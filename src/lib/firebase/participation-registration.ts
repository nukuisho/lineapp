import {
  FieldValue,
} from "firebase-admin/firestore";
import {
  getValidatedWorkDate,
} from "../participation-work-date";
import {
  getValidatedTimeCategory,
  getValidatedWorkType,
} from "../validation";
import {
  getFirebaseFirestore,
} from "./admin";
import {
  AvailableFarm,
  parseAvailableFarm,
} from "./farm";

const maximumCommentLength = 500;
const stampsGranted = 1;

export type ParticipationRegistrationErrorCode =
  | "invalid-input"
  | "user-not-found"
  | "farm-unavailable"
  | "duplicate";

export class ParticipationRegistrationError
  extends Error {
  constructor(
    readonly code:
      ParticipationRegistrationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ParticipationRegistrationError";
  }
}

export type RegisterParticipationInput = {
  userId: string;
  farmId: string;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
  currentDate?: Date;
};

export type RegisterParticipationResult = {
  participationId: string;
  farm: AvailableFarm;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
  stampsGranted: number;
};

function normalizeRequiredString(
  value: string,
): string | null {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function createDuplicateKey(
  userId: string,
  farmId: string,
  workDate: string,
): string {
  return `${userId}_${farmId}_${workDate}`;
}

export async function registerParticipation(
  input: RegisterParticipationInput,
): Promise<RegisterParticipationResult> {
  const userId = normalizeRequiredString(
    input.userId,
  );
  const farmId = normalizeRequiredString(
    input.farmId,
  );
  const workType = getValidatedWorkType(
    input.workType,
  );
  const timeCategory =
    getValidatedTimeCategory(
      input.timeCategory,
    );
  const workDate =
    getValidatedWorkDate(
      input.workDate,
      input.currentDate ?? new Date(),
    );
  const comment = input.comment?.trim();

  if (
    !userId ||
    !farmId ||
    !workDate ||
    !workType ||
    !timeCategory ||
    (comment?.length ?? 0) >
      maximumCommentLength
  ) {
    throw new ParticipationRegistrationError(
      "invalid-input",
      "参加登録の入力を確認できませんでした。",
    );
  }

  const duplicateKey = createDuplicateKey(
    userId,
    farmId,
    workDate,
  );

  const firestore =
    getFirebaseFirestore();
  const userReference =
    firestore.collection("users").doc(userId);
  const farmReference =
    firestore.collection("farms").doc(farmId);
  const duplicateKeyReference =
    firestore
      .collection("participationKeys")
      .doc(duplicateKey);
  const participationReference =
    firestore.collection("participations").doc();

  return firestore.runTransaction(
    async (transaction) => {
      const userSnapshot =
        await transaction.get(
          userReference,
        );
      const farmSnapshot =
        await transaction.get(
          farmReference,
        );
      const duplicateKeySnapshot =
        await transaction.get(
          duplicateKeyReference,
        );

      if (!userSnapshot.exists) {
        throw new ParticipationRegistrationError(
          "user-not-found",
          "参加登録のユーザーを確認できませんでした。",
        );
      }

      const farm = parseAvailableFarm(
        farmSnapshot.id,
        farmSnapshot.data(),
      );

      if (!farm) {
        throw new ParticipationRegistrationError(
          "farm-unavailable",
          "参加登録の農園を確認できませんでした。",
        );
      }

      if (duplicateKeySnapshot.exists) {
        throw new ParticipationRegistrationError(
          "duplicate",
          "この作業日のこの農園への参加は、すでに記録されています。",
        );
      }

      const timestamp =
        FieldValue.serverTimestamp();

      transaction.create(
        participationReference,
        {
          userId,
          farmId: farm.id,
          farmName: farm.name,
          farmOwnerName: farm.ownerName,
          farmFruitTypes: farm.fruitTypes,
          workDate,
          workType,
          timeCategory,
          ...(comment
            ? {
                comment,
              }
            : {}),
          stampsGranted,
          status: "ACTIVE",
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      );

      transaction.create(
        duplicateKeyReference,
        {
          userId,
          farmId: farm.id,
          workDate,
          createdAt: timestamp,
        },
      );

      transaction.update(
        userReference,
        {
          totalParticipations:
            FieldValue.increment(1),
          totalStamps:
            FieldValue.increment(
              stampsGranted,
            ),
          updatedAt: timestamp,
        },
      );

      return {
        participationId:
          participationReference.id,
        farm,
        workDate,
        workType,
        timeCategory,
        comment:
          comment || undefined,
        stampsGranted,
      };
    },
  );
}

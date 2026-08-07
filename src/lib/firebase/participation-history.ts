import {
  Timestamp,
} from "firebase-admin/firestore";
import {
  getValidatedTimeCategory,
  getValidatedWorkType,
} from "../validation";
import {
  getFirebaseFirestore,
} from "./admin";

const maximumHistoryItems = 50;
const maximumCommentLength = 500;
const workDatePattern =
  /^\d{4}-\d{2}-\d{2}$/;

export type ParticipationHistoryItem = {
  id: string;
  farmName: string;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
};

type ParsedHistoryItem =
  ParticipationHistoryItem & {
    createdAtMilliseconds: number;
  };

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getNonEmptyString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function isValidWorkDate(
  value: string,
): boolean {
  if (!workDatePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseHistoryItem(
  id: string,
  value: unknown,
  expectedUserId: string,
): ParsedHistoryItem | null {
  const normalizedId =
    getNonEmptyString(id);

  if (
    !normalizedId ||
    !isRecord(value) ||
    value.status !== "ACTIVE" ||
    value.userId !== expectedUserId ||
    !(value.createdAt instanceof Timestamp)
  ) {
    return null;
  }

  const farmName =
    getNonEmptyString(value.farmName);
  const workDate =
    getNonEmptyString(value.workDate);

  const workType =
    typeof value.workType === "string"
      ? getValidatedWorkType(
          value.workType,
        )
      : null;

  const timeCategory =
    typeof value.timeCategory === "string"
      ? getValidatedTimeCategory(
          value.timeCategory,
        )
      : null;

  const comment =
    typeof value.comment === "string"
      ? value.comment.trim()
      : undefined;

  if (
    !farmName ||
    !workDate ||
    !isValidWorkDate(workDate) ||
    !workType ||
    !timeCategory ||
    ("comment" in value &&
      typeof value.comment !== "string") ||
    (comment?.length ?? 0) >
      maximumCommentLength
  ) {
    return null;
  }

  return {
    id: normalizedId,
    farmName,
    workDate,
    workType,
    timeCategory,
    ...(comment
      ? {
          comment,
        }
      : {}),
    createdAtMilliseconds:
      value.createdAt.toMillis(),
  };
}

export async function getParticipationHistory(
  userId: string,
): Promise<ParticipationHistoryItem[]> {
  const normalizedUserId =
    getNonEmptyString(userId);

  if (!normalizedUserId) {
    throw new Error(
      "参加履歴のユーザーを確認できませんでした。",
    );
  }

  const snapshot =
    await getFirebaseFirestore()
      .collection("participations")
      .where(
        "userId",
        "==",
        normalizedUserId,
      )
      .get();

  return snapshot.docs
    .map((document) =>
      parseHistoryItem(
        document.id,
        document.data(),
        normalizedUserId,
      ),
    )
    .filter(
      (
        item,
      ): item is ParsedHistoryItem =>
        item !== null,
    )
    .sort((left, right) => {
      const dateComparison =
        right.workDate.localeCompare(
          left.workDate,
        );

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return (
        right.createdAtMilliseconds -
        left.createdAtMilliseconds
      );
    })
    .slice(0, maximumHistoryItems)
    .map(
      ({
        createdAtMilliseconds: _,
        ...item
      }) => item,
    );
}

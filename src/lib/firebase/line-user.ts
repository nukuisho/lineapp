
import {
  FieldValue,
} from "firebase-admin/firestore";
import {
  getFirebaseFirestore,
} from "./admin";
import {
  createInternalUserId,
} from "../line/internal-user-id";

export type SaveVerifiedLineUserResult =
  | "created"
  | "reused";

export async function saveVerifiedLineUser(
  channelId: string,
  verifiedSubject: string,
): Promise<SaveVerifiedLineUserResult> {
  const userId = createInternalUserId(
    channelId,
    verifiedSubject,
  );
  const firestore =
    getFirebaseFirestore();
  const userReference =
    firestore.collection("users").doc(userId);

  return firestore.runTransaction(
    async (transaction) => {
      const snapshot =
        await transaction.get(
          userReference,
        );
      const timestamp =
        FieldValue.serverTimestamp();

      if (snapshot.exists) {
        transaction.update(
          userReference,
          {
            updatedAt: timestamp,
            lastAuthenticatedAt:
              timestamp,
          },
        );

        return "reused";
      }

      transaction.create(
        userReference,
        {
          totalParticipations: 0,
          totalStamps: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
          lastAuthenticatedAt:
            timestamp,
        },
      );

      return "created";
    },
  );
}

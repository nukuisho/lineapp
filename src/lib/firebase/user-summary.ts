import { getFirebaseFirestore } from "./admin";

export type UserSummary = {
  totalParticipations: number;
  totalStamps: number;
};

function isNonNegativeInteger(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

export async function getUserSummary(
  userId: string,
): Promise<UserSummary> {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("利用者を確認できませんでした。");
  }

  const snapshot = await getFirebaseFirestore()
    .collection("users")
    .doc(normalizedUserId)
    .get();

  if (!snapshot.exists) {
    return {
      totalParticipations: 0,
      totalStamps: 0,
    };
  }

  const data: unknown = snapshot.data();

  if (
    typeof data !== "object" ||
    data === null ||
    !isNonNegativeInteger(
      Reflect.get(data, "totalParticipations"),
    ) ||
    !isNonNegativeInteger(
      Reflect.get(data, "totalStamps"),
    )
  ) {
    throw new Error("利用者集計の形式が不正です。");
  }

  return {
    totalParticipations: Reflect.get(
      data,
      "totalParticipations",
    ),
    totalStamps: Reflect.get(
      data,
      "totalStamps",
    ),
  };
}

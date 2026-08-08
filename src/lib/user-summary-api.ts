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

export function parseUserSummaryResponse(
  value: unknown,
): UserSummary | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Reflect.get(value, "retrieved") !== true
  ) {
    return null;
  }

  const totalParticipations = Reflect.get(
    value,
    "totalParticipations",
  );
  const totalStamps = Reflect.get(
    value,
    "totalStamps",
  );

  if (
    !isNonNegativeInteger(totalParticipations) ||
    !isNonNegativeInteger(totalStamps)
  ) {
    return null;
  }

  return {
    totalParticipations,
    totalStamps,
  };
}

export function getUserSummaryErrorMessage(
  status: number,
): string {
  if (status === 401) {
    return "LINEのログインを確認して、もう一度お試しください。";
  }

  return "参加の記録を取得できませんでした。通信環境を確認して、もう一度お試しください。";
}

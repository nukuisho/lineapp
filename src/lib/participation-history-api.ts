import {
  isValidTimeCategory,
  isValidWorkType,
} from "./mock-data";

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

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    Boolean(value.trim())
  );
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
  value: unknown,
): ParticipationHistoryItem | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.farmName) ||
    !isNonEmptyString(value.workDate) ||
    !isValidWorkDate(value.workDate) ||
    typeof value.workType !== "string" ||
    !isValidWorkType(value.workType) ||
    typeof value.timeCategory !==
      "string" ||
    !isValidTimeCategory(
      value.timeCategory,
    ) ||
    ("comment" in value &&
      typeof value.comment !== "string")
  ) {
    return null;
  }

  return {
    id: value.id,
    farmName: value.farmName,
    workDate: value.workDate,
    workType: value.workType,
    timeCategory: value.timeCategory,
    ...(typeof value.comment ===
      "string" &&
    value.comment
      ? {
          comment: value.comment,
        }
      : {}),
  };
}

export function parseHistoryResponse(
  value: unknown,
): ParticipationHistoryItem[] | null {
  if (
    !isRecord(value) ||
    value.retrieved !== true ||
    !Array.isArray(
      value.participations,
    )
  ) {
    return null;
  }

  const participations =
    value.participations.map(
      parseHistoryItem,
    );

  if (
    participations.some(
      (participation) =>
        participation === null,
    )
  ) {
    return null;
  }

  return participations as
    ParticipationHistoryItem[];
}

export function getHistoryErrorMessage(
  status: number,
): string {
  if (status === 401) {
    return "LINEのログインを確認して、もう一度お試しください。";
  }

  if (status === 400) {
    return "参加履歴を取得するための情報を確認できませんでした。";
  }

  return "参加履歴を取得できませんでした。通信環境を確認して、もう一度お試しください。";
}

import {
  parseAvailableFarm,
  type AvailableFarm,
} from "./available-farms-response";

export type RegisteredParticipation = {
  id: string;
  farm: AvailableFarm;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
  stampsGranted: number;
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

export function parseParticipationResponse(
  value: unknown,
): RegisteredParticipation | null {
  if (
    !isRecord(value) ||
    value.registered !== true ||
    !isRecord(value.participation)
  ) {
    return null;
  }

  const participation =
    value.participation;

  const farm = parseAvailableFarm(
    participation.farm,
  );

  if (
    !farm ||
    typeof participation.id !== "string" ||
    !participation.id.trim() ||
    typeof participation.workDate !==
      "string" ||
    !participation.workDate.trim() ||
    typeof participation.workType !==
      "string" ||
    !participation.workType.trim() ||
    typeof participation.timeCategory !==
      "string" ||
    !participation.timeCategory.trim() ||
    typeof participation.stampsGranted !==
      "number" ||
    !Number.isInteger(
      participation.stampsGranted,
    ) ||
    participation.stampsGranted < 0 ||
    ("comment" in participation &&
      typeof participation.comment !==
        "string")
  ) {
    return null;
  }

  return {
    id: participation.id,
    farm,
    workDate: participation.workDate,
    workType: participation.workType,
    timeCategory:
      participation.timeCategory,
    stampsGranted:
      participation.stampsGranted,
    ...(typeof participation.comment ===
    "string"
      ? {
          comment:
            participation.comment,
        }
      : {}),
  };
}

export const completedParticipationStorageKey =
  "completed-participation";

export function saveCompletedParticipation(
  storage: Pick<Storage, "setItem">,
  participation: RegisteredParticipation,
): void {
  storage.setItem(
    completedParticipationStorageKey,
    JSON.stringify(participation),
  );
}

export function readCompletedParticipation(
  storage: Pick<Storage, "getItem">,
): RegisteredParticipation | null {
  const storedValue = storage.getItem(
    completedParticipationStorageKey,
  );

  if (!storedValue) {
    return null;
  }

  try {
    const participation: unknown =
      JSON.parse(storedValue);

    return parseParticipationResponse({
      registered: true,
      participation,
    });
  } catch {
    return null;
  }
}

export function getParticipationErrorMessage(
  status: number,
): string {
  if (status === 400) {
    return "入力内容を確認して、もう一度お試しください。";
  }

  if (status === 401) {
    return "LINEのログインを確認して、もう一度お試しください。";
  }

  if (status === 409) {
    return "本日は登録済みか、選択した農園では現在参加登録できません。農園を確認してください。";
  }

  if (status === 500) {
    return "参加登録を開始できませんでした。時間をおいてもう一度お試しください。";
  }

  return "参加登録を完了できませんでした。通信環境を確認して、もう一度お試しください。";
}

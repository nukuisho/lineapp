export type PrototypeParticipation = {
  id: string;
  farmId: string;
  farmName: string;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
  createdAt: string;
};

const storageKey =
  "eno-passport-prototype-participations";

function isPrototypeParticipation(
  value: unknown,
): value is PrototypeParticipation {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const participation =
    value as Record<string, unknown>;

  return (
    typeof participation.id === "string" &&
    typeof participation.farmId === "string" &&
    typeof participation.farmName === "string" &&
    typeof participation.workDate === "string" &&
    typeof participation.workType === "string" &&
    typeof participation.timeCategory === "string" &&
    typeof participation.createdAt === "string" &&
    (
      participation.comment === undefined ||
      typeof participation.comment === "string"
    )
  );
}

export function getPrototypeParticipations():
  PrototypeParticipation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedValue =
    window.localStorage.getItem(storageKey);

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      isPrototypeParticipation,
    );
  } catch {
    return [];
  }
}

export function addPrototypeParticipation(
  participation: PrototypeParticipation,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const currentParticipations =
    getPrototypeParticipations();

  const alreadyExists =
    currentParticipations.some(
      (current) =>
        current.id === participation.id,
    );

  if (alreadyExists) {
    return false;
  }

  const nextParticipations = [
    participation,
    ...currentParticipations,
  ];

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(nextParticipations),
  );

  return true;
}

export function clearPrototypeParticipations():
  void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    storageKey,
  );
}

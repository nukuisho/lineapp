import {
  Timestamp,
} from "firebase-admin/firestore";

export type AvailableFarm = {
  id: string;
  name: string;
  ownerName: string;
  fruitTypes: string[];
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

function parseNonEmptyString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}

function parseFruitTypes(
  value: unknown,
): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const fruitTypes = value.map(
    parseNonEmptyString,
  );

  if (
    fruitTypes.length === 0 ||
    fruitTypes.some(
      (fruitType) => fruitType === null,
    )
  ) {
    return null;
  }

  return fruitTypes as string[];
}

export function parseAvailableFarm(
  id: string,
  value: unknown,
): AvailableFarm | null {
  const normalizedId =
    parseNonEmptyString(id);

  if (
    !normalizedId ||
    !isRecord(value) ||
    value.isActive !== true ||
    value.isAccepting !== true ||
    !(value.createdAt instanceof Timestamp) ||
    !(value.updatedAt instanceof Timestamp)
  ) {
    return null;
  }

  const name =
    parseNonEmptyString(value.name);
  const ownerName =
    parseNonEmptyString(value.ownerName);
  const fruitTypes =
    parseFruitTypes(value.fruitTypes);

  if (
    !name ||
    !ownerName ||
    !fruitTypes
  ) {
    return null;
  }

  return {
    id: normalizedId,
    name,
    ownerName,
    fruitTypes,
  };
}


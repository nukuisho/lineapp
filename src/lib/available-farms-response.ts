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

export function parseAvailableFarm(
  value: unknown,
): AvailableFarm | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    typeof value.ownerName !== "string" ||
    !value.ownerName.trim() ||
    !Array.isArray(value.fruitTypes) ||
    !value.fruitTypes.every(
      (fruitType) =>
        typeof fruitType === "string" &&
        Boolean(fruitType.trim()),
    )
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    ownerName: value.ownerName,
    fruitTypes: value.fruitTypes,
  };
}

export function parseAvailableFarmsResponse(
  value: unknown,
): AvailableFarm[] | null {
  if (
    !isRecord(value) ||
    !Array.isArray(value.farms)
  ) {
    return null;
  }

  const farms = value.farms.map(
    parseAvailableFarm,
  );

  if (
    farms.some((farm) => farm === null)
  ) {
    return null;
  }

  return farms as AvailableFarm[];
}

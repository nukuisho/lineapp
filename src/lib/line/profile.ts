export function getLineDisplayName(
  profile: unknown,
): string | null {
  if (
    typeof profile !== "object" ||
    profile === null ||
    !("displayName" in profile) ||
    typeof profile.displayName !== "string"
  ) {
    return null;
  }

  const displayName =
    profile.displayName.trim();

  return displayName || null;
}
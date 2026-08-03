export type VerifiedIdToken = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time?: number;
  nonce?: string;
  amr?: string[];
  name?: string;
  picture?: string;
  email?: string;
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
    value.trim().length > 0
  );
}

function isInteger(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  );
}

function hasValidOptionalString(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return (
    !(key in value) ||
    typeof value[key] === "string"
  );
}

export function parseVerifiedIdToken(
  value: unknown,
): VerifiedIdToken | null {
  if (
    !isRecord(value) ||
    !isNonEmptyString(value.iss) ||
    !isNonEmptyString(value.sub) ||
    !isNonEmptyString(value.aud) ||
    !isInteger(value.exp) ||
    !isInteger(value.iat)
  ) {
    return null;
  }

  if (
    ("auth_time" in value &&
      !isInteger(value.auth_time)) ||
    ("amr" in value &&
      (!Array.isArray(value.amr) ||
        !value.amr.every(
          (method) => typeof method === "string",
        ))) ||
    !hasValidOptionalString(value, "nonce") ||
    !hasValidOptionalString(value, "name") ||
    !hasValidOptionalString(value, "picture") ||
    !hasValidOptionalString(value, "email")
  ) {
    return null;
  }

  const token: VerifiedIdToken = {
    iss: value.iss,
    sub: value.sub,
    aud: value.aud,
    exp: value.exp,
    iat: value.iat,
  };

  if (isInteger(value.auth_time)) {
    token.auth_time = value.auth_time;
  }

  if (typeof value.nonce === "string") {
    token.nonce = value.nonce;
  }

  if (
    Array.isArray(value.amr) &&
    value.amr.every(
      (method) => typeof method === "string",
    )
  ) {
    token.amr = value.amr;
  }

  if (typeof value.name === "string") {
    token.name = value.name;
  }

  if (typeof value.picture === "string") {
    token.picture = value.picture;
  }

  if (typeof value.email === "string") {
    token.email = value.email;
  }

  return token;
}

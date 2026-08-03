type VerificationResponse = {
  verified: true;
};

function parseVerificationResponse(
  value: unknown,
): VerificationResponse | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("verified" in value) ||
    value.verified !== true
  ) {
    return null;
  }

  return {
    verified: true,
  };
}

export async function verifyLineIdToken(
  idToken: string,
): Promise<boolean> {
  if (!idToken.trim()) {
    return false;
  }

  let response: Response;

  try {
    response = await fetch(
      "/api/line/verify-id-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      },
    );
  } catch {
    return false;
  }

  if (!response.ok) {
    return false;
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    return false;
  }

  return (
    parseVerificationResponse(responseBody) !==
    null
  );
}

import {
  parseVerifiedIdToken,
  VerifiedIdToken,
} from "./verified-id-token";

const LINE_VERIFY_ENDPOINT =
  "https://api.line.me/oauth2/v2.1/verify";
const LINE_TOKEN_ISSUER =
  "https://access.line.me";

export type LineIdTokenVerificationErrorCode =
  | "configuration"
  | "invalid-token"
  | "upstream";

export class LineIdTokenVerificationError
  extends Error {
  constructor(
    readonly code:
      LineIdTokenVerificationErrorCode,
  ) {
    super("LINE IDトークンを検証できませんでした。");
    this.name = "LineIdTokenVerificationError";
  }
}

export type VerifiedLineIdentity = {
  channelId: string;
  token: VerifiedIdToken;
};

export async function verifyLineIdTokenOnServer(
  idToken: string,
): Promise<VerifiedLineIdentity> {
  const normalizedIdToken = idToken.trim();

  if (!normalizedIdToken) {
    throw new LineIdTokenVerificationError(
      "invalid-token",
    );
  }

  const channelId =
    process.env.LINE_CHANNEL_ID?.trim();

  if (!channelId) {
    throw new LineIdTokenVerificationError(
      "configuration",
    );
  }

  let response: Response;

  try {
    response = await fetch(
      LINE_VERIFY_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          id_token: normalizedIdToken,
          client_id: channelId,
        }),
        cache: "no-store",
      },
    );
  } catch {
    throw new LineIdTokenVerificationError(
      "upstream",
    );
  }

  if (!response.ok) {
    throw new LineIdTokenVerificationError(
      "invalid-token",
    );
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw new LineIdTokenVerificationError(
      "upstream",
    );
  }

  const token = parseVerifiedIdToken(
    responseBody,
  );

  if (
    !token ||
    token.iss !== LINE_TOKEN_ISSUER ||
    token.aud !== channelId
  ) {
    throw new LineIdTokenVerificationError(
      "upstream",
    );
  }

  return {
    channelId,
    token,
  };
}

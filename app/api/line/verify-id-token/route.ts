import {
  parseVerifiedIdToken,
} from "../../../../src/lib/line/verified-id-token";

const LINE_VERIFY_ENDPOINT =
  "https://api.line.me/oauth2/v2.1/verify";
const LINE_TOKEN_ISSUER =
  "https://access.line.me";

type VerifyIdTokenRequest = {
  idToken: string;
};

function parseRequestBody(
  value: unknown,
): VerifyIdTokenRequest | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("idToken" in value) ||
    typeof value.idToken !== "string" ||
    value.idToken.trim().length === 0
  ) {
    return null;
  }

  return {
    idToken: value.idToken,
  };
}

function getLineChannelId(): string | null {
  const channelId =
    process.env.LINE_CHANNEL_ID?.trim();

  return channelId || null;
}

function errorResponse(
  status: number,
): Response {
  return Response.json(
    {
      verified: false,
      message:
        "LINEアカウントを確認できませんでした。",
    },
    {
      status,
    },
  );
}

export async function POST(
  request: Request,
): Promise<Response> {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return errorResponse(400);
  }

  const input = parseRequestBody(requestBody);

  if (!input) {
    return errorResponse(400);
  }

  const channelId = getLineChannelId();

  if (!channelId) {
    return errorResponse(500);
  }

  const body = new URLSearchParams({
    id_token: input.idToken,
    client_id: channelId,
  });

  let lineResponse: Response;

  try {
    lineResponse = await fetch(
      LINE_VERIFY_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body,
        cache: "no-store",
      },
    );
  } catch {
    return errorResponse(502);
  }

  if (!lineResponse.ok) {
    return errorResponse(401);
  }

  let responseBody: unknown;

  try {
    responseBody = await lineResponse.json();
  } catch {
    return errorResponse(502);
  }

  const verifiedToken =
    parseVerifiedIdToken(responseBody);

  if (
    !verifiedToken ||
    verifiedToken.iss !== LINE_TOKEN_ISSUER ||
    verifiedToken.aud !== channelId
  ) {
    return errorResponse(502);
  }

  return Response.json({
    verified: true,
  });
}

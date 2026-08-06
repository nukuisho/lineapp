import {
  saveVerifiedLineUser,
} from "../../../../src/lib/firebase/line-user";
import {
  LineIdTokenVerificationError,
  verifyLineIdTokenOnServer,
} from "../../../../src/lib/line/server-id-token-verification";

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

  try {
    const identity =
      await verifyLineIdTokenOnServer(
        input.idToken,
      );

    await saveVerifiedLineUser(
      identity.channelId,
      identity.token.sub,
    );
  } catch (error) {
    if (
      error instanceof
      LineIdTokenVerificationError
    ) {
      if (error.code === "configuration") {
        return errorResponse(500);
      }

      if (error.code === "invalid-token") {
        return errorResponse(401);
      }
    }

    return errorResponse(502);
  }

  return Response.json({
    verified: true,
  });
}

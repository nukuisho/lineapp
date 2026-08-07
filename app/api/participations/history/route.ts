import {
  getParticipationHistory,
} from "../../../../src/lib/firebase/participation-history";
import {
  createInternalUserId,
} from "../../../../src/lib/line/internal-user-id";
import {
  LineIdTokenVerificationError,
  verifyLineIdTokenOnServer,
} from "../../../../src/lib/line/server-id-token-verification";

type HistoryRequest = {
  idToken: string;
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

function parseRequestBody(
  value: unknown,
): HistoryRequest | null {
  if (
    !isRecord(value) ||
    typeof value.idToken !== "string" ||
    !value.idToken.trim()
  ) {
    return null;
  }

  return {
    idToken: value.idToken,
  };
}

function errorResponse(
  status: number,
  message: string,
): Response {
  return Response.json(
    {
      retrieved: false,
      message,
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
    return errorResponse(
      400,
      "参加履歴の入力を確認してください。",
    );
  }

  const input =
    parseRequestBody(requestBody);

  if (!input) {
    return errorResponse(
      400,
      "参加履歴の入力を確認してください。",
    );
  }

  try {
    const identity =
      await verifyLineIdTokenOnServer(
        input.idToken,
      );

    const userId =
      createInternalUserId(
        identity.channelId,
        identity.token.sub,
      );

    const participations =
      await getParticipationHistory(
        userId,
      );

    return Response.json({
      retrieved: true,
      participations,
    });
  } catch (error) {
    if (
      error instanceof
      LineIdTokenVerificationError
    ) {
      if (
        error.code === "invalid-token"
      ) {
        return errorResponse(
          401,
          "LINEアカウントを確認できませんでした。",
        );
      }

      if (
        error.code === "configuration"
      ) {
        return errorResponse(
          500,
          "参加履歴を取得できませんでした。",
        );
      }
    }

    return errorResponse(
      502,
      "参加履歴を取得できませんでした。",
    );
  }
}

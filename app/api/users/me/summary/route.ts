import { getUserSummary } from "../../../../../src/lib/firebase/user-summary";
import { createInternalUserId } from "../../../../../src/lib/line/internal-user-id";
import {
  LineIdTokenVerificationError,
  verifyLineIdTokenOnServer,
} from "../../../../../src/lib/line/server-id-token-verification";

function parseIdToken(value: unknown): string | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const idToken = Reflect.get(value, "idToken");

  return typeof idToken === "string" && idToken.trim()
    ? idToken
    : null;
}

function errorResponse(status: number): Response {
  return Response.json(
    {
      retrieved: false,
      message:
        status === 401
          ? "LINEアカウントを確認できませんでした。"
          : "参加の記録を取得できませんでした。",
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400);
  }

  const idToken = parseIdToken(body);

  if (!idToken) {
    return errorResponse(400);
  }

  try {
    const identity = await verifyLineIdTokenOnServer(idToken);
    const userId = createInternalUserId(
      identity.channelId,
      identity.token.sub,
    );
    const summary = await getUserSummary(userId);

    return Response.json(
      {
        retrieved: true,
        ...summary,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof LineIdTokenVerificationError &&
      error.code === "invalid-token"
    ) {
      return errorResponse(401);
    }

    return errorResponse(500);
  }
}

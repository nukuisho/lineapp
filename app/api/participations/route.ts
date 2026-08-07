import {
  saveVerifiedLineUser,
} from "../../../src/lib/firebase/line-user";
import {
  ParticipationRegistrationError,
  registerParticipation,
} from "../../../src/lib/firebase/participation-registration";
import {
  LineIdTokenVerificationError,
  verifyLineIdTokenOnServer,
} from "../../../src/lib/line/server-id-token-verification";

type ParticipationRequest = {
  idToken: string;
  farmId: string;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
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
): ParticipationRequest | null {
  if (
    !isRecord(value) ||
    typeof value.idToken !== "string" ||
    !value.idToken.trim() ||
    typeof value.farmId !== "string" ||
    !value.farmId.trim() ||
    typeof value.workDate !== "string" ||
    !value.workDate.trim() ||
    typeof value.workType !== "string" ||
    typeof value.timeCategory !== "string" ||
    ("comment" in value &&
      typeof value.comment !== "string")
  ) {
    return null;
  }

  return {
    idToken: value.idToken,
    farmId: value.farmId,
    workDate: value.workDate,
    workType: value.workType,
    timeCategory: value.timeCategory,
    ...(typeof value.comment === "string"
      ? {
          comment: value.comment,
        }
      : {}),
  };
}

function errorResponse(
  status: number,
  message: string,
): Response {
  return Response.json(
    {
      registered: false,
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
      "参加登録の入力を確認してください。",
    );
  }

  const input = parseRequestBody(requestBody);

  if (!input) {
    return errorResponse(
      400,
      "参加登録の入力を確認してください。",
    );
  }

  try {
    const identity =
      await verifyLineIdTokenOnServer(
        input.idToken,
      );

    const user = await saveVerifiedLineUser(
      identity.channelId,
      identity.token.sub,
    );

    const result = await registerParticipation({
      userId: user.userId,
      farmId: input.farmId,
      workDate: input.workDate,
      workType: input.workType,
      timeCategory: input.timeCategory,
      ...(input.comment === undefined
        ? {}
        : {
            comment: input.comment,
          }),
    });

    return Response.json(
      {
        registered: true,
        participation: {
          id: result.participationId,
          farm: result.farm,
          workDate: result.workDate,
          workType: result.workType,
          timeCategory: result.timeCategory,
          ...(result.comment === undefined
            ? {}
            : {
                comment: result.comment,
              }),
          stampsGranted:
            result.stampsGranted,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
      LineIdTokenVerificationError
    ) {
      if (error.code === "invalid-token") {
        return errorResponse(
          401,
          "LINEアカウントを確認できませんでした。",
        );
      }

      if (error.code === "configuration") {
        return errorResponse(
          500,
          "参加登録を開始できませんでした。",
        );
      }
    }

    if (
      error instanceof
      ParticipationRegistrationError
    ) {
      if (error.code === "invalid-input") {
        return errorResponse(
          400,
          "参加登録の入力を確認してください。",
        );
      }

      if (error.code === "duplicate") {
        return errorResponse(
          409,
          "この作業日のこの農園への参加は、すでに記録されています。",
        );
      }

      if (error.code === "farm-unavailable") {
        return errorResponse(
          409,
          "選択した農園では参加登録できません。",
        );
      }
    }

    return errorResponse(
      502,
      "参加登録を完了できませんでした。",
    );
  }
}

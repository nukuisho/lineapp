import {
  getAvailableFarms,
} from "../../../src/lib/firebase/available-farms";

export const dynamic =
  "force-dynamic";

function errorResponse(): Response {
  return Response.json(
    {
      message:
        "農園情報を取得できませんでした。ページを再読み込みしてください。",
    },
    {
      status: 502,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET():
  Promise<Response> {
  try {
    const farms =
      await getAvailableFarms();

    return Response.json(
      {
        farms,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return errorResponse();
  }
}


import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  getParticipationHistory,
} from "../../../../src/lib/firebase/participation-history";
import {
  createInternalUserId,
} from "../../../../src/lib/line/internal-user-id";
import {
  POST,
} from "./route";

vi.mock(
  "../../../../src/lib/firebase/participation-history",
  () => ({
    getParticipationHistory: vi.fn(),
  }),
);

const channelId = "1234567890";
const idToken =
  "header.payload.signature";

const verifiedResponse = {
  iss: "https://access.line.me",
  sub: "U1234567890",
  aud: channelId,
  exp: 1_800_000_000,
  iat: 1_700_000_000,
};

function createRequest(
  body: BodyInit,
): Request {
  return new Request(
    "http://localhost/api/participations/history",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body,
    },
  );
}

function createJsonRequest(
  body: unknown,
): Request {
  return createRequest(
    JSON.stringify(body),
  );
}

describe(
  "POST /api/participations/history",
  () => {
    const fetchMock =
      vi.fn<typeof fetch>();

    beforeEach(() => {
      vi.stubEnv(
        "LINE_CHANNEL_ID",
        channelId,
      );

      vi.stubGlobal(
        "fetch",
        fetchMock,
      );

      fetchMock.mockResolvedValue(
        Response.json(
          verifiedResponse,
        ),
      );

      vi.mocked(
        getParticipationHistory,
      ).mockResolvedValue([
        {
          id: "participation-001",
          farmName: "テスト梨園A",
          workDate: "2026-08-05",
          workType: "袋掛け",
          timeCategory: "午前",
        },
      ]);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    it(
      "検証済みLINEユーザー本人の履歴を返す",
      async () => {
        const response = await POST(
          createJsonRequest({
            idToken,
            userId: "another-user",
          }),
        );

        expect(response.status).toBe(
          200,
        );

        await expect(
          response.json(),
        ).resolves.toEqual({
          retrieved: true,
          participations: [
            {
              id: "participation-001",
              farmName:
                "テスト梨園A",
              workDate: "2026-08-05",
              workType: "袋掛け",
              timeCategory: "午前",
            },
          ],
        });

        expect(
          getParticipationHistory,
        ).toHaveBeenCalledWith(
          createInternalUserId(
            channelId,
            verifiedResponse.sub,
          ),
        );

        expect(
          getParticipationHistory,
        ).not.toHaveBeenCalledWith(
          "another-user",
        );
      },
    );

    it.each([
      null,
      [],
      {},
      {
        idToken: "",
      },
      {
        idToken: 123,
      },
    ])(
      "不正な入力ではFirestoreを読み取らない",
      async (body) => {
        const response = await POST(
          createJsonRequest(body),
        );

        expect(response.status).toBe(
          400,
        );

        expect(
          fetchMock,
        ).not.toHaveBeenCalled();

        expect(
          getParticipationHistory,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "不正なJSONを拒否する",
      async () => {
        const response = await POST(
          createRequest("{"),
        );

        expect(response.status).toBe(
          400,
        );

        expect(
          fetchMock,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "無効なLINE IDトークンを拒否する",
      async () => {
        fetchMock.mockResolvedValue(
          Response.json(
            {
              error:
                "invalid_request",
            },
            {
              status: 400,
            },
          ),
        );

        const response = await POST(
          createJsonRequest({
            idToken,
          }),
        );

        expect(response.status).toBe(
          401,
        );

        expect(
          getParticipationHistory,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "LINE設定不足を安全な500エラーにする",
      async () => {
        vi.stubEnv(
          "LINE_CHANNEL_ID",
          "",
        );

        const response = await POST(
          createJsonRequest({
            idToken,
          }),
        );

        const responseText =
          await response.text();

        expect(response.status).toBe(
          500,
        );

        expect(responseText).not.toContain(
          "LINE_CHANNEL_ID",
        );

        expect(
          getParticipationHistory,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      "Firestore内部エラーを返さない",
      async () => {
        vi.mocked(
          getParticipationHistory,
        ).mockRejectedValue(
          new Error(
            "private firestore details",
          ),
        );

        const response = await POST(
          createJsonRequest({
            idToken,
          }),
        );

        const responseText =
          await response.text();

        expect(response.status).toBe(
          502,
        );

        expect(responseText).not.toContain(
          "private firestore details",
        );
      },
    );
  },
);

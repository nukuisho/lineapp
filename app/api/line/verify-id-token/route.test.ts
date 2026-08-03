import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  saveVerifiedLineUser,
} from "../../../../src/lib/firebase/line-user";
import {
  POST,
} from "./route";

vi.mock(
  "../../../../src/lib/firebase/line-user",
  () => ({
    saveVerifiedLineUser: vi.fn(),
  }),
);

const endpoint =
  "https://api.line.me/oauth2/v2.1/verify";
const channelId = "1234567890";
const idToken = "header.payload.signature";

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
    "http://localhost/api/line/verify-id-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    },
  );
}

function createJsonRequest(
  body: unknown,
): Request {
  return createRequest(JSON.stringify(body));
}

describe("POST /api/line/verify-id-token", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("LINE_CHANNEL_ID", channelId);
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(
      saveVerifiedLineUser,
    ).mockResolvedValue("created");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("LINE APIでIDトークンを検証する", async () => {
    fetchMock.mockResolvedValue(
      Response.json(verifiedResponse),
    );

    const response = await POST(
      createJsonRequest({
        idToken,
      }),
    );

    expect(response.status).toBe(200);
    await expect(
      response.json(),
    ).resolves.toEqual({
      verified: true,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
      }),
    );

    const options =
      fetchMock.mock.calls[0]?.[1];
    const requestBody = options?.body;

    expect(requestBody).toBeInstanceOf(
      URLSearchParams,
    );

    if (!(requestBody instanceof URLSearchParams)) {
      throw new Error(
        "Expected URLSearchParams request body.",
      );
    }

    expect(requestBody.get("id_token")).toBe(
      idToken,
    );
    expect(requestBody.get("client_id")).toBe(
      channelId,
    );
    expect(
      saveVerifiedLineUser,
    ).toHaveBeenCalledWith(
      channelId,
      verifiedResponse.sub,
    );
  });

  it("不正なJSONを拒否する", async () => {
    const response = await POST(
      createRequest("{"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    {},
    {
      idToken: "",
    },
    {
      idToken: "   ",
    },
    {
      idToken: 123,
    },
    null,
    [],
  ])(
    "不正な入力を拒否する",
    async (body) => {
      const response = await POST(
        createJsonRequest(body),
      );

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it(
    "LINE_CHANNEL_IDがない場合は検証しない",
    async () => {
      vi.stubEnv("LINE_CHANNEL_ID", "");

      const response = await POST(
        createJsonRequest({
          idToken,
        }),
      );

      expect(response.status).toBe(500);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it(
    "LINE APIの検証失敗をブラウザへ漏らさない",
    async () => {
      fetchMock.mockResolvedValue(
        Response.json(
          {
            error: "invalid_request",
            error_description:
              "Invalid IdToken: secret-token",
          },
          {
            status: 400,
          },
        ),
      );

      const response = await POST(
        createJsonRequest({
          idToken: "secret-token",
        }),
      );
      const responseText =
        await response.text();

      expect(response.status).toBe(401);
      expect(responseText).not.toContain(
        "secret-token",
      );
      expect(responseText).not.toContain(
        "Invalid IdToken",
      );
    },
  );

  it("通信失敗を汎用エラーへ変換する", async () => {
    fetchMock.mockRejectedValue(
      new Error("network error"),
    );

    const response = await POST(
      createJsonRequest({
        idToken,
      }),
    );

    expect(response.status).toBe(502);
  });

  it(
    "成功レスポンスがJSONでなければ拒否する",
    async () => {
      fetchMock.mockResolvedValue(
        new Response("not-json"),
      );

      const response = await POST(
        createJsonRequest({
          idToken,
        }),
      );

      expect(response.status).toBe(502);
    },
  );

  it.each([
    {
      ...verifiedResponse,
      iss: "https://example.com",
    },
    {
      ...verifiedResponse,
      aud: "different-channel",
    },
    {
      ...verifiedResponse,
      sub: null,
    },
  ])(
    "信頼できない成功レスポンスを拒否する",
    async (lineResponse) => {
      fetchMock.mockResolvedValue(
        Response.json(lineResponse),
      );

      const response = await POST(
        createJsonRequest({
          idToken,
        }),
      );

      expect(response.status).toBe(502);
    },
  );


  it(
    "既存ユーザーの再利用でも成功レスポンスを変えない",
    async () => {
      fetchMock.mockResolvedValue(
        Response.json(verifiedResponse),
      );
      vi.mocked(
        saveVerifiedLineUser,
      ).mockResolvedValue("reused");

      const response = await POST(
        createJsonRequest({ idToken }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        verified: true,
      });
    },
  );

  it(
    "Firestore保存失敗を汎用エラーへ変換する",
    async () => {
      fetchMock.mockResolvedValue(
        Response.json(verifiedResponse),
      );
      vi.mocked(
        saveVerifiedLineUser,
      ).mockRejectedValue(
        new Error("users/internal-id secret-sub"),
      );

      const response = await POST(
        createJsonRequest({ idToken }),
      );
      const responseText = await response.text();

      expect(response.status).toBe(502);
      expect(responseText).not.toContain(
        "users/internal-id",
      );
      expect(responseText).not.toContain("secret-sub");
      expect(responseText).not.toContain(
        verifiedResponse.sub,
      );
    },
  );
});

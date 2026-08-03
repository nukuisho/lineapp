import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  verifyLineIdToken,
} from "./id-token-verification";

describe("verifyLineIdToken", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("IDトークンを検証APIへ送る", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        verified: true,
      }),
    );

    await expect(
      verifyLineIdToken(
        "header.payload.signature",
      ),
    ).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/line/verify-id-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken:
            "header.payload.signature",
        }),
      },
    );
  });

  it.each([
    "",
    "   ",
  ])(
    "空のIDトークンを送信しない",
    async (idToken) => {
      await expect(
        verifyLineIdToken(idToken),
      ).resolves.toBe(false);

      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("HTTPエラーを失敗として扱う", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          verified: false,
        },
        {
          status: 401,
        },
      ),
    );

    await expect(
      verifyLineIdToken(
        "header.payload.signature",
      ),
    ).resolves.toBe(false);
  });

  it("通信エラーを失敗として扱う", async () => {
    fetchMock.mockRejectedValue(
      new Error("network error"),
    );

    await expect(
      verifyLineIdToken(
        "header.payload.signature",
      ),
    ).resolves.toBe(false);
  });

  it("JSONでないレスポンスを拒否する", async () => {
    fetchMock.mockResolvedValue(
      new Response("not-json"),
    );

    await expect(
      verifyLineIdToken(
        "header.payload.signature",
      ),
    ).resolves.toBe(false);
  });

  it.each([
    null,
    {},
    [],
    {
      verified: false,
    },
    {
      verified: "true",
    },
  ])(
    "不正な成功レスポンスを拒否する",
    async (responseBody) => {
      fetchMock.mockResolvedValue(
        Response.json(responseBody),
      );

      await expect(
        verifyLineIdToken(
          "header.payload.signature",
        ),
      ).resolves.toBe(false);
    },
  );
});

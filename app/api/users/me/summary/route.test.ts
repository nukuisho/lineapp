import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getUserSummary } from "../../../../../src/lib/firebase/user-summary";
import { createInternalUserId } from "../../../../../src/lib/line/internal-user-id";
import { POST } from "./route";

vi.mock("../../../../../src/lib/firebase/user-summary", () => ({
  getUserSummary: vi.fn(),
}));

const channelId = "1234567890";
const idToken = "header.payload.signature";
const subject = "U1234567890";

function request(body: unknown): Request {
  return new Request("http://localhost/api/users/me/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/users/me/summary", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("LINE_CHANNEL_ID", channelId);
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue(
      Response.json({
        iss: "https://access.line.me",
        sub: subject,
        aud: channelId,
        exp: 1_800_000_000,
        iat: 1_700_000_000,
      }),
    );
    vi.mocked(getUserSummary).mockResolvedValue({
      totalParticipations: 2,
      totalStamps: 3,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("検証済みLINEユーザー本人の集計だけを返す", async () => {
    const response = await POST(request({ idToken, userId: "other" }));
    await expect(response.json()).resolves.toEqual({
      retrieved: true,
      totalParticipations: 2,
      totalStamps: 3,
    });
    expect(getUserSummary).toHaveBeenCalledWith(
      createInternalUserId(channelId, subject),
    );
    expect(getUserSummary).not.toHaveBeenCalledWith("other");
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store",
    );
  });

  it("LINEアカウントごとに異なる内部ユーザーを取得する", async () => {
    await POST(request({ idToken }));

    fetchMock.mockResolvedValueOnce(
      Response.json({
        iss: "https://access.line.me",
        sub: "U0987654321",
        aud: channelId,
        exp: 1_800_000_000,
        iat: 1_700_000_000,
      }),
    );
    await POST(request({ idToken: "another.token.value" }));

    expect(getUserSummary).toHaveBeenNthCalledWith(
      1,
      createInternalUserId(channelId, subject),
    );
    expect(getUserSummary).toHaveBeenNthCalledWith(
      2,
      createInternalUserId(channelId, "U0987654321"),
    );
  });

  it.each([null, {}, { idToken: "" }, { idToken: 1 }])(
    "不正な入力ではLINE検証もFirestore取得もしない",
    async (body) => {
      expect((await POST(request(body))).status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(getUserSummary).not.toHaveBeenCalled();
    },
  );

  it("無効なIDトークンを拒否する", async () => {
    fetchMock.mockResolvedValue(Response.json({ error: "invalid" }, { status: 400 }));
    const response = await POST(request({ idToken }));
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store",
    );
    expect(getUserSummary).not.toHaveBeenCalled();
  });

  it("不正なJSONを拒否する", async () => {
    const malformedRequest = new Request(
      "http://localhost/api/users/me/summary",
      {
        method: "POST",
        body: "{",
      },
    );

    expect((await POST(malformedRequest)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(getUserSummary).not.toHaveBeenCalled();
  });

  it("LINE設定不足を安全なエラーにする", async () => {
    vi.stubEnv("LINE_CHANNEL_ID", "");

    const response = await POST(request({ idToken }));
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).not.toContain("LINE_CHANNEL_ID");
    expect(text).not.toContain(idToken);
    expect(getUserSummary).not.toHaveBeenCalled();
  });

  it("Firestore内部エラーと識別子を返さない", async () => {
    vi.mocked(getUserSummary).mockRejectedValue(
      new Error("users/private-id firebase secret"),
    );
    const response = await POST(request({ idToken }));
    const text = await response.text();
    expect(response.status).toBe(500);
    expect(text).not.toContain("private-id");
    expect(text).not.toContain(subject);
    expect(text).not.toContain(idToken);
  });
});

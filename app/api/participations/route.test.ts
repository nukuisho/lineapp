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
} from "../../../src/lib/firebase/line-user";
import {
  ParticipationRegistrationError,
  registerParticipation,
} from "../../../src/lib/firebase/participation-registration";
import {
  POST,
} from "./route";

vi.mock(
  "../../../src/lib/firebase/line-user",
  () => ({
    saveVerifiedLineUser: vi.fn(),
  }),
);

vi.mock(
  "../../../src/lib/firebase/participation-registration",
  () => ({
    ParticipationRegistrationError:
      class ParticipationRegistrationError
        extends Error {
        constructor(
          readonly code: string,
          message: string,
        ) {
          super(message);
          this.name =
            "ParticipationRegistrationError";
        }
      },
    registerParticipation: vi.fn(),
  }),
);

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
    "http://localhost/api/participations",
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

function validRequestBody() {
  return {
    idToken,
    farmId: "farm-001",
    workDate: "2026-08-06",
    workType: "袋掛け",
    timeCategory: "午前",
    comment: "よろしくお願いします。",
  };
}

describe("POST /api/participations", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("LINE_CHANNEL_ID", channelId);
    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockResolvedValue(
      Response.json(verifiedResponse),
    );

    vi.mocked(
      saveVerifiedLineUser,
    ).mockResolvedValue({
      status: "reused",
      userId: "internal-user-id",
    });

    vi.mocked(
      registerParticipation,
    ).mockResolvedValue({
      participationId: "participation-001",
      farm: {
        id: "farm-001",
        name: "川崎果樹園",
        ownerName: "川崎さん",
        fruitTypes: ["梨"],
      },
      workDate: "2026-08-06",
      workType: "袋掛け",
      timeCategory: "午前",
      comment: "よろしくお願いします。",
      stampsGranted: 1,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it(
    "検証済みLINEユーザーとして参加を登録する",
    async () => {
      const response = await POST(
        createJsonRequest(validRequestBody()),
      );

      expect(response.status).toBe(201);

      await expect(response.json()).resolves.toEqual({
        registered: true,
        participation: {
          id: "participation-001",
          farm: {
            id: "farm-001",
            name: "川崎果樹園",
            ownerName: "川崎さん",
            fruitTypes: ["梨"],
          },
          workDate: "2026-08-06",
          workType: "袋掛け",
          timeCategory: "午前",
          comment: "よろしくお願いします。",
          stampsGranted: 1,
        },
      });

      expect(fetchMock).toHaveBeenCalledOnce();

      expect(
        saveVerifiedLineUser,
      ).toHaveBeenCalledWith(
        channelId,
        verifiedResponse.sub,
      );

      expect(
        registerParticipation,
      ).toHaveBeenCalledWith({
        userId: "internal-user-id",
        farmId: "farm-001",
        workDate: "2026-08-06",
        workType: "袋掛け",
        timeCategory: "午前",
        comment: "よろしくお願いします。",
      });
    },
  );

  it.each([
    {},
    null,
    [],
    {
      ...validRequestBody(),
      idToken: "",
    },
    {
      ...validRequestBody(),
      farmId: 123,
    },
    {
      ...validRequestBody(),
      workDate: 123,
    },
    {
      ...validRequestBody(),
      workDate: "",
    },
    {
      ...validRequestBody(),
      comment: null,
    },
  ])(
    "不正なリクエストをFirestoreへ渡さない",
    async (body) => {
      const response = await POST(
        createJsonRequest(body),
      );

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();

      expect(
        saveVerifiedLineUser,
      ).not.toHaveBeenCalled();

      expect(
        registerParticipation,
      ).not.toHaveBeenCalled();
    },
  );

  it("不正なJSONを拒否する", async () => {
    const response = await POST(
      createRequest("{"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it(
    "無効なLINE IDトークンを拒否する",
    async () => {
      fetchMock.mockResolvedValue(
        Response.json(
          {
            error: "invalid_request",
          },
          {
            status: 400,
          },
        ),
      );

      const response = await POST(
        createJsonRequest(validRequestBody()),
      );

      expect(response.status).toBe(401);

      expect(
        saveVerifiedLineUser,
      ).not.toHaveBeenCalled();

      expect(
        registerParticipation,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "重複登録を409で返す",
    async () => {
      vi.mocked(
        registerParticipation,
      ).mockRejectedValue(
        new ParticipationRegistrationError(
          "duplicate",
          "internal duplicate details",
        ),
      );

      const response = await POST(
        createJsonRequest(validRequestBody()),
      );

      const responseText =
        await response.text();

      expect(response.status).toBe(409);

      expect(responseText).toContain(
        "この作業日のこの農園への参加は、すでに記録されています。",
      );

      expect(responseText).not.toContain(
        "internal duplicate details",
      );
    },
  );

  it(
    "受付停止農園を409で返す",
    async () => {
      vi.mocked(
        registerParticipation,
      ).mockRejectedValue(
        new ParticipationRegistrationError(
          "farm-unavailable",
          "farms/farm-001 internal",
        ),
      );

      const response = await POST(
        createJsonRequest(validRequestBody()),
      );

      const responseText =
        await response.text();

      expect(response.status).toBe(409);

      expect(responseText).toContain(
        "選択した農園では参加登録できません。",
      );

      expect(responseText).not.toContain(
        "farms/farm-001",
      );
    },
  );

  it(
    "内部エラーと認証情報をブラウザへ漏らさない",
    async () => {
      vi.mocked(
        saveVerifiedLineUser,
      ).mockRejectedValue(
        new Error(
          "users/internal-user-id secret-sub",
        ),
      );

      const response = await POST(
        createJsonRequest(validRequestBody()),
      );

      const responseText =
        await response.text();

      expect(response.status).toBe(502);

      expect(responseText).not.toContain(
        idToken,
      );

      expect(responseText).not.toContain(
        verifiedResponse.sub,
      );

      expect(responseText).not.toContain(
        "internal-user-id",
      );

      expect(responseText).not.toContain(
        "secret-sub",
      );
    },
  );
});

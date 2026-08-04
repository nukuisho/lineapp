import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  getAvailableFarms,
} from "../../../src/lib/firebase/available-farms";
import {
  GET,
} from "./route";

vi.mock(
  "../../../src/lib/firebase/available-farms",
  () => ({
    getAvailableFarms: vi.fn(),
  }),
);

describe("GET /api/farms", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it(
    "利用可能な農園一覧だけを返す",
    async () => {
      vi.mocked(
        getAvailableFarms,
      ).mockResolvedValue([
        {
          id: "farm-001",
          name: "青木果樹園",
          ownerName: "青木さん",
          fruitTypes: ["梨"],
        },
      ]);

      const response = await GET();

      expect(response.status).toBe(200);
      expect(
        response.headers.get(
          "Cache-Control",
        ),
      ).toBe("no-store");
      await expect(
        response.json(),
      ).resolves.toEqual({
        farms: [
          {
            id: "farm-001",
            name: "青木果樹園",
            ownerName: "青木さん",
            fruitTypes: ["梨"],
          },
        ],
      });
    },
  );

  it(
    "利用可能な農園がなければ空配列を返す",
    async () => {
      vi.mocked(
        getAvailableFarms,
      ).mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      await expect(
        response.json(),
      ).resolves.toEqual({
        farms: [],
      });
    },
  );

  it(
    "内部エラーの詳細をブラウザへ返さない",
    async () => {
      vi.mocked(
        getAvailableFarms,
      ).mockRejectedValue(
        new Error(
          "projects/secret/databases/farms",
        ),
      );

      const response = await GET();
      const responseText =
        await response.text();

      expect(response.status).toBe(502);
      expect(
        response.headers.get(
          "Cache-Control",
        ),
      ).toBe("no-store");
      expect(responseText).not.toContain(
        "projects/secret",
      );
      expect(responseText).toContain(
        "農園情報を取得できませんでした。",
      );
    },
  );
});


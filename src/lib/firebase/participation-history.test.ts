import {
  Timestamp,
} from "firebase-admin/firestore";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  getFirebaseFirestore,
} from "./admin";
import {
  getParticipationHistory,
} from "./participation-history";

vi.mock("./admin", () => ({
  getFirebaseFirestore: vi.fn(),
}));

const userId = "user-001";

function createDocument(
  id: string,
  data: Record<string, unknown>,
) {
  return {
    id,
    data: vi.fn(() => data),
  };
}

function validData(
  overrides: Record<string, unknown> = {},
) {
  return {
    userId,
    farmName: "テスト梨園A",
    workDate: "2026-08-05",
    workType: "袋掛け",
    timeCategory: "午前",
    status: "ACTIVE",
    createdAt:
      Timestamp.fromMillis(1000),
    ...overrides,
  };
}

describe("getParticipationHistory", () => {
  const get = vi.fn();

  const where = vi.fn(() => ({
    get,
  }));

  const collection = vi.fn(() => ({
    where,
  }));

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      getFirebaseFirestore,
    ).mockReturnValue({
      collection,
    } as never);

    get.mockResolvedValue({
      docs: [],
    });
  });

  it(
    "本人の有効な履歴を新しい順で返す",
    async () => {
      get.mockResolvedValue({
        docs: [
          createDocument(
            "participation-old",
            validData({
              workDate: "2026-07-20",
            }),
          ),
          createDocument(
            "participation-newer-created",
            validData({
              createdAt:
                Timestamp.fromMillis(3000),
              comment:
                "  お疲れさまでした。  ",
            }),
          ),
          createDocument(
            "participation-new",
            validData({
              createdAt:
                Timestamp.fromMillis(2000),
            }),
          ),
        ],
      });

      await expect(
        getParticipationHistory(userId),
      ).resolves.toEqual([
        {
          id:
            "participation-newer-created",
          farmName: "テスト梨園A",
          workDate: "2026-08-05",
          workType: "袋掛け",
          timeCategory: "午前",
          comment:
            "お疲れさまでした。",
        },
        {
          id: "participation-new",
          farmName: "テスト梨園A",
          workDate: "2026-08-05",
          workType: "袋掛け",
          timeCategory: "午前",
        },
        {
          id: "participation-old",
          farmName: "テスト梨園A",
          workDate: "2026-07-20",
          workType: "袋掛け",
          timeCategory: "午前",
        },
      ]);

      expect(collection).toHaveBeenCalledWith(
        "participations",
      );

      expect(where).toHaveBeenCalledWith(
        "userId",
        "==",
        userId,
      );
    },
  );

  it.each([
    [
      "他人の履歴",
      {
        userId: "another-user",
      },
    ],
    [
      "削除済みの履歴",
      {
        status: "DELETED",
      },
    ],
    [
      "不正な作業日",
      {
        workDate: "2026-02-30",
      },
    ],
    [
      "不正な作業内容",
      {
        workType: "不正",
      },
    ],
    [
      "不正な作業時間",
      {
        timeCategory: "夜間",
      },
    ],
    [
      "不正な作成日時",
      {
        createdAt: "invalid",
      },
    ],
  ])(
    "%sをレスポンスへ含めない",
    async (_, overrides) => {
      get.mockResolvedValue({
        docs: [
          createDocument(
            "invalid-participation",
            validData(overrides),
          ),
        ],
      });

      await expect(
        getParticipationHistory(userId),
      ).resolves.toEqual([]);
    },
  );

  it(
    "空のユーザーIDではFirestoreを読み取らない",
    async () => {
      await expect(
        getParticipationHistory("  "),
      ).rejects.toThrow(
        "参加履歴のユーザーを確認できませんでした。",
      );

      expect(
        collection,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    "新しい履歴を最大50件返す",
    async () => {
      get.mockResolvedValue({
        docs: Array.from(
          {
            length: 51,
          },
          (_, index) =>
            createDocument(
              `participation-${index}`,
              validData({
                createdAt:
                  Timestamp.fromMillis(
                    index,
                  ),
              }),
            ),
        ),
      });

      const history =
        await getParticipationHistory(
          userId,
        );

      expect(history).toHaveLength(50);

      expect(history[0]?.id).toBe(
        "participation-50",
      );

      expect(history.at(-1)?.id).toBe(
        "participation-1",
      );
    },
  );
});

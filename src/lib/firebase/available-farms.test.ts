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
  getAvailableFarms,
} from "./available-farms";

vi.mock("./admin", () => ({
  getFirebaseFirestore: vi.fn(),
}));

const timestamp =
  Timestamp.fromMillis(1_700_000_000_000);

function createDocument(
  id: string,
  data: Record<string, unknown>,
) {
  return {
    id,
    data: vi.fn(() => data),
  };
}

describe("getAvailableFarms", () => {
  const get = vi.fn();
  const secondWhere = vi.fn(
    () => ({
      get,
    }),
  );
  const firstWhere = vi.fn(
    () => ({
      where: secondWhere,
    }),
  );
  const collection = vi.fn(
    () => ({
      where: firstWhere,
    }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      getFirebaseFirestore,
    ).mockReturnValue({
      collection,
    } as never);
  });

  it(
    "利用中かつ受付中の農園を名前順で返す",
    async () => {
      get.mockResolvedValue({
        docs: [
          createDocument(
            "farm-002",
            {
              name: "やまだ果樹園",
              ownerName: "山田さん",
              fruitTypes: ["梨"],
              isActive: true,
              isAccepting: true,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ),
          createDocument(
            "farm-001",
            {
              name: "あおき果樹園",
              ownerName: "青木さん",
              fruitTypes: ["梨"],
              isActive: true,
              isAccepting: true,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          ),
        ],
      });

      await expect(
        getAvailableFarms(),
      ).resolves.toEqual([
        {
          id: "farm-001",
          name: "あおき果樹園",
          ownerName: "青木さん",
          fruitTypes: ["梨"],
        },
        {
          id: "farm-002",
          name: "やまだ果樹園",
          ownerName: "山田さん",
          fruitTypes: ["梨"],
        },
      ]);

      expect(collection).toHaveBeenCalledWith(
        "farms",
      );
      expect(firstWhere).toHaveBeenCalledWith(
        "isActive",
        "==",
        true,
      );
      expect(secondWhere).toHaveBeenCalledWith(
        "isAccepting",
        "==",
        true,
      );
      expect(get).toHaveBeenCalledOnce();
    },
  );

  it(
    "対象農園がなければ空配列を返す",
    async () => {
      get.mockResolvedValue({
        docs: [],
      });

      await expect(
        getAvailableFarms(),
      ).resolves.toEqual([]);
    },
  );

  it(
    "不正な農園ドキュメントが含まれれば一覧全体を拒否する",
    async () => {
      get.mockResolvedValue({
        docs: [
          createDocument(
            "farm-001",
            {
              name: "不正な農園",
              ownerName: "農家さん",
              fruitTypes: ["梨"],
              isActive: true,
              isAccepting: true,
              createdAt: "2026-08-04",
              updatedAt: timestamp,
            },
          ),
        ],
      });

      await expect(
        getAvailableFarms(),
      ).rejects.toThrow(
        "農園データを取得できませんでした。",
      );
    },
  );

  it(
    "Firestore読み取り失敗を呼び出し元へ返す",
    async () => {
      const firestoreError =
        new Error("firestore failed");

      get.mockRejectedValue(
        firestoreError,
      );

      await expect(
        getAvailableFarms(),
      ).rejects.toBe(
        firestoreError,
      );
    },
  );
});


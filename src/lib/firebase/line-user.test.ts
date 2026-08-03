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
  saveVerifiedLineUser,
} from "./line-user";

vi.mock("./admin", () => ({
  getFirebaseFirestore: vi.fn(),
}));

describe("saveVerifiedLineUser", () => {
  const userReference = {
    path: "users/internal-user-id",
  };
  const get = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const transaction = {
    get,
    create,
    update,
  };
  const runTransaction = vi.fn(
    async (
      callback: (
        value: typeof transaction,
      ) => Promise<unknown>,
    ) => callback(transaction),
  );
  const doc = vi.fn(
    () => userReference,
  );
  const collection = vi.fn(
    () => ({
      doc,
    }),
  );
  const firestore = {
    collection,
    runTransaction,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(
      getFirebaseFirestore,
    ).mockReturnValue(
      firestore as never,
    );
  });

  it(
    "新規ユーザーを初期集計値とサーバー時刻で作成する",
    async () => {
      get.mockResolvedValue({
        exists: false,
      });

      await expect(
        saveVerifiedLineUser(
          "1234567890",
          "U1234567890",
        ),
      ).resolves.toBe("created");

      expect(collection).toHaveBeenCalledWith(
        "users",
      );
      expect(doc).toHaveBeenCalledWith(
        "ec26ab42c83fb4f07a31c3eea056d7da398aeebdff4d6f71aad08c1dc1323e1a",
      );
      expect(create).toHaveBeenCalledOnce();
      expect(update).not.toHaveBeenCalled();

      const createdData =
        create.mock.calls[0]?.[1];

      expect(createdData).toEqual({
        totalParticipations: 0,
        totalStamps: 0,
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
        lastAuthenticatedAt:
          expect.anything(),
      });
      expect(createdData).not.toHaveProperty(
        "sub",
      );
      expect(createdData).not.toHaveProperty(
        "lineUserId",
      );
      expect(createdData).not.toHaveProperty(
        "channelId",
      );
    },
  );

  it(
    "既存ユーザーは認証日時だけを更新して集計値を維持する",
    async () => {
      get.mockResolvedValue({
        exists: true,
      });

      await expect(
        saveVerifiedLineUser(
          "1234567890",
          "U1234567890",
        ),
      ).resolves.toBe("reused");

      expect(update).toHaveBeenCalledOnce();
      expect(create).not.toHaveBeenCalled();

      const updatedData =
        update.mock.calls[0]?.[1];

      expect(updatedData).toEqual({
        updatedAt: expect.anything(),
        lastAuthenticatedAt:
          expect.anything(),
      });
      expect(updatedData).not.toHaveProperty(
        "totalParticipations",
      );
      expect(updatedData).not.toHaveProperty(
        "totalStamps",
      );
      expect(updatedData).not.toHaveProperty(
        "createdAt",
      );
      expect(updatedData).not.toHaveProperty(
        "sub",
      );
    },
  );

  it(
    "Transactionの読み取り失敗を呼び出し元へ返す",
    async () => {
      const firestoreError =
        new Error("firestore failed");

      get.mockRejectedValue(
        firestoreError,
      );

      await expect(
        saveVerifiedLineUser(
          "1234567890",
          "U1234567890",
        ),
      ).rejects.toBe(
        firestoreError,
      );

      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );
});

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
  registerParticipation,
} from "./participation-registration";

vi.mock("./admin", () => ({
  getFirebaseFirestore: vi.fn(),
}));

const firestoreTimestamp =
  Timestamp.fromMillis(1_700_000_000_000);

const userId = "user-001";
const farmId = "farm-001";
const duplicateKey =
  "user-001_farm-001_2026-08-05";

function createReference(
  collectionName: string,
  id: string,
) {
  return {
    id,
    path: `${collectionName}/${id}`,
  };
}

describe("registerParticipation", () => {
  let userExists = true;
  let duplicateExists = false;
  let farmData: Record<string, unknown>;

  const userReference =
    createReference("users", userId);
  const farmReference =
    createReference("farms", farmId);
  const duplicateKeyReference =
    createReference(
      "participationKeys",
      duplicateKey,
    );
  const participationReference =
    createReference(
      "participations",
      "participation-001",
    );

  const get = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const runTransaction = vi.fn(
    async (
      callback: (transaction: {
        get: typeof get;
        create: typeof create;
        update: typeof update;
      }) => unknown,
    ) =>
      callback({
        get,
        create,
        update,
      }),
  );

  const collection = vi.fn(
    (collectionName: string) => ({
      doc: vi.fn((id?: string) => {
        if (collectionName === "users") {
          return userReference;
        }

        if (collectionName === "farms") {
          return farmReference;
        }

        if (
          collectionName ===
          "participationKeys"
        ) {
          return duplicateKeyReference;
        }

        if (
          collectionName ===
          "participations"
        ) {
          return participationReference;
        }

        return createReference(
          collectionName,
          id ?? "auto-id",
        );
      }),
    }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
    userExists = true;
    duplicateExists = false;
    farmData = {
      name: "川崎果樹園",
      ownerName: "川崎さん",
      fruitTypes: ["梨"],
      isActive: true,
      isAccepting: true,
      createdAt: firestoreTimestamp,
      updatedAt: firestoreTimestamp,
    };
    vi.mocked(
      getFirebaseFirestore,
    ).mockReturnValue({
      collection,
      runTransaction,
    } as never);

    get.mockImplementation(
      async (reference: { path: string }) => {
        if (
          reference.path ===
          userReference.path
        ) {
          return {
            exists: userExists,
          };
        }

        if (
          reference.path ===
          farmReference.path
        ) {
          return {
            exists: true,
            id: farmId,
            data: vi.fn(() => farmData),
          };
        }

        if (
          reference.path ===
          duplicateKeyReference.path
        ) {
          return {
            exists: duplicateExists,
          };
        }

        throw new Error(
          `Unexpected reference: ${reference.path}`,
        );
      },
    );
  });

  it(
    "有効な入力なら参加履歴を作成し、ユーザー集計を更新する",
    async () => {
      await expect(
        registerParticipation({
          userId,
          farmId,
          workType: "袋掛け",
          timeCategory: "午前",
          comment: "  よろしくお願いします。  ",
          currentDate: new Date(
            "2026-08-04T15:30:00.000Z",
          ),
        }),
      ).resolves.toEqual({
        participationId:
          "participation-001",
        farm: {
          id: farmId,
          name: "川崎果樹園",
          ownerName: "川崎さん",
          fruitTypes: ["梨"],
        },
        workDate: "2026-08-05",
        workType: "袋掛け",
        timeCategory: "午前",
        comment: "よろしくお願いします。",
        stampsGranted: 1,
      });

      expect(runTransaction).toHaveBeenCalledOnce();
      expect(get).toHaveBeenCalledWith(
        userReference,
      );
      expect(get).toHaveBeenCalledWith(
        farmReference,
      );
      expect(get).toHaveBeenCalledWith(
        duplicateKeyReference,
      );

      expect(create).toHaveBeenCalledWith(
        participationReference,
        expect.objectContaining({
          userId,
          farmId,
          farmName: "川崎果樹園",
          farmOwnerName: "川崎さん",
          farmFruitTypes: ["梨"],
          workDate: "2026-08-05",
          workType: "袋掛け",
          timeCategory: "午前",
          comment: "よろしくお願いします。",
          stampsGranted: 1,
          status: "ACTIVE",
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
        }),
      );

      expect(create).toHaveBeenCalledWith(
        duplicateKeyReference,
        expect.objectContaining({
          userId,
          farmId,
          workDate: "2026-08-05",
          createdAt: expect.anything(),
        }),
      );

      expect(update).toHaveBeenCalledWith(
        userReference,
        expect.objectContaining({
          totalParticipations:
            expect.anything(),
          totalStamps: expect.anything(),
          updatedAt: expect.anything(),
        }),
      );
    },
  );

  it(
    "重複キーが存在する場合は履歴と集計を変更せず拒否する",
    async () => {
      duplicateExists = true;

      await expect(
        registerParticipation({
          userId,
          farmId,
          workType: "袋掛け",
          timeCategory: "午前",
          currentDate: new Date(
            "2026-08-04T15:30:00.000Z",
          ),
        }),
      ).rejects.toThrow(
        "本日のこの農園への参加は、すでに記録されています。",
      );

      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );

  it(
    "利用できない農園では履歴と集計を変更せず拒否する",
    async () => {
      farmData = {
        ...farmData,
        isAccepting: false,
      };

      await expect(
        registerParticipation({
          userId,
          farmId,
          workType: "袋掛け",
          timeCategory: "午前",
          currentDate: new Date(
            "2026-08-04T15:30:00.000Z",
          ),
        }),
      ).rejects.toThrow(
        "参加登録の農園を確認できませんでした。",
      );

      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );

  it(
    "不正な作業内容ではFirestore Transactionを開始しない",
    async () => {
      await expect(
        registerParticipation({
          userId,
          farmId,
          workType: "不正な作業",
          timeCategory: "午前",
        }),
      ).rejects.toThrow(
        "参加登録の入力を確認できませんでした。",
      );

      expect(runTransaction).not.toHaveBeenCalled();
      expect(get).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );

  it(
    "500文字を超えるコメントではFirestore Transactionを開始しない",
    async () => {
      await expect(
        registerParticipation({
          userId,
          farmId,
          workType: "袋掛け",
          timeCategory: "午前",
          comment: "あ".repeat(501),
        }),
      ).rejects.toThrow(
        "参加登録の入力を確認できませんでした。",
      );

      expect(runTransaction).not.toHaveBeenCalled();
      expect(get).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );
});

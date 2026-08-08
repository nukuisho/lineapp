import { describe, expect, it, vi } from "vitest";
import { parseResetArguments, resetPocUser } from "./reset-poc-user.mjs";

describe("parseResetArguments", () => {
  it("確認対象が一致した場合だけ実行モードにする", () => {
    expect(
      parseResetArguments([
        "--project",
        "development-project",
        "--user-id",
        "internal-user",
        "--confirm-project",
        "development-project",
      ]),
    ).toEqual({
      projectId: "development-project",
      userId: "internal-user",
      confirmed: true,
    });
  });

  it("確認指定がなければdry-runにする", () => {
    expect(
      parseResetArguments([
        "--project",
        "development-project",
        "--user-id",
        "internal-user",
      ]).confirmed,
    ).toBe(false);
  });
});

describe("resetPocUser", () => {
  it("dry-runでは削除や集計更新を行わない", async () => {
    const transaction = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ size: 1, docs: [{ ref: "participation" }] })
        .mockResolvedValueOnce({ size: 1, docs: [{ ref: "key" }] }),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const firestore = createFirestore(transaction);

    await expect(
      resetPocUser({ firestore, userId: "user", confirmed: false }),
    ).resolves.toEqual({
      participations: 1,
      participationKeys: 1,
      executed: false,
    });
    expect(transaction.delete).not.toHaveBeenCalled();
    expect(transaction.update).not.toHaveBeenCalled();
  });

  it("実行時は履歴と重複キーを削除して集計を0にする", async () => {
    const transaction = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ size: 1, docs: [{ ref: "participation" }] })
        .mockResolvedValueOnce({ size: 1, docs: [{ ref: "key" }] }),
      delete: vi.fn(),
      update: vi.fn(),
    };
    const firestore = createFirestore(transaction);

    await resetPocUser({ firestore, userId: "user", confirmed: true });

    expect(transaction.delete).toHaveBeenCalledTimes(2);
    expect(transaction.update).toHaveBeenCalledWith(
      expect.anything(),
      { totalParticipations: 0, totalStamps: 0 },
    );
  });
});

function createFirestore(transaction) {
  const collection = vi.fn(() => ({
    doc: vi.fn(() => ({ path: "users/user" })),
    where: vi.fn(() => ({ kind: "query" })),
  }));

  return {
    collection,
    runTransaction: vi.fn((callback) => callback(transaction)),
  };
}

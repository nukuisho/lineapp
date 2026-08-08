import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFirebaseFirestore } from "./admin";
import { getUserSummary } from "./user-summary";

vi.mock("./admin", () => ({
  getFirebaseFirestore: vi.fn(),
}));

describe("getUserSummary", () => {
  const get = vi.fn();
  const doc = vi.fn(() => ({ get }));
  const collection = vi.fn(() => ({ doc }));

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirebaseFirestore).mockReturnValue(
      { collection } as never,
    );
  });

  it("指定した本人のusersドキュメントだけを取得する", async () => {
    get.mockResolvedValue({
      exists: true,
      data: () => ({ totalParticipations: 4, totalStamps: 6 }),
    });

    await expect(getUserSummary("internal-user-id")).resolves.toEqual({
      totalParticipations: 4,
      totalStamps: 6,
    });
    expect(collection).toHaveBeenCalledWith("users");
    expect(doc).toHaveBeenCalledWith("internal-user-id");
  });

  it("未作成の利用者は0件として返す", async () => {
    get.mockResolvedValue({ exists: false });
    await expect(getUserSummary("new-user")).resolves.toEqual({
      totalParticipations: 0,
      totalStamps: 0,
    });
  });

  it.each([
    { totalParticipations: "1", totalStamps: 1 },
    { totalParticipations: 1, totalStamps: -1 },
    { totalParticipations: 1.2, totalStamps: 1 },
  ])("不正なFirestoreデータを拒否する", async (data) => {
    get.mockResolvedValue({ exists: true, data: () => data });
    await expect(getUserSummary("user")).rejects.toThrow();
  });
});

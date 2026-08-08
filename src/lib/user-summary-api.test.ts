import { describe, expect, it } from "vitest";
import {
  getUserSummaryErrorMessage,
  parseUserSummaryResponse,
} from "./user-summary-api";

describe("parseUserSummaryResponse", () => {
  it("有効な参加回数とスタンプ数を返す", () => {
    expect(
      parseUserSummaryResponse({
        retrieved: true,
        totalParticipations: 3,
        totalStamps: 5,
      }),
    ).toEqual({
      totalParticipations: 3,
      totalStamps: 5,
    });
  });

  it.each([
    null,
    {},
    { retrieved: false, totalParticipations: 0, totalStamps: 0 },
    { retrieved: true, totalParticipations: -1, totalStamps: 0 },
    { retrieved: true, totalParticipations: 1.5, totalStamps: 0 },
    { retrieved: true, totalParticipations: 0, totalStamps: "1" },
  ])("不正なAPIレスポンスを拒否する", (value) => {
    expect(parseUserSummaryResponse(value)).toBeNull();
  });
});

describe("getUserSummaryErrorMessage", () => {
  it("認証失敗と取得失敗を利用者向けに区別する", () => {
    expect(getUserSummaryErrorMessage(401)).toContain("LINE");
    expect(getUserSummaryErrorMessage(500)).toContain("通信環境");
  });
});

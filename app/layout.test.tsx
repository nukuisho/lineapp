import { describe, expect, it } from "vitest";
import { metadata } from "./layout";

describe("root metadata", () => {
  it("非公式アプリであることを表示する", () => {
    expect(metadata).toMatchObject({
      title: "援農パスポート",
      description: "援農ボランティアの参加記録アプリ(非公式)",
    });
  });
});

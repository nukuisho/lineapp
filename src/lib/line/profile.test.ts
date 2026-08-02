import {
  describe,
  expect,
  it,
} from "vitest";
import { getLineDisplayName } from "./profile";

describe("getLineDisplayName", () => {
  it("LINEプロフィールの表示名を返す", () => {
    expect(
      getLineDisplayName({
        displayName: "山田 花子",
      }),
    ).toBe("山田 花子");
  });

  it("表示名の前後の空白を除去する", () => {
    expect(
      getLineDisplayName({
        displayName: "  山田 花子  ",
      }),
    ).toBe("山田 花子");
  });

  it.each([
    null,
    undefined,
    {},
    {
      displayName: "",
    },
    {
      displayName: "   ",
    },
    {
      displayName: 123,
    },
  ])(
    "不正なプロフィールを拒否する",
    (profile) => {
      expect(
        getLineDisplayName(profile),
      ).toBeNull();
    },
  );
});
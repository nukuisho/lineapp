import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createInternalUserId,
} from "./internal-user-id";

describe("createInternalUserId", () => {
  it(
    "チャネルIDと検証済みsubから決定的なIDを生成する",
    () => {
      expect(
        createInternalUserId(
          "1234567890",
          "U1234567890",
        ),
      ).toBe(
        "ec26ab42c83fb4f07a31c3eea056d7da398aeebdff4d6f71aad08c1dc1323e1a",
      );
    },
  );

  it(
    "同じ入力には同じIDを返す",
    () => {
      const first = createInternalUserId(
        "1234567890",
        "U1234567890",
      );
      const second = createInternalUserId(
        "1234567890",
        "U1234567890",
      );

      expect(second).toBe(first);
      expect(first).toMatch(
        /^[a-f0-9]{64}$/,
      );
    },
  );

  it(
    "チャネルが異なれば異なるIDを返す",
    () => {
      expect(
        createInternalUserId(
          "1234567890",
          "U1234567890",
        ),
      ).not.toBe(
        createInternalUserId(
          "0987654321",
          "U1234567890",
        ),
      );
    },
  );

  it(
    "ユーザーが異なれば異なるIDを返す",
    () => {
      expect(
        createInternalUserId(
          "1234567890",
          "U1234567890",
        ),
      ).not.toBe(
        createInternalUserId(
          "1234567890",
          "U0987654321",
        ),
      );
    },
  );

  it(
    "前後の空白を正規化する",
    () => {
      expect(
        createInternalUserId(
          "  1234567890  ",
          "  U1234567890  ",
        ),
      ).toBe(
        createInternalUserId(
          "1234567890",
          "U1234567890",
        ),
      );
    },
  );

  it.each([
    ["", "U1234567890"],
    ["   ", "U1234567890"],
    ["1234567890", ""],
    ["1234567890", "   "],
  ])(
    "空の識別子を拒否する",
    (channelId, subject) => {
      expect(() =>
        createInternalUserId(
          channelId,
          subject,
        ),
      ).toThrow(
        "内部ユーザーIDを生成できません",
      );
    },
  );
});

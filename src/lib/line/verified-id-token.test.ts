import {
  describe,
  expect,
  it,
} from "vitest";
import {
  parseVerifiedIdToken,
} from "./verified-id-token";

const requiredClaims = {
  iss: "https://access.line.me",
  sub: "U1234567890",
  aud: "1234567890",
  exp: 1_800_000_000,
  iat: 1_700_000_000,
};

describe("parseVerifiedIdToken", () => {
  it("必須クレームを持つレスポンスを返す", () => {
    expect(
      parseVerifiedIdToken(requiredClaims),
    ).toEqual(requiredClaims);
  });

  it("任意クレームを持つレスポンスを返す", () => {
    const response = {
      ...requiredClaims,
      auth_time: 1_699_999_000,
      nonce: "nonce-value",
      amr: ["pwd", "lineautologin"],
      name: "山田 花子",
      picture: "https://example.com/profile.jpg",
      email: "hanako@example.com",
    };

    expect(
      parseVerifiedIdToken(response),
    ).toEqual(response);
  });

  it("未知の追加プロパティを無視する", () => {
    expect(
      parseVerifiedIdToken({
        ...requiredClaims,
        future_claim: "value",
      }),
    ).toEqual(requiredClaims);
  });

  it.each([
    null,
    undefined,
    [],
    "response",
    123,
  ])(
    "オブジェクトでないレスポンスを拒否する",
    (response) => {
      expect(
        parseVerifiedIdToken(response),
      ).toBeNull();
    },
  );

  it.each([
    "iss",
    "sub",
    "aud",
    "exp",
    "iat",
  ] as const)(
    "必須クレーム%sがないレスポンスを拒否する",
    (claim) => {
      const response:
        Record<string, unknown> = {
          ...requiredClaims,
        };

      delete response[claim];

      expect(
        parseVerifiedIdToken(response),
      ).toBeNull();
    },
  );

  it.each([
    {
      ...requiredClaims,
      iss: "",
    },
    {
      ...requiredClaims,
      sub: "   ",
    },
    {
      ...requiredClaims,
      aud: 123,
    },
    {
      ...requiredClaims,
      exp: Number.NaN,
    },
    {
      ...requiredClaims,
      exp: Number.POSITIVE_INFINITY,
    },
    {
      ...requiredClaims,
      exp: 1.5,
    },
    {
      ...requiredClaims,
      iat: "1700000000",
    },
  ])(
    "不正な必須クレームを拒否する",
    (response) => {
      expect(
        parseVerifiedIdToken(response),
      ).toBeNull();
    },
  );

  it.each([
    {
      ...requiredClaims,
      auth_time: "1699999000",
    },
    {
      ...requiredClaims,
      nonce: 123,
    },
    {
      ...requiredClaims,
      amr: "pwd",
    },
    {
      ...requiredClaims,
      amr: ["pwd", 123],
    },
    {
      ...requiredClaims,
      name: 123,
    },
    {
      ...requiredClaims,
      picture: null,
    },
    {
      ...requiredClaims,
      email: false,
    },
  ])(
    "型が不正な任意クレームを拒否する",
    (response) => {
      expect(
        parseVerifiedIdToken(response),
      ).toBeNull();
    },
  );
});

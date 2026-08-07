import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getLiffInitDiagnosticCode,
} from "./liff-init-diagnostic";

describe(
  "getLiffInitDiagnosticCode",
  () => {
    it.each([
      [
        "INVALID_CONFIG",
        "LIFF-INIT-CONFIGURATION",
      ],
      [
        "INIT_FAILED",
        "LIFF-INIT-FAILED",
      ],
      [
        "UNAUTHORIZED",
        "LIFF-INIT-UNAUTHORIZED",
      ],
      [
        "FORBIDDEN",
        "LIFF-INIT-FORBIDDEN",
      ],
      [
        "TIMEOUT",
        "LIFF-INIT-TIMEOUT",
      ],
    ] as const)(
      "%sを安全な診断コードへ変換する",
      (code, expected) => {
        expect(
          getLiffInitDiagnosticCode({
            code,
            message:
              "secret internal details",
            idToken: "secret-token",
          }),
        ).toBe(expected);
      },
    );

    it(
      "LIFF ID設定不足を分類する",
      () => {
        expect(
          getLiffInitDiagnosticCode(
            new Error(
              "NEXT_PUBLIC_LIFF_ID is not configured.",
            ),
          ),
        ).toBe(
          "LIFF-INIT-CONFIGURATION",
        );
      },
    );

    it.each([
      null,
      "error",
      new Error("internal details"),
      {
        code: "UNEXPECTED_CODE",
        token: "secret-token",
      },
    ])(
      "未知のエラーから内部情報を返さない",
      (error) => {
        expect(
          getLiffInitDiagnosticCode(
            error,
          ),
        ).toBe("LIFF-INIT-UNKNOWN");
      },
    );
  },
);

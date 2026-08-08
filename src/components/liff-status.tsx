"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  verifyLineIdToken,
} from "../lib/line/id-token-verification";
import {
  initializeLiff,
} from "../lib/line/liff";
import {
  getLiffInitDiagnosticCode,
  type LiffInitDiagnosticCode,
} from "../lib/line/liff-init-diagnostic";
import {
  getLineDisplayName,
} from "../lib/line/profile";

type LineProfileState =
  | {
      status: "not-logged-in";
    }
  | {
      status: "available";
      displayName: string;
    }
  | {
      status: "unavailable";
    };

type LineVerificationState =
  | {
      status: "not-logged-in";
    }
  | {
      status: "verified";
    }
  | {
      status: "unavailable";
    };

type LiffState =
  | {
      status: "initializing";
    }
  | {
      status: "verifying";
    }
  | {
      status: "ready";
      isInClient: boolean;
      isLoggedIn: boolean;
      profile: LineProfileState;
      verification: LineVerificationState;
    }
  | {
      status: "error";
      diagnosticCode:
        LiffInitDiagnosticCode;
    };

export function LiffStatus() {
  const [state, setState] =
    useState<LiffState>({
      status: "initializing",
    });

  useEffect(() => {
    let isActive = true;

    initializeLiff().then(
      async (liff) => {
        const isLoggedIn =
          liff.isLoggedIn();

        if (isLoggedIn && isActive) {
          setState({
            status: "verifying",
          });
        }

        let profile: LineProfileState = {
          status: "not-logged-in",
        };
        let verification:
          LineVerificationState = {
            status: "not-logged-in",
          };

        if (isLoggedIn) {
          try {
            const result: unknown =
              await liff.getProfile();

            const displayName =
              getLineDisplayName(result);

            profile = displayName
              ? {
                  status: "available",
                  displayName,
                }
              : {
                  status: "unavailable",
                };
          } catch {
            profile = {
              status: "unavailable",
            };
          }

          try {
            const idToken =
              liff.getIDToken();

            const isVerified =
              typeof idToken === "string" &&
              await verifyLineIdToken(
                idToken,
              );

            verification = isVerified
              ? {
                  status: "verified",
                }
              : {
                  status: "unavailable",
                };
          } catch {
            verification = {
              status: "unavailable",
            };
          }
        }

        if (!isActive) {
          return;
        }

        setState({
          status: "ready",
          isInClient: liff.isInClient(),
          isLoggedIn,
          profile,
          verification,
        });
      },
      (error: unknown) => {
        if (!isActive) {
          return;
        }

        setState({
          status: "error",
          diagnosticCode:
            getLiffInitDiagnosticCode(
              error,
            ),
        });
      },
    );

    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === "initializing") {
    return (
      <p
        className="save-status"
        role="status"
        aria-live="polite"
      >
        LINE連携を準備しています…
      </p>
    );
  }

  if (state.status === "verifying") {
    return (
      <p
        className="save-status"
        role="status"
        aria-live="polite"
      >
        LINEアカウントを確認しています…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert">
        <p className="save-status">
          LINE連携を開始できませんでした。
        </p>

        <p className="prototype-note">
          ページを再読み込みしてください。
          解決しない場合は、時間をおいて
          もう一度お試しください。
        </p>

        <p className="prototype-note">
          診断コード：
          {state.diagnosticCode}
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
    >
      <p className="save-status">
        LINE連携の準備ができました。
      </p>

      {state.profile.status ===
        "available" && (
        <p className="save-status">
          {state.profile.displayName}さん
        </p>
      )}

      {state.profile.status ===
        "unavailable" && (
        <p
          className="prototype-note"
          role="alert"
        >
          LINEプロフィールを
          表示できませんでした。
          ページを再読み込みしてください。
        </p>
      )}
    </div>
  );
}

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
      <div
        className="line-status-row"
        role="status"
        aria-live="polite"
      >
        <span className="line-status-dot is-pending" aria-hidden="true" />
        <span>LINE連携を準備しています…</span>
      </div>
    );
  }

  if (state.status === "verifying") {
    return (
      <div
        className="line-status-row"
        role="status"
        aria-live="polite"
      >
        <span className="line-status-dot is-pending" aria-hidden="true" />
        <span>LINEアカウントを確認しています…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="line-status-row is-error" role="alert">
        <span className="line-status-dot is-error" aria-hidden="true" />
        <span>
          LINE連携を確認できません。ページを再読み込みしてください。
        </span>
      </div>
    );
  }

  return (
    <div
      className="line-status-row"
      role="status"
      aria-live="polite"
    >
      <span className="line-status-dot" aria-hidden="true" />
      <span>LINE連携済み</span>

      {state.profile.status ===
        "available" && (
        <strong className="line-status-name">
          {state.profile.displayName}さん
        </strong>
      )}

      {state.profile.status ===
        "unavailable" && (
        <span className="line-status-note">
          ユーザー名を確認できません
        </span>
      )}
    </div>
  );
}

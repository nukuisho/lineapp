"use client";

import { useEffect, useState } from "react";
import { initializeLiff } from "../lib/line/liff";
import { getLineDisplayName } from "../lib/line/profile";

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

type LiffState =
  | {
      status: "initializing";
    }
  | {
      status: "ready";
      isInClient: boolean;
      isLoggedIn: boolean;
      profile: LineProfileState;
    }
  | {
      status: "error";
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

        let profile: LineProfileState = {
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
        }

        if (!isActive) {
          return;
        }

        setState({
          status: "ready",
          isInClient: liff.isInClient(),
          isLoggedIn,
          profile,
        });
      },
      () => {
        if (!isActive) {
          return;
        }

        setState({
          status: "error",
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

<p className="prototype-note">
        {state.isLoggedIn
          ? "LINEにログイン済みです。"
          : "LINEにログインしていません。"}
      </p>
      {state.profile.status ===
        "available" && (
        <div>
          <p className="prototype-note">
            LINEプロフィール（PoC表示）
          </p>

          <p className="save-status">
            {state.profile.displayName}さん
          </p>

          <p className="prototype-note">
            この表示名は本人確認には
            使用していません。
          </p>
        </div>
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
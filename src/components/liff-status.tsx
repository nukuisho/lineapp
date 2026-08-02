"use client";

import { useEffect, useState } from "react";
import { initializeLiff } from "../lib/line/liff";

type LiffState =
  | {
      status: "initializing";
    }
  | {
      status: "ready";
      isInClient: boolean;
      isLoggedIn: boolean;
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
      (liff) => {
        if (!isActive) {
          return;
        }

setState({
          status: "ready",
          isInClient: liff.isInClient(),
          isLoggedIn: liff.isLoggedIn(),
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
    </div>
  );
}
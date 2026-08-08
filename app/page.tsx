"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LiffStatus } from "../src/components/liff-status";
import { ParticipationStamps } from "../src/components/participation-stamps";
import { getLineDisplayName } from "../src/lib/line/profile";
import { initializeLiff } from "../src/lib/line/liff";
import {
  getUserSummaryErrorMessage,
  parseUserSummaryResponse,
  type UserSummary,
} from "../src/lib/user-summary-api";

const mockNotice = {
  id: "notice-001",
  title: "8月の援農活動について",
  body:
    "暑い日が続いています。作業時は飲み物と帽子をご持参ください。",
  publishedAt: "2026年8月2日",
};

export default function HomePage() {
  const [displayName, setDisplayName] = useState("");
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadSummary() {
      try {
        const liff = await initializeLiff();

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        const [profile, idToken] = await Promise.all([
          liff.getProfile(),
          Promise.resolve(liff.getIDToken()),
        ]);
        const validatedDisplayName = getLineDisplayName(profile);

        if (!validatedDisplayName || !idToken) {
          throw new Error("LINE profile is unavailable.");
        }

        const response = await fetch("/api/users/me/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          cache: "no-store",
          signal: controller.signal,
        });
        const responseBody: unknown = await response.json();
        const parsedSummary = response.ok
          ? parseUserSummaryResponse(responseBody)
          : null;

        if (!parsedSummary) {
          if (isActive) {
            setErrorMessage(getUserSummaryErrorMessage(response.status));
            setStatus("error");
          }
          return;
        }

        if (isActive) {
          setDisplayName(validatedDisplayName);
          setSummary(parsedSummary);
          setStatus("ready");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (isActive) {
          setErrorMessage(getUserSummaryErrorMessage(502));
          setStatus("error");
        }
      }
    }

    void loadSummary();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [retryKey]);

  return (
    <main>
      <div className="page">
        <section
          className="hero card"
          aria-labelledby="home-title"
        >
          <h1 id="home-title">
            援農パスポート
          </h1>

          <p>
            ボランティアの参加を記録する
            LINE内の簡単登録アプリです
          </p>
        </section>

        <section
          className="line-status-card"
          aria-label="LINE連携状態"
        >
          <LiffStatus />
        </section>

        <section
          className="notice-card"
          aria-labelledby="notice-title"
        >
          <div className="notice-heading">
            <span
              className="notice-icon"
              aria-hidden="true"
            >
              i
            </span>

            <div>
              <p className="notice-label">
                INFORMATION
              </p>

              <h2 id="notice-title">
                お知らせ
              </h2>
            </div>
          </div>

          <article className="notice-content">
            <h3>{mockNotice.title}</h3>

            <p>{mockNotice.body}</p>

            <div className="notice-meta">
              <time>
                {mockNotice.publishedAt}
              </time>
            </div>
          </article>
        </section>

        <section
          className="card"
          aria-labelledby="user-summary-title"
        >
          <h2 id="user-summary-title">
            {status === "ready" && displayName
              ? `${displayName}さん の参加記録`
              : "あなたの参加記録"}
          </h2>

          {status === "loading" && (
            <p className="welcome-message" role="status">
              LINEプロフィールと参加記録を読み込んでいます…
            </p>
          )}

          {status === "error" && (
            <div className="summary-error">
              <p className="error-text" role="alert">{errorMessage}</p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setStatus("loading");
                  setErrorMessage("");
                  setRetryKey((key) => key + 1);
                }}
              >
                もう一度読み込む
              </button>
            </div>
          )}

          {status === "ready" && summary && (
            <>
              <p className="welcome-message">
                いつもありがとうございます！
              </p>
              <ParticipationStamps
                totalParticipations={summary.totalParticipations}
              />
            </>
          )}
        </section>

        <section
          className="card"
          aria-labelledby="quick-actions-title"
        >
          <h2 id="quick-actions-title">
            すぐできること
          </h2>

          <div className="list quick-actions">
            <Link
              href="/check-in"
              className="primary-button"
            >
              参加を記録する
            </Link>

            <Link
              href="/history"
              className="secondary-button"
            >
              参加履歴を見る
            </Link>

            <Link
              href="/operator"
              className="operator-info-link"
            >
              運営者情報
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ParticipationStamps } from "../src/components/participation-stamps";
import { mockUser } from "../src/lib/mock-data";
import { getPrototypeParticipations } from "../src/lib/prototype-storage";

const mockNotice = {
  id: "notice-001",
  title: "8月の援農活動について",
  body:
    "暑い日が続いています。作業時は飲み物と帽子をご持参ください。",
  publishedAt: "2026年8月2日",
  lineNotificationStatus:
    "LINE通知は次の開発段階で対応予定です",
};

export default function HomePage() {
  const [totalVisits, setTotalVisits] =
    useState(mockUser.totalVisits);

  useEffect(() => {
    const savedParticipations =
      getPrototypeParticipations();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore prototype data from browser storage after hydration.
    setTotalVisits(
      mockUser.totalVisits +
        savedParticipations.length,
    );
  }, []);

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

              <span className="notice-line-status">
                {mockNotice.lineNotificationStatus}
              </span>
            </div>
          </article>
        </section>

        <section
          className="card"
          aria-labelledby="user-summary-title"
        >
          <h2 id="user-summary-title">
            {mockUser.displayName}さん
          </h2>

          <p className="welcome-message">
            いつもありがとうございます！
          </p>

          <ParticipationStamps
            count={totalVisits}
          />
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
          </div>
        </section>
      </div>
    </main>
  );
}

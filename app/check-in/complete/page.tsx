"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  formatJapaneseDate,
} from "../../../src/lib/mock-data";
import {
  readCompletedParticipation,
  type RegisteredParticipation,
} from "../../../src/lib/participation-response";

export default function CompletePage() {
  const [
    participation,
    setParticipation,
  ] = useState<
    | RegisteredParticipation
    | null
    | undefined
  >(undefined);

  useEffect(() => {
    const completedParticipation =
      readCompletedParticipation(
        window.sessionStorage,
      );

    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is available only after the client mounts.
    setParticipation(
      completedParticipation,
    );

    if (
      completedParticipation &&
      "vibrate" in navigator
    ) {
      navigator.vibrate([
        120,
        70,
        120,
      ]);
    }
  }, []);

  if (participation === undefined) {
    return (
      <main>
        <div className="page">
          <section className="card">
            <p
              role="status"
              aria-live="polite"
            >
              登録内容を読み込んでいます…
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!participation) {
    return (
      <main>
        <div className="page">
          <section
            className="hero card"
            aria-labelledby="complete-error-title"
          >
            <h1 id="complete-error-title">
              登録内容を確認できません
            </h1>

            <p>
              参加登録画面から、
              もう一度お試しください。
            </p>
          </section>

          <section className="card">
            <Link
              href="/check-in"
              className="primary-button"
            >
              参加登録へ戻る
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="page">
        <section
          className="hero card"
          aria-labelledby="complete-title"
        >
          <h1 id="complete-title">
            参加登録完了
          </h1>

          <p>
            参加を記録しました。
            今日もおつかれさまでした。
          </p>
        </section>

        <section
          className="card"
          aria-labelledby="summary-title"
        >
          <h2 id="summary-title">
            記録内容
          </h2>

          <ul className="summary-list record-summary">
            <li>
              <span>農園</span>
              <strong>
                {participation.farm.name}
              </strong>
            </li>

            <li>
              <span>農家</span>
              <strong>
                {
                  participation.farm
                    .ownerName
                }
              </strong>
            </li>

            <li>
              <span>作物</span>
              <strong>
                {participation.farm.fruitTypes.join(
                  "・",
                )}
              </strong>
            </li>

            <li>
              <span>作業日</span>
              <strong>
                {formatJapaneseDate(
                  participation.workDate,
                )}
              </strong>
            </li>

            <li>
              <span>作業内容</span>
              <strong>
                {participation.workType}
              </strong>
            </li>

            <li>
              <span>作業時間</span>
              <strong>
                {
                  participation.timeCategory
                }
              </strong>
            </li>

            <li>
              <span>獲得スタンプ</span>
              <strong>
                {
                  participation.stampsGranted
                }
                個
              </strong>
            </li>

            {participation.comment && (
              <li className="summary-comment">
                <span>コメント</span>
                <strong>
                  {participation.comment}
                </strong>
              </li>
            )}
          </ul>

          <p
            className="save-status"
            role="status"
            aria-live="polite"
          >
            参加記録を保存しました。
          </p>
        </section>

        <section className="card">
          <div className="list">
            <Link
              href="/"
              className="primary-button"
            >
              ホームに戻る
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

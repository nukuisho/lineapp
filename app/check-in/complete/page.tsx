"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ParticipationStamps } from "../../../src/components/participation-stamps";
import {
  formatJapaneseDate,
  getFarmById,
  getTodayInJapan,
  isValidTimeCategory,
  isValidWorkType,
  mockUser,
} from "../../../src/lib/mock-data";
import { addPrototypeParticipation } from "../../../src/lib/prototype-storage";

export default function CompletePage() {
  const searchParams = useSearchParams();

  const [isSaved, setIsSaved] =
    useState(false);

  const registrationId =
    searchParams.get("registrationId") ??
    "";

  const farmId =
    searchParams.get("farmId") ?? "";

  const farm = getFarmById(farmId);

  const workDate =
    searchParams.get("workDate") ||
    getTodayInJapan();

  const rawWorkType =
    searchParams.get("workType") ?? "";

  const rawTimeCategory =
    searchParams.get(
      "timeCategory",
    ) ?? "";

  const comment =
    searchParams.get("comment")?.trim() ??
    "";

  const workType =
    isValidWorkType(rawWorkType)
      ? rawWorkType
      : null;

  const timeCategory =
    isValidTimeCategory(
      rawTimeCategory,
    )
      ? rawTimeCategory
      : null;

  useEffect(() => {
    if (
      !registrationId ||
      !farm ||
      !workType ||
      !timeCategory ||
      !workDate
    ) {
      return;
    }

    const saved =
      addPrototypeParticipation({
        id: registrationId,
        farmId: farm.id,
        farmName: farm.name,
        workDate,
        workType,
        timeCategory,
        comment:
          comment || undefined,
        createdAt:
          new Date().toISOString(),
      });

    setIsSaved(true);

    if (
      saved &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate([
        120,
        70,
        120,
      ]);
    }
  }, [
    registrationId,
    farmId,
    farm,
    workDate,
    workType,
    timeCategory,
    comment,
  ]);

  const storedVisitCount =
    isSaved
      ? mockUser.totalVisits + 1
      : mockUser.totalVisits;

  const hasValidRegistration =
    Boolean(
      registrationId &&
      farm &&
      workType &&
      timeCategory &&
      workDate,
    );

  if (!hasValidRegistration) {
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
              <strong>{farm?.name}</strong>
            </li>

            <li>
              <span>農家</span>
              <strong>
                {farm?.ownerName}
              </strong>
            </li>

            <li>
              <span>作物</span>
              <strong>
                {farm?.fruitTypes.join(
                  "・",
                )}
              </strong>
            </li>

            <li>
              <span>作業日</span>
              <strong>
                {formatJapaneseDate(
                  workDate,
                )}
              </strong>
            </li>

            <li>
              <span>作業内容</span>
              <strong>{workType}</strong>
            </li>

            <li>
              <span>作業時間</span>
              <strong>
                {timeCategory}
              </strong>
            </li>

            {comment && (
              <li className="summary-comment">
                <span>コメント</span>
                <strong>{comment}</strong>
              </li>
            )}
          </ul>

          <p
            className="save-status"
            role="status"
            aria-live="polite"
          >
            {isSaved
              ? "参加記録を保存しました。"
              : "参加記録を保存しています…"}
          </p>

          <p className="prototype-note">
            この記録はUI試作用として、
            現在のブラウザ内だけに
            保存されています。
          </p>
        </section>

        <section className="card">
          <ParticipationStamps
            count={storedVisitCount}
          />
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

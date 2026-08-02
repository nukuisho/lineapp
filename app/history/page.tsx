"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatJapaneseDate,
  mockParticipations,
} from "../../src/lib/mock-data";
import {
  getPrototypeParticipations,
  PrototypeParticipation,
} from "../../src/lib/prototype-storage";

type HistoryItem = {
  id: string;
  farmName: string;
  workDate: string;
  workType: string;
  timeCategory: string;
  comment?: string;
  createdAt?: string;
};

export default function HistoryPage() {
  const [participations, setParticipations] =
    useState<HistoryItem[]>(
      mockParticipations,
    );

  useEffect(() => {
    const savedParticipations:
      PrototypeParticipation[] =
        getPrototypeParticipations();

    const combinedParticipations:
      HistoryItem[] = [
        ...savedParticipations,
        ...mockParticipations,
      ];

    combinedParticipations.sort(
      (left, right) => {
        const dateComparison =
          right.workDate.localeCompare(
            left.workDate,
          );

        if (dateComparison !== 0) {
          return dateComparison;
        }

        return (
          right.createdAt ?? ""
        ).localeCompare(
          left.createdAt ?? "",
        );
      },
    );

    setParticipations(
      combinedParticipations,
    );
  }, []);

  return (
    <main>
      <div className="page">
        <section
          className="hero card"
          aria-labelledby="history-title"
        >
          <h1 id="history-title">
            参加履歴
          </h1>

          <p>
            これまでの援農活動を
            新しい順に確認できます。
          </p>
        </section>

        <section
          className="card"
          aria-labelledby="history-list-title"
        >
          <h2 id="history-list-title">
            これまでの参加
          </h2>

          <div className="list history-list">
            {participations.map(
              (participation) => (
                <article
                  key={participation.id}
                  className="list-item history-item"
                >
                  <time
                    dateTime={
                      participation.workDate
                    }
                    className="history-date"
                  >
                    {formatJapaneseDate(
                      participation.workDate,
                    )}
                  </time>

                  <h3>
                    {participation.farmName}
                  </h3>

                  <p>
                    {participation.workType}
                    ・
                    {participation.timeCategory}
                  </p>

                  {participation.comment && (
                    <p className="history-comment">
                      {participation.comment}
                    </p>
                  )}
                </article>
              ),
            )}
          </div>
        </section>

        <section className="card">
          <Link
            href="/"
            className="secondary-button"
          >
            ホームに戻る
          </Link>
        </section>
      </div>
    </main>
  );
}

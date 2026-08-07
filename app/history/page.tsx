"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import {
  formatJapaneseDate,
} from "../../src/lib/mock-data";
import {
  getHistoryErrorMessage,
  parseHistoryResponse,
  type ParticipationHistoryItem,
} from "../../src/lib/participation-history-api";
import {
  initializeLiff,
} from "../../src/lib/line/liff";

type HistoryStatus =
  | "loading"
  | "ready"
  | "error";

export default function HistoryPage() {
  const [
    participations,
    setParticipations,
  ] = useState<
    ParticipationHistoryItem[]
  >([]);

  const [status, setStatus] =
    useState<HistoryStatus>("loading");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const controller =
      new AbortController();

    let isActive = true;

    async function loadHistory() {
      try {
        const liff =
          await initializeLiff();

        if (!liff.isLoggedIn()) {
          liff.login({
            redirectUri:
              window.location.href,
          });

          return;
        }

        const idToken =
          liff.getIDToken();

        if (!idToken) {
          if (isActive) {
            setErrorMessage(
              getHistoryErrorMessage(401),
            );

            setStatus("error");
          }

          return;
        }

        const response = await fetch(
          "/api/participations/history",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              idToken,
            }),
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const responseBody: unknown =
          await response.json();

        const history = response.ok
          ? parseHistoryResponse(
              responseBody,
            )
          : null;

        if (!history) {
          if (isActive) {
            setErrorMessage(
              getHistoryErrorMessage(
                response.status,
              ),
            );

            setStatus("error");
          }

          return;
        }

        if (isActive) {
          setParticipations(history);
          setStatus("ready");
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (isActive) {
          setErrorMessage(
            getHistoryErrorMessage(502),
          );

          setStatus("error");
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
      controller.abort();
    };
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

          {status === "loading" && (
            <p role="status">
              参加履歴を
              読み込んでいます…
            </p>
          )}

          {status === "error" && (
            <div>
              <p
                className="error-text"
                role="alert"
              >
                {errorMessage}
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                もう一度読み込む
              </button>
            </div>
          )}

          {status === "ready" &&
            participations.length === 0 && (
              <p role="status">
                参加履歴はまだありません。
                最初の援農活動を
                記録してみましょう。
              </p>
            )}

          {status === "ready" &&
            participations.length > 0 && (
              <div
                className="list history-list"
              >
                {participations.map(
                  (participation) => (
                    <article
                      key={
                        participation.id
                      }
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
                        {
                          participation.farmName
                        }
                      </h3>

                      <p>
                        {
                          participation.workType
                        }
                        ・
                        {
                          participation.timeCategory
                        }
                      </p>

                      {participation.comment && (
                        <p className="history-comment">
                          {
                            participation.comment
                          }
                        </p>
                      )}
                    </article>
                  ),
                )}
              </div>
            )}
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

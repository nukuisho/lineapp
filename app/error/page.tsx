"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <main>
      <div className="page">
        <section className="hero card" aria-labelledby="error-title">
          <h1 id="error-title">エラーが発生しました</h1>
          <p>参加登録の途中で問題が起きました。時間をおいてもう一度お試しください。</p>
        </section>

        <section className="card">
          <div className="list">
            <Link href="/" className="primary-button">
              ホームへ戻る
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

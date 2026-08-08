import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報 | 援農パスポート",
};

export default function OperatorPage() {
  return (
    <main>
      <div className="page">
        <section
          className="hero card"
          aria-labelledby="operator-title"
        >
          <h1 id="operator-title">
            運営者情報
          </h1>
          <p>
            援農パスポートの運営について
          </p>
        </section>

        <section
          className="card operator-card"
          aria-labelledby="operator-overview-title"
        >
          <h2 id="operator-overview-title">
            サービス概要
          </h2>

          <dl className="operator-details">
            <div>
              <dt>運営形態</dt>
              <dd>個人運営による非公式の試作サービス</dd>
            </div>
            <div>
              <dt>利用目的</dt>
              <dd>援農ボランティアの参加記録と履歴確認</dd>
            </div>
            <div>
              <dt>自治体との関係</dt>
              <dd>自治体が提供・運営する公式サービスではありません</dd>
            </div>
          </dl>
        </section>

        <section
          className="card operator-card"
          aria-labelledby="operator-contact-title"
        >
          <h2 id="operator-contact-title">
            お問い合わせ
          </h2>
          <p>
            運営者名とお問い合わせ窓口は、
            正式運用の開始前に掲載します。
          </p>
        </section>

        <Link
          href="/"
          className="secondary-button"
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}

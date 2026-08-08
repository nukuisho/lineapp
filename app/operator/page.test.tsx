import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OperatorPage, { metadata } from "./page";

describe("OperatorPage", () => {
  it("非公式サービスと運営形態を表示する", () => {
    const markup = renderToStaticMarkup(
      <OperatorPage />,
    );

    expect(markup).toContain("運営者情報");
    expect(markup).toContain("個人運営による非公式の試作サービス");
    expect(markup).toContain("自治体が提供・運営する公式サービスではありません");
    expect(markup).toContain('href="/"');
  });

  it("ページタイトルを設定する", () => {
    expect(metadata).toMatchObject({
      title: "運営者情報 | 援農パスポート",
    });
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ParticipationStamps } from "./participation-stamps";

describe("ParticipationStamps", () => {
  it("参加回数をスタンプ内へ表示する", () => {
    const markup = renderToStaticMarkup(
      <ParticipationStamps
        totalParticipations={2}
      />,
    );

    expect(markup).toContain(">2<");
    expect(markup).toContain("参加回数、現在2回");
    expect(markup).toContain(">回<");
  });

  it("表示値を0以上の整数へ正規化する", () => {
    const markup = renderToStaticMarkup(
      <ParticipationStamps
        totalParticipations={-1}
      />,
    );

    expect(markup).toContain("0回");
    expect(markup).toContain(">0<");
  });
});

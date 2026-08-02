import { describe, expect, it } from "vitest";
import { formatJapaneseDate, isValidTimeCategory, isValidWorkType, sortParticipationsByDateDescending } from "./mock-data";
import { validateCheckInForm } from "./validation";

describe("validateCheckInForm", () => {
  it("作業内容と作業時間が未入力のときにエラーを返す", () => {
    const errors = validateCheckInForm({ workType: "", timeCategory: "" });

    expect(errors.workType).toBe("作業内容を選択してください。");
    expect(errors.timeCategory).toBe("作業時間を選択してください。");
  });

  it("不正な選択肢を拒否する", () => {
    const errors = validateCheckInForm({ workType: "不正な値", timeCategory: "夜間" });

    expect(errors.workType).toBe("選択できない作業内容です。");
    expect(errors.timeCategory).toBe("選択できない作業時間です。");
  });
});

describe("allow-list validation", () => {
  it("許可値を正しく判定する", () => {
    expect(isValidWorkType("摘果")).toBe(true);
    expect(isValidWorkType("不正")).toBe(false);
    expect(isValidTimeCategory("午前")).toBe(true);
    expect(isValidTimeCategory("夜間")).toBe(false);
  });
});

describe("date formatting", () => {
  it("タイムゾーンに依存しない日本語の日付表示に変換する", () => {
    expect(formatJapaneseDate("2026-08-01")).toBe("2026年8月1日");
  });

  it("履歴を新しい順に並べ替える", () => {
    const sorted = sortParticipationsByDateDescending([
      { id: "a", farmName: "A", workDate: "2026-07-10", workType: "摘果", timeCategory: "午前", stampsGranted: 1 },
      { id: "b", farmName: "B", workDate: "2026-07-20", workType: "袋掛け", timeCategory: "午後", stampsGranted: 1 },
    ]);

    expect(sorted[0].id).toBe("b");
    expect(sorted[1].id).toBe("a");
  });
});

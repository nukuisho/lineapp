import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getHistoryErrorMessage,
  parseHistoryResponse,
} from "./participation-history-api";

const participation = {
  id: "participation-001",
  farmName: "テスト梨園A",
  workDate: "2026-08-05",
  workType: "袋掛け",
  timeCategory: "午前",
  comment: "お疲れさまでした。",
};

describe("parseHistoryResponse", () => {
  it(
    "有効な参加履歴レスポンスを受け入れる",
    () => {
      expect(
        parseHistoryResponse({
          retrieved: true,
          participations: [
            participation,
          ],
        }),
      ).toEqual([participation]);
    },
  );

  it(
    "空の参加履歴を受け入れる",
    () => {
      expect(
        parseHistoryResponse({
          retrieved: true,
          participations: [],
        }),
      ).toEqual([]);
    },
  );

  it.each([
    null,
    {},
    {
      retrieved: false,
      participations: [],
    },
    {
      retrieved: true,
      participations: "invalid",
    },
    {
      retrieved: true,
      participations: [
        {
          ...participation,
          workDate: "2026-02-30",
        },
      ],
    },
    {
      retrieved: true,
      participations: [
        {
          ...participation,
          workType: "不正",
        },
      ],
    },
    {
      retrieved: true,
      participations: [
        {
          ...participation,
          timeCategory: "夜間",
        },
      ],
    },
    {
      retrieved: true,
      participations: [
        {
          ...participation,
          comment: null,
        },
      ],
    },
  ])(
    "不正な外部レスポンスを拒否する",
    (value) => {
      expect(
        parseHistoryResponse(value),
      ).toBeNull();
    },
  );
});

describe(
  "getHistoryErrorMessage",
  () => {
    it(
      "401ではLINEログインを案内する",
      () => {
        expect(
          getHistoryErrorMessage(401),
        ).toContain("LINE");
      },
    );

    it(
      "400では入力情報を案内する",
      () => {
        expect(
          getHistoryErrorMessage(400),
        ).toContain("情報");
      },
    );

    it(
      "障害時は再試行を案内する",
      () => {
        expect(
          getHistoryErrorMessage(502),
        ).toContain("もう一度");
      },
    );
  },
);

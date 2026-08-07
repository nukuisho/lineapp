import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getParticipationWorkDateRange,
  getValidatedWorkDate,
} from "./participation-work-date";

describe(
  "getParticipationWorkDateRange",
  () => {
    it(
      "日本時間の当日から1暦月前までを返す",
      () => {
        expect(
          getParticipationWorkDateRange(
            new Date(
              "2026-08-07T03:00:00Z",
            ),
          ),
        ).toEqual({
          minimum: "2026-07-07",
          maximum: "2026-08-07",
        });
      },
    );

    it(
      "前月に同じ日がなければ前月末へ丸める",
      () => {
        expect(
          getParticipationWorkDateRange(
            new Date(
              "2026-03-31T03:00:00Z",
            ),
          ),
        ).toEqual({
          minimum: "2026-02-28",
          maximum: "2026-03-31",
        });
      },
    );

    it(
      "うるう年の前月末を扱う",
      () => {
        expect(
          getParticipationWorkDateRange(
            new Date(
              "2028-03-31T03:00:00Z",
            ),
          ),
        ).toEqual({
          minimum: "2028-02-29",
          maximum: "2028-03-31",
        });
      },
    );

    it(
      "年をまたぐ1暦月前を扱う",
      () => {
        expect(
          getParticipationWorkDateRange(
            new Date(
              "2026-01-30T03:00:00Z",
            ),
          ),
        ).toEqual({
          minimum: "2025-12-30",
          maximum: "2026-01-30",
        });
      },
    );

    it(
      "UTCでは前日でも日本時間の当日を使う",
      () => {
        expect(
          getParticipationWorkDateRange(
            new Date(
              "2026-08-06T16:00:00Z",
            ),
          ),
        ).toEqual({
          minimum: "2026-07-07",
          maximum: "2026-08-07",
        });
      },
    );
  },
);

describe(
  "getValidatedWorkDate",
  () => {
    const currentDate =
      new Date(
        "2026-08-07T03:00:00Z",
      );

    it.each([
      "2026-07-07",
      "2026-07-20",
      "2026-08-07",
    ])(
      "範囲内の日付%sを許可する",
      (workDate) => {
        expect(
          getValidatedWorkDate(
            workDate,
            currentDate,
          ),
        ).toBe(workDate);
      },
    );

    it.each([
      "2026-07-06",
      "2026-08-08",
      "2026-02-30",
      "2026-8-7",
      "invalid-date",
      "",
    ])(
      "範囲外または不正な日付%sを拒否する",
      (workDate) => {
        expect(
          getValidatedWorkDate(
            workDate,
            currentDate,
          ),
        ).toBeNull();
      },
    );
  },
);

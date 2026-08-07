import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getParticipationErrorMessage,
  parseParticipationResponse,
  readCompletedParticipation,
  saveCompletedParticipation,
} from "./participation-response";

const participation = {
  id: "participation-001",
  farm: {
    id: "farm-001",
    name: "川崎果樹園",
    ownerName: "川崎さん",
    fruitTypes: ["梨"],
  },
  workDate: "2026-08-07",
  workType: "摘果",
  timeCategory: "午前",
  comment: "ありがとうございました。",
  stampsGranted: 1,
};

describe(
  "parseParticipationResponse",
  () => {
    it(
      "有効な参加登録結果を返す",
      () => {
        expect(
          parseParticipationResponse({
            registered: true,
            participation,
          }),
        ).toEqual(participation);
      },
    );

    it(
      "コメントがない登録結果を許可する",
      () => {
        const {
          comment: _comment,
          ...withoutComment
        } = participation;

        expect(
          parseParticipationResponse({
            registered: true,
            participation:
              withoutComment,
          }),
        ).toEqual(withoutComment);
      },
    );

    it(
      "不正な農園表示情報を拒否する",
      () => {
        expect(
          parseParticipationResponse({
            registered: true,
            participation: {
              ...participation,
              farm: {
                ...participation.farm,
                fruitTypes: "梨",
              },
            },
          }),
        ).toBeNull();
      },
    );

    it(
      "不正なスタンプ数を拒否する",
      () => {
        expect(
          parseParticipationResponse({
            registered: true,
            participation: {
              ...participation,
              stampsGranted: -1,
            },
          }),
        ).toBeNull();
      },
    );

    it(
      "registeredがtrueでない結果を拒否する",
      () => {
        expect(
          parseParticipationResponse({
            registered: false,
          }),
        ).toBeNull();
      },
    );
  },
);

describe(
  "参加登録結果の画面間受け渡し",
  () => {
    it(
      "保存した登録結果を再検証して読み取る",
      () => {
        const values =
          new Map<string, string>();

        const storage = {
          setItem(
            key: string,
            value: string,
          ) {
            values.set(key, value);
          },
          getItem(key: string) {
            return values.get(key) ?? null;
          },
        };

        saveCompletedParticipation(
          storage,
          participation,
        );

        expect(
          readCompletedParticipation(
            storage,
          ),
        ).toEqual(participation);
      },
    );

    it(
      "改変された保存値を拒否する",
      () => {
        const storage = {
          getItem() {
            return JSON.stringify({
              ...participation,
              stampsGranted: "100",
            });
          },
        };

        expect(
          readCompletedParticipation(
            storage,
          ),
        ).toBeNull();
      },
    );

    it(
      "JSONでない保存値を拒否する",
      () => {
        const storage = {
          getItem() {
            return "invalid-json";
          },
        };

        expect(
          readCompletedParticipation(
            storage,
          ),
        ).toBeNull();
      },
    );
  },
);

describe(
  "getParticipationErrorMessage",
  () => {
    it.each([
      [400, "入力内容"],
      [401, "LINE"],
      [409, "農園"],
      [500, "時間をおいて"],
      [502, "通信環境"],
    ])(
      "%iに対応する案内を返す",
      (status, expected) => {
        expect(
          getParticipationErrorMessage(
            status,
          ),
        ).toContain(expected);
      },
    );
  },
);

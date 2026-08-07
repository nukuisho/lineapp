import {
  describe,
  expect,
  it,
} from "vitest";
import {
  parseAvailableFarmsResponse,
} from "./available-farms-response";

const availableFarm = {
  id: "farm-001",
  name: "川崎果樹園",
  ownerName: "川崎さん",
  fruitTypes: ["梨"],
};

describe(
  "parseAvailableFarmsResponse",
  () => {
    it(
      "有効な農園一覧を返す",
      () => {
        expect(
          parseAvailableFarmsResponse({
            farms: [availableFarm],
          }),
        ).toEqual([availableFarm]);
      },
    );

    it(
      "空の農園一覧を許可する",
      () => {
        expect(
          parseAvailableFarmsResponse({
            farms: [],
          }),
        ).toEqual([]);
      },
    );

    it(
      "不正な農園データを拒否する",
      () => {
        expect(
          parseAvailableFarmsResponse({
            farms: [
              {
                ...availableFarm,
                fruitTypes: "梨",
              },
            ],
          }),
        ).toBeNull();
      },
    );

    it(
      "状態値を含むことを前提にしない",
      () => {
        expect(
          parseAvailableFarmsResponse({
            farms: [
              {
                ...availableFarm,
                isActive: true,
                isAccepting: true,
              },
            ],
          }),
        ).toEqual([availableFarm]);
      },
    );
  },
);

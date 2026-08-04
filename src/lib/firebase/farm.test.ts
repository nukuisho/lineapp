import {
  Timestamp,
} from "firebase-admin/firestore";
import {
  describe,
  expect,
  it,
} from "vitest";
import {
  parseAvailableFarm,
} from "./farm";

const timestamp =
  Timestamp.fromMillis(1_700_000_000_000);

const validFarm = {
  name: "川崎果樹園",
  ownerName: "川崎さん",
  fruitTypes: ["梨"],
  isActive: true,
  isAccepting: true,
  createdAt: timestamp,
  updatedAt: timestamp,
};

describe("parseAvailableFarm", () => {
  it(
    "利用中かつ受付中の農園を表示用データへ変換する",
    () => {
      expect(
        parseAvailableFarm(
          "farm-001",
          validFarm,
        ),
      ).toEqual({
        id: "farm-001",
        name: "川崎果樹園",
        ownerName: "川崎さん",
        fruitTypes: ["梨"],
      });
    },
  );

  it(
    "表示文字列の前後空白を除去する",
    () => {
      expect(
        parseAvailableFarm(
          "  farm-001  ",
          {
            ...validFarm,
            name: "  川崎果樹園  ",
            ownerName: "  川崎さん  ",
            fruitTypes: [
              "  梨  ",
              "  ぶどう  ",
            ],
          },
        ),
      ).toEqual({
        id: "farm-001",
        name: "川崎果樹園",
        ownerName: "川崎さん",
        fruitTypes: [
          "梨",
          "ぶどう",
        ],
      });
    },
  );

  it.each([
    {
      ...validFarm,
      isActive: false,
    },
    {
      ...validFarm,
      isAccepting: false,
    },
    {
      ...validFarm,
      isActive: "true",
    },
    {
      ...validFarm,
      isAccepting: 1,
    },
  ])(
    "利用中かつ受付中でない農園を拒否する",
    (farm) => {
      expect(
        parseAvailableFarm(
          "farm-001",
          farm,
        ),
      ).toBeNull();
    },
  );

  it.each([
    ["", validFarm],
    ["   ", validFarm],
    [
      "farm-001",
      {
        ...validFarm,
        name: "",
      },
    ],
    [
      "farm-001",
      {
        ...validFarm,
        ownerName: 123,
      },
    ],
    [
      "farm-001",
      {
        ...validFarm,
        fruitTypes: [],
      },
    ],
    [
      "farm-001",
      {
        ...validFarm,
        fruitTypes: ["梨", ""],
      },
    ],
    [
      "farm-001",
      {
        ...validFarm,
        createdAt: "2026-08-04",
      },
    ],
    [
      "farm-001",
      {
        ...validFarm,
        updatedAt: null,
      },
    ],
    ["farm-001", null],
    ["farm-001", []],
  ])(
    "不正な農園データを拒否する",
    (id, farm) => {
      expect(
        parseAvailableFarm(
          id,
          farm,
        ),
      ).toBeNull();
    },
  );
});


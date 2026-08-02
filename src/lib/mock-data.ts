export const mockUser = {
  id: "user-001",
  displayName: "稲城 太郎",
  pictureUrl: null as string | null,
  totalVisits: 7,
};

export const mockFarm = {
  id: "farm-001",
  name: "川崎果樹園",
  ownerName: "川崎さん",
  fruitTypes: ["梨"],
  isActive: true,
};

export const mockParticipations = [
  {
    id: "participation-001",
    farmName: "川崎果樹園",
    workDate: "2026-07-20",
    workType: "袋掛け",
    timeCategory: "午前",
    stampsGranted: 1,
  },
  {
    id: "participation-002",
    farmName: "稲城梨園",
    workDate: "2026-07-16",
    workType: "摘果",
    timeCategory: "午後",
    stampsGranted: 1,
  },
  {
    id: "participation-003",
    farmName: "進則園",
    workDate: "2026-07-10",
    workType: "圃場整備",
    timeCategory: "終日",
    stampsGranted: 1,
  },
];

export const workTypeOptions = [
  "花摘み",
  "花粉付け",
  "摘果",
  "袋掛け",
  "袋破り",
  "土づくり",
  "剪定枝処理",
  "その他",
] as const;

export const timeCategoryOptions = ["午前", "午後", "終日"] as const;

export type WorkType = (typeof workTypeOptions)[number];
export type TimeCategory = (typeof timeCategoryOptions)[number];

export function isValidWorkType(value: string): value is WorkType {
  return workTypeOptions.includes(value as WorkType);
}

export function isValidTimeCategory(value: string): value is TimeCategory {
  return timeCategoryOptions.includes(value as TimeCategory);
}

export function formatJapaneseDate(value: string): string {
  const [year, month, day] = value.split("-").map((segment) => Number(segment));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return value;
  }

  return `${year}年${month}月${day}日`;
}

export function sortParticipationsByDateDescending(items: typeof mockParticipations) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(`${left.workDate}T00:00:00`);
    const rightDate = new Date(`${right.workDate}T00:00:00`);
    return rightDate.getTime() - leftDate.getTime();
  });
}

export function getActiveFarms() {
  return [
    {
      id: "farm-001",
      name: "川崎果樹園",
      ownerName: "川崎さん",
      fruitTypes: ["梨"],
      isActive: true,
    },
    {
      id: "farm-002",
      name: "稲城梨園",
      ownerName: "稲城さん",
      fruitTypes: ["梨"],
      isActive: true,
    },
    {
      id: "farm-003",
      name: "進則園",
      ownerName: "進則さん",
      fruitTypes: ["梨"],
      isActive: true,
    },
  ];
}

export function getFarmById(
  farmId: string | null,
) {
  if (!farmId) {
    return null;
  }

  return (
    getActiveFarms().find(
      (farm) =>
        farm.id === farmId &&
        farm.isActive,
    ) ?? null
  );
}

export function getTodayInJapan(): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year",
  )?.value;

  const month = parts.find(
    (part) => part.type === "month",
  )?.value;

  const day = parts.find(
    (part) => part.type === "day",
  )?.value;

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

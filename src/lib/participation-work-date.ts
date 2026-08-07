export type ParticipationWorkDateRange = {
  minimum: string;
  maximum: string;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function formatDateParts(
  parts: DateParts,
): string {
  return [
    parts.year.toString().padStart(4, "0"),
    parts.month.toString().padStart(2, "0"),
    parts.day.toString().padStart(2, "0"),
  ].join("-");
}

function getDatePartsInJapan(
  currentDate: Date,
): DateParts {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(currentDate);

  const year = Number(
    parts.find(
      (part) => part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month",
    )?.value,
  );

  const day = Number(
    parts.find(
      (part) => part.type === "day",
    )?.value,
  );

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new Error(
      "日本時間の日付を確定できませんでした。",
    );
  }

  return {
    year,
    month,
    day,
  };
}

function getDaysInMonth(
  year: number,
  month: number,
): number {
  return new Date(
    Date.UTC(year, month, 0),
  ).getUTCDate();
}

function isValidDateString(
  value: string,
): boolean {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= getDaysInMonth(year, month)
  );
}

export function getParticipationWorkDateRange(
  currentDate: Date = new Date(),
): ParticipationWorkDateRange {
  const current =
    getDatePartsInJapan(currentDate);

  const previousMonth =
    current.month === 1
      ? 12
      : current.month - 1;

  const previousMonthYear =
    current.month === 1
      ? current.year - 1
      : current.year;

  const previousMonthDay = Math.min(
    current.day,
    getDaysInMonth(
      previousMonthYear,
      previousMonth,
    ),
  );

  return {
    minimum: formatDateParts({
      year: previousMonthYear,
      month: previousMonth,
      day: previousMonthDay,
    }),
    maximum: formatDateParts(current),
  };
}

export function getValidatedWorkDate(
  value: unknown,
  currentDate: Date = new Date(),
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!isValidDateString(normalizedValue)) {
    return null;
  }

  const range =
    getParticipationWorkDateRange(
      currentDate,
    );

  if (
    normalizedValue < range.minimum ||
    normalizedValue > range.maximum
  ) {
    return null;
  }

  return normalizedValue;
}

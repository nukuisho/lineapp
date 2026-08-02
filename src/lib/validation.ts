import { isValidTimeCategory, isValidWorkType, type TimeCategory, type WorkType } from "./mock-data";

export type CheckInFormValues = {
  workType: string;
  timeCategory: string;
};

export function validateCheckInForm(values: CheckInFormValues) {
  const errors: Partial<Record<keyof CheckInFormValues, string>> = {};

  if (!values.workType.trim()) {
    errors.workType = "作業内容を選択してください。";
  } else if (!isValidWorkType(values.workType)) {
    errors.workType = "選択できない作業内容です。";
  }

  if (!values.timeCategory.trim()) {
    errors.timeCategory = "作業時間を選択してください。";
  } else if (!isValidTimeCategory(values.timeCategory)) {
    errors.timeCategory = "選択できない作業時間です。";
  }

  return errors;
}

export function getValidatedWorkType(value: string | null | undefined): WorkType | null {
  if (!value) {
    return null;
  }

  return isValidWorkType(value) ? value : null;
}

export function getValidatedTimeCategory(value: string | null | undefined): TimeCategory | null {
  if (!value) {
    return null;
  }

  return isValidTimeCategory(value) ? value : null;
}

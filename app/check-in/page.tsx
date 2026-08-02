"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getActiveFarms,
  getFarmById,
  getTodayInJapan,
  timeCategoryOptions,
  workTypeOptions,
} from "../../src/lib/mock-data";

type FormErrors = {
  farmId?: string;
  workDate?: string;
  workType?: string;
  timeCategory?: string;
  comment?: string;
  photo?: string;
};

const mockDelayMilliseconds = 700;
const maximumCommentLength = 500;
const maximumPhotoBytes = 5 * 1024 * 1024;

export default function CheckInPage() {
  const router = useRouter();

  const activeFarms = useMemo(
    () => getActiveFarms(),
    [],
  );

  const [workDate, setWorkDate] =
    useState(() => getTodayInJapan());

  const [farmId, setFarmId] =
    useState("");

  const [workType, setWorkType] =
    useState("");

  const [
    timeCategory,
    setTimeCategory,
  ] = useState("");

  const [comment, setComment] =
    useState("");

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [photoPreviewUrl, setPhotoPreviewUrl] =
    useState<string | null>(null);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedFarm =
    getFarmById(farmId);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(
          photoPreviewUrl,
        );
      }
    };
  }, [photoPreviewUrl]);

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!getFarmById(farmId)) {
      nextErrors.farmId =
        "農園を選択してください。";
    }

    if (!workDate) {
      nextErrors.workDate =
        "作業日を選択してください。";
    }

    if (!workType) {
      nextErrors.workType =
        "作業内容を選択してください。";
    }

    if (!timeCategory) {
      nextErrors.timeCategory =
        "作業時間を選択してください。";
    }

    if (
      comment.length >
      maximumCommentLength
    ) {
      nextErrors.comment =
        `コメントは${maximumCommentLength}文字以内で入力してください。`;
    }

    if (
      photo &&
      !photo.type.startsWith("image/")
    ) {
      nextErrors.photo =
        "画像ファイルを選択してください。";
    }

    if (
      photo &&
      photo.size > maximumPhotoBytes
    ) {
      nextErrors.photo =
        "写真は5MB以下にしてください。";
    }

    return nextErrors;
  }

  function handlePhotoChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const nextPhoto =
      event.target.files?.[0] ?? null;

    if (photoPreviewUrl) {
      URL.revokeObjectURL(
        photoPreviewUrl,
      );
    }

    setPhoto(nextPhoto);
    setErrors((current) => ({
      ...current,
      photo: undefined,
    }));

    if (!nextPhoto) {
      setPhotoPreviewUrl(null);
      return;
    }

    setPhotoPreviewUrl(
      URL.createObjectURL(nextPhoto),
    );
  }

  function removePhoto() {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(
        photoPreviewUrl,
      );
    }

    setPhoto(null);
    setPhotoPreviewUrl(null);
    setErrors((current) => ({
      ...current,
      photo: undefined,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0
    ) {
      return;
    }

    const confirmationMessage = [
      "以下の内容で参加を記録します。",
      "",
      `農園：${selectedFarm?.name ?? "未選択"}`,
      `作業日：${workDate}`,
      `作業内容：${workType}`,
      `作業時間：${timeCategory}`,
      comment.trim()
        ? `コメント：${comment.trim()}`
        : "コメント：なし",
      "",
      "内容をご確認ください。",
    ].join("\n");

    const shouldRegister =
      window.confirm(confirmationMessage);

    if (!shouldRegister) {
      return;
    }

    setIsSubmitting(true);

    const registrationId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const parameters =
      new URLSearchParams({
        registrationId,
        farmId,
        workDate,
        workType,
        timeCategory,
      });

    if (comment.trim()) {
      parameters.set(
        "comment",
        comment.trim(),
      );
    }

    window.setTimeout(() => {
      router.push(
        `/check-in/complete?${parameters.toString()}`,
      );
    }, mockDelayMilliseconds);
  }

  return (
    <main>
      <div className="page">
        <section
          className="hero card"
          aria-labelledby="check-in-title"
        >
          <h1 id="check-in-title">
            参加を記録する
          </h1>

          <p>
            農園と作業内容、作業時間を
            選びましょう。
          </p>
        </section>

        <form
          className="card check-in-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <fieldset className="fieldset">
            <legend className="legend">
              参加内容
            </legend>

            <div className="field-row">
              <label htmlFor="farmId">
                農園
              </label>

              <select
                id="farmId"
                name="farmId"
                value={farmId}
                aria-describedby={
                  errors.farmId
                    ? "farmId-error"
                    : undefined
                }
                aria-invalid={
                  Boolean(errors.farmId)
                }
                onChange={(event) => {
                  setFarmId(
                    event.target.value,
                  );

                  setErrors((current) => ({
                    ...current,
                    farmId: undefined,
                  }));
                }}
              >
                <option value="">
                  農園を選択してください
                </option>

                {activeFarms.map((farm) => (
                  <option
                    key={farm.id}
                    value={farm.id}
                  >
                    {farm.name}
                  </option>
                ))}
              </select>

              {errors.farmId && (
                <p
                  id="farmId-error"
                  className="error-text"
                  role="alert"
                >
                  {errors.farmId}
                </p>
              )}
            </div>

            {selectedFarm && (
              <section
                className="selected-farm"
                aria-live="polite"
              >
                <p className="selected-farm-label">
                  選択中の農園
                </p>

                <h2>
                  {selectedFarm.name}
                </h2>

                <dl>
                  <div>
                    <dt>農家</dt>
                    <dd>
                      {selectedFarm.ownerName}
                    </dd>
                  </div>

                  <div>
                    <dt>作物</dt>
                    <dd>
                      {selectedFarm.fruitTypes.join(
                        "・",
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <div className="field-row">
              <label htmlFor="workDate">
                作業日
              </label>

              <div className="date-input-wrapper">
                <input
                  id="workDate"
                  name="workDate"
                  type="date"
                  value={workDate}
                  max={getTodayInJapan()}
                  aria-describedby={
                    errors.workDate
                      ? "workDate-error workDate-help"
                      : "workDate-help"
                  }
                  aria-invalid={
                    Boolean(errors.workDate)
                  }
                  onChange={(event) => {
                    setWorkDate(
                      event.target.value,
                    );

                    setErrors((current) => ({
                      ...current,
                      workDate: undefined,
                    }));
                  }}
                />

                <span
                  className="date-input-icon"
                  aria-hidden="true"
                >
                  📅
                </span>
              </div>

              <p
                id="workDate-help"
                className="field-help"
              >
                初期値は日本時間の当日です。
                過去日または当日を選択できます。
              </p>

              {errors.workDate && (
                <p
                  id="workDate-error"
                  className="error-text"
                  role="alert"
                >
                  {errors.workDate}
                </p>
              )}
            </div>

            <div className="field-row">
              <label htmlFor="workType">
                作業内容
              </label>

              <select
                id="workType"
                name="workType"
                value={workType}
                aria-describedby={
                  errors.workType
                    ? "workType-error"
                    : undefined
                }
                aria-invalid={
                  Boolean(
                    errors.workType,
                  )
                }
                onChange={(event) => {
                  setWorkType(
                    event.target.value,
                  );

                  setErrors((current) => ({
                    ...current,
                    workType: undefined,
                  }));
                }}
              >
                <option value="">
                  作業内容を選択してください
                </option>

                {workTypeOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ),
                )}
              </select>

              {errors.workType && (
                <p
                  id="workType-error"
                  className="error-text"
                  role="alert"
                >
                  {errors.workType}
                </p>
              )}
            </div>

            <div className="field-row">
              <p
                id="timeCategory-label"
                className="field-label"
              >
                作業時間
              </p>

              <div
                className="time-radio-group"
                role="radiogroup"
                aria-labelledby="timeCategory-label"
                aria-describedby={
                  errors.timeCategory
                    ? "timeCategory-error"
                    : undefined
                }
                aria-invalid={
                  Boolean(errors.timeCategory)
                }
              >
                {timeCategoryOptions.map(
                  (option) => (
                    <label
                      key={option}
                      className={`time-radio-card${
                        timeCategory === option
                          ? " is-selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeCategory"
                        value={option}
                        checked={
                          timeCategory === option
                        }
                        onChange={() => {
                          setTimeCategory(option);

                          setErrors((current) => ({
                            ...current,
                            timeCategory:
                              undefined,
                          }));
                        }}
                      />

                      <span>{option}</span>
                    </label>
                  ),
                )}
              </div>

              {errors.timeCategory && (
                <p
                  id="timeCategory-error"
                  className="error-text"
                  role="alert"
                >
                  {errors.timeCategory}
                </p>
              )}
            </div>

            <div className="field-row">
              <label htmlFor="comment">
                コメント
                <span className="optional-label">
                  任意
                </span>
              </label>

              <textarea
                id="comment"
                name="comment"
                rows={4}
                maxLength={
                  maximumCommentLength
                }
                value={comment}
                aria-describedby="comment-help"
                onChange={(event) => {
                  setComment(
                    event.target.value,
                  );

                  setErrors((current) => ({
                    ...current,
                    comment: undefined,
                  }));
                }}
                placeholder="作業内容や気づいたことを入力してください"
              />

              <div
                id="comment-help"
                className="field-help field-help-between"
              >
                <span>
                  入力したコメントは、
                  次段階で参加履歴に保存します。
                </span>

                <span>
                  {comment.length}/
                  {maximumCommentLength}
                </span>
              </div>

              {errors.comment && (
                <p
                  className="error-text"
                  role="alert"
                >
                  {errors.comment}
                </p>
              )}
            </div>

            <div className="field-row">
              <label htmlFor="photo">
                写真
                <span className="optional-label">
                  任意
                </span>
              </label>

              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                aria-describedby="photo-help"
                onChange={handlePhotoChange}
              />

              <p
                id="photo-help"
                className="field-help"
              >
                UI試作品のため、写真は
                まだ保存されません。
              </p>

              {errors.photo && (
                <p
                  className="error-text"
                  role="alert"
                >
                  {errors.photo}
                </p>
              )}

              {photoPreviewUrl && (
                <div className="photo-preview">
                  <img
                    src={photoPreviewUrl}
                    alt="選択した写真のプレビュー"
                  />

                  <button
                    type="button"
                    className="photo-remove-button"
                    onClick={removePhoto}
                  >
                    写真を削除
                  </button>
                </div>
              )}
            </div>
          </fieldset>

          {selectedFarm && (
            <p className="farm-confirmation">
              {selectedFarm.name}
              での参加を記録します。
              農園名をご確認ください。
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "参加を記録しています…"
              : "参加を記録する"}
          </button>

          <Link
            href="/"
            className="secondary-button"
          >
            キャンセル
          </Link>
        </form>
      </div>
    </main>
  );
}

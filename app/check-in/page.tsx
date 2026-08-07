"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  timeCategoryOptions,
  workTypeOptions,
} from "../../src/lib/mock-data";
import {
  parseAvailableFarmsResponse,
  type AvailableFarm,
} from "../../src/lib/available-farms-response";
import {
  initializeLiff,
} from "../../src/lib/line/liff";
import {
  getParticipationErrorMessage,
  parseParticipationResponse,
  saveCompletedParticipation,
} from "../../src/lib/participation-response";
import {
  getParticipationWorkDateRange,
  getValidatedWorkDate,
} from "../../src/lib/participation-work-date";

type FormErrors = {
  farmId?: string;
  workDate?: string;
  workType?: string;
  timeCategory?: string;
  comment?: string;
  photo?: string;
};

const maximumCommentLength = 500;
const maximumPhotoBytes = 5 * 1024 * 1024;

type FarmListStatus =
  | "loading"
  | "ready"
  | "error";

export default function CheckInPage() {
  const router = useRouter();

  const [activeFarms, setActiveFarms] =
    useState<AvailableFarm[]>([]);

  const [farmListStatus, setFarmListStatus] =
    useState<FarmListStatus>("loading");

  const workDateRange =
    getParticipationWorkDateRange();

  const [workDate, setWorkDate] =
    useState(
      workDateRange.maximum,
    );

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

  const [submitError, setSubmitError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const selectedFarm =
    activeFarms.find(
      (farm) => farm.id === farmId,
    ) ?? null;

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadAvailableFarms() {
      try {
        const response = await fetch(
          "/api/farms",
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const responseBody: unknown =
          await response.json();

        const farms =
          response.ok
            ? parseAvailableFarmsResponse(
                responseBody,
              )
            : null;

        if (!farms) {
          setFarmListStatus("error");
          return;
        }

        setActiveFarms(farms);
        setFarmListStatus("ready");
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setFarmListStatus("error");
      }
    }

    void loadAvailableFarms();

    return () => {
      controller.abort();
    };
  }, []);

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

    if (!selectedFarm) {
      nextErrors.farmId =
        "農園を選択してください。";
    }

    if (!getValidatedWorkDate(workDate)) {
      nextErrors.workDate =
        "作業日は本日から1か月前までの範囲で選択してください。";
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError("");

    if (
      Object.keys(nextErrors).length > 0 ||
      !selectedFarm
    ) {
      return;
    }

    const confirmationMessage = [
      "以下の内容で参加を記録します。",
      "",
      `農園：${selectedFarm.name}`,
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

    try {
      const liff = await initializeLiff();

      if (!liff.isLoggedIn()) {
        setSubmitError(
          "LINEアプリ内の参加登録画面から、もう一度お試しください。",
        );
        return;
      }

      const idToken = liff.getIDToken();

      if (!idToken) {
        setSubmitError(
          getParticipationErrorMessage(
            401,
          ),
        );
        return;
      }

      const response = await fetch(
        "/api/participations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            idToken,
            farmId,
            workDate,
            workType,
            timeCategory,
            ...(comment.trim()
              ? {
                  comment:
                    comment.trim(),
                }
              : {}),
          }),
        },
      );

      const responseBody: unknown =
        await response.json();

      if (!response.ok) {
        setSubmitError(
          getParticipationErrorMessage(
            response.status,
          ),
        );
        return;
      }

      const participation =
        parseParticipationResponse(
          responseBody,
        );

      if (!participation) {
        setSubmitError(
          getParticipationErrorMessage(
            502,
          ),
        );
        return;
      }

      saveCompletedParticipation(
        window.sessionStorage,
        participation,
      );

      router.push("/check-in/complete");
    } catch {
      setSubmitError(
        getParticipationErrorMessage(
          502,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <fieldset
            className="fieldset"
            disabled={isSubmitting}
          >
            <legend className="legend">
              参加内容
            </legend>

            <div className="field-row">
              <label htmlFor="farmId">
                農園
              </label>

              {farmListStatus ===
                "loading" && (
                <p
                  id="farm-list-status"
                  className="field-help"
                  role="status"
                >
                  農園情報を読み込んでいます…
                </p>
              )}

              {farmListStatus ===
                "error" && (
                <p
                  id="farm-list-error"
                  className="error-text"
                  role="alert"
                >
                  農園情報を取得できませんでした。
                  ページを再読み込みしてください。
                </p>
              )}

              {farmListStatus === "ready" &&
                activeFarms.length === 0 && (
                  <p
                    id="farm-list-empty"
                    className="field-help"
                    role="status"
                  >
                    現在、参加を受け付けている
                    農園はありません。
                  </p>
                )}

              <select
                id="farmId"
                name="farmId"
                value={farmId}
                disabled={
                  farmListStatus !== "ready" ||
                  activeFarms.length === 0
                }
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
                  min={workDateRange.minimum}
                  max={workDateRange.maximum}
                  aria-describedby={
                    errors.workDate
                      ? "workDate-help workDate-error"
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
                日本時間の本日から
                1か月前まで選択できます。
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

          {submitError && (
            <p
              className="error-text"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={
              isSubmitting ||
              farmListStatus !== "ready" ||
              activeFarms.length === 0
            }
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

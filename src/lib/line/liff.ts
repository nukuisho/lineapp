type LiffInstance =
  (typeof import("@line/liff"))["default"];

let initializationPromise:
  Promise<LiffInstance> | null = null;

export function getLiffId(): string {
  const liffId =
    process.env.NEXT_PUBLIC_LIFF_ID?.trim();

  if (!liffId) {
    throw new Error(
      "NEXT_PUBLIC_LIFF_ID is not configured.",
    );
  }

  return liffId;
}

export function initializeLiff():
  Promise<LiffInstance> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error(
        "LIFF can only be initialized in a browser.",
      ),
    );
  }

  if (!initializationPromise) {
    initializationPromise = import(
      "@line/liff"
    ).then(async ({ default: liff }) => {
      await liff.init({
        liffId: getLiffId(),
      });

      return liff;
    });
  }

  return initializationPromise;
}
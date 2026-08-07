export type LiffInitDiagnosticCode =
  | "LIFF-INIT-CONFIGURATION"
  | "LIFF-INIT-FAILED"
  | "LIFF-INIT-UNAUTHORIZED"
  | "LIFF-INIT-FORBIDDEN"
  | "LIFF-INIT-TIMEOUT"
  | "LIFF-INIT-UNKNOWN";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function getLiffInitDiagnosticCode(
  error: unknown,
): LiffInitDiagnosticCode {
  if (
    error instanceof Error &&
    error.message ===
      "NEXT_PUBLIC_LIFF_ID is not configured."
  ) {
    return "LIFF-INIT-CONFIGURATION";
  }

  if (!isRecord(error)) {
    return "LIFF-INIT-UNKNOWN";
  }

  if (error.code === "INVALID_CONFIG") {
    return "LIFF-INIT-CONFIGURATION";
  }

  if (error.code === "INIT_FAILED") {
    return "LIFF-INIT-FAILED";
  }

  if (error.code === "UNAUTHORIZED") {
    return "LIFF-INIT-UNAUTHORIZED";
  }

  if (error.code === "FORBIDDEN") {
    return "LIFF-INIT-FORBIDDEN";
  }

  if (error.code === "TIMEOUT") {
    return "LIFF-INIT-TIMEOUT";
  }

  return "LIFF-INIT-UNKNOWN";
}

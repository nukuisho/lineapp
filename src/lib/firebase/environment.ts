export type FirebaseAdminEnvironment = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

type FirebaseEnvironmentVariableName =
  | "FIREBASE_PROJECT_ID"
  | "FIREBASE_CLIENT_EMAIL"
  | "FIREBASE_PRIVATE_KEY";

type EnvironmentSource =
  Record<string, string | undefined>;

function readRequiredEnvironmentVariable(
  source: EnvironmentSource,
  name: FirebaseEnvironmentVariableName,
): string {
  const value = source[name]?.trim();

  if (!value) {
    throw new Error(
      `Firebase Admin環境変数が設定されていません: ${name}`,
    );
  }

  return value;
}

export function getFirebaseAdminEnvironment(
  source: EnvironmentSource = process.env,
): FirebaseAdminEnvironment {
  const projectId =
    readRequiredEnvironmentVariable(
      source,
      "FIREBASE_PROJECT_ID",
    );

  const clientEmail =
    readRequiredEnvironmentVariable(
      source,
      "FIREBASE_CLIENT_EMAIL",
    );

  const privateKey =
    readRequiredEnvironmentVariable(
      source,
      "FIREBASE_PRIVATE_KEY",
    ).replace(/\\n/g, "\n");

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

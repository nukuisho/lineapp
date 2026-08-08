import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { pathToFileURL } from "node:url";

const maximumDeletes = 498;

export function parseResetArguments(argumentsList) {
  const values = new Map();

  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index];
    const value = argumentsList[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error("引数の形式を確認してください。");
    }

    values.set(key, value);
  }

  const projectId = values.get("--project");
  const userId = values.get("--user-id");
  const confirmProject = values.get("--confirm-project");

  if (!projectId || !userId) {
    throw new Error("--projectと--user-idは必須です。");
  }

  if (values.size > 3) {
    throw new Error("未対応の引数が指定されています。");
  }

  return {
    projectId,
    userId,
    confirmed: confirmProject === projectId,
  };
}

function getEnvironment(projectId) {
  const environmentProjectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (
    !environmentProjectId ||
    !clientEmail ||
    !privateKey ||
    environmentProjectId !== projectId
  ) {
    throw new Error("Firebase環境変数または対象プロジェクトを確認してください。");
  }

  return {
    projectId: environmentProjectId,
    clientEmail,
    privateKey,
  };
}

export async function resetPocUser({
  firestore,
  userId,
  confirmed,
}) {
  const userReference = firestore.collection("users").doc(userId);
  const participationQuery = firestore
    .collection("participations")
    .where("userId", "==", userId);
  const participationKeyQuery = firestore
    .collection("participationKeys")
    .where("userId", "==", userId);

  return firestore.runTransaction(async (transaction) => {
    const [userSnapshot, participationSnapshot, participationKeySnapshot] =
      await Promise.all([
        transaction.get(userReference),
        transaction.get(participationQuery),
        transaction.get(participationKeyQuery),
      ]);

    if (!userSnapshot.exists) {
      throw new Error("対象ユーザーが見つかりません。");
    }

    const deleteCount =
      participationSnapshot.size + participationKeySnapshot.size;

    if (deleteCount > maximumDeletes) {
      throw new Error("一度に安全にリセットできる件数を超えています。");
    }

    const result = {
      participations: participationSnapshot.size,
      participationKeys: participationKeySnapshot.size,
      executed: confirmed,
    };

    if (!confirmed) {
      return result;
    }

    for (const document of participationSnapshot.docs) {
      transaction.delete(document.ref);
    }

    for (const document of participationKeySnapshot.docs) {
      transaction.delete(document.ref);
    }

    transaction.update(userReference, {
      totalParticipations: 0,
      totalStamps: 0,
    });

    return result;
  });
}

async function main() {
  const input = parseResetArguments(process.argv.slice(2));
  const environment = getEnvironment(input.projectId);
  const app = initializeApp({ credential: cert(environment) });

  const result = await resetPocUser({
    firestore: getFirestore(app),
    userId: input.userId,
    confirmed: input.confirmed,
  });

  console.log(
    JSON.stringify({
      mode: result.executed ? "executed" : "dry-run",
      projectId: input.projectId,
      participations: result.participations,
      participationKeys: result.participationKeys,
    }),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "リセット処理に失敗しました。",
    );
    process.exitCode = 1;
  });
}

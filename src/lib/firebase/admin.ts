import "server-only";

import {
  App,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import {
  Firestore,
  getFirestore,
} from "firebase-admin/firestore";
import {
  getFirebaseAdminEnvironment,
} from "./environment";

export function getFirebaseAdminApp(): App {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  const environment =
    getFirebaseAdminEnvironment();

  return initializeApp({
    credential: cert({
      projectId: environment.projectId,
      clientEmail: environment.clientEmail,
      privateKey: environment.privateKey,
    }),
  });
}

export function getFirebaseFirestore(): Firestore {
  return getFirestore(
    getFirebaseAdminApp(),
  );
}

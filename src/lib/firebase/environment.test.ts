import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getFirebaseAdminEnvironment,
} from "./environment";

describe(
  "getFirebaseAdminEnvironment",
  () => {
    it(
      "returns validated Firebase Admin configuration",
      () => {
        expect(
          getFirebaseAdminEnvironment({
            FIREBASE_PROJECT_ID:
              "inagi-poc",
            FIREBASE_CLIENT_EMAIL:
              "firebase-admin@example.iam.gserviceaccount.com",
            FIREBASE_PRIVATE_KEY:
              "private-key",
          }),
        ).toEqual({
          projectId: "inagi-poc",
          clientEmail:
            "firebase-admin@example.iam.gserviceaccount.com",
          privateKey: "private-key",
        });
      },
    );

    it(
      "trims surrounding whitespace",
      () => {
        expect(
          getFirebaseAdminEnvironment({
            FIREBASE_PROJECT_ID:
              "  inagi-poc  ",
            FIREBASE_CLIENT_EMAIL:
              "  admin@example.com  ",
            FIREBASE_PRIVATE_KEY:
              "  private-key  ",
          }),
        ).toEqual({
          projectId: "inagi-poc",
          clientEmail:
            "admin@example.com",
          privateKey: "private-key",
        });
      },
    );

    it(
      "restores escaped private-key newlines",
      () => {
        expect(
          getFirebaseAdminEnvironment({
            FIREBASE_PROJECT_ID:
              "inagi-poc",
            FIREBASE_CLIENT_EMAIL:
              "admin@example.com",
            FIREBASE_PRIVATE_KEY:
              "line-one\\nline-two",
          }).privateKey,
        ).toBe(
          "line-one\nline-two",
        );
      },
    );

    it.each([
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ] as const)(
      "rejects a missing %s",
      (name) => {
        const environment = {
          FIREBASE_PROJECT_ID:
            "inagi-poc",
          FIREBASE_CLIENT_EMAIL:
            "admin@example.com",
          FIREBASE_PRIVATE_KEY:
            "private-key",
        };

        delete environment[name];

        expect(() =>
          getFirebaseAdminEnvironment(
            environment,
          ),
        ).toThrow(name);
      },
    );

    it.each([
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ] as const)(
      "rejects an empty %s",
      (name) => {
        const environment = {
          FIREBASE_PROJECT_ID:
            "inagi-poc",
          FIREBASE_CLIENT_EMAIL:
            "admin@example.com",
          FIREBASE_PRIVATE_KEY:
            "private-key",
          [name]: "   ",
        };

        expect(() =>
          getFirebaseAdminEnvironment(
            environment,
          ),
        ).toThrow(name);
      },
    );

    it(
      "does not include configured secret values in an error",
      () => {
        const secret =
          "do-not-show-this-secret";

        expect(() =>
          getFirebaseAdminEnvironment({
            FIREBASE_PROJECT_ID:
              "inagi-poc",
            FIREBASE_CLIENT_EMAIL:
              "",
            FIREBASE_PRIVATE_KEY:
              secret,
          }),
        ).toThrowError(
          expect.not.objectContaining({
            message:
              expect.stringContaining(
                secret,
              ),
          }),
        );
      },
    );
  },
);

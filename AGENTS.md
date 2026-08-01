# AGENTS.md

## Project purpose

This repository contains a LINE LIFF application for recording agricultural volunteer participation by scanning a QR code displayed at a farm.

The application records participation history and grants digital stamps. It is not an employee attendance or payroll system.

## Sources of truth

When implementing LINE-related features, use the following priority order:

1. Current LINE Developers official documentation
2. Official repositories under the `line` GitHub organization
3. Documentation in this repository
4. Existing implementation in this repository
5. General knowledge or assumptions

Do not implement LINE API behavior based only on memory.

If the official documentation conflicts with this repository, report the conflict before changing the implementation.

## Official references

Consult `docs/official-references.md` before implementing or changing:

* LIFF initialization
* LINE Login
* ID token handling
* Access token handling
* User profile retrieval
* Messaging API
* LIFF browser behavior
* LIFF endpoint URLs
* LINE webhook processing

## Required official repositories

Use the following official repositories as references:

* `line/line-liff-v2-starter`
* `line/line-bot-sdk-nodejs`
* `line/liff-playground`
* `line/liff-mock`
* `line/liff-inspector`

Do not copy code from archived or unofficial repositories without explaining why it is needed.

## Authentication and security

* Never trust a LINE user ID sent directly by the client.
* Verify LINE ID tokens or access tokens on the server.
* Never expose the LINE channel secret or channel access token to the browser.
* Store secrets only in environment variables.
* Never commit `.env.local` or production credentials.
* Do not place access tokens, user IDs, or secrets in LIFF URLs or QR codes.
* Treat the farm QR token as an identifier, not as proof of user identity.
* Prevent duplicate participation records on the server.
* Perform authorization and validation on the server, not only in the UI.

## QR check-in rules

* QR codes contain only a random farm check-in token.
* Do not use sequential farm IDs in public QR codes.
* Scanning a QR code must not immediately create a participation record.
* Display the farm name and require explicit confirmation.
* Reject inactive farms and invalid tokens.
* Prevent duplicate check-ins according to the rule documented in `docs/qr-check-in.md`.

## Firestore rules

* Keep server-side Firestore access separate from browser-side access.
* Do not assume Firestore Security Rules protect requests made through the Firebase Admin SDK.
* Use server-side validation for all participation writes.
* Use transactions or another atomic operation when creating participation records and updating stamp totals.
* Do not maintain counters in multiple places without an explicit consistency strategy.

## Development rules

* Use TypeScript.
* Avoid `any` unless a reason is documented.
* Keep LINE-specific code in isolated modules.
* Keep business logic independent from UI components.
* Validate all API request bodies.
* Add tests for authentication, invalid QR tokens, duplicate check-ins, and stamp updates.
* Run lint, type checking, and tests after changes.
* Report commands that could not be run.
* Do not replace the existing architecture without explaining the migration impact.

## Documentation rules

When adding a LINE-dependent implementation:

1. Add the official reference to `docs/official-references.md`.
2. Record the relevant access date.
3. Explain any assumptions.
4. Add or update tests.
5. Update the applicable design document.

## Language

* UI text and user-facing errors: Japanese
* Source code identifiers: English
* Technical documentation: Japanese unless an existing file uses English

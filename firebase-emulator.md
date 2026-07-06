# Firebase Emulator Suite

This project uses the [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) for local development and testing. The emulators allow you to run and test Firebase services locally without affecting the production database.

## Configured Emulators

The emulators are configured in [`firebase.json`](firebase.json):

| Service       | Port  | Notes                     |
|---------------|-------|---------------------------|
| **Auth**      | 9099  | User authentication       |
| **Firestore** | 8080  | Database (default, eur3)  |
| **UI**        | —     | Emulator Suite UI enabled |

- The default Firebase project is set to `pos-system-0` (see [`.firebaserc`](.firebaserc)).
- `singleProjectMode` is enabled, which means the emulator UI will only show data for the default project.

## Starting the Emulators

Run the following command from the project root:

```bash
npx firebase emulators:start
```

To start only specific emulators:

```bash
# Firestore only
npx firebase emulators:start --only firestore

# Auth only
npx firebase emulators:start --only auth
```

Once started, the Emulator Suite UI is available at [http://127.0.0.1:4000](http://127.0.0.1:4000).

## Seeding Data from Production

The [`scripts/`](scripts/) directory contains utilities for cloning production Firestore and Auth data into the local emulators. See [`scripts/README.md`](scripts/README.md) for full documentation.

Quick start:

```bash
cd scripts
npm run clone        # Clone Firestore data only
npm run clone:auth   # Clone Firestore + Auth data
```

Requirements:
- Node.js >= 18
- A Firebase service account key at `scripts/serviceAccount.json`
- The emulators must be running locally

## Accessing Emulators from Apps

When running applications locally, configure them to connect to the local emulators. For Firebase Web SDK v9+, use `connectFirestoreEmulator` and `connectAuthEmulator`:

```js
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

// Point to local emulators
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectAuthEmulator(auth, "http://127.0.0.1:9099");
```

## Emulator Data Persistence

By default, emulator data is stored in memory and is **lost** when the emulators stop. To persist data between sessions, use the `--import` and `--export-on-exit` flags:

```bash
npx firebase emulators:start --import=./emulator-data --export-on-exit
```

This will save and restore emulator state from the `emulator-data/` directory.

## Firestore Rules & Indexes

- **Security rules**: [`firestore.rules`](firestore.rules) — enforced by the emulator when running locally.
- **Indexes**: [`firestore.indexes.json`](firestore.indexes.json) — composite indexes required for Firestore queries.

## Useful Links

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Connect your app to the Emulator Suite](https://firebase.google.com/docs/emulator-suite/connect_and)
- [Emulator Suite UI](http://127.0.0.1:4000) (when running)
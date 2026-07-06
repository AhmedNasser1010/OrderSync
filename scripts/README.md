# Scripts

This directory contains utility scripts for exporting and importing Firestore and Firebase Authentication data. These scripts facilitate cloning production data into a local Firebase Emulator Suite environment for development and testing.

## Prerequisites

- **Node.js** >= 18
- A Firebase service account JSON file at `scripts/serviceAccount.json` (used for production access)
- The [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) running locally:
  - Firestore emulator on `127.0.0.1:8080` (default)
  - Auth emulator on `127.0.0.1:9099` (default)
- A `.env` file in the `scripts/` directory (optional, for environment overrides)

## Available Commands

Run these via `npm run <command>` from within the `scripts/` directory.

| Command          | Description                                                                                             |
|------------------|---------------------------------------------------------------------------------------------------------|
| `export`         | Export all Firestore documents from production to `clone-data/firestore.jsonl`                          |
| `import`         | Import Firestore documents from `clone-data/firestore.jsonl` into the local emulator                    |
| `export:auth`    | Export all Auth users from production to `clone-data/auth.jsonl`                                       |
| `import:auth`    | Import Auth users from `clone-data/auth.jsonl` into the local Auth emulator                            |
| `auth:create`    | Create Auth users in the emulator based on user data found in a previously exported Firestore dump      |
| `clone`          | Run `export` then `import` (Firestore only)                                                            |
| `clone:auth`     | Run `export`, `import`, `export:auth`, and `import:auth` in sequence (full clone)                      |

## File Structure

| File                              | Purpose                                                                 |
|-----------------------------------|-------------------------------------------------------------------------|
| `firebaseAdmin.ts`                | Shared Firebase Admin SDK initialization for production access          |
| `exportFirestore.ts`              | Exports all Firestore documents (with subcollections) to JSONL          |
| `importFirestore.ts`              | Imports Firestore documents from JSONL into the local emulator          |
| `serializer.ts`                   | Converts Firestore native types (`Timestamp`, `GeoPoint`) to serializable objects |
| `deserializer.ts`                 | Restores serialized objects back to Firestore native types              |
| `exportAuth.ts`                   | Exports all Firebase Auth users from production to JSONL                |
| `importAuth.ts`                   | Imports Firebase Auth users from JSONL into the local Auth emulator     |
| `createAuthUsersFromFirestore.ts` | Creates Auth users in the emulator by reading `userInfo` from a Firestore export |
| `clone.ts`                        | Orchestrates an end-to-end Firestore + (optionally) Auth clone          |
| `clone-data/`                     | Output directory for exported data (`.gitignore`d)                      |

## How It Works

### Firestore Clone (`clone` / `clone:auth`)

1. **Export** — `exportFirestore.ts` lists all top-level collections in the production Firestore database. It recursively walks each collection, fetching every document including nested subcollections. Documents are serialized (converting `Timestamp` and `GeoPoint` to plain objects) and written as newline-delimited JSON (`.jsonl`) to `clone-data/firestore.jsonl`. A `manifest.json` is also written with export metadata.

2. **Import** — `importFirestore.ts` reads `clone-data/firestore.jsonl`, deserializes each record back into Firestore-native types, and writes them to the local Firestore emulator in batches of 500. It verifies the import by attempting to read from the `users` collection.

### Auth Clone (`clone:auth` only)

1. **Export** — `exportAuth.ts` iterates over all production Auth users (paginated, 1000 at a time) and writes their UID, email, display name, phone number, provider data, password hash/salt, custom claims, and metadata to `clone-data/auth.jsonl`.

2. **Import** — `importAuth.ts` reads `clone-data/auth.jsonl` and imports users into the local Auth emulator. It first attempts a bulk `importUsers` call with hash support. If that fails (e.g., the emulator doesn't support the hash algorithm), it falls back to creating users individually with a default password.

### Creating Auth Users from Firestore (`auth:create`)

`createAuthUsersFromFirestore.ts` reads a previously exported Firestore dump (`clone-data/firestore.jsonl`), extracts `userInfo` objects from documents at the paths `users/{uid}` or `customers/{uid}`, and creates corresponding Auth users in the emulator with a default password. This is useful when you don't have an Auth export but the user data exists in Firestore.

## Usage Examples

```bash
# Clone only Firestore data to the local emulator
npm run clone

# Clone both Firestore and Auth data to the local emulator
npm run clone:auth

# Export/import individually
npm run export
npm run import

# Export/import Auth users individually
npm run export:auth
npm run import:auth

# Create Auth users from an existing Firestore export
npm run auth:create
```

## Important Notes

- **Service Account** — A valid Firebase service account key (`serviceAccount.json`) is required for production access. **Do not commit this file** to version control.
- **Emulator Required** — The `import`, `import:auth`, and `auth:create` commands connect to locally running Firebase emulators. Ensure they are started before running these commands.
- **Default Password** — Auth users imported or created via these scripts will have the password `123456` set by default.
- **Auth Hash Fallback** — The Auth import tries to preserve password hashes from production for seamless sign-in. If the emulator does not support the hash algorithm, users are created individually with the default password instead.
- **Data Directory** — The `clone-data/` directory is created automatically during export and contains exported JSONL files and a manifest. It is ignored by git.
- **Emulator Sync Delay** — After importing a large dataset, the Firestore Emulator UI may take some time to index and display the imported documents. Be patient; the data is present and queryable even if the UI hasn't updated yet.

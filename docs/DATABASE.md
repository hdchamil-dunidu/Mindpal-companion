# Database, ownership and migration

No live Azure endpoint was available in this session. The code uses MongoDB driver 6.20.0 with ordinary collection operations, no transactions, no change streams, and no direct client database access. Compatibility with your exact Azure account must be checked before deployment.

## Azure account choice

Determine whether your account is Azure Cosmos DB for MongoDB (RU), a MongoDB vCore service, or another MongoDB-compatible service. Obtain its connection string from its portal and preserve the required options. For RU accounts, `retryWrites=false` may be required unless the capability is enabled. Do not infer options from the hostname, use a copied exposed credential, or disable TLS validation. Provider guide: <https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/connect-account>.

Use a new database name initially. For an existing sharded Cosmos collection, confirm its partition/shard key and unique `_id` behavior match these queries. The setup script does not select throughput, shard keys or retention policies for you. Use an unsharded collection for a small personal deployment where supported, or adapt and verify queries/indexes with your chosen account. Account-specific compatibility remains untested.

## Collections

Every activity document uses a server-enforced `ownerId`. Client JSON cannot override it. `_id` combines the owner identifier with the client's generated UUID, isolating equal UUIDs across users. Timestamps are ISO strings unless otherwise listed. The API strips internal IDs, owner IDs and password hashes from returned records.

| Collection | Important fields | Purpose / indexes |
| --- | --- | --- |
| `users` | `_id`: SHA-256 of normalized email namespace; `email`, `name`, `passwordHash`, `settings`, `look`, `createdAt` | Built-in unique `_id` handles duplicate registration without an extra unique-email index. Salted scrypt hashes; no plain-text passwords. |
| `auth_sessions` | `_id`: HMAC of random token; `ownerId`; BSON Date `expiresAt` | TTL index `{expiresAt:1}`, `expireAfterSeconds:0`. Authentication checks expiry independently of TTL cleanup. |
| `moods` | `mood`, `note`, `id`, `ownerId`, `createdAt`, `updatedAt` | Index `{ownerId:1}`; only the six canonical mood identifiers. |
| `tasks` | `title`, `notes`, `date`, `time`, `priority`, `completed`, `completedAt` plus ownership/timestamps | Index `{ownerId:1}`. Dates are local `YYYY-MM-DD`; time optional `HH:mm`. |
| `events` | `title`, `details`, `date`, `start`, `end` plus ownership/timestamps | Index `{ownerId:1}`. Same-day end must be later than start. Overlaps allowed and displayed. |
| `finances` | `title`, `kind`, `category`, `date`, integer `amountMinor` plus ownership/timestamps | Index `{ownerId:1}`. Positive minor units; income/expense determine sign. |
| `sessions` | `kind`, `durationMs`, `targetMs`, `endedAt`, `date` plus ownership/timestamps | Index `{ownerId:1}`. Duration must equal target; kind allowlist. |
| `chats` | `text`, `reply`, `cue`, `status`, `id`, `ownerId`, `createdAt`, `updatedAt` | Index `{ownerId:1}`. A request ID identifies one message/reply across retries. |

Settings and accessories are stored on each `users` document. `server/setup.js` calls `setupDB()` in `server/db.js`; it creates only the listed indexes and pings the database. Run `npm run db:setup`. No records are dropped, renamed, seeded or silently migrated. If your account rejects the TTL index, inspect its supported indexing/TTL configuration; session expiry still must remain enforced by authentication. Do not treat an index-setup error as a successful setup.

## Migrations and existing records

No older application source, schema or user-data export was supplied, so there was no existing data migration. This is a new implementation using the original mascot assets. Do not point it at existing production collections until their schema and ownership fields have been reviewed.

Before a schema change: back up the database, test a migration against an isolated copy, preserve IDs/ownership/timestamps, verify counts and sample records, then apply it during a controlled deployment. No destructive migration is included. Changing `SESSION_SECRET` logs users out but preserves the stable user `_id`. Changing the user-identity hashing scheme would require an explicit migration.

Local storage uses `mindpal.local.v1`. It is separate from cloud storage. JSON backup restore is local-only, validated, replaces local records after confirmation and omits cloud chat history. There is no automatic local-to-cloud import.

## Security and operation limits

Bearer tokens stay in session storage and are sent in Authorization headers. All cloud requests require authentication except health and registration/login. Passwords have length constraints; rate limits apply to API, authentication and chat. CORS uses exact origins. Security headers and escaped UI text reduce injection exposure. Provider keys and database URIs stay on the server.

Rate limits are in process and use the socket peer address. A public multi-instance service should use a shared rate limiter, a reviewed proxy configuration, account recovery, email verification and monitoring. These services are not configured in this personal-app delivery. Records are currently loaded per owner; add pagination/archiving before large-scale use. There is no autonomous AI write access to personal records.

Verify with two real test accounts on your actual database: create records in A, ensure B cannot see/edit/delete A's records, expire/logout A's session, then test all CRUD flows and chat retry after a network failure. Isolated ownership tests passed; this real-account test remains outstanding.

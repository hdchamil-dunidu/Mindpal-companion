# Database — MindPal 1.2

Keep MONGODB_URI and MONGODB_DB pointing to the original database to retain cloud data. Run `npm run db:setup` to create indexes. No collections are dropped.

Existing: users, auth_sessions, moods, tasks, events, finances, sessions, chats.

Added: financeBudgets, savingsGoals, recurring, weeklyPlans, insights, reports, categories, finance_cache, oauth_requests.

Record documents use `_id = ownerId + ':' + id`; queries filter authenticated ownerId. Tasks and calendar events remain separate. Finance amounts are integer minor units. Existing finance records gain optional time, description and payment-method defaults on editing; existing monthly budgets in user settings remain visible and editable. Legacy local backups load new resources as empty arrays.

Indexes: ownerId on each regular record collection; TTL expiry for auth_sessions and oauth_requests; unique sparse googleSub on users. `finance_cache` is keyed by owner plus a hash of statistics; application logic reuses a result for up to six hours. It is not a second transaction source.

Reports store metadata and optional AI commentary; numerical reports are recalculated from authoritative records. Goal savings are user-entered, not bank-verified. Scheduled recurring items become expenses only after the user records a payment. Stable occurrence IDs avoid duplicate payment inserts on retry.

Local `.env` and user JSON/CSV backups may contain private data. They are not included in this source distribution.

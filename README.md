# SpaceLab — electronics in space

SpaceLab now includes a governed industrial quality journey for space inference electronics: source-revisioned supplier, part, and BOM records; idempotent inventory receipts; unit-aware measured inspections; exception holds; independent lot acceptance; accepted-inventory mission planning; and independently approved part-requirement changes. Deterministic rules—not LLM output—control lot state and availability.

## Local setup

Requirements: Node.js 20.19 or newer, npm, and PostgreSQL.

1. Copy `.env.example` to `.env` and replace all secret placeholders.
2. Create `space_electronics_db`.
3. For a first-time disposable local setup, run `./start.sh --install --demo-reset`.
4. Later, run `./start.sh`. Normal startup applies checksum-verified additive migrations only. It does not reset/seed data, install packages, copy secrets, or kill other processes.

The demo-reset path is destructive and is refused for production, remote hosts, or database names outside the explicit local allowlist. The seeded demo login must not be used in shared environments.

## Verification

```sh
cd backend && npm run check && npm test && npm audit
cd ../frontend && npm run build && npm audit
```

Tests create a uniquely named disposable PostgreSQL database, exercise migration replay and failure paths, and drop only that database.

## Quality API

The `/api/quality` contract uses strict JSON with source system, source revision/event ID, and offset timestamps. Receipt and inspection event IDs are idempotent: exact retries return the existing record and conflicting reuse fails. Inspection units are fixed (`each`, `krad(Si)`, `degC`), and rules are snapshotted with each measurement. Failed rules create exception holds. A second quality authority must release a lot or approve a requirement change.

See [docs/operations.md](docs/operations.md) for source ownership, rollback/replanning, key lifecycle, backup, monitoring, and incident recovery.

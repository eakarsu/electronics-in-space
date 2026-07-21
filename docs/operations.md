# Quality operations runbook

## Source contracts and authority

Assign an owner to each source: ERP for suppliers, PLM for qualified-part requirements, mission configuration management for BOM revisions, warehouse/WMS for receipts, and calibrated quality/lab systems for inspections. Use stable event IDs and immutable revisions. A replay with changed content is an integration incident, not an update mechanism; use a reviewed change order.

All inventory quantities use discrete `each`. Radiation screens use `krad(Si)` and thermal qualification uses `degC`; unit mismatches fail closed. Late receipts are retained with a `late` event marker. Future-dated inspections and inspections predating receipt are rejected. Never convert units implicitly at the acceptance boundary.

## State and human controls

Only accepted lots count toward mission availability. Failed measurements place a lot on hold and create an exception. Quality managers may record rework or segregated scrap, but the required measurement must pass before release. The measurement submitter/requester cannot approve the same lot. Part limits change only through a second-person change-order decision. Planning overrides remain separate pending records and do not silently change accepted inventory or BOM facts.

The old COTS auto-advance endpoint is retired because estimated yield is not evidence. Optional LLM tools remain advisory and outside supplier qualification, inspection, acceptance, BOM, and planning state transitions.

## Monitoring and incident response

Monitor authentication failures, 409 duplicate conflicts, 422 unit/timestamp/rule failures, lots on hold, aging exceptions, pending approvals/change orders, inventory freshness, shortages, and audit-chain verification. For a disputed measurement: hold the lot, preserve the source payload/event ID and calibration record, identify affected plans, rerun through the authoritative lab integration, and document resolution.

For a supplier disruption, mark the supplier suspended, identify received/held lots, recompute mission plans, and submit explicit human overrides only with mission authority. Do not promote conditional or held inventory into available quantity.

## Deployment and recovery

Use a dedicated least-privilege PostgreSQL role/database, TLS ingress, exact `CORS_ORIGINS`, managed secrets, encrypted backups, point-in-time recovery, and scheduled audit verification. Increment `token_version` or set `active=false` to revoke a user. Rotating the audit key begins a documented trust epoch; retain the old key/chain for verification.

Before release, back up and apply `npm run migrate`. A recovery drill restores to isolation, replays migrations, verifies the audit chain, reconciles supplier/part/BOM/lot/inspection/exception/approval counts, recomputes a known mission plan, and confirms held lots remain excluded.

---
name: API environment loading
description: Durable guidance for loading environment files in the TypeScript API across source and compiled execution.
---

The API environment loader must resolve its `.env` path relative to the module directory and account for both source execution and compiled execution. PM2’s working directory is deployment configuration, not a safe source of truth.

**Why:** The API may be launched by PM2, a workspace script, or a compiled entrypoint from different working directories; relying on `process.cwd()` can silently select the wrong environment file and surface misleading database failures.

**How to apply:** Keep the loader ahead of Prisma imports, log only the selected file and non-secret variable status, and fail clearly when `DATABASE_URL` is absent.
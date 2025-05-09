#!/usr/bin/env sh
set -e

# wait for Postgres
wait-on tcp:$POSTGRES_HOST:$POSTGRES_PORT

# sync schema & generate client
npx prisma db push
npx prisma generate

# start watcher
exec npx tsx watch src/index.ts
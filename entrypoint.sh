#!/usr/bin/env sh
set -e

# wait for Postgres
wait-on tcp:$POSTGRES_HOST:$POSTGRES_PORT

# If there are no migrations => push, else migrate.
if [ -d "./prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "Migrations found → running migrate reset"
  npx prisma migrate reset --force
else
  echo "No migrations → running db push"
  npx prisma db push
fi

# Generate client and seed.
npx prisma generate
npx tsx prisma/seed.ts

# start dev server
exec npx tsx watch src/index.ts

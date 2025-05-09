#!/bin/bash

# Reset db schema.
echo "Dropping and recreating database schema..."
docker compose exec postgres_dev psql -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Regenerate Prisma client + sync schema.
echo "Regenerating Prisma client and pushing schema..."
docker compose exec app sh -c "
  npx prisma generate &&
  npx prisma db push
"

# Check if the reset was successful
if [ $? -eq 0 ]; then
  echo "✅ Database reset successful!"
else
  echo "❌ Database reset failed. Check the error messages above."
fi
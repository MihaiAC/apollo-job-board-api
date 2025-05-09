# apollo-job-board-api

A practice GraphQL API using Apollo, Express, and Prisma.

Aim of the project is to get some experience with a Node.js stack by recreating my previous GraphQL [project](https://github.com/MihaiAC/strawberry-job-board-api), which used Strawberry, FastAPI, and SQLAlchemy.

Here, I will only talk about the differences between these two projects and will focus less on testing.

## Diffs

1. `process.env` to hold environment variables (Node.js default), dotenv to load vars from .env to `process.env`.

2. `var!` basic TS feature to mark that `var` is not `null` or `undefined`.

3. Lots and lots of small extra packages everywhere, with functionality that should have maybe been included in the bigger packages? But this is the JavaScript way.

4. With SQLAlchemy, I didn't have to run migrations. Way to work with Prisma:

- Run `prisma generate`.
- Somewhere, run `prisma db push` - only on init. For future schema changes, etc. have to run `prisma migrate deploy`. Since the schema doesn't change in this toy example, I guess I will only run `prisma db push`.

5. Watch for changes with `npx tsx watch src/index.ts`.

6. Handling schema changes.

Drop tables -> run `npx prisma migrate reset --force ` (optional?) -> run `npx prisma generate` (re-generates the Prisma client) -> run `npx prisma db push` (syncs Prisma schema with db schema, good for quick prototyping).

Put together into `./reset-db.sh`.

7. Adding Jobs and dataloaders.

Extra packages: dataloader, @graphql-tools/merge (merge multiple graphql schema defs into one), @graphql-tools/load-files (for loading the files to be merged).

8. Correct PrismaClient import from the generated prisma files.
   `import { PrismaClient } from "../../prisma/generated";`

## Remaining questions

1. How are errors handled here? In Strawberry + FastAPI I would get pretty ok errors by default (not too informative, not too short, just right). With this stack do I need to explicitly check every error and return a human readable version of it?

## References

1. [Prisma + Apollo minimal example](https://www.prisma.io/apollo).
2. [PrismaClient correct import](https://github.com/prisma/prisma/discussions/19669).

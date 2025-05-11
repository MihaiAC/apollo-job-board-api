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

9. Can add an Enum as a Prisma field type then import it from the generated files.

10. Adding DB indexes with Prisma is pretty easy (e.g: `@@index([userId])`).

11. Added an additional "MANAGER" user role that manages a single employer and will be able to post/delete jobs on their behalf.

12. seed.ts to automatically add some data to the DB when restarting the container and when running `./reset-db.sh`.

## TODOs

1. Errors are not handled in a nice way by default, have to wrap errors if you don't want the full stack trace in the GraphQL response.

2. Need to validate field length on entity creation and update. Django and SQLAlchemy could specify them then and there.

3. How to add email validation for user and employer email?

4. How to set length limits on DB fields?

5. Stretch goal: handle saving files (CVs). Again, something that Django did by default.

6. Could de-normalize further and add the manager id to a job so you don't need to perform and extra join on some queries.

7. Need to add a few tests to get the hang of it with this stack + to test some access strategies.

## References

1. [Prisma + Apollo minimal example](https://www.prisma.io/apollo).
2. [PrismaClient correct import](https://github.com/prisma/prisma/discussions/19669).

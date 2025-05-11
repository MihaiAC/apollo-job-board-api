import { prisma } from "../../db/client";
import { Context } from "../context";
import { requireRole } from "../../utils/auth";
import { Role } from "../../../prisma/generated";
import { Application, User } from "../../../prisma/generated";

export const applicationResolver = {
  Query: {
    applications: requireRole(
      [Role.ADMIN, Role.CANDIDATE],
      async (
        _: unknown,
        __: unknown,
        context: Context
      ): Promise<Application[]> => {
        const auth = context.auth!;

        // Admin can see all applications.
        if (auth.role === Role.ADMIN) {
          return prisma.application.findMany();
        }

        // Candidate only sees his own applications.
        if (auth.role === Role.CANDIDATE) {
          return prisma.application.findMany({ where: { userId: auth.id } });
        }

        // Manager will access applications through his jobs.
        throw new Error("Unauthorized");
      }
    ),
  },
  Mutation: {
    addApplication: requireRole(
      [Role.CANDIDATE],
      async (
        _: unknown,
        args: { userId: number; jobId: number }
      ): Promise<Application> => {
        return prisma.application.create({
          data: {
            user: { connect: { id: args.userId } },
            job: { connect: { id: args.jobId } },
          },
        });
      }
    ),

    deleteApplication: requireRole(
      [Role.CANDIDATE, Role.ADMIN],
      async (
        _: unknown,
        args: { id: number },
        context: Context
      ): Promise<Application> => {
        const auth = context.auth!;

        // Candidates can only delete their applications.
        if (auth.role === Role.CANDIDATE) {
          const application = await prisma.application.findUnique({
            where: { id: args.id },
          });
          if (application?.userId !== auth.id) {
            throw new Error("Unauthorized");
          }
        }

        return prisma.application.delete({ where: { id: args.id } });
      }
    ),
  },
  Application: {
    user: requireRole(
      [Role.ADMIN, Role.MANAGER, Role.CANDIDATE],
      async (
        parent: { userId: number },
        _: unknown,
        context: Context
      ): Promise<User> => {
        const auth = context.auth!;

        if (auth.role === Role.CANDIDATE && parent.userId !== auth.id) {
          throw new Error("Unauthorized");
        }

        const user = await context.loaders.userById.load(parent.userId);

        if (!user) {
          throw new Error(
            "User should exist, something really wrong is happening."
          );
        }

        return user;
      }
    ),
    job: (parent: { jobId: number }, _: unknown, context: Context) => {
      return context.loaders.jobById.load(parent.jobId);
    },
  },
};

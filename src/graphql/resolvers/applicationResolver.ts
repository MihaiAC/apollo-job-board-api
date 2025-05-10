import { prisma } from "../../db/client";
import { Context } from "../context";

export const applicationResolver = {
  Query: {
    applications: async () => {
      return await prisma.application.findMany();
    },
  },
  Mutation: {
    addApplication: async (
      _: unknown,
      args: { userId: number; jobId: number }
    ) => {
      return prisma.application.create({
        data: {
          user: {
            connect: {
              id: args.userId,
            },
          },
          job: {
            connect: {
              id: args.jobId,
            },
          },
        },
      });
    },

    deleteApplication: async (_: unknown, args: { id: number }) => {
      return prisma.application.delete({ where: { id: args.id } });
    },
  },
  Application: {
    user: (parent: { userId: number }, _: unknown, context: Context) => {
      return context.loaders.userById.load(parent.userId);
    },
    job: (parent: { jobId: number }, _: unknown, context: Context) => {
      return context.loaders.jobById.load(parent.jobId);
    },
  },
};

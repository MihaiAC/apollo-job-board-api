import { prisma } from "../../db/client";
import { Context } from "../context";

export const jobResolver = {
  Query: {
    jobs: async () => {
      return await prisma.job.findMany();
    },
    job: async (_: unknown, args: { id: number }) => {
      return await prisma.job.findUnique({ where: { id: args.id } });
    },
  },
  Mutation: {
    addJob: (
      _: unknown,
      args: { title: string; description: string; employerId: number }
    ) =>
      prisma.job.create({
        data: {
          title: args.title,
          description: args.description,
          employer: { connect: { id: args.employerId } },
        },
      }),
    updateJob: (
      _: unknown,
      args: { id: number; title: string; description: string }
    ) =>
      prisma.job.update({
        where: { id: args.id },
        data: {
          title: args.title,
          description: args.description,
        },
      }),
    deleteJob: (_: unknown, args: { id: number }) =>
      prisma.job.delete({ where: { id: args.id } }),
  },
  Job: {
    employer: (
      parent: { employerId: number },
      _: unknown,
      context: Context
    ) => {
      return context.loaders.employerById.load(parent.employerId);
    },
  },
};

import { prisma } from "../../db/client";

export const employerResolvers = {
  Query: {
    employers: async () => {
      return await prisma.employer.findMany();
    },
    employer: async (_: unknown, args: { id: number }) => {
      return await prisma.employer.findUnique({ where: { id: args.id } });
    },
  },
};

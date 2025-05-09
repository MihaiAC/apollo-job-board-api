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
  Mutation: {
    addEmployer: (
      _: unknown,
      args: { name: string; contactEmail: string; industry: string }
    ) => prisma.employer.create({ data: args }),
    updateEmployer: (
      _: unknown,
      args: { id: number; name: string; contactEmail: string; industry: string }
    ) =>
      prisma.employer.update({
        where: { id: args.id },
        data: {
          name: args.name,
          contactEmail: args.contactEmail,
          industry: args.industry,
        },
      }),
    deleteEmployer: (_: unknown, args: { id: string }) =>
      prisma.employer.delete({ where: { id: args.id } }),
  },
};

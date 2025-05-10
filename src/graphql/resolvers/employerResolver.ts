import { prisma } from "../../db/client";
import { Context } from "../context";

export const employerResolver = {
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
      args: {
        name: string;
        contactEmail: string;
        industry: string;
        managerId: number;
      }
    ) =>
      prisma.employer.create({
        data: {
          name: args.name,
          contactEmail: args.contactEmail,
          industry: args.industry,
          manager: {
            connect: {
              id: args.managerId,
            },
          },
        },
      }),
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
    deleteEmployer: (_: unknown, args: { id: number }) =>
      prisma.employer.delete({ where: { id: args.id } }),
  },
  Employer: {
    jobs: (parent: { id: number }, _: unknown, context: Context) => {
      return context.loaders.jobsByEmployer.load(parent.id);
    },
    manager: (parent: { managerId: number }, _: unknown, context: Context) => {
      return context.loaders.employerByManagerId.load(parent.managerId);
    },
  },
};

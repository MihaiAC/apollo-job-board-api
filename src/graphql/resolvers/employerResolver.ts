import { prisma } from "../../db/client";
import { Context } from "../context";
import { requireRole } from "../../utils/auth";
import { Role } from "../../../prisma/generated";
import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";

async function isManagerOfEmployer(
  employerId: number,
  managerId: number
): Promise<boolean> {
  const employer = await prisma.employer.findUnique({
    where: { id: employerId },
    select: { managerId: true },
  });

  return employer?.managerId === managerId;
}

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
    addEmployer: requireRole(
      [Role.ADMIN, Role.MANAGER],
      async (
        _: unknown,
        args: {
          name: string;
          contactEmail: string;
          industry: string;
          managerId: number;
        },
        context: Context,
        info: GraphQLResolveInfo
      ) => {
        const auth = context.auth!;
        if (auth.role === Role.MANAGER && auth.id !== args.managerId) {
          throw new Error("Unauthorized: You can't assign another manager.");
        }

        return prisma.employer.create({
          data: {
            name: args.name,
            contactEmail: args.contactEmail,
            industry: args.industry,
            manager: { connect: { id: args.managerId } },
          },
        });
      }
    ),

    updateEmployer: requireRole(
      [Role.ADMIN, Role.MANAGER],
      async (
        _: unknown,
        args: {
          id: number;
          name: string;
          contactEmail: string;
          industry: string;
        },
        context: Context,
        info: GraphQLResolveInfo
      ) => {
        const auth = context.auth!;

        if (
          auth.role === Role.MANAGER &&
          !(await isManagerOfEmployer(args.id, auth.id))
        ) {
          throw new Error("Unauthorized: You do not manage this employer.");
        }

        return prisma.employer.update({
          where: { id: args.id },
          data: {
            name: args.name,
            contactEmail: args.contactEmail,
            industry: args.industry,
          },
        });
      }
    ),

    deleteEmployer: requireRole(
      [Role.ADMIN, Role.MANAGER],
      async (
        _: unknown,
        args: { id: number },
        context: Context,
        info: GraphQLResolveInfo
      ) => {
        const auth = context.auth!;

        if (
          auth.role === Role.MANAGER &&
          !(await isManagerOfEmployer(args.id, auth.id))
        ) {
          throw new Error("Unauthorized: You do not manage this employer.");
        }

        return prisma.employer.delete({ where: { id: args.id } });
      }
    ),
  },
  Employer: {
    jobs: (parent: { id: number }, _: unknown, context: Context) => {
      return context.loaders.jobsByEmployer.load(parent.id);
    },
    manager: requireRole(
      [Role.ADMIN],
      (parent: { managerId: number }, _: unknown, context: Context) => {
        return context.loaders.employerByManagerId.load(parent.managerId);
      }
    ) as GraphQLFieldResolver<unknown, Context>,
  },
};

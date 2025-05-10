import { prisma } from "../../db/client";
import { Context } from "../context";
import { Role } from "../../../prisma/generated";

export const userResolver = {
  Query: {
    users: async () => {
      return await prisma.user.findMany();
    },
    user: async (_: unknown, args: { id: number }) => {
      return await prisma.user.findUnique({ where: { id: args.id } });
    },
  },
  Mutation: {
    createUser: async (
      _: unknown,
      args: {
        username: string;
        email: string;
        cvUrl?: string;
        role: string;
        password: string;
      }
    ) => {
      // Dummy value for now.
      const passwordHash = `hashed(${args.password})`;

      return prisma.user.create({
        data: {
          username: args.username,
          email: args.email,
          cvUrl: args.cvUrl,
          role: args.role as Role,
          passwordHash: passwordHash,
        },
      });
    },
    loginUser: async (
      _: unknown,
      args: { username: string; password: string }
    ) => {
      return "dummy_token";
    },
    updateUser: async (
      _: unknown,
      args: { id: number; username?: string; cvUrl?: string }
    ) => {
      const { id, ...rest } = args;
      const updateData: Record<string, string> = {};

      if (rest.username !== undefined) {
        updateData.username = rest.username;
      }

      if (rest.cvUrl !== undefined) {
        updateData.cvUrl = rest.cvUrl;
      }

      return prisma.user.update({
        where: { id },
        data: updateData,
      });
    },
    deleteUser: async (_: unknown, args: { id: number }) => {
      return prisma.user.delete({ where: { id: args.id } });
    },
  },

  User: {
    applications: (parent: { id: number }, _: unknown, context: Context) => {
      return context.loaders.applicationsByUser.load(parent.id);
    },
    manages: (parent: { id: number }, _: unknown, context: Context) => {
      return context.loaders.employerByManagerId.load(parent.id);
    },
  },
};

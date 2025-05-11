import { prisma } from "../../db/client";
import { Context } from "../context";
import { Employer, Role } from "../../../prisma/generated";
import {
  hashPassword,
  verifyPassword,
  createToken,
  requireRole,
} from "../../utils/auth";
import { Application } from "../../../prisma/generated";
import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";

export const userResolver = {
  Query: {
    users: requireRole([Role.ADMIN, Role.MANAGER], async () => {
      return await prisma.user.findMany({
        where: {
          // Managers shouldn't see admins
          role: {
            not: "ADMIN",
          },
        },
      });
    }),

    user: requireRole(
      [Role.ADMIN, Role.MANAGER],
      async (_: unknown, args: { id: number }, context: Context) => {
        const user = await prisma.user.findUnique({ where: { id: args.id } });

        if (!user) return null;

        // If the requester is a MANAGER and the target is ADMIN, block it
        if (context.auth?.role === "MANAGER" && user.role === "ADMIN") {
          throw new Error("Forbidden.");
        }

        return user;
      }
    ),
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
      },
      context: Context
    ) => {
      // Only an admin can create a manager or another admin.
      if (args.role === Role.ADMIN || args.role === Role.MANAGER) {
        const auth = context.auth;
        if (!auth) {
          throw new Error("Not authenticated");
        }
        if (auth.role !== "ADMIN") {
          throw new Error("Forbidden.");
        }
      }

      const passwordHash = await hashPassword(args.password);

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
      args: { username: string; password: string },
      context: Context
    ) => {
      const auth = context.auth;
      if (auth) {
        throw new Error("User is already logged in.");
      }

      const user = await prisma.user.findUnique({
        where: { username: args.username },
      });

      if (!user) {
        throw new Error("Invalid credentials.");
      }

      const match = await verifyPassword(args.password, user.passwordHash);

      if (!match) {
        throw new Error("Invalid credentials.");
      }

      return createToken({ id: user.id, role: user.role });
    },
    updateUser: requireRole(
      [Role.MANAGER, Role.ADMIN, Role.CANDIDATE],
      async (
        _: unknown,
        args: { id: number; username?: string; cvUrl?: string },
        context: Context
      ) => {
        // Only an admin can update other users.
        if (context.auth!.role !== Role.ADMIN && args.id !== context.auth!.id) {
          throw new Error("Invalid credentials.");
        }

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
      }
    ),

    deleteUser: requireRole(
      [Role.ADMIN, Role.MANAGER, Role.CANDIDATE],
      async (_: unknown, args: { id: number }, context: Context) => {
        const auth = context.auth;

        if (!auth) {
          throw new Error("Not authenticated");
        }

        // Admins cannot be deleted at all
        const userToDelete = await prisma.user.findUnique({
          where: { id: args.id },
        });

        if (userToDelete?.role === Role.ADMIN) {
          throw new Error("Admins cannot be deleted.");
        }

        // Any other role can only delete themselves
        if (auth.id !== args.id && auth.role !== Role.ADMIN) {
          throw new Error("Unauthorized.");
        }

        // Admin can delete any non-admin user
        return prisma.user.delete({ where: { id: args.id } });
      }
    ),
  },

  User: {
    applications: (async (
      parent: { id: number },
      _: unknown,
      context: Context
    ): Promise<Application[]> => {
      const auth = context.auth!;
      // Admins see everything
      if (auth.role === "ADMIN") {
        return context.loaders.applicationsByUser.load(parent.id);
      }
      // Candidates see only their own
      if (auth.role === "CANDIDATE") {
        if (auth.id !== parent.id) {
          throw new Error("Forbidden");
        }
        return context.loaders.applicationsByUser.load(parent.id);
      }
      // Managers shouldn’t use this path to see applications.
      // They should review via Job.applications instead.
      return [];
    }) as GraphQLFieldResolver<unknown, Context>,

    manages: requireRole(
      [Role.ADMIN, Role.MANAGER],
      async (
        source: unknown,
        _: unknown,
        context: Context,
        info: GraphQLResolveInfo
      ): Promise<Employer | null> => {
        const { id } = source as { id: number };

        // Admins see any, managers only their own
        if (context.auth!.role === "MANAGER" && context.auth!.id !== id) {
          throw new Error("Forbidden");
        }

        return context.loaders.employerByManagerId.load(id);
      }
    ),
  },
};

import { prisma } from "../../db/client";
import { Context } from "../context";
import { GraphQLFieldResolver } from "graphql";
import { requireRole } from "../../utils/auth";
import { Job, Role } from "../../../prisma/generated";
import { Application } from "../../../prisma/generated";

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
    addJob: requireRole(
      [Role.MANAGER, Role.ADMIN],
      async (
        _: unknown,
        args: { title: string; description: string; employerId: number },
        context
      ) => {
        const auth = context.auth!;

        if (auth.role !== Role.ADMIN) {
          const employer = await prisma.employer.findUnique({
            where: { id: args.employerId },
            select: { managerId: true },
          });

          if (!employer || employer.managerId !== auth.id) {
            throw new Error(
              "Unauthorized: You are not the manager of this employer."
            );
          }
        }

        return prisma.job.create({
          data: {
            title: args.title,
            description: args.description,
            employer: { connect: { id: args.employerId } },
          },
        });
      }
    ),

    updateJob: requireRole(
      [Role.MANAGER, Role.ADMIN],
      async (
        _: unknown,
        args: { id: number; title: string; description: string },
        context
      ) => {
        const auth = context.auth!;

        if (auth.role !== Role.ADMIN) {
          const job = await prisma.job.findUnique({
            where: { id: args.id },
            include: { employer: { select: { managerId: true } } },
          });

          if (!job || job.employer.managerId !== auth.id) {
            throw new Error("Unauthorized: You do not manage this job.");
          }
        }

        return prisma.job.update({
          where: { id: args.id },
          data: {
            title: args.title,
            description: args.description,
          },
        });
      }
    ),

    deleteJob: requireRole(
      [Role.MANAGER, Role.ADMIN],
      async (_: unknown, args: { id: number }, context) => {
        const auth = context.auth!;

        if (auth.role !== Role.ADMIN) {
          const job = await prisma.job.findUnique({
            where: { id: args.id },
            include: { employer: { select: { managerId: true } } },
          });

          if (!job || job.employer.managerId !== auth.id) {
            throw new Error("Unauthorized: You do not manage this job.");
          }
        }

        return prisma.job.delete({ where: { id: args.id } });
      }
    ),
  },
  Job: {
    employer: (
      parent: { employerId: number },
      _: unknown,
      context: Context
    ) => {
      return context.loaders.employerById.load(parent.employerId);
    },
    applications: requireRole(
      [Role.ADMIN, Role.MANAGER, Role.CANDIDATE],
      async (
        parent: Job, // Now explicitly typing parent as Job
        _: unknown,
        context: Context
      ): Promise<Application[]> => {
        const auth = context.auth!;

        // Admin: all applications via loader
        if (auth.role === Role.ADMIN) {
          return context.loaders.applicationsByJob.load(parent.id);
        }

        // Candidate: only own applications
        if (auth.role === Role.CANDIDATE) {
          const allApplications = await context.loaders.applicationsByJob.load(
            parent.id
          );
          return allApplications.filter((app) => app.userId === auth.id);
        }

        // Manager: only applications for jobs they manage
        return prisma.application.findMany({
          where: {
            jobId: parent.id,
            job: {
              employer: {
                managerId: auth.id,
              },
            },
          },
        });
      }
    ) as GraphQLFieldResolver<unknown, Context>,
  },
};

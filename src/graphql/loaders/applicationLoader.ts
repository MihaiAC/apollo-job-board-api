import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Application } from "../../../prisma/generated";

export function createApplicationsByUserIdLoader(): DataLoader<
  number,
  Application[]
> {
  return new DataLoader(async (userIds: readonly number[]) => {
    const applications = await prisma.application.findMany({
      where: { userId: { in: userIds as number[] } },
    });

    const appMap: Record<number, Application[]> = {};

    for (const app of applications) {
      if (!appMap[app.userId]) {
        appMap[app.userId] = [];
      }
      appMap[app.userId].push(app);
    }

    return userIds.map((id) => appMap[id] || []);
  });
}

export function createApplicationsByJobIdLoader(): DataLoader<
  number,
  Application[]
> {
  return new DataLoader(async (jobIds: readonly number[]) => {
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds as number[] } },
    });

    const appMap: Record<number, Application[]> = {};

    for (const app of applications) {
      if (!appMap[app.jobId]) {
        appMap[app.jobId] = [];
      }
      appMap[app.jobId].push(app);
    }

    return jobIds.map((id) => appMap[id] || []);
  });
}

import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Job } from "@prisma/client";

export function createJobsByEmployerLoader(): DataLoader<number, Job[]> {
  return new DataLoader(async (employerIds: readonly number[]) => {
    const jobs = await prisma.job.findMany({
      where: { employerId: { in: employerIds as number[] } },
    });

    const jobsMap: Record<number, Job[]> = {};

    for (const job of jobs) {
      if (!jobsMap[job.employerId]) {
        jobsMap[job.employerId] = [];
      }
      jobsMap[job.employerId].push(job);
    }

    return employerIds.map((id) => jobsMap[id] || []);
  });
}

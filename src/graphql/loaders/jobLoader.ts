import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Job } from "../../../prisma/generated";

export function createJobsByEmployerIdLoader(): DataLoader<number, Job[]> {
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

export function createJobByIdLoader(): DataLoader<number, Job | null> {
  return new DataLoader(async (jobIds: readonly number[]) => {
    const jobs = await prisma.job.findMany({
      where: { id: { in: jobIds as number[] } },
    });

    const jobMap = new Map<number, Job>();
    for (const job of jobs) {
      jobMap.set(job.id, job);
    }

    return jobIds.map((id) => jobMap.get(id) || null);
  });
}

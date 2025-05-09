import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Job } from "@prisma/client";

export function createJobsByEmployerLoader(): DataLoader<number, Job[]> {
  return new DataLoader(async (employerIds: readonly number[]) => {
    const jobs = await prisma.job.findMany({
      where: { employerId: { in: employerIds as number[] } },
    });
    const map = new Map(jobs.map((job: Job) => [job.id, job]));
    return employerIds.map((employerId) => map.get(employerId));
  });
}

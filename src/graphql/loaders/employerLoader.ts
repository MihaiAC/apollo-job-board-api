import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Employer } from "../../../prisma/generated";

export function createEmployerByIdLoader(): DataLoader<
  number,
  Employer | null
> {
  return new DataLoader(async (ids: readonly number[]) => {
    const employers = await prisma.employer.findMany({
      where: { id: { in: ids as number[] } },
    });

    const map = new Map(
      employers.map((employer: Employer) => [employer.id, employer])
    );

    return ids.map((id) => map.get(id) || null);
  });
}

export function createEmployerByManagerIdLoader(): DataLoader<
  number,
  Employer | null
> {
  return new DataLoader(async (userIds: readonly number[]) => {
    const employers = await prisma.employer.findMany({
      where: { managerId: { in: userIds as number[] } },
    });

    const map = new Map<number, Employer>();
    for (const employer of employers) {
      map.set(employer.managerId, employer);
    }

    return userIds.map((id) => map.get(id) || null);
  });
}

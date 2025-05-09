import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { Employer } from "@prisma/client";

export function createEmployerLoader(): DataLoader<
  number,
  Employer | undefined
> {
  return new DataLoader(async (ids: readonly number[]) => {
    const employers = await prisma.employer.findMany({
      where: { id: { in: ids as number[] } },
    });
    const map = new Map(
      employers.map((employer: Employer) => [employer.id, employer])
    );
    return ids.map((id) => map.get(id));
  });
}

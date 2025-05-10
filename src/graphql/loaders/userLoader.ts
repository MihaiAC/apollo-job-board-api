import DataLoader from "dataloader";
import { prisma } from "../../db/client";
import { User } from "../../../prisma/generated";

export function createUserByIdLoader(): DataLoader<number, User | null> {
  return new DataLoader(async (ids: readonly number[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as number[] } },
    });

    const map = new Map(users.map((user: User) => [user.id, user]));
    return ids.map((id) => map.get(id) || null);
  });
}

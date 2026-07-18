import { prisma } from "@/lib/prisma";
import type { ClientInput } from "@/features/clients/client-input";

export const clientRepository = {
  list: (userId: string) => prisma.client.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
  create: (userId: string, input: ClientInput) => prisma.client.create({ data: { ...input, userId } }),
  update: (id: string, userId: string, input: ClientInput) => prisma.client.updateMany({ where: { id, userId }, data: input }),
  find: (id: string, userId: string) => prisma.client.findFirst({ where: { id, userId } }),
  remove: (id: string, userId: string) => prisma.client.deleteMany({ where: { id, userId } }),
  replaceAll: (userId: string, inputs: ClientInput[]) => prisma.$transaction(async (transaction) => {
    await transaction.client.deleteMany({ where: { userId } });
    if (!inputs.length) return;
    await transaction.client.createMany({ data: inputs.map((input) => ({ ...input, userId })) });
  }),
};

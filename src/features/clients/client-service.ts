import { clientRepository } from "@/features/clients/client-repository";
import type { ClientInput } from "@/features/clients/client-input";

export const clientService = {
  list: (userId: string) => clientRepository.list(userId),
  create: (userId: string, input: ClientInput) => clientRepository.create(userId, input),
  update: async (id: string, userId: string, input: ClientInput) => {
    const result = await clientRepository.update(id, userId, input);
    if (!result.count) return null;
    return clientRepository.find(id, userId);
  },
  remove: async (id: string, userId: string) => (await clientRepository.remove(id, userId)).count > 0,
  replaceAll: (userId: string, inputs: ClientInput[]) => clientRepository.replaceAll(userId, inputs),
};

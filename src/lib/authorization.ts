import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
};

export const getAdminUser = async () => {
  const user = await getAuthenticatedUser();
  return user?.role === "admin" ? user : null;
};

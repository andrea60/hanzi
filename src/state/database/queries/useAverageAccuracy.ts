import { useQuery } from "@tanstack/react-query";
import { db } from "../database.db";
import { getAuthenticatedUser } from "../../../auth/useAuth";
import { QueryKey } from "./queryKey";

export const useAverageSessionAccuracy = () => {
  return useQuery({
    queryKey: QueryKey.AverageSessionAccuracy(),
    queryFn: async () => {
      const user = getAuthenticatedUser();
      const sessions = await db.sessions
        .where("userId")
        .equals(user.uid)
        .toArray();

      if (sessions.length === 0) return "unavailable";

      return (
        sessions.map((s) => s.avgAccuracy).reduce((c, n) => c + n) /
        sessions.length
      );
    },
  });
};

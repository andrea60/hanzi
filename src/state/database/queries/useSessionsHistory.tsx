import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "./queryKey";
import { getAuthenticatedUser } from "../../../auth/useAuth";
import { db } from "../database.db";

export const useSessionsHistory = (max: number) => {
  return useQuery({
    queryKey: QueryKey.SessionsHistory(max),
    queryFn: async () => {
      const user = getAuthenticatedUser();
      // Due to a limitation of Dexie, I can't use a .limit() operation on sorted collections
      // Considering the number of sessions should always be limited limiting in memory is acceptable
      const sessions = await db.sessions
        .where("userId")
        .equals(user.uid)

        .sortBy("timestamp");

      return sessions.slice(0, max);
    },
  });
};

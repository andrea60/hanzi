import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "./queryKey";
import { db } from "../database.db";
import { getAuthenticatedUser } from "../../../auth/useAuth";
import Dexie from "dexie";
import { toMap } from "../../../utils/toMap";

export const useWordsAccuracyStats = (
  sortDir: "best" | "worst",
  limit: number
) => {
  return useQuery({
    queryKey: QueryKey.WordsAccuracyStats(sortDir, limit),
    queryFn: async () => {
      const user = getAuthenticatedUser();

      let baseQuery = db.wordStats
        .where("[userId+avgAccuracy]")
        .between([user.uid, Dexie.minKey], [user.uid, Dexie.maxKey])
        .limit(limit);

      if (sortDir === "best") baseQuery = baseQuery.reverse();

      const stats = await baseQuery.toArray();

      const dictonaryEntries = toMap(
        await db.dictionary
          .where("word")
          .anyOf(stats.map((s) => s.word))
          .toArray(),
        (r) => r.word
      );

      return stats.map((s) => ({
        ...s,
        ...dictonaryEntries.get(s.word),
      }));
    },
  });
};

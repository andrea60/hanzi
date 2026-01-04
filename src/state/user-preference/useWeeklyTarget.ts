import { useQuery } from "@tanstack/react-query";
import { db } from "../database/database.db";
import { getAuthenticatedUser } from "../../auth/useAuth";
import { L } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";
import { getUserPreferences } from "./useUserPreference";

const getStartOfWeek = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
};

const getEndOfWeek = (): Date => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Calculate days to add to get to Sunday (0 = Sunday, 1 = Monday, etc.)
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
};

export const useWeeklyTarget = () => {
  return useQuery({
    queryKey: ["user-preference", "target"],
    queryFn: async () => {
      const user = getAuthenticatedUser();
      const startOfWeek = getStartOfWeek();
      const endOfWeek = getEndOfWeek();

      const relevantSessions = await db.sessions
        .where("[userId+timestamp]")
        .between([user.uid, startOfWeek], [user.uid, endOfWeek])
        .toArray();

      const practiceTimeSeconds =
        relevantSessions.sum((s) => s.timeTakenSeconds) ?? 0;

      const practiceTimeMinutes = practiceTimeSeconds / 60;

      const { weeklyTargetMinutes } = await getUserPreferences();

      return {
        weeklyTargetMinutes,
        practiceTimeMinutes,
        progress: Math.min(1, practiceTimeMinutes / weeklyTargetMinutes),
      };
    },
  });
};

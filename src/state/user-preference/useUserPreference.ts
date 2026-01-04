import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedUser, useAuth } from "../../auth/useAuth";
import { db } from "../database/database.db";

export type UserPreference = {
  weeklyTargetMinutes: number;
};

const defaultUserPreference: UserPreference = {
  weeklyTargetMinutes: 20 * 7,
};

const QUERY_KEY = "user-preference";

export const useUserPreference = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  if (!user) throw new Error("User must be authenticated");

  const userPreferences = useQuery<UserPreference>({
    queryKey: [QUERY_KEY],
    staleTime: Infinity,
    queryFn: async () => {
      const data = await getUserPreferences();
      return {
        weeklyTargetMinutes: data.weeklyTargetMinutes,
      };
    },
  });

  const updateUserPreference = useMutation({
    mutationFn: async (pref: UserPreference) => {
      await db.userPreference.put({ userId: user.uid, ...pref });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { userPreferences, updateUserPreference };
};

export const getUserPreferences = async () => {
  const user = getAuthenticatedUser();
  const data = await db.userPreference
    .where("userId")
    .equals(user.uid)
    .toArray();
  if (data.length === 0) return defaultUserPreference;
  if (data.length > 1) throw new Error("Multiple user preferences detected!");

  return data[0];
};

import { getAuthenticatedUser } from "../../../auth/useAuth";
import { useQuery } from "@tanstack/react-query";
import { db } from "../database.db";
import { QueryKey } from "./queryKey";

export const useFavourites = () => {
  return useQuery({
    queryKey: QueryKey.Favourites(),
    queryFn: async () => {
      const user = getAuthenticatedUser();
      const favourites = await db.favourites
        .where("userId")
        .equals(user.uid)
        .toArray();
      return favourites.map((fav) => fav.word);
    },
  });
};

export const useFavouritesCount = () => {
  return useQuery({
    queryKey: QueryKey.FavouritesCount(),
    queryFn: async () => {
      const user = getAuthenticatedUser();
      return await db.favourites.where("userId").equals(user.uid).count();
    },
  });
};

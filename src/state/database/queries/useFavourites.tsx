import { getAuthenticatedUser } from "../../../auth/useAuth";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { db } from "../database.db";
import { QueryKey } from "./queryKey";
import { toMap } from "../../../utils/toMap";

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

const PAGE_SIZE = 25;
export const useFavouritesPaginated = () => {
  return useInfiniteQuery({
    queryKey: [...QueryKey.Favourites(), "paginated"],
    queryFn: async ({ pageParam = 0 }) => {
      const totalCount = await db.favourites.count();
      const favs = await db.favourites
        .offset(pageParam)
        .limit(PAGE_SIZE)
        .toArray();
      const words = await db.dictionary
        .where("word")
        .anyOf(favs.map((f) => f.word))
        .toArray();

      const favsMap = toMap(favs, (f) => f.word);
      const orderedWords = words.sortBy(
        (w) => favsMap.get(w.word)?.addedAt.valueOf(),
        "desc"
      );

      return {
        totalCount,
        words: orderedWords,
        offset: pageParam,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (prevPage) => {
      const nextPage = prevPage.offset + PAGE_SIZE;
      if (nextPage < prevPage.totalCount) {
        return nextPage;
      }
      return null;
    },
  });
};

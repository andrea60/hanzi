import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { db } from "../../data/database.db";
import { WordCard } from "./WordCard";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

const fetchFavourites = async (offset: number, limit: number) => {
  const totalCount = await db.favourites.count();
  const favs = await db.favourites.offset(offset).limit(limit).toArray();
  const words = await db.dictionary
    .where("word")
    .anyOf(favs.map((f) => f.word))
    .toArray();
  return {
    totalCount,
    words,
    offset,
  };
};

const PAGE_SIZE = 30;

export const CharactersList = () => {
  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["characters"],
    queryFn: async ({ pageParam = 0 }) => fetchFavourites(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (prevPage) => {
      const nextPage = prevPage.offset + PAGE_SIZE;
      if (nextPage < prevPage.totalCount) {
        return nextPage;
      }
      return null;
    },
  });

  const flatData = useMemo(() => data?.pages.flatMap((p) => p.words), [data]);
  if (isLoading) return <div>Loading...</div>;

  const isEmpty = flatData && flatData.length == 0;

  if (isEmpty) {
    return (
      <div role="alert" className="mt-6 flex flex-row gap-2 ">
        <InformationCircleIcon className="size-10 justify-self-start" />

        <div>
          <p className="">Empty study list</p>
          <p className="text-xs">
            Use the search bar above to search characters and add them to your
            study list
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grow flex flex-col gap-2">
      {flatData?.map((word) => <WordCard word={word} />)}

      {hasNextPage && (
        <button
          className="btn btn-ghost w-full"
          onClick={() => fetchNextPage()}
        >
          Load more...
        </button>
      )}
    </div>
  );
};

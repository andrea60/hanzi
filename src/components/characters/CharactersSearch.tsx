import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { db } from "../../data/database.db";
import { WordCard } from "./WordCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";

const fetchWords = async (
  search: string | undefined,
  skip: number,
  size: number
) => {
  if (!search) return { words: [], skip, totalCount: 0 };

  console.log("fetching from ", skip, " and taking ", size, " words");

  const baseQuery = db.dictionary
    .where("searchablePinyin")
    .startsWith(search)
    .or("word")
    .equals(search);

  const totalCount = await baseQuery.count();

  const words = await baseQuery.offset(skip).limit(size).toArray();

  return { words, skip, totalCount };
};
const PAGE_SIZE = 25;
type Props = {
  search: string | undefined;
};
export const CharactersSearch = ({ search }: Props) => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    isSuccess,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["characters", search],
    queryFn: ({ pageParam = 0 }) => fetchWords(search, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (prev) => {
      const nextSkip = prev.skip + PAGE_SIZE;
      return nextSkip < prev.totalCount ? nextSkip : undefined;
    },
  });

  const words = useMemo(() => data?.pages.flatMap((p) => p.words), [data]);

  if (!search) return;

  console.log({ isLoading, isFetching });
  if (isLoading) return <div className="text-center my-10">Loading...</div>;

  if (isSuccess)
    return (
      <>
        <div role="list" className="flex flex-col gap-2">
          {words?.map((word) => <WordCard key={word.word} word={word} />)}
        </div>
        <div>
          {hasNextPage && (
            <button
              className="btn btn-ghost w-100"
              onClick={() => fetchNextPage()}
            >
              Load more...
            </button>
          )}
        </div>
      </>
    );
  return <div>Error {error?.message}</div>;
};

import { useQuery } from "@tanstack/react-query";
import { db } from "../../data/database.db";
import { WordCard } from "./WordCard";

type Props = {
  search: string | undefined;
};
export const CharactersSearch = ({ search }: Props) => {
  const { data, isLoading, isFetching, error, isSuccess } = useQuery({
    queryKey: ["characters", search],
    queryFn: async () => {
      if (!search) return [];

      const matching = await db.dictionary
        .where("searchablePinyin")
        .startsWith(search)
        .or("word")
        .equals(search)
        .toArray();

      const favourites = await db.favourites
        .where("word")
        .anyOf(matching.map((m) => m.word))
        .toArray();
      var favouritesSet = new Set(favourites.map((f) => f.word));

      return matching.map((m) => ({
        ...m,
        isFavourite: favouritesSet.has(m.word),
      }));
    },
  });

  if (isLoading || isFetching) return <div>Loading...</div>;

  if (isSuccess)
    return (
      <div role="list" className="flex flex-col gap-2">
        {data.map((word) => (
          <WordCard
            key={word.word}
            word={word}
            isFavourite={word.isFavourite}
          />
        ))}
      </div>
    );
  return <div>Error {error?.message}</div>;
};

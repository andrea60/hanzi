import { useMemo } from "react";
import { db, DictionaryRow } from "../../data/database.db";
import { FavouriteToggle } from "./FavouriteToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "../../firebase/firebase.config";
import { useAuth } from "../../auth/useAuth";

const maxDefinitionLength = 125;

type Props = {
  word: DictionaryRow;
};

export const WordCard = ({ word }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const definition = useMemo(() => {
    const text = word.definitions.join(", ");
    if (text.length > maxDefinitionLength)
      return text.substring(0, maxDefinitionLength - 3) + "...";

    return text;
  }, word.definitions);

  const { data: isFavourite } = useQuery({
    queryKey: ["word", word.word],
    queryFn: async () =>
      (await db.favourites.where("word").equals(word.word).count()) > 0,
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (newStatus: boolean) => {
      if (newStatus)
        await db.favourites.add({
          word: word.word,
          userId: user!.uid,
          addedAt: new Date(),
        });
      else await db.favourites.delete([word.word, user!.uid]);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["word", word.word] }),
  });
  return (
    <div className="card shadow">
      <div className="card-body p-3 h-18 flex flex-row gap-3 items-center">
        <div>
          <p className="text-2xl whitespace-nowrap">{word.word}</p>
        </div>
        <div className="flex-1">
          <h1>{word.pinyin.join("/")}</h1>
          <p className="text-xs text-ellipsis overflow-hidden">{definition}</p>
        </div>
        <div>
          <FavouriteToggle
            isFavourite={isFavourite ?? false}
            onChange={(fav) => mutateAsync(fav)}
          />
        </div>
      </div>
    </div>
  );
};

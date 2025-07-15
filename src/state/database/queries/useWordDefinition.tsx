import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "../database.db";
import { useAuth } from "../../../auth/useAuth";

const fetchWordDef = async (wordChar: string, userId: string) => {
  const word = await db.dictionary.get(wordChar);
  if (!word) {
    throw new Error(`Word ${wordChar} not found in dictionary`);
  }

  const isFavourite =
    (await db.favourites
      .where("[word+userId]")
      .equals([wordChar, userId])
      .count()) > 0;

  return {
    ...word,
    isFavourite,
  };
};

export const useWordDefinition = (wordChar: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["word-definition", wordChar],
    queryFn: () => fetchWordDef(wordChar, user!.uid),
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (newStatus: boolean) => {
      if (newStatus)
        await db.favourites.add({
          word: wordChar,
          userId: user!.uid,
          addedAt: new Date(),
        });
      else await db.favourites.delete([wordChar, user!.uid]);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["word-definition", wordChar],
      }),
  });

  return {
    wordData: query,
    changeFavourite: mutateAsync,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db, UserFavouriteRow } from "../database.db";
import { getAuthenticatedUser } from "../../../auth/useAuth";
import { QueryKey } from "../queries/queryKey";

export const importFavouriteWords = async (words: string[]) => {
  const user = getAuthenticatedUser();
  // Check the words all exist in the dictionary
  const dictionaryWords = await db.dictionary
    .where("word")
    .anyOf(words)
    .toArray();

  // Find the words that do not exist in the dictionary
  if (dictionaryWords.length !== words.length) {
    const missingWords = words.filter(
      (word) => !dictionaryWords.some((dictWord) => dictWord.word === word)
    );
    throw new Error(
      `The following words do not exist in the dictionary: ${missingWords.join(", ")}`
    );
  }

  await db.favourites.clear();
  await db.favourites.bulkAdd(
    words.map<UserFavouriteRow>((word) => ({
      userId: user.uid,
      word,
      addedAt: new Date(),
    }))
  );
};

export const useFavouriteImport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importFavouriteWords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKey.Favourites() });
    },
  });
};

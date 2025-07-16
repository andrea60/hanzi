import { db } from "../database/database.db";

export const selectPracticeWords = async () => {
  const favs = await db.favourites.toArray();

  const numWords = Math.floor(favs.length * 0.5);

  return shuffleArray(favs.map((fav) => fav.word)).slice(0, numWords);
};

const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

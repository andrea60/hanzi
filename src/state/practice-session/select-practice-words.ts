import { toMap } from "../../utils/toMap";
import { db } from "../database/database.db";
import { WordPracticeData } from "./usePracticeSession";

export const selectPracticeWords = async (
  numWords: number
): Promise<WordPracticeData[]> => {
  const favs = await db.favourites.toArray();

  const words = shuffleArray(favs.map((fav) => fav.word)).slice(0, numWords);

  const chars = words.flatMap((w) => w.split(""));

  const wordDefs = toMap(
    await db.dictionary.where("word").anyOf(words).toArray(),
    (i) => i.word
  );
  const strokesData = toMap(
    await db.strokeData.where("char").anyOf(chars).toArray(),
    (i) => i.char
  );

  return words.reduce((result, word) => {
    const wordDef = wordDefs.get(word);
    if (!wordDef) return result;

    const chars = word.split("");
    const pinyins = wordDef.pinyin[0].split(" ");
    if (chars.length !== pinyins.length) {
      throw new Error(
        `Word ${word} has unmatching number of pinyins and word characters. Pinyin ${wordDef.pinyin[0]}`
      );
    }

    const steps = chars.map((char, idx) => {
      const strokeData = strokesData.get(char);
      if (!strokeData)
        throw new Error(
          `Character ${char} does not have any stroke data. Source word ${word}`
        );
      return {
        char,
        pinyin: pinyins[idx],
        strokeData: strokeData.strokes,
      };
    });

    return [
      ...result,
      {
        word,
        definitions: wordDef.definitions,
        pinyin: wordDef.pinyin[0],
        steps: steps,
      } as WordPracticeData,
    ];
  }, [] as WordPracticeData[]);
};

const shuffleArray = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

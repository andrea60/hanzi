import { useMemo } from "react";
import { DictionaryRow } from "../../data/database.db";

type Props = {
  word: DictionaryRow;
  isFavourite: boolean;
};
export const WordCard = ({ word, isFavourite }: Props) => {
  const definition = useMemo(() => {
    const text = word.definitions.join(",");
  }, word.definitions);
  return (
    <div className="card shadow-xs">
      <div className="card-body p-3 flex flex-row gap-3">
        <div>
          <p className="text-2xl whitespace-nowrap">{word.word}</p>
        </div>
        <div className="flex-1">
          <h1>{word.pinyin.join("/")}</h1>
          <p className="text-xs max-h-10 text-ellipsis overflow-hidden">
            {word.definitions.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
};

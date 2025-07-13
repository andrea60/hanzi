import { useMemo } from "react";
import { DictionaryRow } from "../../data/database.db";
import { FavouriteToggle } from "./FavouriteToggle";
import { useNavigate } from "@tanstack/react-router";
import { useWordDefinition } from "../../data/queries/useWordDefinition";

const maxDefinitionLength = 125;

type Props = {
  word: DictionaryRow;
};

export const WordCard = ({ word }: Props) => {
  const navigate = useNavigate();

  const definition = useMemo(() => {
    const text = word.definitions.join(", ");
    if (text.length > maxDefinitionLength)
      return text.substring(0, maxDefinitionLength - 3) + "...";

    return text;
  }, word.definitions);

  const { wordData, changeFavourite } = useWordDefinition(word.word);

  const handleClick = () => {
    navigate({ to: "/app/characters/$char", params: { char: word.word } });
  };
  return (
    <div className="card shadow" onClick={handleClick}>
      <div className="card-body p-3 h-18 flex flex-row gap-3 items-center">
        <div>
          <p className="text-2xl whitespace-nowrap">{word.word}</p>
        </div>
        <div className="flex-1">
          <h1>{word.pinyin.join("/")}</h1>
          <p className="text-xs text-ellipsis overflow-hidden max-h-8">
            {definition}
          </p>
        </div>
        <div>
          <FavouriteToggle
            isFavourite={wordData?.data?.isFavourite ?? false}
            onChange={changeFavourite}
          />
        </div>
      </div>
    </div>
  );
};

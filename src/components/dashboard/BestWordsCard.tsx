import { useState } from "react";
import { useWordsAccuracyStats } from "../../state/database/queries/useWordsStats";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";

export const BestWordsCard = () => {
  const { data } = useWordsAccuracyStats("best", 3);
  const [cards] = useState([0, 0, 0]);

  const skeleton = (
    <>
      <div className="skeleton w-16 h-4"></div>
      <div className="skeleton w-12 h-12 my-1" />
      <div className="skeleton w-8 h-4" />
    </>
  );

  const notEnoughDataPlaceholder = (
    <div className="card card-sm card-default col-span-3">
      <div className="card-body text-center">
        <p>Not enough data yet</p>
      </div>
    </div>
  );

  const cardsContent = cards.map((_, idx) => {
    const word = data?.[idx];
    return (
      <div className="card card-sm card-default text-center">
        <div className="card-body flex items-center">
          {word ? (
            <>
              <div className="mb-1">{word.pinyin}</div>
              <div className={`text-4xl hanzi-serif mb-1 whitespace-nowrap`}>
                {word.word}
              </div>
              <div className="badge badge-sm badge-success">
                {(word.avgAccuracy * 100).toFixed(0)}%
              </div>
            </>
          ) : (
            skeleton
          )}
        </div>
      </div>
    );
  });

  const notEnoughData = data && data.length < 3;

  return (
    <>
      <h1 className="mb-1">
        <HandThumbUpIcon className="size-4 inline text-success" /> Your Best
        Words
      </h1>
      <div className="grid grid-cols-3 grid-rows-1 items-end gap-2">
        {notEnoughData ? notEnoughDataPlaceholder : cardsContent}
      </div>
    </>
  );
};

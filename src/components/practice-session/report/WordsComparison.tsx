import {
  ArrowRightCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { WordPracticeStats } from "../../../state/practice-session/usePracticeSession";
import { AccuracyBadge } from "../../ui/AccuracyBadge";
import {
  ArrowDownCircleIcon,
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ArrowUpCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import { useMemo } from "react";
import { match } from "ts-pattern";

type Props = {
  words: WordPracticeStats[];
};
export const WordsComparison = ({ words }: Props) => {
  const sortedWords = useMemo(
    () => words.sortByProperty("accuracy", "desc"),
    [words]
  );
  return (
    <div className="flex flex-col gap-2">
      {sortedWords.map((w) => (
        <WordComparisonCard key={w.word} word={w} />
      ))}
    </div>
  );
};

type CardProps = {
  word: WordPracticeStats;
};
const WordComparisonCard = ({ word }: CardProps) => {
  const comparison = match(word)
    .with({ prevAccuracy: undefined }, () => <span>New Word!</span>)
    .when(
      (x) => x.accuracy === x.prevAccuracy,
      () => (
        <span className="items-center flex">
          <EllipsisHorizontalIcon className="size-4 inline mr-1" />
          No change
        </span>
      )
    )
    .when(
      (x) => x.accuracy > x.prevAccuracy!,
      () => (
        <span className="text-success items-center flex">
          <ArrowTrendingUpIcon className="size-4 inline mr-1" />
          Improved!
        </span>
      )
    )
    .when(
      (x) => x.accuracy < x.prevAccuracy!,
      () => (
        <span className="text-error items-center flex">
          <ArrowTrendingDownIcon className="size-4 inline mr-1" />
          Getting Worse
        </span>
      )
    )
    .run();
  return (
    <div className="card card-default card-sm">
      <div className="card-body grid grid-cols-[1fr_min-content] grid-rows-[1fr_min-content] gap-0">
        <div className="text-lg">
          <span className="hanzi-serif text-xl">{word.word}</span> {word.pinyin}
        </div>

        <div className="flex gap-2 items-center row-span-2">
          <AccuracyBadge accuracy={word.prevAccuracy} />
          <ArrowRightIcon className="size-4 inline" />
          <AccuracyBadge accuracy={word.accuracy} />
        </div>
        <div>{comparison}</div>
      </div>
    </div>
  );
};

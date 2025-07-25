import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { HanziWordWriter } from "../hanzi-writer/HanziWordWriter";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { motion } from "motion/react";

export const WordPractice = () => {
  const { currentWord, markWordComplete, repracticeWord, progress } =
    usePracticeSession();
  const [wordCompleted, setWordCompleted] = useResettableState(false, [
    currentWord,
  ]);
  const [accuracy, setAccuracy] = useResettableState<number | undefined>(
    undefined,
    [currentWord]
  );
  const handleComplete = (accuracy: number) => {
    setWordCompleted(true);
    setAccuracy(accuracy);
  };

  const moveToNext = () => {
    if (!currentWord || !accuracy)
      throw new Error("There is not current word in the quiz");
    markWordComplete({ word: currentWord.word, accuracy });
  };
  const practiceAgain = () => {
    if (!currentWord || !accuracy)
      throw new Error("There is not current word in the quiz");
    repracticeWord({ word: currentWord.word, accuracy });
  };

  if (!currentWord) return;
  return (
    <div className="grow flex flex-col">
      <progress className="progress w-full mb-2" value={progress} max="1" />
      <div>
        <h1 className="text-2xl mb-1">
          {currentWord.pinyin}
          {wordCompleted && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
              }}
              className="inline-block"
            >
              <CheckCircleIconSolid className="ml-1 size-6 inline text-success" />
            </motion.span>
          )}
        </h1>
        <p className="text-xs h-6 whitespace-nowrap overflow-hidden text-ellipsis">
          {currentWord.definitions.join(", ")}
        </p>
      </div>
      <div className="grow">
        <HanziWordWriter
          key={currentWord.uuid}
          word={currentWord.word}
          onComplete={handleComplete}
        />
      </div>

      <div className="flex gap-2 text-sm">
        <button
          className="btn btn-warning btn-dash flex-1"
          onClick={practiceAgain}
          disabled={!wordCompleted}
        >
          <ArrowPathIcon className="size-4" /> Try Again
        </button>
        <button
          className="btn btn-success flex-1"
          onClick={moveToNext}
          disabled={!wordCompleted}
        >
          <CheckCircleIcon className="size-4" /> Learned
        </button>
      </div>
    </div>
  );
};

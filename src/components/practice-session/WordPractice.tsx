import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { HanziWordWriter } from "../hanzi-writer/HanziWordWriter";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { motion } from "motion/react";
import { AccuracyBadge } from "../ui/AccuracyBadge";
import { BucketType } from "../../state/practice-session/select-practice-words";
import { match } from "ts-pattern";

export const WordPractice = () => {
  const {
    currentWord,
    markWordComplete,
    repracticeWord,
    progress,
    isRunning,
    isCompleted,
  } = usePracticeSession();
  if (!isRunning || isCompleted)
    throw new Error(
      "No active session running. This component should not be rendered"
    );

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
    if (!accuracy)
      throw new Error(
        "No accuracy data for the current word. This should not happen"
      );
    markWordComplete(accuracy);
  };
  const practiceAgain = () => {
    if (!accuracy)
      throw new Error(
        "No accuracy data for the current word. This should not happen"
      );
    repracticeWord(accuracy);
  };

  return (
    <div className="grow flex flex-col">
      <progress className="progress w-full mb-2" value={progress} max="1" />
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl mb-1 grow">
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
          <span className="badge badge-sm badge-primary mr-2">
            {bucketTypeToLabel(currentWord.bucketSource)}
          </span>
        </div>

        <p className="text-xs h-6 whitespace-nowrap overflow-hidden text-ellipsis">
          {currentWord.definitions.join(", ")}
        </p>
      </div>
      <div className="grow">
        <HanziWordWriter
          key={currentWord.uuid}
          word={currentWord.word}
          onComplete={handleComplete}
          onAccuracyChange={setAccuracy}
        />
      </div>

      <div className="flex justify-between mb-2 items-center text-sm gap-2">
        <span>
          Avg Accuracy: <AccuracyBadge accuracy={currentWord.avgAccuracy} />
        </span>
        <span>
          Accuracy: <AccuracyBadge accuracy={accuracy} />
        </span>
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
          <CheckCircleIcon className="size-4" /> Next Word
        </button>
      </div>
    </div>
  );
};

const bucketTypeToLabel = (type: BucketType) =>
  match(type)
    .with("leastPracticed", () => "Rusty Word")
    .with("newest", () => "New Word")
    .with("worstAccuracy", () => "Weak Word")
    .with("random", () => "Random")
    .exhaustive();

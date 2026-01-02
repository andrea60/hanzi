import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { HanziWordWriter } from "../hanzi-writer/HanziWordWriter";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { motion } from "motion/react";
import { match } from "ts-pattern";
import { useState } from "react";
import { SkillPracticeResult } from "../../state/practice-session/PracticeScheduler";

export const HanziWriter = () => {
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
  const [result, setResult] = useState<SkillPracticeResult>();

  const handleComplete = (failed: boolean, usedHints: boolean) => {
    setWordCompleted(true);
    if (failed) setResult("failure");
    else if (usedHints) setResult("partial-success");
    else setResult("success");
  };

  const moveToNext = () => {
    if (!result)
      throw new Error(
        "No result registered for current word. This should not happen"
      );
    markWordComplete(result);
  };
  const practiceAgain = () => {
    if (!result)
      throw new Error(
        "No result registered for current word. This should not happen"
      );
    repracticeWord(result);
  };

  return (
    <div className="grow flex flex-col">
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
          <CheckCircleIcon className="size-4" /> Next Word
        </button>
      </div>
    </div>
  );
};

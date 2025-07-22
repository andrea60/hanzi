import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useWordDefinition } from "../../state/database/queries/useWordDefinition";
import { WordPractice } from "./WordPractice";
import { useConfirm } from "../modal/useConfirm";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useResettableState } from "../../utils/useResettableState";

export const PracticeSession = () => {
  const { currentWord, discardSession, markWordComplete, repracticeWord } =
    usePracticeSession();
  const confirm = useConfirm();
  const [wordCompleted, setWordCompleted] = useResettableState(false, [
    currentWord,
  ]);

  const handleExitClick = async () => {
    if (
      await confirm({
        description: "Are you sure you want to quit?",
        severity: "warning",
        title: "Quitting?",
      })
    )
      discardSession();
  };
  const handleComplete = () => {
    setWordCompleted(true);
  };

  const moveToNext = () => {
    if (!currentWord) throw new Error("There is not current word in the quiz");
    markWordComplete({ word: currentWord.word, confidence: 1 });
  };
  const practiceAgain = () => {
    if (!currentWord) throw new Error("There is not current word in the quiz");
    repracticeWord({ word: currentWord.word, confidence: 1 });
  };

  if (!currentWord) return;

  return (
    <div className="card h-full w-full">
      <div className="card-body">
        <div>
          <h1 className="card-title flex justify-between border-b border-base-300 pb-2">
            Practice Session
            {
              <XMarkIcon
                role="button"
                className="size-6"
                onClick={handleExitClick}
              />
            }
          </h1>
          <h1 className="text-2xl">{currentWord.pinyin}</h1>
          <p className="text-xs h-8 whitespace-nowrap overflow-hidden text-ellipsis">
            {currentWord.definitions.join(", ")}
          </p>
        </div>
        <div className="grow">
          <WordPractice
            key={currentWord.word}
            wordData={currentWord}
            onComplete={handleComplete}
          />
        </div>

        <div className="flex gap-2 text-sm">
          <button
            className="btn btn-warning btn-dash flex-1"
            onClick={practiceAgain}
            disabled={!wordCompleted}
          >
            <ArrowPathIcon className="size-4" /> Tray Again
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
    </div>
  );
};

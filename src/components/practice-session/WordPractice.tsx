import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { HanziWordWriter } from "../hanzi-writer/HanziWordWriter";
import { useResettableState } from "../../utils/useResettableState";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export const WordPractice = () => {
  const { currentWord, markWordComplete, repracticeWord } =
    usePracticeSession();
  const [wordCompleted, setWordCompleted] = useResettableState(false, [
    currentWord,
  ]);
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
    <div className="grow flex flex-col">
      <div>
        <h1 className="text-2xl">{currentWord.pinyin}</h1>
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

import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useWordDefinition } from "../../state/database/queries/useWordDefinition";
import { WordPractice } from "./WordPractice";
import { useConfirm } from "../modal/useConfirm";

export const PracticeSession = () => {
  const { currentWord, discardSession } = usePracticeSession();
  const confirm = useConfirm();

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
          <p>{currentWord.definitions.join(", ")}</p>
        </div>
        <div className="grow">
          <WordPractice wordData={currentWord} />
        </div>

        <div className="flex gap-2">
          <button className="btn btn-dash btn-warning grow">Skip</button>
          <button className="btn btn-neutral grow" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

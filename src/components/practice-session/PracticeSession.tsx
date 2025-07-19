import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useWordDefinition } from "../../state/database/queries/useWordDefinition";
import { WordPractice } from "./WordPractice";
import { useConfirm } from "../modal/useConfirm";

export const PracticeSession = () => {
  const { currentWord, discardSession } = usePracticeSession();
  const { wordData } = useWordDefinition(currentWord!);
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

  const chars = currentWord.split("");

  return (
    <div className="card h-full w-full">
      <div className="card-body">
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
        <p>
          {wordData?.data?.pinyin.join("+")} - {chars.join(" + ")}
        </p>
        <WordPractice chars={chars} pinyin={wordData.data?.pinyin ?? []} />
      </div>
    </div>
  );
};

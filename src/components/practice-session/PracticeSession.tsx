import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useConfirm } from "../modal/useConfirm";
import { WordPractice } from "./WordPractice";
import { EndSessionReport } from "./EndSessionReport";

export const PracticeSession = () => {
  const { isCompleted, discardSession } = usePracticeSession();
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

  return (
    <div className="rounded-lg p-6 h-full w-full bg-base-200 flex flex-col">
      {!isCompleted && (
        <XMarkIcon
          role="button"
          className="size-4 mb-2"
          onClick={handleExitClick}
        />
      )}
      <div className="grow">
        {!isCompleted ? <WordPractice /> : <EndSessionReport />}
      </div>
    </div>
  );
};

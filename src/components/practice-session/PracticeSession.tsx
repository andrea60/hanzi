import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useConfirm } from "../modal/useConfirm";
import { WordPractice } from "./WordPractice";
import { EndSessionReport } from "./EndSessionReport";

export const PracticeSession = () => {
  const session = usePracticeSession();
  const confirm = useConfirm();

  const handleExitClick = async () => {
    if (!session.isRunning) return;
    const userConfirmation = await confirm({
      description: "Are you sure you want to quit?",
      severity: "warning",
      title: "Quitting?",
    });
    if (userConfirmation) session.discardSession();
  };

  return (
    <div className="rounded-lg p-6 h-full w-full bg-base-200 flex flex-col">
      {!session.isCompleted && (
        <XMarkIcon
          role="button"
          className="size-4 mb-2"
          onClick={handleExitClick}
        />
      )}
      {session.isCompleted ? <EndSessionReport /> : <WordPractice />}
    </div>
  );
};

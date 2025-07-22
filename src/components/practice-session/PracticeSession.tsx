import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useConfirm } from "../modal/useConfirm";
import { WordPractice } from "./WordPractice";

export const PracticeSession = () => {
  const { isCompleted, discardSession, progress } = usePracticeSession();
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
    <div className="card h-full w-full">
      <div className="card-body">
        <div>
          <h1 className="card-title flex justify-between pb-2">
            Practice Session
            {
              <XMarkIcon
                role="button"
                className="size-6"
                onClick={handleExitClick}
              />
            }
          </h1>
          <progress className="progress w-full" value={progress} max="1" />
        </div>
        {!isCompleted ? <WordPractice /> : null}{" "}
      </div>
    </div>
  );
};

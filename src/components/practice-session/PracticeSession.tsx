import { XMarkIcon } from "@heroicons/react/24/solid";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { useConfirm } from "../modal/useConfirm";
import { WordPractice } from "./WordPractice";
import { EndSessionReport } from "./EndSessionReport";
import { ErrorBoundary, ErrorHandlerComponent } from "../ErrorBoundary";

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
      <ErrorBoundary handler={ErrorHandler}>
        {!session.isCompleted && (
          <XMarkIcon
            role="button"
            className="size-4 mb-2"
            onClick={handleExitClick}
          />
        )}
        {session.isCompleted ? <EndSessionReport /> : <WordPractice />}
      </ErrorBoundary>
    </div>
  );
};

const ErrorHandler: ErrorHandlerComponent = ({ error }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-2xl font-bold mb-4">An error occurred</h2>
    <p className="text-red-500 mb-2">{error.message}</p>
    <p className="text-sm link" onClick={() => session.discardSession()}>
      You can click here to discard and close this session
    </p>
  </div>
);

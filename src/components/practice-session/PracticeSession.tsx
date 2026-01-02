import { XMarkIcon } from "@heroicons/react/24/solid";
import {
  forceDeleteSession,
  usePracticeSession,
} from "../../state/practice-session/usePracticeSession";
import { useConfirm } from "../modal/useConfirm";
import { HanziWriter } from "./HanziWriter";
import { EndSessionReport } from "./report/EndSessionReport";
import { ErrorBoundary, ErrorHandlerComponent } from "../ErrorBoundary";
import { match } from "ts-pattern";
import { HanziReader } from "./HanziReader";
import { HanziTyper } from "./HanziTyper";
import { PinyinTyper } from "./PinyinTyper";

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

  const Content = match(session.currentWord)
    .with(undefined, () => () => undefined)
    .with({ objective: "write" }, () => HanziWriter)
    .with({ objective: "read" }, () => HanziReader)
    .with({ objective: "type-hanzi" }, () => HanziTyper)
    .with({ objective: "type-pinyi" }, () => PinyinTyper)
    .exhaustive();

  return (
    <div className="rounded-lg p-6 h-full max-h-full w-full bg-base-200 flex flex-col overflow-y-hidden">
      <ErrorBoundary handler={ErrorHandler}>
        <div className="flex items-center gap-3">
          {!session.isCompleted && (
            <XMarkIcon
              role="button"
              className="size-6 mb-2"
              onClick={handleExitClick}
            />
          )}
          <progress
            className="progress w-full mb-2"
            value={session.progress ?? 1}
            max="1"
          />
        </div>
        {session.isCompleted ? (
          <EndSessionReport />
        ) : (
          <Content key={session.currentWord?.uuid} />
        )}
      </ErrorBoundary>
    </div>
  );
};

const ErrorHandler: ErrorHandlerComponent = ({ error }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-2xl font-bold mb-4">An error occurred</h2>
    <p className="text-red-500 mb-2">{error.message}</p>
    <p
      className="text-sm link"
      onClick={() => {
        forceDeleteSession();
        location.reload();
      }}
    >
      You can click here to discard and close this session
    </p>
  </div>
);

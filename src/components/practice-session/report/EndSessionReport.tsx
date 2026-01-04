import {
  ArchiveBoxIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { PropsWithChildren } from "react";
import { usePracticeSession } from "../../../state/practice-session/usePracticeSession";

export const EndSessionReport = () => {
  const { isCompleted, isRunning, closeSession, stats } = usePracticeSession();

  if (!isRunning || !isCompleted)
    throw new Error(
      "Unable to render an end session report if no session is active"
    );

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold text-center mb-2 pb-2 border-b border-base-300">
        Session Complete! 🎉
      </h1>

      <div className="grow overflow-y-auto">
        <p>Coming soon...</p>
      </div>

      <button className="btn btn-success w-full mt-3" onClick={closeSession}>
        <ArchiveBoxIcon className="size-4" /> Save and Exit
      </button>
    </div>
  );
};

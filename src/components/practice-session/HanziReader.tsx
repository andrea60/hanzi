import { useState } from "react";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { DefinitionsList } from "../DefinitionsList";

export const HanziReader = () => {
  const { isRunning, isCompleted, currentWord, markWordComplete } =
    usePracticeSession();
  const [isRevealed, setIsRevealed] = useState(false);
  if (!isRunning || isCompleted)
    throw new Error(
      "No active session running. This component should not be rendered"
    );

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="grow flex flex-col text-center justify-center">
        <label className="font-bold">Do you know what this means?</label>
        <div className="text-6xl my-4 word-box">{currentWord.word}</div>
        {isRevealed && (
          <div>
            <label className="font-bold mb-4">{currentWord.pinyin}</label>
            <DefinitionsList
              definitions={currentWord.definitions}
              className="text-center mt-4"
            />
          </div>
        )}
      </div>

      {isRevealed ? (
        <div className="flex gap-2 w-full">
          <button
            className="btn btn-neutral grow"
            onClick={() => markWordComplete("failure")}
          >
            <HandThumbDownIcon className="size-4" />
            Forgot
          </button>
          <button
            className="btn btn-success grow"
            onClick={() => markWordComplete("success")}
          >
            <HandThumbUpIcon className="size-4" />
            Nailed it
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary w-full"
          onClick={() => setIsRevealed(true)}
        >
          Show
        </button>
      )}
    </div>
  );
};

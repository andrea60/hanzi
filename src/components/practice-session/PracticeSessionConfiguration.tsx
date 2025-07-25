import { useState } from "react";
import { Slider } from "../ui/Slider";
import { useFavouritesCount } from "../../state/database/queries/useFavourites";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { usePageTitle } from "../../utils/PageTitleProvider";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

export const PracticeSessionConfiguration = () => {
  usePageTitle("Practice Session", []);
  const { data: favouritesCount } = useFavouritesCount();
  const { isRunning, startSession } = usePracticeSession();

  if (favouritesCount === undefined) return <p>Loading...</p>;
  if (isRunning) return <RunningSessionPlaceholder />;

  const handleOnStart = (numWords: number) => {
    if (isRunning) return;
    startSession(numWords);
  };
  return (
    <div className="flex flex-col h-full">
      {favouritesCount > 0 ? (
        <SessionConfigurator
          totalWordsCount={favouritesCount}
          onStart={handleOnStart}
        />
      ) : (
        <div className="flex-1 justify-self-center flex justify-center items-center flex-col">
          <p>
            <FaceFrownIcon className="size-14" />
          </p>
          <p>Your study list is empty</p>
          <p className="text-xs text-center">
            Find and add words to pracitce practice in the{" "}
            <Link className="text-info font-bold" to="/app/characters">
              Words Search
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

const numWordsAtom = atomWithStorage<number>("session-setup-numwords", 1);

type Props = {
  totalWordsCount: number;
  onStart: (numWords: number) => void;
};
const SessionConfigurator = ({ totalWordsCount, onStart }: Props) => {
  const [numWords, setNumWords] = useAtom(numWordsAtom);

  const addWordCount = (val: number) => {
    setNumWords((c) =>
      c + val < 1 || c + val >= totalWordsCount ? c : c + val
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div>
          <label className="text-xs mb-2">What do you want to practice?</label>
          <div className="tabs tabs-box bg-base-300 justify-center">
            <input
              type="radio"
              name="practiceMode"
              className="tab flex-1"
              aria-label="Practice Writing"
              defaultChecked
            />
            <input
              type="radio"
              name="practiceMode"
              className="tab flex-1"
              aria-label="Practice Reading"
              disabled
            />
          </div>
        </div>
        <div>
          <label className="text-xs">How many words?</label>
          <div className="mt-2 bg-base-100 flex items-center justify-between rounded-r-full rounded-l-full  shadow-[0_.1rem_.5rem_-.3rem_#0003]">
            <button
              className="btn btn-ghost btn-xl  rounded-l-full"
              onClick={() => addWordCount(-1)}
            >
              <MinusIcon className="size-6" />
            </button>
            <div>
              <span className="text-4xl font-bold mr-1">{numWords}</span>
              words
            </div>
            <button
              className="btn btn-ghost btn-xl rounded-r-full"
              onClick={() => addWordCount(1)}
            >
              <PlusIcon className="size-6" />
            </button>
          </div>
        </div>

        <button
          className="btn btn-neutral w-full mt-auto mb-2 self-end"
          onClick={() => onStart(numWords)}
        >
          <BookOpenIcon className="size-6" /> Start Practicing {numWords} Words
        </button>
      </div>
    </>
  );
};

export const RunningSessionPlaceholder = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="text-center">
        <BookOpenIcon className="size-12 inline" />
        <p>Practice session in progress...</p>
      </div>
    </div>
  );
};

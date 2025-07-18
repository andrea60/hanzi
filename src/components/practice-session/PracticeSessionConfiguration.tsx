import { useState } from "react";
import { Slider } from "../ui/Slider";
import { useFavouritesCount } from "../../state/database/queries/useFavourites";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { Overlay } from "../modal/Overlay";

export const PracticeSessionConfiguration = () => {
  const { data: favouritesCount } = useFavouritesCount();
  const { startSession, isRunning } = usePracticeSession();

  if (favouritesCount === undefined) return <p>Loading...</p>;
  if (isRunning) return <RunningSessionPlaceholder />;

  const handleOnStart = (numWords: number) => {
    startSession(numWords);
  };
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl mb-2 font-extrabold text-center">
        <BookOpenIcon className="size-6 inline" /> Start a practice session
      </h1>
      <hr className="mb-4" />
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
          <p className="text-xs">
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

type Props = {
  totalWordsCount: number;
  onStart: (numWords: number) => void;
};
const SessionConfigurator = ({ totalWordsCount, onStart }: Props) => {
  const [wordsPerc, setWordsPerc] = useState(50);

  const numWords = Math.round((wordsPerc / 100) * totalWordsCount);
  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div>
          <label className="text-xs">How many words?</label>
          <Slider
            max={100}
            min={25}
            step={25}
            value={wordsPerc}
            stepLabelRenderer={(p) => <span>{p.toFixed(0)}%</span>}
            onChange={setWordsPerc}
          />
        </div>

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

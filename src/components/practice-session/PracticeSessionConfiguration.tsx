import { useFavouritesCount } from "../../state/database/queries/useFavourites";
import {
  BookOpenIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { FaceFrownIcon } from "@heroicons/react/24/outline";
import {
  PracticeMode,
  usePracticeSession,
} from "../../state/practice-session/usePracticeSession";
import { usePageTitle } from "../../utils/PageTitleProvider";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { ErrorHandler } from "../ui/ErrorHandler";
import { PracticeTemplates } from "./practice-templates";
import {
  MultiProgression,
  MultiProgressionStage,
} from "../ui/MultiProgression";
import { BucketDef } from "../../state/practice-session/PracticeScheduler";
import { match } from "ts-pattern";
import { useState } from "react";

export const PracticeSessionConfiguration = () => {
  usePageTitle("Practice Session", []);
  const { data: favouritesCount, error } = useFavouritesCount();
  const { isRunning, startSession } = usePracticeSession();

  if (error) return <ErrorHandler error={error} />;
  if (favouritesCount === undefined) return <p>Loading...</p>;
  if (isRunning) return <RunningSessionPlaceholder />;

  const handleOnStart = (
    numWords: number,
    buckets: BucketDef[],
    mode: PracticeMode
  ) => {
    if (isRunning) return;
    startSession(numWords, buckets, mode);
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
const practiceTemplateAtom = atomWithStorage<string>(
  "session-setup-template",
  "default"
);
type Props = {
  totalWordsCount: number;
  onStart: (
    numWords: number,
    bucketDefs: BucketDef[],
    mode: PracticeMode
  ) => void;
};
const SessionConfigurator = ({ totalWordsCount, onStart }: Props) => {
  const [numWords, setNumWords] = useAtom(numWordsAtom);
  const [mode, setMode] = useState<PracticeMode>("memo");
  const [selectedTemplateName, setSelectedTemplateName] =
    useAtom(practiceTemplateAtom);
  const selectedTemplated = PracticeTemplates[selectedTemplateName];

  const addWordCount = (val: number) => {
    setNumWords((c) =>
      c + val < 1 || c + val > totalWordsCount ? c : c + val
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div>
          <label className="mb-2">What do you want to practice?</label>
          <div className="tabs tabs-box bg-base-300 justify-center">
            <input
              type="radio"
              name="practiceMode"
              className="tab flex-1"
              aria-label="Characters Memorization"
              value="memo"
              checked={mode === "memo"}
              onChange={(e) => setMode(e.currentTarget.value as PracticeMode)}
            />
            <input
              type="radio"
              name="practiceMode"
              className="tab flex-1"
              aria-label="Hand Writing"
              value="write"
              checked={mode === "write"}
              onChange={(e) => setMode(e.currentTarget.value as PracticeMode)}
            />
          </div>
        </div>
        <div>
          <label>How many words?</label>
          <div className="mt-2 bg-base-100 flex items-center justify-between rounded-r-full rounded-l-full  shadow-[0_.1rem_.5rem_-.3rem_#0003]">
            <button
              className="btn btn-ghost btn-xl  rounded-l-full"
              onClick={() => addWordCount(-1)}
            >
              <MinusIcon className="size-6" />
            </button>
            <div>
              <span className="text-2xl font-bold mr-1">{numWords}</span>
            </div>
            <button
              className="btn btn-ghost btn-xl rounded-r-full"
              onClick={() => addWordCount(1)}
            >
              <PlusIcon className="size-6" />
            </button>
          </div>
        </div>
        <div>
          <label>What do you want to focus on?</label>
          <select
            className="select block w-full my-2 select-lg"
            value={selectedTemplateName}
            onChange={(e) => setSelectedTemplateName(e.target.value)}
          >
            {Object.entries(PracticeTemplates).map(([key, template]) => (
              <option key={key} value={key}>
                {template.name}
              </option>
            ))}
          </select>
          <MultiProgression
            className="my-4"
            stages={selectedTemplated.buckets.map(bucketToStep)}
          />
          <p className="text-xs">
            <InformationCircleIcon className="size-4 mr-2 inline" />
            {selectedTemplated.description}
          </p>
        </div>

        <button
          className="btn btn-primary w-full mt-auto mb-2 self-end"
          onClick={() => onStart(numWords, selectedTemplated.buckets, mode)}
        >
          <BookOpenIcon className="size-6" /> Let's Start!
        </button>
      </div>
    </>
  );
};

const bucketToStep = (bucket: BucketDef): MultiProgressionStage => {
  return match(bucket.bucketType)
    .with("newest", () => ({
      value: bucket.weight,
      label: "Newest",
    }))
    .with("worstAccuracy", () => ({
      value: bucket.weight,
      label: "Worst",
    }))
    .with("leastPracticed", () => ({
      value: bucket.weight,
      label: "Uncommon",
    }))
    .with("random", () => ({
      value: bucket.weight,
      label: "Random",
    }))
    .with("lastPracticed", () => ({
      value: bucket.weight,
      label: "Rusty",
    }))
    .exhaustive();
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

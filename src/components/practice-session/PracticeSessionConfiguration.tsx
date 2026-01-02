import { useFavouritesCount } from "../../state/database/queries/useFavourites";
import {
  BookOpenIcon,
  DocumentTextIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { FaceFrownIcon } from "@heroicons/react/24/outline";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { usePageTitle } from "../../utils/PageTitleProvider";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { ErrorHandler } from "../ui/ErrorHandler";
import { MultiProgressionStage } from "../ui/MultiProgression";
import { match } from "ts-pattern";
import {
  ALL_SKILLS,
  Skill,
} from "../../state/practice-session/PracticeScheduler";
import { useState } from "react";
import { motion } from "motion/react";
import classNames from "classnames";
import { KeyboardIcon } from "@phosphor-icons/react";

export const PracticeSessionConfiguration = () => {
  usePageTitle("Practice Session", []);
  const { data: favouritesCount, error } = useFavouritesCount();
  const { isRunning, startSession } = usePracticeSession();

  if (error) return <ErrorHandler error={error} />;
  if (favouritesCount === undefined) return <p>Loading...</p>;
  if (isRunning) return <RunningSessionPlaceholder />;

  const handleOnStart = (numWords: number, skills: Skill[]) => {
    if (isRunning) return;
    startSession(numWords, skills);
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
const skillsAtom = atomWithStorage<Skill[]>(
  "session-target-skills",
  ALL_SKILLS
);

type Props = {
  totalWordsCount: number;
  onStart: (numWords: number, skills: Skill[]) => void;
};
const SessionConfigurator = ({ totalWordsCount, onStart }: Props) => {
  const [numWords, setNumWords] = useAtom(numWordsAtom);
  const [skills, setSkills] = useAtom(skillsAtom);

  const addWordCount = (val: number) => {
    setNumWords((c) =>
      c + val < 1 || c + val > totalWordsCount ? c : c + val
    );
  };

  const toggleSkill = (skill: Skill) => {
    setSkills((cur) => {
      const existing = cur.includes(skill);
      if (existing) return cur.filter((f) => f !== skill);
      return [...cur, skill];
    });
  };

  const valid = skills.length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 h-full">
        <div>
          <label>What do you want to practice?</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ALL_SKILLS.map((s) => (
              <SkillBox
                key={s}
                skill={s}
                selected={skills.includes(s)}
                onClick={() => toggleSkill(s)}
              />
            ))}
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

        <button
          className="btn btn-primary w-full mt-auto mb-2 self-end"
          disabled={!valid}
          onClick={() => onStart(numWords, ALL_SKILLS)}
        >
          <BookOpenIcon className="size-6" /> Let's Start!
        </button>
      </div>
    </>
  );
};

type SkillBoxProps = {
  skill: Skill;
  selected: boolean;
  onClick: () => void;
};
const SkillBox = ({ skill, onClick, selected }: SkillBoxProps) => {
  const { icon: Icon, label } = match(skill)
    .with("read", () => ({ label: "Read 汉字", icon: DocumentTextIcon }))
    .with("type-hanzi", () => ({ label: "Type 汉字", icon: KeyboardIcon }))
    .with("type-pinyi", () => ({
      label: "Type Pinyin",
      icon: KeyboardIcon,
    }))
    .with("write", () => ({ label: "Hand Write", icon: PencilIcon }))
    .exhaustive();
  return (
    <motion.div
      className={classNames("card card-default card-sm border", {
        "opacity-50 shadow-none!": !selected,
      })}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div className="card-body flex flex-row items-center justify-center">
        <Icon className="size-6" />
        <label>{label}</label>
      </div>
    </motion.div>
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

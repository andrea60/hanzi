import classNames from "classnames";
import { useAnimation, motion } from "motion/react";
import { useState } from "react";
import {
  useRunningPracticeSession,
  WordPracticeResult,
} from "../../../state/practice-session/usePracticeSession";
import { useTimedState } from "../../../utils/useTimedState";
import { SkillPracticeResult } from "../../../state/practice-session/PracticeScheduler";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { SuccessIcon } from "./SuccessIcon";
import { match } from "ts-pattern";
import { FailureIcon } from "./FailureIcon";
import {
  ArrowCircleRightIcon,
  CaretRight,
  CaretRightIcon,
} from "@phosphor-icons/react";
const MAX_ATTEMPTS = 5;

type Props = {
  label: string;
  placeholder: string;
  validateInput: (input: string) => boolean;
};
export const TypingExercise = ({
  label,
  validateInput,
  placeholder,
}: Props) => {
  const { currentWord, markWordComplete } = useRunningPracticeSession();

  const [value, setValue] = useState("");
  const [attempt, setAttempt] = useState(MAX_ATTEMPTS);
  const inputControls = useAnimation();
  const [inputError, setInputError] = useTimedState(1500);
  const [result, setResult] = useState<SkillPracticeResult>();

  const onFailure = () => {
    inputControls.start("shake");
    setInputError();
    setAttempt((x) => x - 1);
    if (attempt > 1) {
      setValue("");
    } else {
      // run out of possible attempts
      setResult("failure");
    }
  };

  const onCorrectAnswer = () => {
    const firstTry = attempt === MAX_ATTEMPTS;

    setResult(firstTry ? "success" : "partial-success");
  };

  const handleSubmit = () => {
    const cleanValue = value?.trim();
    if (!cleanValue || cleanValue.length < 1) return;

    if (validateInput(cleanValue)) onCorrectAnswer();
    else onFailure();
  };

  const handleSkip = () => {
    markWordComplete?.("skipped");
  };

  const hasValue = value && value.trim().length > 0;
  const completed = !!result;

  const ResultIcon = match(result)
    .with("success", "partial-success", () => SuccessIcon)
    .with("failure", () => FailureIcon)
    .otherwise(() => () => null);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold mb-2">
          Writing Practice
          {completed && <ResultIcon />}
        </h1>

        {/* <p className="text-xs">Type the translation of the word below</p> */}
      </div>
      <div className="grow flex flex-col justify-center w-full gap-8 text-center">
        <div className="p-2 w-full text-center">
          <label className="text-xs font-bold mb-2">Definition:</label>
          <p>{currentWord.definitions.join(" - ")}</p>
        </div>
        <fieldset className="fieldset w-full ">
          <legend className="fieldset-legend text-center">
            How does it translate in Chinese?
          </legend>
          <motion.input
            variants={variants}
            animate={inputControls}
            type="text"
            autoFocus
            className={classNames("input text-center w-full", {
              "input-error": inputError,
            })}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            disabled={completed}
          />
          <label className="text-center w-full">{label}</label>
        </fieldset>
      </div>
      <div className="text-right w-full">
        <span className="text-sm text-right badge badge-error">
          Attempts: {attempt}/{MAX_ATTEMPTS}
        </span>
      </div>
      <div className="flex gap-2 w-full">
        {completed ? (
          <>
            <button
              className="btn btn-primary grow"
              disabled={!hasValue}
              onClick={handleSubmit}
            >
              Next <CaretRightIcon size={18} />
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-warning" onClick={handleSkip}>
              Skip
            </button>
            <button
              className="btn btn-primary grow"
              disabled={!hasValue}
              onClick={handleSubmit}
            >
              Check
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const variants = {
  shake: () => ({
    rotate: [-1, 1.3, 0],
    transition: {
      delay: 0.1,
      repeat: 6,
      duration: 0.15,
    },
  }),
  reset: {
    rotate: 0,
  },
};

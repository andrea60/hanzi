import classNames from "classnames";
import { useAnimation, motion } from "motion/react";
import { useRef, useState } from "react";
import {
  useRunningPracticeSession,
  WordPracticeResult,
} from "../../../state/practice-session/usePracticeSession";
import { useTimedState } from "../../../utils/useTimedState";
import { SkillPracticeResult } from "../../../state/practice-session/PracticeScheduler";
import { SuccessIcon } from "./SuccessIcon";
import { match, P } from "ts-pattern";
import { FailureIcon } from "./FailureIcon";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { FlashCard } from "./FlashCard";
import { LivesBadge } from "./LivesBadge";
const MAX_ATTEMPTS = 5;

type Props = {
  label: string;
  helper: string;
  validateInput: (input: string) => boolean;
  solution: string;
};
export const TypingExercise = ({
  label,
  validateInput,
  helper,
  solution,
}: Props) => {
  const { currentWord, markWordComplete } = useRunningPracticeSession();

  const [value, setValue] = useState("");
  const [attempt, setAttempt] = useState(MAX_ATTEMPTS);
  const inputControls = useAnimation();
  const [inputError, setInputError] = useTimedState(1500);
  const [result, setResult] = useState<SkillPracticeResult>();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFailure = () => {
    inputControls.start("shake");
    setInputError();
    setAttempt((x) => Math.max(0, x - 1));
    if (attempt > 1) {
      // user has another life
      setValue("");
      inputRef.current?.focus();
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

  const next = () => {
    if (!result) return;
    markWordComplete(result);
  };

  const hasValue = value && value.trim().length > 0;
  const completed = !!result;

  const ResultIcon = match(result)
    .with("success", "partial-success", () => SuccessIcon)
    .with("failure", () => FailureIcon)
    .otherwise(() => () => null);

  const explanation = match(result)
    .with("failure", () => (
      <legend className="fieldset-legend text-left font-normal text-error">
        <XCircleIcon weight="fill" size={16} />
        The correct answer was:
      </legend>
    ))
    .with("success", "partial-success", () => (
      <legend className="fieldset-legend text-left font-normal text-success">
        <CheckCircleIcon weight="fill" size={16} />
        Well done!
      </legend>
    ))
    .otherwise(() => null);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="grow w-full flex items-center">
        <FlashCard
          attempt={attempt}
          maxAttempts={MAX_ATTEMPTS}
          onSkip={handleSkip}
          title={label}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">What's the word for:</h1>
            {completed && <ResultIcon />}
          </div>
          <p className="my-2 italic">{currentWord.definitions.join(" - ")}</p>
          <div className="h-[80px] flex flex-row gap-2 items-end">
            {completed ? (
              <>
                <fieldset className="fieldset grow">
                  {explanation}
                  <div className="h-[40px] rounded-sm bg-base-200 justify-center flex items-center text-xl border border-base-300">
                    {solution}
                  </div>
                </fieldset>
                <button className="btn btn-primary mb-1" onClick={next}>
                  Next
                </button>
              </>
            ) : (
              <>
                <fieldset className="fieldset grow">
                  <legend className="fieldset-legend text-left font-normal">
                    {helper}
                  </legend>
                  <motion.input
                    ref={inputRef}
                    variants={variants}
                    animate={inputControls}
                    type="text"
                    autoFocus
                    className={classNames("input text-center w-full", {
                      "input-error": inputError,
                    })}
                    placeholder={helper}
                    value={!completed ? value : solution}
                    onChange={(e) => setValue(e.currentTarget.value)}
                    disabled={completed}
                  />
                </fieldset>
                <button
                  className="btn btn-primary mb-1"
                  disabled={!hasValue}
                  onClick={handleSubmit}
                >
                  Check
                </button>
              </>
            )}
          </div>
        </FlashCard>
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

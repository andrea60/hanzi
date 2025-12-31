import { useState } from "react";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { motion, useAnimation } from "motion/react";
import { useTimedState } from "../../utils/useTimedState";
import classNames from "classnames";

const MAX_ATTEMPTS = 5;
export const HanziTyper = () => {
  const { isRunning, isCompleted, currentWord, markWordComplete } =
    usePracticeSession();
  const [value, setValue] = useState("");
  const [attempt, setAttempt] = useState(MAX_ATTEMPTS);
  const inputControls = useAnimation();
  const [inputError, setInputError] = useTimedState(1500);

  if (!isRunning || isCompleted)
    throw new Error(
      "No active session running. This component should not be rendered"
    );

  const onFailure = () => {
    inputControls.start("shake");
    setInputError();
    if (attempt > 1) {
      setAttempt((x) => x - 1);
      setValue("");
    } else {
      markWordComplete(0);
    }
  };

  const handleSubmit = () => {
    const cleanValue = value?.trim();
    if (!cleanValue || cleanValue.length < 1) return;
    if (cleanValue === currentWord.word) {
      const accuracy = attempt / MAX_ATTEMPTS;
      markWordComplete(accuracy);
    } else onFailure();
  };

  const handleSkip = () => {
    markWordComplete(0);
  };

  const hasValue = value && value.trim().length > 0;
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Written Translation</h1>
        <p className="text-xs">Type the translation of the sentence below</p>
      </div>
      <div className="grow flex flex-col justify-center w-full gap-8">
        <div className="p-2 w-full text-center">
          <span className="text-xl">"</span>
          {currentWord.definitions.join(";")}
          <span className="text-xl">"</span>
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
            className={classNames("input text-center", {
              "input-error": inputError,
            })}
            placeholder="Type chinese character here"
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
          <label className="text-center w-full">
            Use chinese characters only, e.g. 你好
          </label>
        </fieldset>
      </div>
      <p className="text-sm text-right w-full">
        Attempts: {attempt}/{MAX_ATTEMPTS}
      </p>
      <div className="flex gap-2 w-full">
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
      </div>
    </div>
  );
};

const variants = {
  shake: () => ({
    rotate: [-1, 1.3, 0],
    transition: {
      delay: 0.1,
      repeat: 7,
      duration: 0.15,
    },
  }),
  reset: {
    rotate: 0,
  },
};

import { useRunningPracticeSession } from "../../state/practice-session/usePracticeSession";
import { TypingExercise } from "./components/TypingExercise";

export const HanziTyper = () => {
  const { currentWord } = useRunningPracticeSession();

  const validateInput = (input: string) => {
    return input === currentWord.word;
  };

  return (
    <TypingExercise
      label="Use chinese characters only, e.g. 你好"
      placeholder="Type using 汉字 here"
      validateInput={validateInput}
    />
  );
};

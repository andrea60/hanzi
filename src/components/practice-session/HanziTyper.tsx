import { useRunningPracticeSession } from "../../state/practice-session/usePracticeSession";
import { TypingExercise } from "./components/TypingExercise";

export const HanziTyper = () => {
  const { currentWord } = useRunningPracticeSession();

  const validateInput = (input: string) => {
    return input === currentWord.word;
  };

  return (
    <TypingExercise
      label="汉字 Typing Practice"
      solution={currentWord.word}
      helper="Type 汉字"
      validateInput={validateInput}
    />
  );
};

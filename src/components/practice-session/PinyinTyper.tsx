import { useRunningPracticeSession } from "../../state/practice-session/usePracticeSession";
import { TypingExercise } from "./components/TypingExercise";

export const PinyinTyper = () => {
  const { currentWord } = useRunningPracticeSession();

  const validateInput = (input: string) => {
    const expectedInput = currentWord.pinyin.replace(/\s/g, "").toLowerCase();
    const sanitizedInput = input.replace(/\s/g, "").toLowerCase();

    return expectedInput === sanitizedInput;
  };

  return (
    <TypingExercise
      label="Pinyin Typing Practice"
      solution={currentWord.pinyin}
      helper="Type pinyin"
      validateInput={validateInput}
    />
  );
};

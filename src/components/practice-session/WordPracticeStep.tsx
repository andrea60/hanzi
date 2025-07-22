import { WordPracticeStepData } from "../../state/practice-session/usePracticeSession";
import { HanziCharacterWriter } from "../hanzi-writer/HanziCharacterWriter";

type Props = {
  step: WordPracticeStepData;
  size: number;
  onComplete: (usedHint: boolean, totalMistakes: number) => void;
};
export const WordPracticeStep = ({ onComplete, size, step }: Props) => {
  return (
    <>
      <HanziCharacterWriter
        char={step.char}
        onComplete={onComplete}
        size={size}
      />
    </>
  );
};

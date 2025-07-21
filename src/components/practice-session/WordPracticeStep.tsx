import { WordPracticeStepData } from "../../state/practice-session/usePracticeSession";
import { HanziCharacterWriter } from "../hanzi-writer/HanziCharacterWriter";

type Props = {
  step: WordPracticeStepData;
};
export const WordPracticeStep = ({ step }: Props) => {
  return (
    <>
      <HanziCharacterWriter char={step.char} size={250} />
    </>
  );
};

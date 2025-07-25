import { HanziWriterReport } from "./HanziCharacterWriter";

export const getAccuracy = (report: HanziWriterReport): number => {
  return accuracyFn({
    ...report,
    hintsPenalty: 1,
    mistakesPenalty: 0.5,
  });
};

const accuracyFn = (inputs: {
  strokes: number;
  mistakes: number;
  mistakesPenalty: number;
  hints: number;
  hintsPenalty: number;
}) => {
  return Math.max(
    0,
    1 -
      (inputs.mistakes * inputs.mistakesPenalty +
        inputs.hints * inputs.hintsPenalty) /
        inputs.strokes
  );
};

import { useMemo } from "react";

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  stepLabelRenderer: (step: number) => React.ReactElement;
  onChange: (value: number) => void;
};
export const Slider = ({
  max,
  min,
  onChange,
  step,
  value,
  stepLabelRenderer,
}: Props) => {
  const steps = useMemo(() => {
    const stepsArr = new Array(Math.round((max - min) / step) + 1);
    stepsArr.fill(null);
    return stepsArr;
  }, [max, min]);
  return (
    <div className="w-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range w-full range-sm"
        step={step}
      />
      <div className="flex justify-between px-2.5 mt-2 text-xs">
        {steps.map((_, index) => (
          <span key={index}>|</span>
        ))}
      </div>
      <div className="flex justify-between px-2.5 mt-2 text-xs">
        {steps.map((_, index) => (
          <span key={index}>{stepLabelRenderer(min + step * index)}</span>
        ))}
      </div>
    </div>
  );
};

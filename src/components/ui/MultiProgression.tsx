import classNames from "classnames";

export type MultiProgressionStage = {
  value: number;
  label: string;
};
type Props = {
  stages: MultiProgressionStage[];
  className?: string;
};
export const MultiProgression = ({ stages, className }: Props) => {
  return (
    <div
      className={classNames(
        "h-6 w-full bg-base-300 rounded-full flex",
        className
      )}
    >
      {stages.map((stage, index) => (
        <div
          key={index}
          className={classNames(
            "h-full text-xs flex items-center justify-center border-base-300  ",
            `bg-primary/${100 - index * 25}`,
            "text-primary-content",
            {
              "rounded-l-full": index === 0,
              "rounded-r-full": index === stages.length - 1,
              "border-r-3": index < stages.length - 1,
            }
          )}
          style={{
            width: `${stage.value * 100}%`,
          }}
        >
          {stage.label}
        </div>
      ))}
    </div>
  );
};

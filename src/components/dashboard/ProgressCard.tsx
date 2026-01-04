import classNames from "classnames";
import { useWeeklyTarget } from "../../state/user-preference/useWeeklyTarget";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Props = {
  className?: string;
};
export const ProgressCard = ({ className }: Props) => {
  const { isPending, data } = useWeeklyTarget();

  return (
    <div
      className={classNames("card card-default rounded-full mx-6", className)}
    >
      <div className="card-body p-4">
        <CircularProgressbarWithChildren
          value={data?.progress ?? 0}
          minValue={0}
          maxValue={1}
          strokeWidth={6}
          circleRatio={1}
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold relative">
              {formatInt(data?.practiceTimeMinutes)}/
              {formatInt(data?.weeklyTargetMinutes)}
              <span className="absolute left-[105%] font-normal bottom-0 text-sm">
                Min
              </span>
            </h1>
            <h2 className="text-xs">Weekly Practice Target</h2>
          </div>
        </CircularProgressbarWithChildren>
      </div>
    </div>
  );
};

const formatInt = (
  num: number | undefined,
  ifUndefined: string = "-"
): string => {
  if (num === undefined) return ifUndefined;
  return num.toFixed(0);
};

import classNames from "classnames";
import { useWeeklyTarget } from "../../state/user-preference/useWeeklyTarget";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { match } from "ts-pattern";
import { CheckCircleIcon } from "@phosphor-icons/react";

type Props = {
  className?: string;
};

export const PracticeLeftCard = ({ className }: Props) => {
  const { data, isSuccess } = useWeeklyTarget();

  const value = isSuccess
    ? Math.max(0, data.weeklyTargetMinutes - data.practiceTimeMinutes)
    : undefined;

  const content = match(value)
    .with(undefined, () => (
      <div className="h-10 flex items-center">
        <div className="skeleton w-20 h-4" />
      </div>
    ))
    .with(0, () => (
      <div className="flex items-center justify-between text-2xl">
        None
        <CheckCircleIcon
          className="text-success inline mr-2 float-right"
          weight="fill"
          size={42}
        />
      </div>
    ))
    .otherwise((v) => (
      <div>
        <AnimatedNumber value={v} className="text-4xl font-bold mr-2" />
        minutes
      </div>
    ));

  return (
    <div className={classNames(className, "card card-default card-sm")}>
      <div className="card-body flex">
        <h1>Time left</h1>
        {content}
      </div>
    </div>
  );
};

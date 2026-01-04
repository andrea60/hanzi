import classNames from "classnames";
import { useWeeklyTarget } from "../../state/user-preference/useWeeklyTarget";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { match, P } from "ts-pattern";
import { CheckCircleIcon } from "@phosphor-icons/react";

type Props = {
  className?: string;
};
export const AdaptiveDailyTargetCard = ({ className }: Props) => {
  const { data, isSuccess } = useWeeklyTarget();
  const remainingDays = getDaysUntilEOW();

  const dailyTarget = isSuccess
    ? (data.weeklyTargetMinutes - data.practiceTimeMinutes) / remainingDays
    : undefined;

  const content = match(dailyTarget)
    .with(undefined, () => (
      <div className="h-10 flex items-center">
        <div className="skeleton w-20 h-4" />
      </div>
    ))
    .with(P.number.lte(0), () => (
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
        <h1>Daily target</h1>
        {content}
      </div>
    </div>
  );
};

const getDaysUntilEOW = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Convert to Monday-based week: Monday = 1, Tuesday = 2, ..., Sunday = 0
  const mondayBasedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  // Days remaining until end of week (Sunday), including today
  return 8 - mondayBasedDay;
};

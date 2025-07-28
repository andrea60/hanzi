import { CheckBadgeIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import { useSessionsHistory } from "../../state/database/queries/useSessionsHistory";
import { Card } from "../ui/Card";
type Props = {
  height: number;
};

export const AccuracyChart = (props: Props) => {
  return (
    <Card>
      <CardContent {...props} />
    </Card>
  );
};

const CardContent = ({ height }: Props) => {
  const sessions = useSessionsHistory(25);
  if (!sessions.data) return <p>Loading...</p>;

  if (sessions.data.length < 5)
    return (
      <div className="text-center py-8 text-base-content/60">
        <p className="w-full uppercase font-bold ">Not enough data yet</p>
        <p className="text-xs">
          You need at least 5 sessions to see this analysis
        </p>
      </div>
    );

  return (
    <div className="card-body flex flex-col">
      <h1>Accuracy Trend</h1>
      <div className="flex flex-row justify-around gap-4 items-end overflow-x-hidden grow mb-4">
        {sessions.data.map((s) => (
          <div
            key={s.id}
            className="w-3 rounded-t-full rounded-b-full bg-base-content"
            style={{ height: getHeight(s.avgAccuracy, height) }}
          />
        ))}
      </div>
      <p>Your accuracy trend in your last 25 sessions</p>
    </div>
  );
};

const getHeight = (value: number, maxHeight: number) => {
  return value * maxHeight;
};

import { AccuracyChart } from "./AccuracyChart";

export const DashboardPage = () => {
  return (
    <div>
      <div className="card card-sm card-default">
        <div className="card-body">
          <h1>Accuracy Trend</h1>
          <AccuracyChart height={100} />
        </div>
      </div>
    </div>
  );
};

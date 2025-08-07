import classNames from "classnames";
import { match, P } from "ts-pattern";
type Props = { accuracy: number | undefined; className?: string };
export const AccuracyBadge = ({ accuracy, className }: Props) => {
  const badgeClass = match(accuracy)
    .with(undefined, () => "badge-neutral")
    .with(P.number.lt(0.5), () => "badge-error")
    .with(P.number.gte(0.5).and(P.number.lt(0.8)), () => "badge-warning")
    .otherwise(() => "badge-success");

  const content =
    accuracy === undefined ? "-" : Math.round(accuracy * 100) + "%";
  return (
    <span
      className={classNames(
        `badge badge-sm font-bold ${badgeClass}`,
        className
      )}
    >
      {content}
    </span>
  );
};

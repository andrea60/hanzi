import { HeartIcon, HeartBreakIcon } from "@phosphor-icons/react";
import { match, P } from "ts-pattern";

type LivesBadgeProps = {
  livesLeft: number;
  maxLives: number;
};
export const LivesBadge = ({ livesLeft, maxLives }: LivesBadgeProps) => {
  const ratio = livesLeft / maxLives;
  const icon = match(ratio)
    .with(P.number.gt(0.666), () => (
      <HeartIcon className="inline" weight="fill" />
    ))
    .with(P.number.gt(0.333), () => (
      <HeartBreakIcon className="inline text-warning" weight="fill" />
    ))
    .otherwise(() => (
      <HeartBreakIcon className="inline text-error" weight="fill" />
    ));

  return (
    <span className="flex items-center gap-1">
      Attempt: {livesLeft}/{maxLives} {icon}
    </span>
  );
};

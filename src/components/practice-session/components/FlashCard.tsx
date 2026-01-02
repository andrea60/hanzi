import { HeartIcon, HeartBreakIcon } from "@phosphor-icons/react";
import React from "react";
import { match, P } from "ts-pattern";
import { LivesBadge } from "./LivesBadge";
import { motion } from "motion/react";

type Props = {
  maxAttempts?: number;
  attempt?: number;
  title: string;
  onSkip: () => void;
  children: React.ReactNode;
};
export const FlashCard = ({
  children,
  title,
  maxAttempts,
  attempt,
  onSkip,
}: Props) => {
  const hasAttempts = attempt && maxAttempts;
  return (
    <motion.div className="w-full">
      <div className="rounded-2xl bg-base-300 p-1.5 w-full">
        <p className="text-sm p-2 opacity-75 flex justify-between">
          <span className="font-bold uppercase">{title}</span>
          {hasAttempts && (
            <LivesBadge livesLeft={attempt} maxLives={maxAttempts} />
          )}
        </p>
        <div className="card card-default rounded-2xl text-base-content">
          <div className="card-body py-4">{children}</div>
        </div>
      </div>
      <div className="text-sm p-2 opacity-75 text-right">
        <button className="link" onClick={onSkip}>
          Skip this card
        </button>
      </div>
    </motion.div>
  );
};

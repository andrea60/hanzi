import { CheckCircleIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";

export const SuccessIcon = () => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.4 },
      }}
      className="inline-block"
    >
      <CheckCircleIcon className="ml-1 size-6 inline text-success" />
    </motion.span>
  );
};

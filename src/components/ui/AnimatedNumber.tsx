import { useEffect, useState } from "react";
import { animate, circOut } from "framer-motion";
type Props = { value: number; unit?: string; className?: string };
export const AnimatedNumber = ({ value, unit, ...props }: Props) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: circOut,
      onUpdate(latest) {
        setDisplay(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span {...props}>
      {display}
      {unit}
    </span>
  );
};

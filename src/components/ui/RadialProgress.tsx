import { useEffect, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { animate, circOut } from "motion/react";

type Props = {
  progress: number;
  animationDuration?: number;
  size: number;
};
export const RadialProgress = ({
  progress,
  animationDuration = 2,
  size,
}: Props) => {
  const thickness = size / 8;

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, progress, {
      duration: animationDuration,
      ease: circOut,
      onUpdate(latest) {
        setDisplay(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [progress]);

  return (
    <div
      className="radial-progress"
      style={
        {
          "--value": display,
          "--size": `${size.toFixed(2)}rem`,
          "--thickness": `${thickness.toFixed(2)}rem`,
        } as React.CSSProperties
      }
      aria-valuenow={progress}
      role="progressbar"
    >
      <AnimatedNumber value={progress} unit="%" />
    </div>
  );
};

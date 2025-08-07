import { PropsWithChildren } from "react";
import cn from "classnames";

type Props = {
  onBackdropClick?: () => void;
  zIndex?: number;
};
export const Overlay = ({
  onBackdropClick,
  zIndex,
  children,
}: PropsWithChildren<Props>) => {
  const baseZ = zIndex ?? 10;

  return (
    <div
      className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"
      style={{ zIndex: baseZ }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full glass-bg fade-in fade-in"
        onClick={onBackdropClick}
      />
      <div
        style={{ zIndex: baseZ + 1 }}
        className={cn(
          "relative p-2 grow flex justify-center items-center w-full max-h-full"
        )}
      >
        {children}
      </div>
    </div>
  );
};

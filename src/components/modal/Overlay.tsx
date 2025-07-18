import { PropsWithChildren } from "react";
import cn from "classnames";

type Props = {
  onBackdropClick?: () => void;
};
export const Overlay = ({
  onBackdropClick,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-center">
      <div
        className="absolute top-0 left-0 w-full h-full glass-bg fade-in fade-in"
        onClick={onBackdropClick}
      />
      <div
        className={cn(
          "relative z-11 p-2 grow flex justify-center items-center w-full"
        )}
      >
        {children}
      </div>
    </div>
  );
};

import { PropsWithChildren } from "react";
import cn from "classnames";

type Props = {
  onBackdropClick?: () => void;
  fullWidth: boolean;
};
export const Overlay = ({
  onBackdropClick,
  fullWidth,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center">
      <div
        className="absolute top-0 left-0 w-full h-full glass-bg fade-in fade-in"
        onClick={onBackdropClick}
      />
      <div className={cn("relative z-11", { "w-full": fullWidth })}>
        {children}
      </div>
    </div>
  );
};

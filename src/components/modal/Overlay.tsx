import { PropsWithChildren } from "react";

type Props = {
  onBackdropClick?: () => void;
};
export const Overlay = ({
  onBackdropClick,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center">
      <div
        className="absolute top-0 left-0 w-full h-full glass-bg fade-in fade-in"
        onClick={onBackdropClick}
      />
      <div className="relative z-11">{children}</div>
    </div>
  );
};

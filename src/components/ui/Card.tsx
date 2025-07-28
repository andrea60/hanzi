import { PropsWithChildren } from "react";
import { ErrorBoundary, ErrorHandlerComponentProps } from "../ErrorBoundary";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Props = {
  className?: string;
};
export const Card = ({ children, ...props }: PropsWithChildren<Props>) => {
  return (
    <div className="card card-sm card-default" {...props}>
      <ErrorBoundary handler={ErrorHandler}>{children}</ErrorBoundary>
    </div>
  );
};

const ErrorHandler = (_: ErrorHandlerComponentProps) => {
  return (
    <div className="flex items-center justify-center flex-col grow">
      <ExclamationTriangleIcon className="size-12 block" />
      <p className="text-xs">Error occured</p>
    </div>
  );
};

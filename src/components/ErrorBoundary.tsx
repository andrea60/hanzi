import React, { PropsWithChildren } from "react";

type State =
  | {
      hasError: true;
      error: Error;
    }
  | {
      hasError: false;
    };

export type ErrorHandlerComponentProps = {
  error: Error;
};
export type ErrorHandlerComponent =
  React.ComponentType<ErrorHandlerComponentProps>;
type Props = {
  handler: ErrorHandlerComponent;
};

export class ErrorBoundary extends React.Component<
  PropsWithChildren<Props>,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const { handler: ErrorHandler } = this.props;
      return <ErrorHandler error={this.state.error} />;
    }

    return this.props.children;
  }
}

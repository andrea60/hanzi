import { Overlay } from "./Overlay";
import { PropsWithChildren } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { create } from "zustand";
import classNames from "classnames";
type ModalCloseReason = "cancel" | "complete";
type OpenModalState<TResult = any, TProps = any> = {
  isOpen: true;
  force?: boolean;
  component: ModalContentComponent<TResult, TProps>;
  componentProps: TProps;
  close: (result: ModalResult<TResult>) => void;
} & (OpenDialogModalState | OpenOverlayModalState);

type OpenOverlayModalState = {
  mode: "overlay";
  title?: never;
};
type OpenDialogModalState = {
  mode: "dialog";
  title: string;
  fullWidth?: boolean;
};

type CloseModalState = {
  isOpen: false;
};

type ModalState = OpenModalState | CloseModalState;
type InternalModalState = {
  updateState: (state: ModalState) => void;
} & ModalState;

type ModalResult<TResult> = {
  result: TResult;
  reason: ModalCloseReason;
};

export type ModalContentProps<TResult, TProps> = TProps & {
  close: (result: TResult) => void;
  cancel: () => void;
};
type ModalContentComponent<
  TResult = unknown,
  TProps = unknown,
> = React.ComponentType<ModalContentProps<TResult, TProps>>;

const useModalState = create<InternalModalState>((set) => ({
  isOpen: false,
  updateState: (state: ModalState) => set(state),
}));

export const useModal = () => {
  const { updateState, ...modal } = useModalState();

  const openModal = async <TResult = void, TProps = unknown>(
    opts: {
      component: ModalContentComponent<TResult, TProps>;
      componentProps: Omit<TProps, "close" | "cancel">;
      force?: boolean;
    } & (OpenDialogModalState | OpenOverlayModalState)
  ): Promise<ModalResult<TResult>> => {
    let completeModal: (result: ModalResult<TResult>) => void = () => {};

    const waitingPromise = new Promise<ModalResult<TResult>>(
      (resolve) => (completeModal = resolve)
    );

    updateState({
      isOpen: true,
      close: completeModal,
      ...opts,
    });

    try {
      const result = await waitingPromise;
      return result;
    } finally {
      updateState({ isOpen: false });
    }
  };

  const closeModal = () => {
    updateState({ isOpen: false });
  };

  return { openModal, closeModal, isModalActive: modal.isOpen };
};

export const ModalRenderer = () => {
  const modal = useModalState();

  const cancel = () => {
    if (!modal.isOpen) return;
    modal.close({ result: undefined, reason: "cancel" });
  };

  const close = (result: any) => {
    if (!modal.isOpen) return;
    modal.close({ result, reason: "complete" });
  };

  if (!modal.isOpen) return null;

  const Content = modal.component;

  const overlayContent = (
    <Content {...modal.componentProps} cancel={cancel} close={close} />
  );

  const handleBackdropClick = () => {
    if (modal.force) return;
    cancel();
  };

  return (
    <Overlay onBackdropClick={handleBackdropClick} zIndex={20}>
      {modal.mode == "overlay" ? (
        overlayContent
      ) : (
        <DialogModalWrapper
          title={modal.title}
          fullWidth={modal.mode == "dialog" && (modal.fullWidth ?? false)}
          onCancel={modal.force ? undefined : cancel}
        >
          {overlayContent}
        </DialogModalWrapper>
      )}
    </Overlay>
  );
};

const DialogModalWrapper = (
  props: PropsWithChildren<{
    title: string;
    onCancel?: () => void;
    fullWidth: boolean;
  }>
) => {
  return (
    <motion.div
      initial={{ y: 25 }}
      animate={{ y: 0 }}
      className={classNames("card card-sm shadow-xl mx-2", {
        "w-full": props.fullWidth,
      })}
    >
      <div className="card-body">
        <h1 className="card-title flex justify-between">
          {props.title}
          {!!props.onCancel && (
            <XMarkIcon
              role="button"
              onClick={props.onCancel}
              className="size-4"
            />
          )}
        </h1>
        {props.children}
      </div>
    </motion.div>
  );
};

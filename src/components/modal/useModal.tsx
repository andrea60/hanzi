import { atom, useAtom } from "jotai";
import { Overlay } from "./Overlay";
import { PropsWithChildren } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

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
};

type CloseModalState = {
  isOpen: false;
};

type ModalState = OpenModalState | CloseModalState;

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

const modalAtom = atom<ModalState>({ isOpen: false });

export const useModal = () => {
  const [modal, setModal] = useAtom(modalAtom);

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

    setModal({
      isOpen: true,
      close: completeModal,
      ...opts,
    });

    try {
      const result = await waitingPromise;
      return result;
    } finally {
      setModal({ isOpen: false });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false });
  };

  return { openModal, closeModal, isModalActive: modal.isOpen };
};

export const ModalRenderer = () => {
  const [modal] = useAtom(modalAtom);

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
    <Overlay onBackdropClick={handleBackdropClick}>
      {modal.mode == "overlay" ? (
        overlayContent
      ) : (
        <DialogModalWrapper
          title={modal.title}
          onCancel={modal.force ? undefined : cancel}
        >
          {overlayContent}
        </DialogModalWrapper>
      )}
    </Overlay>
  );
};

const DialogModalWrapper = (
  props: PropsWithChildren<{ title: string; onCancel?: () => void }>
) => {
  return (
    <motion.div
      initial={{ y: 25 }}
      animate={{ y: 0 }}
      className="card card-sm shadow-xl mx-2"
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

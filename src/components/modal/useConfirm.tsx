import { ModalContentProps, useModal } from "./useModal";
import { match } from "ts-pattern";
import cn from "classnames";
type ConfirmOptions = {
  title: string;
  description: string;
  severity: "warning" | "default" | "critical";
};

export const useConfirm = () => {
  const { openModal } = useModal();

  const confirm = async (opts: ConfirmOptions) => {
    const result = await openModal({
      component: ConfirmContent,
      componentProps: opts,
      mode: "dialog",
      title: opts.title,
    });

    return result.reason === "complete";
  };

  return confirm;
};

const ConfirmContent = ({
  description,
  severity,
  cancel,
  close,
}: ModalContentProps<{}, ConfirmOptions>) => {
  const btnClass = match(severity)
    .with("default", () => "btn-neutral")
    .with("warning", () => "btn-warning")
    .with("critical", () => "btn-error")
    .exhaustive();
  return (
    <>
      <p>{description}</p>
      <div className="flex [&>*]:flex-grow gap-2">
        <button className="btn" onClick={cancel}>
          Cancel
        </button>
        <button className={cn("btn", btnClass)} onClick={close}>
          Confirm
        </button>
      </div>
    </>
  );
};

import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useModal } from "../../../components/modal/useModal";
import { useEffect } from "react";
import { useWordDefinition } from "../../../data/queries/useWordDefinition";
import { FavouriteToggle } from "../../../components/characters/FavouriteToggle";
import { HanziWordViewer } from "../../../components/hanzi-writer/HanziWordViewer";

export const Route = createFileRoute("/app/characters/$char")({
  component: RouteComponent,
});

function RouteComponent() {
  const { char } = useParams({ from: "/app/characters/$char" });
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    openModal({
      component: Modal,
      componentProps: { wordChar: char },
      mode: "dialog",
      fullWidth: true,
      title: "Word Details",
    }).then(() => {
      navigate({ to: "/app/characters" });
    });

    return () => {
      // Close the modal
      closeModal();
    };
  }, [char]);
  return null;
}

type Props = {
  wordChar: string;
};
const Modal = ({ wordChar }: Props) => {
  const { wordData, changeFavourite } = useWordDefinition(wordChar);
  if (!wordData.isSuccess) return <div className="">Loading...</div>;

  const { word, definitions, pinyin, isFavourite } = wordData.data;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 justify-between">
        <h5 className="text-2xl">
          {word} {pinyin}
        </h5>
        <FavouriteToggle isFavourite={isFavourite} onChange={changeFavourite} />
      </div>
      <hr className=" border-b border-base-300" />
      <div>
        <div className="text-xs">
          <h5 className="font-bold mb-2">DEFINITIONS</h5>
          <ul className="list-disc ml-6">
            {definitions.map((def, index) => (
              <li key={index}>{def}</li>
            ))}
          </ul>
        </div>
      </div>
      <hr className="border-b border-base-300" />
      <h5 className="font-bold">WRITING</h5>

      <HanziWordViewer word={word} size={125} />
    </div>
  );
};

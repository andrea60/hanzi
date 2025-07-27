import { createFileRoute } from "@tanstack/react-router";
import { CharactersPage } from "../../components/characters/CharactersPage";

export const Route = createFileRoute("/app/characters")({
  component: CharactersPage,
});

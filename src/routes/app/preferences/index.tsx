import { createFileRoute } from "@tanstack/react-router";
import { UserPreferencesPage } from "../../../components/user-preferences/UserPreferencesPage";

export const Route = createFileRoute("/app/preferences/")({
  component: UserPreferencesPage,
});

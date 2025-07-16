import { createFileRoute } from "@tanstack/react-router";
import { PracticeSessionConfiguration } from "../../components/practice-session/PracticeSessionConfiguration";
import { auth } from "../../firebase/firebase.config";

export const Route = createFileRoute("/app/practice-setup")({
  beforeLoad: async () => {
    await auth.authStateReady();
  },
  component: PracticeSessionConfiguration,
});

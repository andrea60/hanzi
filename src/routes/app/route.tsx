import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavigationBar } from "../../components/NavigationBar";
import {
  ListBulletIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { auth } from "../../firebase/firebase.config";
import { HanziDataSetProvider } from "../../state/database/HanziDataSetProvider";
import { useAuth } from "../../auth/useAuth";
import { usePracticeSession } from "../../state/practice-session/usePracticeSession";
import { Overlay } from "../../components/modal/Overlay";
import { PracticeSession } from "../../components/practice-session/PracticeSession";
import { useCurrentPageTitle } from "../../utils/PageTitleProvider";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  beforeLoad: async () => {
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw redirect({
        to: "..",
      });
    }
  },
});

function RouteComponent() {
  const { user } = useAuth();
  const session = usePracticeSession();
  const title = useCurrentPageTitle();
  if (!user)
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  return (
    <HanziDataSetProvider>
      <div className="flex flex-col h-full relative bg-neutral ">
        <div className="py-3 px-6 text-neutral-content">
          <h1 className="font-extrabold text-2xl flex items-center">
            <img src="/icon.svg" className="size-12 inline mr-2" />
            <span className="mashanzheng">练汉字</span>{" "}
            {title ? " - " + title : null}
          </h1>
        </div>
        <div className="bg-base-200 flex-1 overflow-y-auto p-6 pt-4 pb-22 rounded-t-3xl shadow-md">
          <Outlet />
          {session.isRunning && (
            <Overlay>
              <PracticeSession />
            </Overlay>
          )}
        </div>
        <div className="bg-base-100 fixed bottom-0 w-full shadow-lg rounded-t-3xl pt-2">
          <NavigationBar
            links={[
              { to: "/app/dashboard", icon: ListBulletIcon, label: "Recipes" },
              { to: "/app/practice-setup", icon: PlusIcon, label: "Practice" },
              {
                to: "/app/characters",
                icon: MagnifyingGlassIcon,
                label: "Search",
              },
            ]}
          />
        </div>
      </div>
    </HanziDataSetProvider>
  );
}

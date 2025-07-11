import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavigationBar } from "../../components/NavigationBar";
import {
  Cog6ToothIcon,
  ListBulletIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { auth } from "../../firebase/firebase.config";
import { HanziDataSetProvider } from "../../data/hanzi-dataset/HanziDataSetProvider";

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
  return (
    <HanziDataSetProvider>
      <div className="flex flex-col h-full relative bg-secondary">
        <div className="p-4 px-6">
          <h1 className="font-extrabold text-2xl">Hanzi Writer</h1>
        </div>
        <div className="bg-base-200 flex-1 overflow-y-auto p-6 pt-4 pb-22 rounded-t-3xl shadow-md">
          <Outlet />
        </div>
        <div className="bg-base-100 fixed bottom-0 w-full shadow-lg rounded-t-3xl pt-2">
          <NavigationBar
            links={[
              { to: "/app/dashboard", icon: ListBulletIcon, label: "Recipes" },
              { to: "/app/practice", icon: PlusIcon, label: "Practice" },
              {
                to: "/app/characters",
                icon: Cog6ToothIcon,
                label: "Characters",
              },
            ]}
          />
        </div>
      </div>
    </HanziDataSetProvider>
  );
}

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { NavigationBar } from "../../components/NavigationBar";
import { ListBulletIcon, PlusIcon } from "@heroicons/react/24/outline";
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
        <div className="p-6 pb-4">
          <h1 className="font-extrabold text-2xl">Your Recipes Cookbook</h1>
        </div>
        <div className="bg-base-200 flex-1 p-6 pt-4 rounded-t-3xl shadow-md">
          <Outlet />
        </div>
        <div className="bg-base-100 fixed bottom-0 left-0 w-full shadow-lg rounded-t-3xl pt-2">
          <NavigationBar
            links={[
              { to: "/app/dashboard", icon: ListBulletIcon, label: "Recipes" },
              { to: "/app/practice", icon: PlusIcon, label: "Practice" },
              { to: "/app/characters", icon: PlusIcon, label: "Characters" },
            ]}
          />
        </div>
      </div>
    </HanziDataSetProvider>
  );
}

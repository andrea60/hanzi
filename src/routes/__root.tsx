import { createRootRoute, Outlet } from "@tanstack/react-router";
import { type FileRoutesByTo } from "../routeTree.gen";
import { ModalRenderer } from "../components/modal/useModal";
import { ToastRenderer } from "../components/toastr/useToast";

export const Route = createRootRoute({
  component: () => (
    <main className="h-full w-full bg-base-200 [&_.card]:bg-base-100 [&_.card]:border-base-300">
      <ModalRenderer />
      <ToastRenderer />
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </main>
  ),
});

export type TRoutes = keyof FileRoutesByTo;

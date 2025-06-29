import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { auth } from "../firebase/firebase.config";
import { useAuth } from "../auth/useAuth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    await auth.authStateReady();
    if (auth.currentUser) {
      throw redirect({
        to: "/app/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const handleSignIn = async () => {
    const success = await signIn();
    if (!success) return;

    navigate({ to: "/app/dashboard" });
  };

  return (
    <div className=" p-4 h-full w-full flex flex-col items-center justify-center">
      <h1 className="font-extrabold text-4xl mb-1">Hanzi Trainer</h1>
      <h2 className="font-serif">Hanzi character writing training app</h2>
      <div className="card card-border card-sm w-full mt-6 shadow-xs">
        <div className="card-body">
          <h1 className="card-title self-center mb-2">Welcome Back!</h1>
          <button className="btn btn-neutral" onClick={handleSignIn}>
            Sign-in using Google
          </button>
        </div>
      </div>
    </div>
  );
}

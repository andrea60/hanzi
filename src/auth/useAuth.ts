import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { useNavigate } from "@tanstack/react-router";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      return true;
    } catch (error) {
      console.error("Error signing in:", error);
    }
    return false;
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, signIn, signOut: signOutUser };
};

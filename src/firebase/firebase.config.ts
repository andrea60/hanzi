import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzMko35IweuLvdeiFT2CWUMl_Lr8tNvKo",
  authDomain: "hanzi-trainer-2c3cc.firebaseapp.com",
  projectId: "hanzi-trainer-2c3cc",
  storageBucket: "hanzi-trainer-2c3cc.firebasestorage.app",
  messagingSenderId: "1088294817901",
  appId: "1:1088294817901:web:834fb62abf37ea34072f64",
  measurementId: "G-0D0YV0936B",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

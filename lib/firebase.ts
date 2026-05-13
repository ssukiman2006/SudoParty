import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBBXB9WlonBWt2PyZ75lnk_5-775Vm-Y-c",
  authDomain: "sudoparty-4f0a5.firebaseapp.com",
  databaseURL: "https://sudoparty-4f0a5-default-rtdb.firebaseio.com",
  projectId: "sudoparty-4f0a5",
  storageBucket: "sudoparty-4f0a5.firebasestorage.app",
  messagingSenderId: "51386741091",
  appId: "1:51386741091:web:a177814a628a0eacabe356",
  measurementId: "G-YD2KWJCT16",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);

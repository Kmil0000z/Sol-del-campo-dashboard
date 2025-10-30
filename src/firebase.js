import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVxVvBYbr3H-NENkc3ssNNRLJrjmmEklg",
  authDomain: "soldeloriente-d1663.firebaseapp.com",
  projectId: "soldeloriente-d1663",
  storageBucket: "soldeloriente-d1663.firebasestorage.app",
  messagingSenderId: "175541268798",
  appId: "1:175541268798:web:ddc9765018d7572910fc6f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
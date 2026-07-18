import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfoy_GycEheznXbk_zNmc8i4OwBovloVk",
  authDomain: "rihlati-13e62.firebaseapp.com",
  projectId: "rihlati-13e62",
  storageBucket: "rihlati-13e62.firebasestorage.app",
  messagingSenderId: "243208880774",
  appId: "1:243208880774:web:ce07223f909fcc39ac0707"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
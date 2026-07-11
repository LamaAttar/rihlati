import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
 
const auth = getAuth();
const provider = new GoogleAuthProvider();
 
export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};
 
export const logOut = () => {
  return signOut(auth);
};
 
export { auth };
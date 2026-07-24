import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// رجعنا لطريقة الـ popup للجميع (بدون استثناء للموبايل) —
// لأنه اكتشفنا إنه طريقة "إعادة التوجيه" هي يلي كانت بتسبب مشكلة
// عدم إتمام تسجيل الدخول على Safari، مش طريقة الـ popup
export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export const logOut = () => {
  return signOut(auth);
};

export { auth };
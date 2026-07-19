import { getAuth, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// بيكتشف إذا المستخدم فاتح الموقع من موبايل (آيفون/أندرويد)
function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// على الموبايل (وخصوصاً آيفون/Safari) الـ popup ما بيشتغل صح غالباً،
// فمنستخدم redirect بدلها. على الكمبيوتر منستخدم popup لأنها تجربة أسرع وأسهل
export const signInWithGoogle = () => {
  if (isMobileDevice()) {
    return signInWithRedirect(auth, provider);
  }
  return signInWithPopup(auth, provider);
};

// بعد ما يرجع المستخدم من صفحة تسجيل الدخول (بحالة الموبايل/redirect)،
// هاد بيتأكد من نتيجة العملية ويمسك أي خطأ صار
getRedirectResult(auth).catch((error) => {
  console.error('خطأ بتسجيل الدخول:', error);
});

export const logOut = () => {
  return signOut(auth);
};

export { auth };
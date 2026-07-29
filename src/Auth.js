import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// سفاري على الموبايل (وأحياناً متصفحات موبايل تانية) بترفض تفتح نافذة
// الـ popup حتى لو إعداد "Block Pop-ups" مطفي — بترجع خطأ auth/popup-blocked.
// الحل الموصى فيه من فايربيز: نستخدم "إعادة التوجيه" (redirect) بالموبايل،
// ونخلي الكمبيوتر يضل يستخدم الـ popup (تجربة أسرع وما بتحتاج تحميل صفحة جديدة)
function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export const signInWithGoogle = () => {
  if (isMobileDevice()) {
    return signInWithRedirect(auth, provider);
  }
  return signInWithPopup(auth, provider);
};

// لازم نستدعي هاي الدالة مرة وحدة لما التطبيق يفتح، عشان نمسك نتيجة
// تسجيل الدخول (أو أي خطأ صار) بعد ما المستخدم يرجع من صفحة جوجل
export const checkRedirectResult = () => {
  return getRedirectResult(auth);
};

export const logOut = () => {
  return signOut(auth);
};

export { auth };
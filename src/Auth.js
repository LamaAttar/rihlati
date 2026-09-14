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

// سفاري بترفض تفتح نافذة الـ popup — سواء على الموبايل أو حتى على
// الماك (كمبيوتر) — بسبب حماية الخصوصية المدمجة (Intelligent Tracking
// Prevention) يلي بتعتبر نافذة تسجيل الدخول المنبثقة "تتبع عبر مواقع"
// وبترفضها بصمت (auth/popup-blocked)، بغض النظر عن نوع الجهاز.
// الفحص السابق كان يكتشف الموبايل بس (iPhone/iPad/Android)، فكان
// يفوّت حالة سفاري على الماك تحديداً ويخليها تستخدم popup وتفشل.
// الحل: نكتشف سفاري بالذات (أي جهاز) ونستخدم "إعادة التوجيه" لأي
// سفاري، ونخلي باقي المتصفحات (كروم، إيدج، فايرفوكس...) تستخدم
// popup العادي (تجربة أسرع وما بتحتاج تحميل صفحة جديدة)
function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isSafariBrowser() {
  const ua = navigator.userAgent;
  // سفاري (سطح مكتب أو آيفون) بيحتوي على "Safari" بالـ user agent،
  // بس كروم وفايرفوكس وإيدج وأوبرا على آيفون كمان بيحطوا "Safari"
  // لأسباب توافقية تقنية — فلازم نستثنيهم صراحة عشان الفحص يكون دقيق
  // وما نصنّف كروم-على-آيفون غلط على إنه سفاري
  return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Edg\//i.test(ua);
}

export const signInWithGoogle = () => {
  if (isMobileDevice() || isSafariBrowser()) {
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
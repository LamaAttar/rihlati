import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// سفاري بترفض تفتح نافذة الـ popup — سواء على الموبايل أو حتى على
// الماك (كمبيوتر) — بسبب حماية الخصوصية المدمجة (Intelligent Tracking
// Prevention) يلي بتعتبر نافذة تسجيل الدخول المنبثقة "تتبع عبر مواقع"
// وبترفضها بصمت (auth/popup-blocked)، بغض النظر عن نوع الجهاز.
function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isSafariBrowser() {
  const ua = navigator.userAgent;
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

// ===== تسجيل دخول بديل بإيميل وكلمة سر — طريقة احتياطية موثوقة =====
// ما بتعتمد على popup أو redirect أو دومين خارجي إطلاقاً، فما فيها
// أي احتمال لمشاكل سفاري أو حظر شبكات لدومينات جوجل. مفيدة كحل
// دايم لأي مستخدم يواجه مشكلة بتسجيل الدخول عبر جوجل لأي سبب

// إنشاء حساب جديد بإيميل وكلمة سر، مع اسم عرض (لأنه باقي التطبيق
// بيعتمد على user.displayName بكل مكان)
export const signUpWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
};

export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const logOut = () => {
  return signOut(auth);
};

export { auth };
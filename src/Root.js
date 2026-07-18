import React, { useState } from 'react';
import LandingPage from './LandingPage';
import App from './App';

// هاد الملف بس "مفتاح تبديل" — ما بيلمس أو يغيّر أي شي جوه App.js
// أول ما المستخدم يفتح الموقع، بيشوف LandingPage. لما يدوس "Start Your Journey"،
// بينتقل للتطبيق الأصلي (App) كامل زي ما هو تماماً، بدون أي تغيير على منطقه.
export default function Root() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) return <App />;
  return <LandingPage onStart={() => setShowApp(true)} />;
}
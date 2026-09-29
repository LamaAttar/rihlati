import { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

const CONTACT_EMAIL = 'rihlatijordan@outlook.com';

// نفس آلية التنبيهات المستخدمة بـ App.js (showToast)
function toast(message, type = 'error') {
  window.dispatchEvent(new CustomEvent('rl-toast', { detail: { message, type } }));
}

const LEGAL = {
  ar: {
    title: 'شروط الاستخدام وسياسة الخصوصية',
    updated: 'آخر تحديث: أيلول 2026',
    sections: [
      { h: 'عن رحلتي', p: 'رحلتي مبادرة تطوعية غير ربحية يديرها فرد، هدفها تشجيع السياحة الداخلية والتعريف بالمناطق الأردنية الأقل شهرة. الاستخدام مجاني بالكامل. المحتوى إرشادي ولا يغني عن التأكد من الأسعار والمواعيد والظروف محلياً.' },
      { h: 'البيانات التي نجمعها', p: 'عند تسجيل الدخول: الاسم والإيميل (عبر Google أو الإيميل وكلمة السر). ضمن استخدامك للتطبيق: التقييمات والمراجعات والصور والمناطق المضافة والرحلات المحفوظة والمفضلة وطلبات الصداقة والرسائل بين الأصدقاء ونقاطك. موقعك الجغرافي يُطلب من متصفحك فقط لحساب المسافات وعرض الطقس والخدمات القريبة، ولا نحفظه في قاعدة البيانات، لكن إحداثيات المكان الذي تبحث عنه ترسل إلى خدمة الخرائط (OpenStreetMap عبر خادم وسيط) لجلب الخدمات القريبة.' },
      { h: 'كيف نستخدمها', p: 'لتشغيل الميزات المذكورة فقط، ولا نبيع بياناتك ولا نشاركها مع جهات إعلانية. نستخدم خدمات Google Firebase للتخزين وتسجيل الدخول، وCloudinary لتخزين الصور، وEmailJS لإشعار الإدارة بالمحتوى الجديد، وOpen-Meteo للطقس.' },
      { h: 'المحتوى الذي ترفعه', p: 'تحتفظ بحقوق صورك ومراجعاتك، وتمنح رحلتي ترخيصاً غير حصري لعرضها داخل التطبيق. ارفع فقط ما تملك حق نشره. تخضع المناطق والصور لمراجعة الإدارة قبل الظهور، ويحق لنا رفض أو حذف أي محتوى مخالف.' },
      { h: 'السلوك المقبول', p: 'يُمنع المحتوى المسيء أو المضلل أو الذي ينتهك خصوصية الآخرين. يمكنك حظر أي مستخدم أو الإبلاغ عنه من داخل المحادثة. قد تُراجع الرسائل من الإدارة عند وجود بلاغ فقط.' },
      { h: 'حقوقك', p: `يمكنك طلب حذف حسابك وبياناتك أو تصحيحها بمراسلتنا على ${CONTACT_EMAIL}.` },
      { h: 'الملكية', p: 'تصميم رحلتي وشعارها وشيفرتها البرمجية ومحتواها الأصلي محفوظة لصاحب المبادرة. بيانات الخرائط © مساهمو OpenStreetMap ومرخّصة بموجب ODbL.' },
      { h: 'تنويه', p: 'التوصيات والتكاليف وأوقات السفر تقديرية وتُحسب بقواعد محلية وليست ذكاءً اصطناعياً توليدياً، وقد تختلف عن الواقع.' },
    ],
    close: 'إغلاق',
  },
  en: {
    title: 'Terms of Use & Privacy Policy',
    updated: 'Last updated: September 2026',
    sections: [
      { h: 'About Rihlati', p: 'Rihlati is a non-profit volunteer initiative run by an individual to encourage domestic tourism and promote lesser-known places in Jordan. It is completely free. Content is informational; please verify prices, hours and conditions locally.' },
      { h: 'Data we collect', p: 'On sign-in: name and email (via Google or email/password). While using the app: ratings, reviews, photos, added places, saved trips, favorites, friend requests, messages between friends, and your points. Your device location is requested by your browser only to compute distances, weather and nearby services; it is not stored in our database, but the coordinates of the place you browse are sent to OpenStreetMap (through a proxy server) to fetch nearby services.' },
      { h: 'How we use it', p: 'Only to run the features above. We do not sell your data or share it with advertisers. We use Google Firebase for storage and sign-in, Cloudinary for photos, EmailJS to notify the admin of new content, and Open-Meteo for weather.' },
      { h: 'Content you upload', p: 'You keep the rights to your photos and reviews and grant Rihlati a non-exclusive license to display them in the app. Upload only what you have the right to share. Places and photos are reviewed before appearing, and we may reject or remove violating content.' },
      { h: 'Acceptable behavior', p: 'Abusive, misleading content or content violating others\' privacy is not allowed. You can block or report any user from within the chat. Messages may be reviewed by the admin only when a report is filed.' },
      { h: 'Your rights', p: `You can request deletion or correction of your account and data by emailing ${CONTACT_EMAIL}.` },
      { h: 'Ownership', p: 'Rihlati\'s design, logo, source code and original content belong to the initiative owner. Map data © OpenStreetMap contributors, licensed under ODbL.' },
      { h: 'Disclaimer', p: 'Recommendations, costs and travel times are estimates computed by local rule-based logic, not generative AI, and may differ from reality.' },
    ],
    close: 'Close',
  },
};

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const card = { background: '#fff', borderRadius: 20, padding: 24, maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' };

export function SiteFooter({ lang = 'ar', onOpenLegal, onOpenFeedback }) {
  const linkStyle = { background: 'none', border: 'none', color: '#8B6914', textDecoration: 'underline', cursor: 'pointer', padding: 0, margin: 0, fontSize: '0.8rem', boxShadow: 'none' };
  return (
    <footer style={{ margin: '40px auto 90px', maxWidth: 700, padding: '18px 20px', textAlign: 'center', borderTop: '1px solid #e8d5a3', color: '#777', fontSize: '0.8rem', lineHeight: 1.9 }}>
      <div>© 2026 {lang === 'ar' ? 'رحلتي – جميع الحقوق محفوظة' : 'Rihlati – All rights reserved'}</div>
      <div>{lang === 'ar' ? 'مبادرة تطوعية غير ربحية لتشجيع السياحة الداخلية في الأردن' : 'A non-profit volunteer initiative promoting domestic tourism in Jordan'}</div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', margin: '6px 0' }}>
        <button style={linkStyle} onClick={onOpenLegal}>{lang === 'ar' ? 'الشروط والخصوصية' : 'Terms & Privacy'}</button>
        <button style={linkStyle} onClick={onOpenFeedback}>{lang === 'ar' ? 'شاركنا رأيك' : 'Share feedback'}</button>
        <a href={`mailto:${CONTACT_EMAIL}`} style={{ ...linkStyle, textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>
      </div>
      <div style={{ fontSize: '0.72rem', color: '#999' }}>
        {lang === 'ar' ? 'بيانات الخرائط © ' : 'Map data © '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: '#999' }}>OpenStreetMap</a>
        {lang === 'ar' ? ' ومساهموها · الطقس من ' : ' contributors · Weather by '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#999' }}>Open-Meteo</a>
      </div>
    </footer>
  );
}

export function LegalModal({ lang = 'ar', onClose }) {
  const t = LEGAL[lang] || LEGAL.ar;
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...card, textAlign: lang === 'ar' ? 'right' : 'left' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        <h2 style={{ color: '#8B6914', marginBottom: 2 }}>{t.title}</h2>
        <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: 16 }}>{t.updated}</p>
        {t.sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <h4 style={{ color: '#5a3e1b', marginBottom: 4 }}>{s.h}</h4>
            <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>{s.p}</p>
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', background: '#faf6ec', color: '#8B6914', border: '1px solid #e8d5a3', padding: 10, borderRadius: 10, marginTop: 6 }}>{t.close}</button>
      </div>
    </div>
  );
}

// نموذج رأي المستخدم — بيخزن بمجموعة feedback بـ Firestore، ودليل حقيقي للجنة التحكيم
export function FeedbackModal({ user, lang = 'ar', onClose }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [allowPublic, setAllowPublic] = useState(false);
  const [sending, setSending] = useState(false);
  const ar = lang === 'ar';

  const submit = async () => {
    if (!user) return toast(ar ? 'سجل دخول أولاً عشان تشاركنا رأيك' : 'Please log in first to share feedback');
    if (text.trim().length < 5) return toast(ar ? 'اكتب كم كلمة عن تجربتك' : 'Please write a few words about your experience');
    setSending(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user.uid,
        name: user.displayName || null,
        stars,
        text: text.trim().slice(0, 1000),
        allowPublic,
        createdAt: new Date().toISOString(),
      });
      toast(ar ? '🙏 شكراً لرأيك!' : '🙏 Thank you for your feedback!', 'success');
      onClose();
    } catch (e) {
      toast(ar ? 'صار خطأ، جرب مرة ثانية' : 'Something went wrong, try again');
    }
    setSending(false);
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...card, maxWidth: 420, textAlign: ar ? 'right' : 'left' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        <h2 style={{ color: '#8B6914', marginBottom: 4 }}>{ar ? '💬 شاركنا رأيك' : '💬 Share your feedback'}</h2>
        <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 14 }}>{ar ? 'رأيك بيساعدنا نطور رحلتي' : 'Your feedback helps us improve Rihlati'}</p>
        <div style={{ marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} onClick={() => setStars(s)} style={{ cursor: 'pointer', fontSize: '1.6rem', color: s <= stars ? '#ffb703' : '#ccc' }}>★</span>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={ar ? 'شو أعجبك؟ وشو بتقترح نحسّن؟' : 'What did you like? What should we improve?'}
          style={{ width: '100%', border: '1.5px solid #e8d5a3', borderRadius: 12, padding: 10, fontFamily: 'inherit', background: '#faf6ec', marginBottom: 10 }}
        />
        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem', color: '#5a3e1b', marginBottom: 14 }}>
          <input type="checkbox" checked={allowPublic} onChange={(e) => setAllowPublic(e.target.checked)} style={{ marginTop: 3 }} />
          <span>{ar ? 'أسمح باستخدام رأيي (مع اسمي الأول) كشهادة مستخدم بالتقارير وطلبات الجوائز' : 'I allow my feedback (with my first name) to be used as a testimonial in reports and award applications'}</span>
        </label>
        <button onClick={submit} disabled={sending} style={{ width: '100%', background: 'linear-gradient(135deg, #C4952A, #8B6914)', color: '#fff', padding: 12, borderRadius: 14, opacity: sending ? 0.7 : 1 }}>
          {sending ? '⏳...' : (ar ? 'إرسال' : 'Send')}
        </button>
      </div>
    </div>
  );
}
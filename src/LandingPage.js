import React, { useEffect, useRef, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './LandingPage.css';

/* ===== Scroll-reveal wrapper — fades sections up as they enter view ===== */
function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`rl-reveal ${visible ? 'rl-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ===== Recurring golden-hour divider — the page's signature motif ===== */
function GoldDivider({ flip = false }) {
  return (
    <div className="rl-divider" style={{ transform: flip ? 'scaleY(-1)' : 'none' }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,30 C 360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#F5EFE3" />
        <path d="M0,32 C 360,58 1080,6 1440,32" stroke="#C4952A" strokeWidth="1.5" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

const FEATURES = [
  { icon: '🧭', title: 'خطط رحلتك بالذكاء الاصطناعي', desc: 'جاوب على كم سؤال بسيط واحصل على جدول رحلة مخصص من أماكن حقيقية، فوراً.' },
  { icon: '🗺️', title: 'خريطة تفاعلية', desc: 'استكشف كل وجهة على خريطة حية مع الاتجاهات والخدمات القريبة.' },
  { icon: '🏛️', title: 'استكشف الوجهات', desc: 'من الآثار القديمة للكثبان الصحراوية — اكتشف أشهر أماكن الأردن.' },
  { icon: '🤝', title: 'مجتمع المسافرين', desc: 'شارك صورك، اقرأ التقييمات، وتواصل مع مستكشفين تانيين بكل البلد.' },
  { icon: '🏆', title: 'صورة الأسبوع', desc: 'الصورة الأكتر إعجاباً كل أسبوع بتظهر لكل المجتمع.' },
  { icon: '🌿', title: 'سياحة مستدامة', desc: 'سافر بمسؤولية مع تذكيرات مدمجة للحفاظ على الطبيعة والثقافة المحلية.' },
];

const DESTINATIONS = [
  { key: 'petra', name: 'البتراء', tag: 'إحدى عجائب الدنيا السبع', img: '/petra.png' },
  { key: 'wadirum', name: 'وادي رم', tag: 'وادي القمر', img: '/wadirum.png' },
  { key: 'deadsea', name: 'البحر الميت', tag: 'أخفض نقطة على سطح الأرض', img: '/dead-sea.png' },
  { key: 'jerash', name: 'جرش', tag: 'إرث روماني عريق', img: '/jerash.png' },
  { key: 'ajloun', name: 'عجلون', tag: 'مرتفعات خضراء', img: '/ajloun.png' },
];

const ECO = [
  { icon: '🌿', title: 'احمي الطبيعة', desc: 'خلي كل مسار زي ما لقيتيه، أو أحلى.' },
  { icon: '💧', title: 'رشّد استهلاك المياه', desc: 'استخدم المياه بوعي، خصوصاً بالمناطق الصحراوية.' },
  { icon: '🤍', title: 'احترم الثقافة', desc: 'قدّر العادات والمجتمعات المحلية يلي بتزورها.' },
];

export default function LandingPage({ onStart }) {
  const [communityPhotos, setCommunityPhotos] = useState([]);
  const [travelerOfWeek, setTravelerOfWeek] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const loadCommunityContent = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'photos'));
        const allPhotos = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          (data.items || []).forEach((item) => {
            allPhotos.push({ ...item, placeKey: docSnap.id, likeCount: (item.likes || []).length });
          });
        });

        if (allPhotos.length > 0) {
          const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
          setCommunityPhotos(shuffled.slice(0, 8));

          const top = [...allPhotos].sort((a, b) => b.likeCount - a.likeCount)[0];
          if (top && top.likeCount > 0) setTravelerOfWeek(top);
        }
      } catch (e) {
        // صامت — لو ما قدرنا نجيب صور حقيقية، الصفحة بتضل شغالة بدون قسم المجتمع
      }
    };
    loadCommunityContent();
  }, []);

  // خلفية الهيرو المتحركة — تدور بين صور حقيقية رفعها الزوار (لو موجودة)، وإلا صورة ثابتة
  const heroPhotos = communityPhotos.slice(0, 5);
  useEffect(() => {
    if (heroPhotos.length < 2) return;
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroPhotos.length);
    }, 6000);
    return () => clearInterval(t);
  }, [heroPhotos.length]);

  const scrollToFeatures = () => {
    document.getElementById('rl-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="rl-landing" dir="rtl">

      {/* ===== Hero ===== */}
      <section className="rl-hero">
        {heroPhotos.length > 0 ? (
          heroPhotos.map((p, i) => (
            <div
              key={i}
              className="rl-hero-bg"
              style={{
                backgroundImage: `url('${p.url}')`,
                opacity: i === heroIndex ? 1 : 0,
                transition: 'opacity 1.4s ease',
              }}
            />
          ))
        ) : (
          <div className="rl-hero-bg" style={{ backgroundImage: "url('/wadirum.png')" }} />
        )}
        <div className="rl-hero-overlay" />
        <div className="rl-hero-content">
          <span className="rl-hero-eyebrow">الأردن، بنظرة جديدة</span>
          <h1 className="rl-hero-title">رحلتي</h1>
          <p className="rl-hero-tagline">تعال نكتشف الأردن معاً</p>
          <p className="rl-hero-sub">خطط لرحلاتك، اكتشف الأماكن الخفية، وشارك مغامراتك — كل هذا بمكان واحد.</p>
          <div className="rl-hero-actions">
            <button className="rl-btn rl-btn-primary" onClick={onStart}>ابدأ رحلتك</button>
            <button className="rl-btn rl-btn-ghost" onClick={scrollToFeatures}>استكشف الميزات</button>
          </div>
        </div>
        <div className="rl-scroll-cue" />
      </section>

      <GoldDivider />

      {/* ===== Features ===== */}
      <section className="rl-section" id="rl-features">
        <Reveal as="div" className="rl-section-head">
          <span className="rl-eyebrow">شو رح تحصل عليه</span>
          <h2>كل شي محتاجه كمسافر عصري</h2>
          <p>ست أدوات مبنية على شكل استكشاف الناس الحقيقي للأردن — قبل الرحلة، أثناءها، وبعدها.</p>
        </Reveal>
        <div className="rl-grid-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="rl-feature-card">
                <div className="rl-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Destinations ===== */}
      <section className="rl-section">
        <Reveal as="div" className="rl-section-head">
          <span className="rl-eyebrow">وين تروح</span>
          <h2>أشهر وجهات الأردن</h2>
        </Reveal>
        <div className="rl-dest-grid">
          {DESTINATIONS.map((d, i) => (
            <Reveal key={d.key} delay={i * 70} className="rl-dest-card">
              <img src={d.img} alt={d.name} />
              <div className="rl-dest-overlay">
                <div>
                  <span>{d.tag}</span>
                  <h3>{d.name}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <GoldDivider flip />

      {/* ===== AI Assistant ===== */}
      <section className="rl-ai-section">
        <div className="rl-ai-inner">
          <Reveal>
            <span className="rl-ai-badge">تعرّف على رحّال</span>
            <h2>رفيق سفرك الذكي</h2>
            <p>
              رحّال بيفهم شو بدك بالضبط — الموسم، مع مين مسافر، قديش عندك وقت،
              وميزانيتك — وبعدها بيبني رحلة مخصصة من أماكن حقيقية بكل الأردن.
              بدون جداول عامة، بس يلي فعلاً يناسبك.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="rl-ai-visual">
              <div className="rl-ai-chip">🗓️ "عندي ويكند فاضي وبحب المشي بالطبيعة..."</div>
              <div className="rl-ai-chip">🏆 اقتراحنا: محمية ضانا — يوم كامل، ميزانية معقولة</div>
              <div className="rl-ai-chip" style={{ marginBottom: 0 }}>📍 خريطة، اتجاهات، وخدمات قريبة مضمّنة</div>
            </div>
          </Reveal>
        </div>
      </section>

      <GoldDivider />

      {/* ===== Traveler Community ===== */}
      {communityPhotos.length > 0 && (
        <section className="rl-section">
          <Reveal as="div" className="rl-section-head">
            <span className="rl-eyebrow">رحلات حقيقية</span>
            <h2>من مجتمع المسافرين عندنا</h2>
            <p>صور حقيقية، شاركها مسافرون حقيقيون يستكشفوا الأردن هلق.</p>
          </Reveal>
          <div className="rl-community-grid">
            {communityPhotos.map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rl-post-card">
                  <img src={p.url} alt={p.uploadedBy || 'صورة مسافر'} />
                  <div className="rl-post-meta">
                    <span>{p.uploadedBy || 'مسافر'}</span>
                    <span>❤️ {p.likeCount}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== Traveler of the Week ===== */}
      {travelerOfWeek && (
        <section className="rl-section">
          <Reveal as="div" className="rl-section-head">
            <span className="rl-eyebrow">مفضّلة المجتمع</span>
            <h2>مسافر الأسبوع</h2>
          </Reveal>
          <Reveal>
            <div className="rl-tow-card">
              <img className="rl-tow-img" src={travelerOfWeek.url} alt={travelerOfWeek.uploadedBy || 'مسافر'} />
              <div className="rl-tow-body">
                <span className="rl-tow-badge">🏆 الصورة الأكتر إعجاباً</span>
                <h3>{travelerOfWeek.uploadedBy || 'مسافر من رحلتي'}</h3>
                <p>❤️ {travelerOfWeek.likeCount} إعجاب من المجتمع</p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <GoldDivider flip />

      {/* ===== Sustainable Tourism ===== */}
      <section className="rl-section">
        <Reveal as="div" className="rl-section-head">
          <span className="rl-eyebrow">سافر بمسؤولية</span>
          <h2>سياحة مستدامة، مدمجة بالتطبيق</h2>
        </Reveal>
        <div className="rl-grid-3-sm">
          {ECO.map((e, i) => (
            <Reveal key={e.title} delay={i * 80}>
              <div className="rl-eco-card">
                <div className="rl-feature-icon">{e.icon}</div>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="rl-cta">
        <Reveal>
          <h2>جاهز تكتشف الأردن؟</h2>
          <p>مغامرتك الجاية بعدها كبسة وحدة — مخططة بذكاء، ومشاركة أوسع.</p>
          <button className="rl-btn rl-btn-primary" onClick={onStart}>ابدأ رحلتك</button>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="rl-footer">
        <div className="rl-footer-inner">
          <div className="rl-footer-brand">
            <h3>رحلتي</h3>
            <p>منصة سياحية مدعومة بالذكاء الاصطناعي، بتساعدك تكتشف الأردن بذكاء — خطط لرحلاتك، استكشف الوجهات، وشارك رحلتك.</p>
          </div>
          <div className="rl-footer-col">
            <h4>عن المنصة</h4>
            <a href="#rl-features">قصتنا</a>
            <a href="#rl-features">الميزات</a>
          </div>
          <div className="rl-footer-col">
            <h4>تواصل معنا</h4>
            <a href="mailto:hello@rihlati.app">hello@rihlati.app</a>
            <a href="#rl-features">الدعم</a>
          </div>
          <div className="rl-footer-col">
            <h4>تابعنا</h4>
            <a href="#rl-features">إنستقرام</a>
            <a href="#rl-features">فيسبوك</a>
          </div>
        </div>
        <div className="rl-footer-bottom">
          <span>© {new Date().getFullYear()} رحلتي. جميع الحقوق محفوظة.</span>
        </div>
      </footer>
    </div>
  );
}
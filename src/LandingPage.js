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
  { icon: '🧭', title: 'AI Trip Planner', desc: 'Answer a few questions and get a personalized itinerary built from real destinations, instantly.' },
  { icon: '🗺️', title: 'Interactive Map', desc: 'Explore every destination on a live map with directions and nearby services.' },
  { icon: '🏛️', title: 'Explore Destinations', desc: 'From ancient ruins to desert dunes — discover Jordan\'s most iconic places.' },
  { icon: '🤝', title: 'Traveler Community', desc: 'Share photos, read reviews, and connect with fellow explorers across the country.' },
  { icon: '🏆', title: 'Traveler of the Week', desc: 'The most-loved photo each week gets featured for the whole community to see.' },
  { icon: '🌿', title: 'Sustainable Tourism', desc: 'Travel responsibly with built-in reminders to protect nature and local culture.' },
];

const DESTINATIONS = [
  { key: 'petra', name: 'Petra', tag: 'Wonder of the World', img: '/petra.png' },
  { key: 'wadirum', name: 'Wadi Rum', tag: 'The Valley of the Moon', img: '/wadirum.png' },
  { key: 'deadsea', name: 'Dead Sea', tag: 'Lowest Point on Earth', img: '/dead-sea.png' },
  { key: 'jerash', name: 'Jerash', tag: 'Roman Legacy', img: '/jerash.png' },
  { key: 'ajloun', name: 'Ajloun', tag: 'Green Highlands', img: '/ajloun.png' },
];

const ECO = [
  { icon: '🌿', title: 'Protect Nature', desc: 'Leave every trail as beautiful as you found it.' },
  { icon: '💧', title: 'Save Water', desc: 'Use water mindfully, especially in desert regions.' },
  { icon: '🤍', title: 'Respect Culture', desc: 'Honor local traditions and communities you visit.' },
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
    <div className="rl-landing" dir="ltr">

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
          <span className="rl-hero-eyebrow">Jordan, Reimagined</span>
          <h1 className="rl-hero-title">رحلتي 🌍</h1>
          <p className="rl-hero-tagline">تعال نكتشف الأردن معاً</p>
          <p className="rl-hero-sub">Plan your trips, explore hidden gems, and share your adventures — all in one place.</p>
          <div className="rl-hero-actions">
            <button className="rl-btn rl-btn-primary" onClick={onStart}>Start Your Journey</button>
            <button className="rl-btn rl-btn-ghost" onClick={scrollToFeatures}>Explore Features</button>
          </div>
        </div>
        <div className="rl-scroll-cue" />
      </section>

      <GoldDivider />

      {/* ===== Features ===== */}
      <section className="rl-section" id="rl-features">
        <Reveal as="div" className="rl-section-head">
          <span className="rl-eyebrow">What You Get</span>
          <h2>Everything a modern traveler needs</h2>
          <p>Six tools built around how people actually explore Jordan — before, during, and after the trip.</p>
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
          <span className="rl-eyebrow">Where to Go</span>
          <h2>Jordan's most iconic destinations</h2>
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
            <span className="rl-ai-badge">Meet Rahal</span>
            <h2>Your smart travel companion</h2>
            <p>
              Rahal understands what you're looking for — the season, who you're traveling with,
              how much time you have, and your budget — then builds a personalized trip from real
              destinations across Jordan. No generic itineraries, just what actually fits you.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="rl-ai-visual">
              <div className="rl-ai-chip">🗓️ "I have a free weekend and love hiking..."</div>
              <div className="rl-ai-chip">🏆 Suggested: Dana Reserve — full-day, moderate budget</div>
              <div className="rl-ai-chip" style={{ marginBottom: 0 }}>📍 Map, directions & nearby services included</div>
            </div>
          </Reveal>
        </div>
      </section>

      <GoldDivider />

      {/* ===== Traveler Community ===== */}
      {communityPhotos.length > 0 && (
        <section className="rl-section">
          <Reveal as="div" className="rl-section-head">
            <span className="rl-eyebrow">Real Journeys</span>
            <h2>From our traveler community</h2>
            <p>Real photos, shared by real travelers exploring Jordan right now.</p>
          </Reveal>
          <div className="rl-community-grid">
            {communityPhotos.map((p, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rl-post-card">
                  <img src={p.url} alt={p.uploadedBy || 'traveler photo'} />
                  <div className="rl-post-meta">
                    <span>{p.uploadedBy || 'Traveler'}</span>
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
            <span className="rl-eyebrow">Community Favorite</span>
            <h2>Traveler of the Week</h2>
          </Reveal>
          <Reveal>
            <div className="rl-tow-card">
              <img className="rl-tow-img" src={travelerOfWeek.url} alt={travelerOfWeek.uploadedBy || 'traveler'} />
              <div className="rl-tow-body">
                <span className="rl-tow-badge">🏆 Most Loved Photo</span>
                <h3>{travelerOfWeek.uploadedBy || 'A Rihlati Traveler'}</h3>
                <p>❤️ {travelerOfWeek.likeCount} likes from the community</p>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <GoldDivider flip />

      {/* ===== Sustainable Tourism ===== */}
      <section className="rl-section">
        <Reveal as="div" className="rl-section-head">
          <span className="rl-eyebrow">Travel Responsibly</span>
          <h2>Sustainable tourism, built in</h2>
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
          <h2>Ready to Discover Jordan?</h2>
          <p>Your next adventure is one click away — planned smarter, shared further.</p>
          <button className="rl-btn rl-btn-primary" onClick={onStart}>Start Your Journey</button>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="rl-footer">
        <div className="rl-footer-inner">
          <div className="rl-footer-brand">
            <h3>Rihlati</h3>
            <p>An AI-powered tourism platform helping you discover Jordan smarter — plan trips, explore destinations, and share your journey.</p>
          </div>
          <div className="rl-footer-col">
            <h4>About</h4>
            <a href="#rl-features">Our Story</a>
            <a href="#rl-features">Features</a>
          </div>
          <div className="rl-footer-col">
            <h4>Contact</h4>
            <a href="mailto:hello@rihlati.app">hello@rihlati.app</a>
            <a href="#rl-features">Support</a>
          </div>
          <div className="rl-footer-col">
            <h4>Follow</h4>
            <a href="#rl-features">Instagram</a>
            <a href="#rl-features">Facebook</a>
          </div>
        </div>
        <div className="rl-footer-bottom">
          <span>© {new Date().getFullYear()} Rihlati. All rights reserved.</span>
          <button className="rl-lang-toggle">🌐 العربية</button>
        </div>
      </footer>
    </div>
  );
}
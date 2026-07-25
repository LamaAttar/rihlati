import React from "react";

/**
 * AboutPage — صفحة "عن رحلتي"
 */

const COPY = {
  ar: {
    dir: "rtl",
    eyebrow: "عن التطبيق",
    title: "رحلتي",
    tagline: "دليلك الرقمي لاستكشاف الأردن، خطوة بخطوة",
    close: "إغلاق",
    ctaButton: "ابدأ رحلتك",
    exploreButton: "استكشف الوجهات",

    overviewLabel: "نظرة عامة",
    overviewTitle: "بوابة رقمية واحدة للأردن كله",
    overviewBody:
      "رحلتي منصة سياحية إلكترونية تجمع أبرز المناطق والوجهات الأردنية في مكان واحد، وتساعد الزائر والمواطن على اكتشافها بمعلومات موثوقة، وتقييمات حقيقية، وأدوات عملية للتخطيط، بدل التنقل بين عشرات المصادر المتفرقة.",

    problemLabel: "المشكلة",
    problemTitle: "معلومات السياحة الأردنية مبعثرة",
    problemBody:
      "من يريد التخطيط لرحلة داخل الأردن يجد نفسه أمام مصادر متفرقة وغير محدثة: منشورات قديمة، تقييمات غير موثوقة، ونقص في الأدوات العملية مثل الطقس الحي أو خطة رحلة جاهزة. النتيجة رحلات أقل تنظيماً، ومناطق كثيرة تبقى غير مكتشفة رغم قيمتها.",

    solutionLabel: "الحل",
    solutionTitle: "منصة واحدة، تجربة متكاملة",
    solutionBody:
      "جمعنا في رحلتي المعلومة والتقييم والطقس والخريطة وخطة الرحلة في تجربة واحدة سلسة، مبنية بالكامل لتبقى مجانية ومتاحة للجميع، بدون اعتماد على خدمات مدفوعة أو بنية تحتية مكلفة.",

    featuresLabel: "المزايا",
    featuresTitle: "كل ما تحتاجه في رحلتك",
    features: [
      { t: "استكشاف المناطق", d: "أدلة تفصيلية لأبرز الوجهات الأردنية مع صور وتصنيف حسب الفصل." },
      { t: "تقييمات ومراجعات", d: "آراء حقيقية من مستخدمين زاروا المكان فعلاً." },
      { t: "طقس حي", d: "حالة الطقس لحظياً لكل منطقة قبل ما تخططي لزيارتها." },
      { t: "خرائط تفاعلية", d: "مواقع دقيقة لكل وجهة لتسهيل الوصول." },
      { t: "رحّال — المساعد الذكي", d: "شات بوت يجاوب على أسئلتك ويقترح عليك وجهات." },
      { t: "خطط رحلات", d: "بناء خطة يدوياً أو بالذكاء الاصطناعي المحلي مجاناً بالكامل." },
      { t: "نقاط ولوحة صدارة", d: "نظام تحفيزي يكافئ المساهمين والمستكشفين." },
      { t: "صور المجتمع", d: "رفع صور من زياراتك لإثراء دليل كل منطقة." },
    ],

    roadmapLabel: "خارطة الطريق",
    roadmapTitle: "إلى أين نتجه بالذكاء الاصطناعي",
    roadmap: [
      { t: "تخطيط رحلات أذكى", d: "خطط مخصصة تتكيف مع وقتك وميزانيتك واهتماماتك تلقائياً." },
      { t: "توصيات شخصية", d: "اقتراح وجهات بناءً على سلوكك وتقييماتك السابقة داخل التطبيق." },
      { t: "رحّال أعمق", d: "مساعد محادثة أكثر دقة يفهم سياق رحلتك الكاملة." },
      { t: "تجربة صوتية", d: "استكشاف المناطق والاستفسار عنها بالصوت أثناء التنقل." },
    ],

    techLabel: "التقنيات",
    techTitle: "كيف بنينا رحلتي",
    tech: [
      { t: "React", d: "واجهة تفاعلية سريعة الاستجابة." },
      { t: "Firebase", d: "استضافة، مصادقة، وقاعدة بيانات فورية." },
      { t: "Cloudinary", d: "تخزين ومعالجة صور محسّنة." },
      { t: "AI محلي بلا تكلفة", d: "منطق مبني بالكود لتخطيط الرحلات دون الاعتماد على واجهات خارجية مدفوعة." },
    ],

    visionLabel: "الرؤية والرسالة",
    visionTitle: "أن يصبح اكتشاف الأردن سهلاً ومتاحاً للجميع",
    visionBody:
      "نؤمن أن كل زاوية في الأردن تستحق أن تُكتشف، وأن المعلومة الصحيحة في الوقت المناسب تصنع فرقاً حقيقياً في تجربة أي رحلة. رحلتي مبنية لتبقى مجانية بالكامل، ومتاحة لأي شخص يريد أن يبدأ رحلته القادمة بثقة.",
  },

  en: {
    dir: "ltr",
    eyebrow: "About the app",
    title: "Rihlati",
    tagline: "Your digital guide to exploring Jordan, one stop at a time",
    close: "Close",
    ctaButton: "Start Your Trip",
    exploreButton: "Explore Destinations",

    overviewLabel: "Overview",
    overviewTitle: "One digital gateway to all of Jordan",
    overviewBody:
      "Rihlati is a tourism platform that brings Jordan's destinations together in one place, helping visitors and locals discover them through reliable information, genuine reviews, and practical planning tools — instead of hopping between dozens of scattered sources.",

    problemLabel: "The problem",
    problemTitle: "Tourism information is scattered",
    problemBody:
      "Anyone planning a trip within Jordan runs into outdated posts, unreliable reviews, and a lack of practical tools like live weather or a ready-made itinerary. The result: less organized trips, and many worthwhile places staying undiscovered.",

    solutionLabel: "The solution",
    solutionTitle: "One platform, one seamless experience",
    solutionBody:
      "Rihlati brings information, reviews, weather, maps, and trip planning together in a single smooth experience — built from the ground up to stay free and accessible to everyone, without relying on paid services or costly infrastructure.",

    featuresLabel: "Features",
    featuresTitle: "Everything your trip needs",
    features: [
      { t: "Explore destinations", d: "Detailed guides to Jordan's top spots, with photos and season tags." },
      { t: "Ratings & reviews", d: "Real opinions from people who actually visited." },
      { t: "Live weather", d: "Instant weather per region before you plan a visit." },
      { t: "Interactive maps", d: "Precise locations for easy navigation." },
      { t: "Rahhal — smart assistant", d: "A chatbot that answers your questions and suggests destinations." },
      { t: "Trip planning", d: "Build a plan manually or with a fully free, local AI." },
      { t: "Points & leaderboard", d: "A reward system for contributors and explorers." },
      { t: "Community photos", d: "Upload your own visit photos to enrich each guide." },
    ],

    roadmapLabel: "Roadmap",
    roadmapTitle: "Where we're headed with AI",
    roadmap: [
      { t: "Smarter trip planning", d: "Plans that auto-adapt to your time, budget, and interests." },
      { t: "Personal recommendations", d: "Destination suggestions based on your in-app behavior and ratings." },
      { t: "A deeper Rahhal", d: "A more capable assistant that understands your whole trip context." },
      { t: "Voice experience", d: "Explore and ask about places by voice while on the move." },
    ],

    techLabel: "Technology",
    techTitle: "How Rihlati is built",
    tech: [
      { t: "React", d: "A fast, responsive interface." },
      { t: "Firebase", d: "Hosting, authentication, and a real-time database." },
      { t: "Cloudinary", d: "Optimized image storage and delivery." },
      { t: "Free local AI", d: "Code-based trip planning logic with no paid external API." },
    ],

    visionLabel: "Vision & mission",
    visionTitle: "Making Jordan easy to discover, for everyone",
    visionBody:
      "We believe every corner of Jordan deserves to be discovered, and that the right information at the right time makes a real difference in any trip. Rihlati is built to stay completely free, and available to anyone ready to start their next journey with confidence.",
  },
};

function Milestone({ index, side, label, title, body, lang }) {
  return (
    <div className={`rl-about-stop rl-about-stop--${side}`}>
      <div className="rl-about-stop-pin">
        <span>{index}</span>
      </div>
      <div className="rl-about-stop-card">
        <span className="rl-about-eyebrow">{label}</span>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

export default function AboutPage({ lang = "ar", onClose }) {
  const t = COPY[lang] || COPY.ar;

  return (
    <div className="rl-about-overlay" dir={t.dir}>
      <style>{`
        .rl-about-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: #F5F1E8;
          overflow-y: auto;
          font-family: 'Cairo', sans-serif;
          animation: rlAboutFade .25s ease;
        }
        @keyframes rlAboutFade { from { opacity: 0 } to { opacity: 1 } }

        .rl-about-close {
          position: fixed;
          top: 18px;
          inset-inline-end: 18px;
          z-index: 20;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.35);
          color: #F5F1E8;
          font-size: 1.1rem;
          cursor: pointer;
          backdrop-filter: blur(4px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          transition: transform .15s ease;
        }
        .rl-about-close:hover { transform: scale(1.08); }

        .rl-about-hero {
          position: relative;
          padding: 100px 24px 80px;
          text-align: center;
          background:
            radial-gradient(1.5px 1.5px at 10% 20%, #fff, transparent),
            radial-gradient(1px 1px at 22% 55%, #fff, transparent),
            radial-gradient(2px 2px at 35% 15%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 48% 70%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 60% 30%, #fff, transparent),
            radial-gradient(1px 1px at 72% 60%, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 85% 25%, #fff, transparent),
            radial-gradient(1px 1px at 92% 75%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 15% 85%, rgba(255,255,255,0.7), transparent),
            radial-gradient(circle at 30% 15%, rgba(196,149,42,0.12), transparent 45%),
            linear-gradient(180deg, #0e1320 0%, #241a15 100%);
          background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%,
                           100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
          color: #F5F1E8;
          overflow: hidden;
        }

        .rl-about-hero-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 26px;
        }
        .rl-about-btn {
          border-radius: 999px;
          padding: 13px 28px;
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          border: none;
        }
        .rl-about-btn--solid {
          background: linear-gradient(135deg, #C4952A, #8B6914);
          color: #fff;
        }
        .rl-about-btn--outline {
          background: transparent;
          color: #F5F1E8;
          border: 1.5px solid rgba(245,241,232,0.5);
        }

        .rl-about-eyebrow {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #C4952A;
          margin-bottom: 8px;
        }
        .rl-about-hero h1 {
          font-size: clamp(2.2rem, 6vw, 3.4rem);
          font-weight: 800;
          margin: 4px 0 10px;
          color: #FBF6EC;
        }
        .rl-about-hero p {
          font-size: 1.05rem;
          color: rgba(251,246,236,0.82);
          max-width: 480px;
          margin: 0 auto;
        }

        .rl-about-trail {
          position: relative;
          max-width: 880px;
          margin: 0 auto;
          padding: 60px 20px 20px;
        }
        .rl-about-trail::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 60px;
          inset-inline-start: 50%;
          width: 0;
          border-inline-start: 3px dashed rgba(139,105,20,0.28);
          transform: translateX(-1.5px);
        }

        .rl-about-stop {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 46px;
        }
        .rl-about-stop-pin {
          position: absolute;
          top: 6px;
          inset-inline-start: 50%;
          transform: translateX(-50%);
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #8B6914;
          color: #FBF6EC;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          box-shadow: 0 0 0 6px #F5F1E8, 0 6px 14px rgba(139,105,20,0.35);
          z-index: 2;
        }
        .rl-about-stop-card {
          width: 100%;
          max-width: 360px;
          background: #FFFCF5;
          border: 1px solid rgba(139,105,20,0.12);
          border-radius: 18px;
          padding: 26px 24px 22px;
          box-shadow: 0 8px 22px rgba(90,70,30,0.07);
        }
        .rl-about-stop-card h3 {
          color: #8B6914;
          font-size: 1.2rem;
          margin: 2px 0 8px;
        }
        .rl-about-stop-card p {
          color: #4a3f33;
          line-height: 1.75;
          font-size: 0.95rem;
          margin: 0;
        }
        .rl-about-stop-card .rl-about-eyebrow { margin-bottom: 2px; }

        .rl-about-stop--right { justify-content: flex-end; padding-inline-end: calc(50% + 40px); }
        .rl-about-stop--left  { justify-content: flex-start; padding-inline-start: calc(50% + 40px); }

        .rl-about-section {
          max-width: 1000px;
          margin: 0 auto;
          padding: 30px 24px 10px;
        }
        .rl-about-section h2 {
          text-align: center;
          color: #8B6914;
          font-size: 1.6rem;
          margin: 4px 0 34px;
        }
        .rl-about-section .rl-about-eyebrow { display: block; text-align: center; }

        .rl-about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 50px;
        }
        .rl-about-tile {
          background: #FFFDF8;
          border: 1px solid rgba(196,149,42,0.16);
          border-radius: 16px;
          padding: 20px;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .rl-about-tile:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(139,105,20,0.14);
        }
        .rl-about-tile h4 {
          color: #8B6914;
          font-size: 1rem;
          margin: 0 0 6px;
        }
        .rl-about-tile p {
          color: #5a4d3d;
          font-size: 0.88rem;
          line-height: 1.6;
          margin: 0;
        }

        .rl-about-tech-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          justify-content: center;
          margin-bottom: 50px;
        }
        .rl-about-tech-chip {
          background: #2B2320;
          color: #FBF6EC;
          border-radius: 14px;
          padding: 14px 20px;
          min-width: 150px;
          text-align: center;
        }
        .rl-about-tech-chip strong {
          display: block;
          color: #C4952A;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .rl-about-tech-chip span {
          font-size: 0.8rem;
          color: rgba(251,246,236,0.75);
          line-height: 1.5;
        }

        .rl-about-vision {
          margin-top: 30px;
          padding: 60px 24px 70px;
          text-align: center;
          background: linear-gradient(180deg, #3a2a1c 0%, #2b1e14 100%);
        }
        .rl-about-vision-inner { max-width: 620px; margin: 0 auto; }
        .rl-about-vision h2 { color: #F5F1E8; margin-bottom: 14px; font-size: 1.5rem; }
        .rl-about-vision p { color: rgba(245,241,232,0.82); line-height: 1.85; font-size: 1rem; margin: 0 0 26px; }
        .rl-about-vision .rl-about-eyebrow { color: #E0B85C; }

        @media (max-width: 720px) {
          .rl-about-trail::before { inset-inline-start: 22px; }
          .rl-about-stop-pin { inset-inline-start: 22px; transform: translateX(-50%); }
          .rl-about-stop--right, .rl-about-stop--left {
            justify-content: flex-start;
            padding-inline-start: 56px;
            padding-inline-end: 0;
          }
          .rl-about-stop-card { max-width: 100%; }
        }
      `}</style>

      <button className="rl-about-close" onClick={onClose} aria-label={t.close}>✕</button>

      <div className="rl-about-hero">
        <span className="rl-about-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.tagline}</p>
        <div className="rl-about-hero-actions">
          <button className="rl-about-btn rl-about-btn--solid" onClick={onClose}>{t.ctaButton}</button>
          <button className="rl-about-btn rl-about-btn--outline" onClick={onClose}>{t.exploreButton}</button>
        </div>
      </div>

      <div className="rl-about-trail">
        <Milestone index={1} side="right" label={t.overviewLabel} title={t.overviewTitle} body={t.overviewBody} lang={lang} />
        <Milestone index={2} side="left" label={t.problemLabel} title={t.problemTitle} body={t.problemBody} lang={lang} />
        <Milestone index={3} side="right" label={t.solutionLabel} title={t.solutionTitle} body={t.solutionBody} lang={lang} />
      </div>

      <div className="rl-about-section">
        <span className="rl-about-eyebrow">{t.featuresLabel}</span>
        <h2>{t.featuresTitle}</h2>
        <div className="rl-about-grid">
          {t.features.map((f, i) => (
            <div className="rl-about-tile" key={i}>
              <h4>{f.t}</h4>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rl-about-section">
        <span className="rl-about-eyebrow">{t.roadmapLabel}</span>
        <h2>{t.roadmapTitle}</h2>
        <div className="rl-about-grid">
          {t.roadmap.map((r, i) => (
            <div className="rl-about-tile" key={i}>
              <h4>{r.t}</h4>
              <p>{r.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rl-about-section">
        <span className="rl-about-eyebrow">{t.techLabel}</span>
        <h2>{t.techTitle}</h2>
        <div className="rl-about-tech-row">
          {t.tech.map((x, i) => (
            <div className="rl-about-tech-chip" key={i}>
              <strong>{x.t}</strong>
              <span>{x.d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rl-about-vision">
        <div className="rl-about-vision-inner">
          <span className="rl-about-eyebrow">{t.visionLabel}</span>
          <h2>{t.visionTitle}</h2>
          <p>{t.visionBody}</p>
          <button className="rl-about-btn rl-about-btn--solid" onClick={onClose}>{t.ctaButton}</button>
        </div>
      </div>
    </div>
  );
}
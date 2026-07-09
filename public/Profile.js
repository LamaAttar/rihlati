import React, { useState } from "react";
import "./Profile.css";

// بيانات وهمية للتجربة — بدّليها لبيانات المستخدم الحقيقية من Firebase
const MOCK_USER = {
  name: "lolo nazem",
  email: "lolonazem5@gmail.com",
  gender: "female", // "female" أو "male" — هاد بيجي من بيانات المستخدم بقاعدة البيانات
  level: 1,
  levelLabel: "مستكشف مبتدئ",
  points: 10,
  maxPoints: 100,
  favoritePlaces: ["أم قيس"],
  addedPlacesCount: 0,
  uploadedPhotosCount: 0,
};

const MOCK_WEATHER = {
  temp: 32,
  condition: "مشمس",
  city: "إربد",
  recommendation:
    "الجو مشمس ومعتدل، وقت ممتاز لزيارة الأماكن الأثرية أو المشي بالطبيعة. جرب تزور أم قيس وشوف الإطلالة 🌿",
};

function Avatar({ gender }) {
  if (gender === "male") {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="bgM" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4EEEA" />
            <stop offset="100%" stopColor="#C4DAD2" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bgM)" />
        <path d="M-5 66 L18 44 L34 60 L50 38 L68 58 L80 46 L105 68 V100 H-5 Z" fill="#9FC2B7" opacity="0.7" />
        <path d="M-5 78 L22 60 L42 74 L60 54 L78 72 L105 60 V100 H-5 Z" fill="#82AC9F" opacity="0.7" />
        <path d="M18 100c2-16 14-24 32-24s30 8 32 24z" fill="#3F6E63" />
        <path d="M42 66h16v12H42z" fill="#C68F63" />
        <ellipse cx="50" cy="45" rx="18" ry="20" fill="#D69B6C" />
        <path d="M31 40c-2-14 8-23 19-23s21 9 19 23c-1-7-9-12-19-12s-18 5-19 12z" fill="#2A2018" />
        <path d="M30 40c-1 4-1 8 0 11 2-1 3-2 3-5-1-2-2-4-3-6z" fill="#2A2018" />
        <path d="M70 40c1 4 1 8 0 11-2-1-3-2-3-5 1-2 2-4 3-6z" fill="#2A2018" />
        <path d="M37 42.5h7" stroke="#2A2018" strokeWidth="2" strokeLinecap="round" />
        <path d="M56 42.5h7" stroke="#2A2018" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40.5" cy="46.5" r="1.8" fill="#2A2018" />
        <circle cx="59.5" cy="46.5" r="1.8" fill="#2A2018" />
        <path d="M44.5 57c3 1.8 8 1.8 11 0" stroke="#7A4128" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M34 54c2 7 8 12 16 12s14-5 16-12c-3 5-9 8-16 8s-13-3-16-8z" fill="#2A2018" opacity="0.16" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bgF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6E7D3" />
          <stop offset="100%" stopColor="#EAD0AE" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#bgF)" />
      <path d="M-5 66 L18 44 L34 60 L50 38 L68 58 L80 46 L105 68 V100 H-5 Z" fill="#DCB78C" opacity="0.7" />
      <path d="M-5 78 L22 60 L42 74 L60 54 L78 72 L105 60 V100 H-5 Z" fill="#CFA274" opacity="0.7" />
      <path d="M18 100c2-16 14-24 32-24s30 8 32 24z" fill="#C97B4E" />
      <path d="M42 66h16v12H42z" fill="#DDA57A" />
      <path d="M24 44c-3 16-2 30 4 40h6c-4-10-5-24-3-36zM76 44c3 16 2 30-4 40h-6c4-10 5-24 3-36z" fill="#5C3A26" />
      <ellipse cx="50" cy="44" rx="18" ry="20" fill="#EAB183" />
      <path d="M32 40c-2-15 7-26 18-26s20 11 18 26c-3-9-9-14-18-14s-15 5-18 14z" fill="#5C3A26" />
      <path d="M30 38c-3 4-4 12-2 20 3-1 4-3 4-7-2-4-3-9-2-13z" fill="#5C3A26" />
      <path d="M70 38c3 4 4 12 2 20-3-1-4-3-4-7 2-4 3-9 2-13z" fill="#5C3A26" />
      <ellipse cx="40" cy="49" rx="3.5" ry="2.2" fill="#E0916F" opacity="0.45" />
      <ellipse cx="60" cy="49" rx="3.5" ry="2.2" fill="#E0916F" opacity="0.45" />
      <path d="M38 43.5c1.5-1.3 4-1.3 5.5 0" stroke="#4A2F1F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M56.5 43.5c1.5-1.3 4-1.3 5.5 0" stroke="#4A2F1F" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M45.5 55.5c2 1.6 7 1.6 9 0" stroke="#8A5236" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg className="weather-icon" viewBox="0 0 64 64" fill="none">
      <circle cx="26" cy="26" r="14" fill="#FFE08A" />
      <g stroke="#FFE08A" strokeWidth="3" strokeLinecap="round">
        <line x1="26" y1="2" x2="26" y2="8" />
        <line x1="26" y1="44" x2="26" y2="50" />
        <line x1="2" y1="26" x2="8" y2="26" />
        <line x1="6" y1="6" x2="10" y2="10" />
        <line x1="42" y1="42" x2="46" y2="46" />
        <line x1="6" y1="46" x2="10" y2="42" />
        <line x1="42" y1="10" x2="46" y2="6" />
      </g>
      <path
        d="M30 44a10 10 0 0 1 20 2 8 8 0 0 1-2 16H26a9 9 0 0 1-1-18c1-6 6-10 5 0z"
        fill="#FFF7E6"
        opacity="0.9"
      />
    </svg>
  );
}

export default function Profile({ user = MOCK_USER, weather = MOCK_WEATHER, lang = "ar" }) {
  const [weatherOpen, setWeatherOpen] = useState(false);

  const progressPct = Math.min(100, (user.points / user.maxPoints) * 100);

  return (
    <div className="profile-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="phone">
        <div className="header">
          <div className="who">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="avatar">
            <Avatar gender={user.gender} />
          </div>
        </div>

        {/* كرت الطقس — يفتح ويسكر بالضغط */}
        <div className="weather-wrap">
          <div
            className={`weather-card ${weatherOpen ? "open" : ""}`}
            onClick={() => setWeatherOpen((v) => !v)}
          >
            <WeatherIcon />
            <div className="weather-main">
              <div className="weather-temp">
                {weather.temp}
                <span className="deg">°م</span> · {weather.condition}
              </div>
              <div className="weather-sub">{weather.city} اليوم — طقس رائع للاستكشاف</div>
            </div>
            <svg
              className="weather-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className={`weather-detail ${weatherOpen ? "open" : ""}`}>
            <div className="weather-detail-inner">
              <div className="weather-detail-title">توصية اليوم</div>
              <div className="weather-detail-text">{weather.recommendation}</div>
              <div className="weather-cta">شوف أماكن تناسب هالطقس ←</div>
            </div>
          </div>
        </div>

        <div className="level-row">
          <div className="level-badge">
            <div className="star">⭐</div>
            <div className="lvl-text">
              <p>{user.levelLabel}</p>
              <span className="level-tag">المستوى {user.level}</span>
            </div>
          </div>
          <div className="points">
            <div className="num">
              {user.points} / {user.maxPoints}
            </div>
            <div className="lbl">نقاطك</div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="icon">❤️</span>
            <span className="n">{user.favoritePlaces.length}</span>
            أماكن مفضلة
          </div>
          <div className="stat">
            <span className="icon">📍</span>
            <span className="n">{user.addedPlacesCount}</span>
            مناطق أضفتها
          </div>
          <div className="stat">
            <span className="icon">📷</span>
            <span className="n">{user.uploadedPhotosCount}</span>
            صور رفعتها
          </div>
        </div>

        <div className="section">
          <div className="section-title">❤️ الأماكن المفضلة</div>
          {user.favoritePlaces.map((place) => (
            <div className="fav-item" key={place}>
              {place}
            </div>
          ))}
        </div>

        <div className="section">
          <div className="section-title">📷 الصور التي رفعتها</div>
          <div className="empty-photos">
            <svg viewBox="0 0 64 64" fill="none">
              <path
                d="M12 46 24 30l8 8 10-14 10 22z"
                stroke="#C99B5A"
                strokeWidth="2.5"
                fill="#F5E5C8"
              />
              <circle cx="18" cy="20" r="4" fill="#E3A23B" />
              <rect
                x="6"
                y="10"
                width="52"
                height="44"
                rx="6"
                stroke="#C99B5A"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
            <p className="t">لسا ما رفعتي أي صورة</p>
            <p className="d">شاركي لحظاتك الجميلة</p>
          </div>
        </div>

        <div className="banner">
          <span>استمر في استكشاف الأماكن الجميلة، وجمع الذكريات!</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  );
}
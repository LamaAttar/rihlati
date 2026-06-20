import './App.css';
import { useState, useEffect } from 'react';

const places = {
  ajloun: { name: 'عجلون', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', services: ['🍽️ مطعم القلعة - 500م', '🛒 سوبر ماركت عجلون - 1كم', '⛽ محطة بنزين - 2كم'] },
  jerash: { name: 'جرش', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', services: ['🍽️ مطعم الأوديون - 300م', '🛒 ماركت جرش - 800م', '⛽ محطة بنزين - 1.5كم'] },
  umqais: { name: 'أم قيس', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان، منظر خلاب 🏛️', services: ['🍽️ مطعم أم قيس - 400م', '🛒 ماركت محلي - 1كم', '⛽ محطة بنزين - 2.5كم'] },
  petra: { name: 'البتراء', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', services: ['🍽️ مطعم البترا - 200م', '🛒 ماركت وادي موسى - 1كم', '⛽ محطة بنزين - 2كم'] },
  wadirum: { name: 'وادي رم', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', services: ['🍽️ مطعم البدو - 1كم', '🛒 ماركت رم - 3كم', '⛽ محطة بنزين - 5كم'] },
  aqaba: { name: 'العقبة', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', services: ['🍽️ مطعم العقبة - 300م', '🛒 ماركت العقبة - 700م', '⛽ محطة بنزين - 1كم'] },
};

const summerKeys = ['ajloun', 'jerash', 'umqais'];
const winterKeys = ['petra', 'wadirum', 'aqaba'];

// معادلة حساب المسافة بين نقطتين على الكرة الأرضية
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(0);
}

function App() {
  const [season, setSeason] = useState('');
  const [openPlace, setOpenPlace] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocationError('ما قدرنا نوصل لموقعك، رح نعرض المسافة من عمان بدلها');
        }
      );
    }
  }, []);

  const toggleDetails = (place) => {
    setOpenPlace(openPlace === place ? '' : place);
  };

  const goHome = () => {
    setSeason('');
    setOpenPlace('');
  };

  const renderPlace = (key) => {
    const place = places[key];
    let distanceText = '';

    if (userLocation) {
      const dist = getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng);
      distanceText = `📍 تبعد حوالي ${dist} كم عن موقعك الحالي`;
    } else {
      distanceText = '📍 جاري تحديد موقعك...';
    }

    return (
      <div className="place-card" key={key}>
        <h3>{place.name}</h3>
        <img src={place.img} alt={place.name} />
        <p>{distanceText}</p>
        <p>{place.desc}</p>
        <button onClick={() => toggleDetails(key)}>عرض الخدمات القريبة</button>
        {openPlace === key && (
          <div className="services">
            {place.services.map((s, i) => <p key={i}>{s}</p>)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <h1>رحلتي 🗺️</h1>
      <p>اكتشف أجمل مناطق الأردن</p>

      {locationError && <p style={{ color: 'red' }}>{locationError}</p>}

      {season === '' && (
        <p className="welcome-msg">👋 اختر الموسم المناسب لرحلتك</p>
      )}

      <button onClick={() => setSeason('summer')}>☀️ صيف</button>
      <button onClick={() => setSeason('winter')}>❄️ شتاء</button>

      {season !== '' && (
        <button className="home-btn" onClick={goHome}>🏠 الرئيسية</button>
      )}

      {season === 'summer' && (
        <div>
          <h2>مناطق الصيف</h2>
          <div className="places-grid">
            {summerKeys.map(renderPlace)}
          </div>
        </div>
      )}

      {season === 'winter' && (
        <div>
          <h2>مناطق الشتاء</h2>
          <div className="places-grid">
            {winterKeys.map(renderPlace)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
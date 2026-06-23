import './App.css';
import { useState, useEffect } from 'react';

const places = {
  ajloun: { name: 'عجلون', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', season: 'summer', services: ['🍽️ مطعم القلعة - 500م', '🛒 سوبر ماركت عجلون - 1كم', '⛽ محطة بنزين - 2كم'] },
  jerash: { name: 'جرش', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', season: 'summer', services: ['🍽️ مطعم الأوديون - 300م', '🛒 ماركت جرش - 800م', '⛽ محطة بنزين - 1.5كم'] },
  umqais: { name: 'أم قيس', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', season: 'summer', services: ['🍽️ مطعم أم قيس - 400م', '🛒 ماركت محلي - 1كم', '⛽ محطة بنزين - 2.5كم'] },
  deadsea: { name: 'البحر الميت', lat: 31.55, lng: 35.47, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', season: 'summer', services: ['🍽️ مطعم البحر الميت - 1كم', '🛒 ماركت السياحة - 2كم', '⛽ محطة بنزين - 3كم'] },
  shouna: { name: 'الشونة', lat: 32.34, lng: 35.58, img: '/shouna.png', desc: 'منطقة زراعية خضراء جميلة في الأغوار الشمالية 🌿', season: 'summer', services: ['🍽️ مطعم الأغوار - 500م', '🛒 سوق الشونة - 1كم', '⛽ محطة بنزين - 2كم'] },
  salt: { name: 'السلط', lat: 32.03, lng: 35.72, img: '/salt.png', desc: 'مدينة تراثية عريقة مدرجة على قائمة التراث العالمي 🏘️', season: 'summer', services: ['🍽️ مطعم البلدة القديمة - 300م', '🛒 ماركت السلط - 700م', '⛽ محطة بنزين - 1كم'] },
  petra: { name: 'البتراء', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', season: 'winter', services: ['🍽️ مطعم البترا - 200م', '🛒 ماركت وادي موسى - 1كم', '⛽ محطة بنزين - 2كم'] },
  wadirum: { name: 'وادي رم', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', season: 'winter', services: ['🍽️ مطعم البدو - 1كم', '🛒 ماركت رم - 3كم', '⛽ محطة بنزين - 5كم'] },
  aqaba: { name: 'العقبة', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', season: 'winter', services: ['🍽️ مطعم العقبة - 300م', '🛒 ماركت العقبة - 700م', '⛽ محطة بنزين - 1كم'] },
  madaba: { name: 'مادبا', lat: 31.71, lng: 35.79, img: '/madaba.png', desc: 'مدينة الفسيفساء والكنائس التاريخية الرائعة ⛪', season: 'winter', services: ['🍽️ مطعم مادبا - 400م', '🛒 ماركت البلدة - 800م', '⛽ محطة بنزين - 1.5كم'] },
  karak: { name: 'الكرك', lat: 31.18, lng: 35.70, img: '/karak.png', desc: 'قلعة صليبية شامخة تطل على البحر الميت 🏰', season: 'winter', services: ['🍽️ مطعم القلعة - 500م', '🛒 ماركت الكرك - 1كم', '⛽ محطة بنزين - 2كم'] },
  deisa: { name: 'الديسة', lat: 29.69, lng: 35.47, img: '/deisa.png', desc: 'وادي ساحر بين الجبال الحمراء، مشي وطبيعة خلابة 🏔️', season: 'winter', services: ['🍽️ مطعم الوادي - 2كم', '🛒 ماركت محلي - 3كم', '⛽ محطة بنزين - 4كم'] },
};

const summerKeys = ['ajloun', 'jerash', 'umqais', 'deadsea', 'shouna', 'salt'];
const winterKeys = ['petra', 'wadirum', 'aqaba', 'madaba', 'karak', 'deisa'];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(0);
}

function App() {
  const [season, setSeason] = useState('');
  const [openPlace, setOpenPlace] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const toggleDetails = (place) => setOpenPlace(openPlace === place ? '' : place);
  const goHome = () => { setSeason(''); setOpenPlace(''); };

  const renderPlace = (key) => {
    const place = places[key];
    const distanceText = userLocation
      ? `📍 تبعد حوالي ${getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} كم عن موقعك`
      : '📍 جاري تحديد موقعك...';

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

      {season === '' && <p className="welcome-msg">👋 اختر الموسم المناسب لرحلتك</p>}

      <button onClick={() => setSeason('summer')}>☀️ صيف</button>
      <button onClick={() => setSeason('winter')}>❄️ شتاء</button>

      {season !== '' && <button className="home-btn" onClick={goHome}>🏠 الرئيسية</button>}

      {season === 'summer' && (
        <div>
          <h2>مناطق الصيف</h2>
          <div className="places-grid">{summerKeys.map(renderPlace)}</div>
        </div>
      )}

      {season === 'winter' && (
        <div>
          <h2>مناطق الشتاء</h2>
          <div className="places-grid">{winterKeys.map(renderPlace)}</div>
        </div>
      )}
    </div>
  );
}

export default App;
import './App.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import L from 'leaflet';

const places = {
  ajloun: { name: 'عجلون', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', season: 'summer' },
  jerash: { name: 'جرش', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', season: 'summer' },
  umqais: { name: 'أم قيس', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', season: 'summer' },
  deadsea: { name: 'البحر الميت', lat: 31.70, lng: 35.60, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', season: 'summer' },
  shouna: { name: 'الشونة', lat: 32.34, lng: 35.58, img: '/shouna.png', desc: 'منطقة زراعية خضراء جميلة في الأغوار الشمالية 🌿', season: 'summer' },
  salt: { name: 'السلط', lat: 32.03, lng: 35.72, img: '/salt.png', desc: 'مدينة تراثية عريقة مدرجة على قائمة التراث العالمي 🏘️', season: 'summer' },
  petra: { name: 'البتراء', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', season: 'winter' },
  wadirum: { name: 'وادي رم', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', season: 'winter' },
  aqaba: { name: 'العقبة', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', season: 'winter' },
  madaba: { name: 'مادبا', lat: 31.71, lng: 35.79, img: '/madaba.png', desc: 'مدينة الفسيفساء والكنائس التاريخية الرائعة ⛪', season: 'winter' },
  karak: { name: 'الكرك', lat: 31.18, lng: 35.70, img: '/karak.png', desc: 'قلعة صليبية شامخة تطل على البحر الميت 🏰', season: 'winter' },
  deisa: { name: 'الديسة', lat: 29.69, lng: 35.47, img: '/deisa.png', desc: 'وادي ساحر بين الجبال الحمراء، مشي وطبيعة خلابة 🏔️', season: 'winter' },
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

async function fetchNearbyServices(lat, lng) {
  const radius = 15000;
  const query = `[out:json];(node["amenity"="restaurant"](around:${radius},${lat},${lng});node["shop"="supermarket"](around:${radius},${lat},${lng});node["amenity"="fuel"](around:${radius},${lat},${lng});node["tourism"="hotel"](around:${radius},${lat},${lng}););out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.elements;
}

function getServiceIcon(tags) {
  if (tags.amenity === 'restaurant') return '🍽️';
  if (tags.shop === 'supermarket') return '🛒';
  if (tags.amenity === 'fuel') return '⛽';
  if (tags.tourism === 'hotel') return '🏨';
  return '📍';
}

function getMarkerColor(tags) {
  if (tags.amenity === 'restaurant') return 'red';
  if (tags.shop === 'supermarket') return 'green';
  if (tags.amenity === 'fuel') return 'blue';
  if (tags.tourism === 'hotel') return 'orange';
  return 'gray';
}

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.5)"></div>`,
    iconSize: [12, 12],
  });
}

function StarRating({ placeKey, ratings, setRatings }) {
  const rating = ratings[placeKey] || 0;
  const handleRate = async (star) => {
    setRatings({ ...ratings, [placeKey]: star });
    try { await setDoc(doc(db, 'ratings', placeKey), { rating: star }); } catch (e) {}
  };
  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => handleRate(star)} style={{ cursor:'pointer', fontSize:'1.5rem', color: star <= rating ? '#ffb703' : '#ccc' }}>★</span>
      ))}
      {rating > 0 && <span style={{ fontSize:'0.9rem', color:'#555' }}> ({rating}/5)</span>}
    </div>
  );
}

function App() {
  const [season, setSeason] = useState('');
  const [openPlace, setOpenPlace] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [mapServices, setMapServices] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
    const loadRatings = async () => {
      try {
        const newRatings = {};
        for (const key of Object.keys(places)) {
          const docSnap = await getDoc(doc(db, 'ratings', key));
          if (docSnap.exists()) newRatings[key] = docSnap.data().rating;
        }
        setRatings(newRatings);
      } catch (e) {}
    };
    loadRatings();
  }, []);

  const toggleDetails = async (key) => {
    if (openPlace === key) { setOpenPlace(''); setServices([]); return; }
    setOpenPlace(key);
    setLoadingServices(true);
    const result = await fetchNearbyServices(places[key].lat, places[key].lng);
    setServices(result.filter(s => s.tags.name).slice(0, 10));
    setLoadingServices(false);
  };

  const openMap = async (place) => {
    setSelectedPlace(place);
    const result = await fetchNearbyServices(place.lat, place.lng);
    setMapServices(result.filter(s => s.lat && s.lon));
  };

  const goHome = () => { setSeason(''); setOpenPlace(''); setSelectedPlace(null); setServices([]); setSearchQuery(''); setMapServices([]); };

  const renderPlace = (key) => {
    const place = places[key];
    const distanceText = userLocation
      ? `📍 تبعد حوالي ${getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} كم عن موقعك`
      : '📍 جاري تحديد موقعك...';
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    return (
      <div className="place-card" key={key}>
        <h3>{place.name}</h3>
        <img src={place.img} alt={place.name} />
        <p>{distanceText}</p>
        <p>{place.desc}</p>
        <StarRating placeKey={key} ratings={ratings} setRatings={setRatings} />
        <button onClick={() => openMap(place)}>🗺️ عرض على الخريطة</button>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="directions-btn">🚗 احصل على الاتجاهات</a>
        <button onClick={() => toggleDetails(key)}>عرض الخدمات القريبة</button>
        {openPlace === key && (
          <div className="services">
            {loadingServices ? <p>⏳ جاري تحميل الخدمات...</p>
              : services.length > 0 ? services.map((s, i) => <p key={i}>{getServiceIcon(s.tags)} {s.tags.name}</p>)
              : <p>لا توجد خدمات قريبة في قاعدة البيانات</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <h1>رحلتي 🗺️</h1>
      <p>اكتشف أجمل مناطق الأردن</p>
      <input className="search-input" type="text" placeholder="🔍 ابحث عن منطقة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      {searchQuery && <div className="places-grid">{Object.keys(places).filter(key => places[key].name.includes(searchQuery)).map(renderPlace)}</div>}
      {!searchQuery && season === '' && <p className="welcome-msg">👋 اختر الموسم المناسب لرحلتك</p>}
      {!searchQuery && <><button onClick={() => setSeason('summer')}>☀️ صيف</button><button onClick={() => setSeason('winter')}>❄️ شتاء</button></>}
      {season !== '' && !searchQuery && <button className="home-btn" onClick={goHome}>🏠 الرئيسية</button>}
      {selectedPlace && (
        <div className="map-container">
          <h2>📍 {selectedPlace.name}</h2>
          <div className="map-legend">
            <span>🔴 مطاعم</span><span>🟢 ماركتات</span><span>🔵 محطات وقود</span><span>🟠 فنادق</span>
          </div>
          <MapContainer center={[selectedPlace.lat, selectedPlace.lng]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[selectedPlace.lat, selectedPlace.lng]}><Popup>{selectedPlace.name}</Popup></Marker>
            {mapServices.map((s, i) => (
              <Marker key={i} position={[s.lat, s.lon]} icon={createColorIcon(getMarkerColor(s.tags))}>
                <Popup>{getServiceIcon(s.tags)} {s.tags.name || 'خدمة قريبة'}</Popup>
              </Marker>
            ))}
          </MapContainer>
          <button className="home-btn" onClick={() => { setSelectedPlace(null); setMapServices([]); }}>✖️ إغلاق الخريطة</button>
        </div>
      )}
      {season === 'summer' && !selectedPlace && !searchQuery && <div><h2>مناطق الصيف</h2><div className="places-grid">{summerKeys.map(renderPlace)}</div></div>}
      {season === 'winter' && !selectedPlace && !searchQuery && <div><h2>مناطق الشتاء</h2><div className="places-grid">{winterKeys.map(renderPlace)}</div></div>}
    </div>
  );
}

export default App;
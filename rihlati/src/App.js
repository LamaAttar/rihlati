import './App.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from './firebase';
import { auth, signInWithGoogle, logOut } from './Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import L from 'leaflet';
import ImageUpload from './ImageUpload';
import translations from './translations';

const places = {
  ajloun: { name: 'عجلون', nameEn: 'Ajloun', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', descEn: 'A historic castle amid green forests with moderate summer weather 🌲', season: 'summer' },
  jerash: { name: 'جرش', nameEn: 'Jerash', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', descEn: 'An ancient Roman city, one of the most important historical sites in Jordan 🏛️', season: 'summer' },
  umqais: { name: 'أم قيس', nameEn: 'Um Qais', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', descEn: 'Roman ruins overlooking the Sea of Galilee and the Golan Heights 🏛️', season: 'summer' },
  deadsea: { name: 'البحر الميت', nameEn: 'Dead Sea', lat: 31.70, lng: 35.60, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', descEn: 'The lowest point on Earth with healing salt water and therapeutic mud 🌊', season: 'summer' },
  shouna: { name: 'الشونة', nameEn: 'Shouna', lat: 32.34, lng: 35.58, img: '/shouna.png', desc: 'منطقة زراعية خضراء جميلة في الأغوار الشمالية 🌿', descEn: 'A beautiful green agricultural area in the Northern Jordan Valley 🌿', season: 'summer' },
  salt: { name: 'السلط', nameEn: 'Salt', lat: 32.03, lng: 35.72, img: '/salt.png', desc: 'مدينة تراثية عريقة مدرجة على قائمة التراث العالمي 🏘️', descEn: 'An ancient heritage city listed as a UNESCO World Heritage Site 🏘️', season: 'summer' },
  petra: { name: 'البتراء', nameEn: 'Petra', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', descEn: 'One of the Seven Wonders of the World with warm winter weather ☀️', season: 'winter' },
  wadirum: { name: 'وادي رم', nameEn: 'Wadi Rum', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', descEn: 'A magical desert with golden colors and unforgettable camping experience 🏜️', season: 'winter' },
  aqaba: { name: 'العقبة', nameEn: 'Aqaba', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', descEn: 'A warm coastal city in winter with the Red Sea and amazing coral reefs 🌊', season: 'winter' },
  madaba: { name: 'مادبا', nameEn: 'Madaba', lat: 31.71, lng: 35.79, img: '/madaba.png', desc: 'مدينة الفسيفساء والكنائس التاريخية الرائعة ⛪', descEn: 'The city of mosaics and amazing historic churches ⛪', season: 'winter' },
  karak: { name: 'الكرك', nameEn: 'Karak', lat: 31.18, lng: 35.70, img: '/karak.png', desc: 'قلعة صليبية شامخة تطل على البحر الميت 🏰', descEn: 'A towering Crusader castle overlooking the Dead Sea 🏰', season: 'winter' },
  deisa: { name: 'الديسة', nameEn: 'Deisa', lat: 29.69, lng: 35.47, img: '/deisa.png', desc: 'وادي ساحر بين الجبال الحمراء، مشي وطبيعة خلابة 🏔️', descEn: 'An enchanting valley between red mountains with stunning nature 🏔️', season: 'winter' },
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
  const [user, setUser] = useState(null);
  const [placePhotos, setPlacePhotos] = useState({});
  const [lang, setLang] = useState('ar');
  const [lightboxImg, setLightboxImg] = useState(null);

  const t = translations[lang];

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
    const loadPhotos = async () => {
      try {
        const newPhotos = {};
        for (const key of Object.keys(places)) {
          const docSnap = await getDoc(doc(db, 'photos', key));
          if (docSnap.exists()) newPhotos[key] = docSnap.data().urls || [];
        }
        setPlacePhotos(newPhotos);
      } catch (e) {}
    };
    loadRatings();
    loadPhotos();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (placeKey, url) => {
    try {
      await setDoc(doc(db, 'photos', placeKey), { urls: arrayUnion(url) }, { merge: true });
      setPlacePhotos(prev => ({
        ...prev,
        [placeKey]: [...(prev[placeKey] || []), url]
      }));
    } catch (e) {}
  };

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

  const openLightbox = (url) => setLightboxImg(url);
  const closeLightbox = () => setLightboxImg(null);

  const renderPlace = (key) => {
    const place = places[key];
    const placeName = lang === 'ar' ? place.name : place.nameEn;
    const placeDesc = lang === 'ar' ? place.desc : place.descEn;
    const distanceText = userLocation
      ? `📍 ${t.distance} ${getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} ${t.fromLocation}`
      : `📍 ${t.locating}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    const photos = placePhotos[key] || [];

    return (
      <div className="place-card" key={key}>
        <h3>{placeName}</h3>
        <img src={place.img} alt={placeName} />
        <p>{distanceText}</p>
        <p>{placeDesc}</p>
        <StarRating placeKey={key} ratings={ratings} setRatings={setRatings} />
        <button onClick={() => openMap(place)}>{t.map}</button>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="directions-btn">{t.directions}</a>
        <button onClick={() => toggleDetails(key)}>{t.services}</button>
        {openPlace === key && (
          <div className="services">
            {loadingServices ? <p>{t.loading}</p>
              : services.length > 0 ? services.map((s, i) => <p key={i}>{getServiceIcon(s.tags)} {s.tags.name}</p>)
              : <p>{t.noServices}</p>}
          </div>
        )}
        {photos.length > 0 && (
          <div className="photo-gallery">
            <h4>{t.photos}</h4>
            <div className="photos-grid">
              {photos.map((url, i) => (
                <img key={i} src={url} alt={placeName} className="user-photo" onClick={() => openLightbox(url)} />
              ))}
            </div>
          </div>
        )}
        {user && <ImageUpload placeKey={key} onUpload={handlePhotoUpload} />}
        {!user && <p className="login-hint">{t.loginHint}</p>}
      </div>
    );
  };

  return (
    <div className="App" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="navbar">
        <h1>{t.title}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? '🌐 English' : '🌐 العربية'}
          </button>
          {user ? (
            <div className="user-info">
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              <span>{user.displayName}</span>
              <button className="logout-btn" onClick={logOut}>{t.logout}</button>
            </div>
          ) : (
            <button className="login-btn" onClick={signInWithGoogle}>{t.login}</button>
          )}
        </div>
      </div>
      <p>{t.subtitle}</p>
      <input className="search-input" type="text" placeholder={`🔍 ${t.search}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      {searchQuery && (
        <div className="places-grid">
          {Object.keys(places)
            .filter(key => places[key].name.includes(searchQuery) || places[key].nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(renderPlace)}
        </div>
      )}
      {!searchQuery && season === '' && <p className="welcome-msg">{t.welcome}</p>}
      {!searchQuery && (
        <>
          <button onClick={() => setSeason('summer')}>{t.summer}</button>
          <button onClick={() => setSeason('winter')}>{t.winter}</button>
        </>
      )}
      {season !== '' && !searchQuery && <button className="home-btn" onClick={goHome}>{t.home}</button>}
      {selectedPlace && (
        <div className="map-container">
          <h2>📍 {lang === 'ar' ? selectedPlace.name : selectedPlace.nameEn}</h2>
          <div className="map-legend">
            <span>🔴 {t.restaurants}</span>
            <span>🟢 {t.markets}</span>
            <span>🔵 {t.fuel}</span>
            <span>🟠 {t.hotels}</span>
          </div>
          <MapContainer center={[selectedPlace.lat, selectedPlace.lng]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
              <Popup>{lang === 'ar' ? selectedPlace.name : selectedPlace.nameEn}</Popup>
            </Marker>
            {mapServices.map((s, i) => (
              <Marker key={i} position={[s.lat, s.lon]} icon={createColorIcon(getMarkerColor(s.tags))}>
                <Popup>{getServiceIcon(s.tags)} {s.tags.name || 'Service'}</Popup>
              </Marker>
            ))}
          </MapContainer>
          <button className="home-btn" onClick={() => { setSelectedPlace(null); setMapServices([]); }}>{t.closeMap}</button>
        </div>
      )}
      {season === 'summer' && !selectedPlace && !searchQuery && (
        <div>
          <h2>{t.summerRegions}</h2>
          <div className="places-grid">{summerKeys.map(renderPlace)}</div>
        </div>
      )}
      {season === 'winter' && !selectedPlace && !searchQuery && (
        <div>
          <h2>{t.winterRegions}</h2>
          <div className="places-grid">{winterKeys.map(renderPlace)}</div>
        </div>
      )}
      {lightboxImg && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <img src={lightboxImg} alt="مكبرة" />
        </div>
      )}
    </div>
  );
}

export default App;

import './App.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from './firebase';
import { auth, signInWithGoogle, logOut } from './Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, arrayUnion, collection, addDoc, getDocs } from 'firebase/firestore';
import L from 'leaflet';
import ImageUpload from './ImageUpload';
import translations from './translations';

const places = {
  ajloun: { name: 'عجلون', nameEn: 'Ajloun', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', descEn: 'A historic castle amid green forests with moderate summer weather 🌲', food: 'المقلوبة والمنسف', foodEn: 'Maqluba and Mansaf', season: 'summer' },
  irbid: { name: 'إربد', nameEn: 'Irbid', lat: 32.56, lng: 35.85, img: '/irbid.png', desc: 'مدينة العلم والثقافة بشمال الأردن، أجواء معتدلة ومعالم تاريخية عريقة 🎓', descEn: 'The city of knowledge and culture in northern Jordan, with a moderate climate and rich historical landmarks 🎓', food: 'الفلافل والحمص', foodEn: 'Falafel and Hummus', season: 'summer' },
  amman: { name: 'عمّان', nameEn: 'Amman', lat: 31.95, lng: 35.93, img: '/amman.png', desc: 'عاصمة المملكة النابضة بالحياة، تجمع بين التاريخ الروماني وحيوية المدينة الحديثة 🏛️', descEn: 'The vibrant capital of the Kingdom, blending Roman history with modern city life 🏛️', food: 'المنسف والكنافة', foodEn: 'Mansaf and Knafeh', season: 'summer' },
  jerash: { name: 'جرش', nameEn: 'Jerash', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', descEn: 'An ancient Roman city, one of the most important historical sites in Jordan 🏛️', food: 'المسخن والمنسف', foodEn: 'Musakhan and Mansaf', season: 'summer' },
  umqais: { name: 'أم قيس', nameEn: 'Um Qais', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', descEn: 'Roman ruins overlooking the Sea of Galilee and the Golan Heights 🏛️', food: 'المسخن وزيت الزيتون البلدي', foodEn: 'Musakhan and local olive oil', season: 'summer' },
  deadsea: { name: 'البحر الميت', nameEn: 'Dead Sea', lat: 31.70, lng: 35.60, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', descEn: 'The lowest point on Earth with healing salt water and therapeutic mud 🌊', food: 'الأسماك الطازجة والتمر', foodEn: 'Fresh fish and dates', season: 'summer' },
  shouna: { name: 'الشونة', nameEn: 'Shouna', lat: 32.34, lng: 35.58, img: '/shouna.png', desc: 'منطقة زراعية خضراء جميلة في الأغوار الشمالية 🌿', descEn: 'A beautiful green agricultural area in the Northern Jordan Valley 🌿', food: 'الخضار والفواكه الطازجة', foodEn: 'Fresh fruits and vegetables', season: 'summer' },
  salt: { name: 'السلط', nameEn: 'Salt', lat: 32.03, lng: 35.72, img: '/salt.png', desc: 'مدينة تراثية عريقة مدرجة على قائمة التراث العالمي 🏘️', descEn: 'An ancient heritage city listed as a UNESCO World Heritage Site 🏘️', food: 'الكعك السلطي والعصبان', foodEn: "Salt-style Ka'ak and Osban", season: 'summer' },
  ummjimal: { name: 'أم الجمال', nameEn: 'Umm el-Jimal', lat: 32.32, lng: 36.34, img: '/ummjimal.png', desc: 'مدينة أثرية بازلتية سوداء نادرة الطراز شمال شرق الأردن 🏛️', descEn: 'A rare black basalt ancient city in northeastern Jordan 🏛️', food: 'الفريكة ولبن الماعز', foodEn: 'Freekeh and goat yogurt', season: 'summer' },
  pella: { name: 'بيلا (طبقة فحل)', nameEn: 'Pella', lat: 32.45, lng: 35.61, img: '/pella.png', desc: 'مدينة أثرية بالأغوار الشمالية تعود لآلاف السنين 🏛️', descEn: 'An ancient city in the Northern Jordan Valley dating back thousands of years 🏛️', food: 'المسخن وزيت الزيتون', foodEn: 'Musakhan and olive oil', season: 'summer' },
  mujib: { name: 'محمية وادي الموجب', nameEn: 'Wadi Mujib Reserve', lat: 31.48, lng: 35.58, img: '/mujib.png', desc: '"الجراند كانيون" الأردني، مسارات مياه ومغامرة وسط الطبيعة 🏞️', descEn: "Jordan's 'Grand Canyon', water trails and adventure amid stunning nature 🏞️", food: 'المنسف والمقلوبة', foodEn: 'Mansaf and Maqluba', season: 'summer' },
  tafilah: { name: 'الطفيلة', nameEn: 'Tafilah', lat: 30.84, lng: 35.60, img: '/tafilah.png', desc: 'مدينة جبلية جنوبية، بوابة محمية ضانا وأجواء معتدلة صيفاً ⛰️', descEn: "A southern mountain city, gateway to Dana Reserve with mild summer weather ⛰️", food: 'زيت الزيتون والمقلوبة', foodEn: 'Olive oil and Maqluba', season: 'summer' },
  petra: { name: 'البتراء', nameEn: 'Petra', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', descEn: 'One of the Seven Wonders of the World with warm winter weather ☀️', food: 'الزرب البدوي والمنسف', foodEn: 'Bedouin Zarb and Mansaf', season: 'winter' },
  wadirum: { name: 'وادي رم', nameEn: 'Wadi Rum', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', descEn: 'A magical desert with golden colors and unforgettable camping experience 🏜️', food: 'الزرب (الطبخ تحت الرمل) والشاي البدوي', foodEn: 'Zarb (sand-buried BBQ) and Bedouin tea', season: 'winter' },
  aqaba: { name: 'العقبة', nameEn: 'Aqaba', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', descEn: 'A warm coastal city in winter with the Red Sea and amazing coral reefs 🌊', food: 'السياديّة والمأكولات البحرية', foodEn: 'Sayadieh and fresh seafood', season: 'winter' },
  madaba: { name: 'مادبا', nameEn: 'Madaba', lat: 31.71, lng: 35.79, img: '/madaba.png', desc: 'مدينة الفسيفساء والكنائس التاريخية الرائعة ⛪', descEn: 'The city of mosaics and amazing historic churches ⛪', food: 'المنسف والمقلوبة', foodEn: 'Mansaf and Maqluba', season: 'winter' },
  karak: { name: 'الكرك', nameEn: 'Karak', lat: 31.18, lng: 35.70, img: '/karak.png', desc: 'قلعة صليبية شامخة تطل على البحر الميت 🏰', descEn: 'A towering Crusader castle overlooking the Dead Sea 🏰', food: 'المنسف الكركي الأصيل', foodEn: 'Authentic Karak-style Mansaf', season: 'winter' },
  deisa: { name: 'الديسة', nameEn: 'Deisa', lat: 29.69, lng: 35.47, img: '/deisa.png', desc: 'وادي ساحر بين الجبال الحمراء، مشي وطبيعة خلابة 🏔️', descEn: 'An enchanting valley between red mountains with stunning nature 🏔️', food: 'الزرب البدوي', foodEn: 'Bedouin Zarb', season: 'winter' },
  dana: { name: 'محمية ضانا', nameEn: 'Dana Reserve', lat: 30.67, lng: 35.60, img: '/dana.png', desc: 'أكبر محمية طبيعية بالأردن، تنوع حيوي مذهل وسط جبال ووديان خلابة 🏔️', descEn: 'The largest nature reserve in Jordan, with amazing biodiversity amid stunning mountains and valleys 🏔️', food: 'أعشاب برية ومنتجات محلية عضوية', foodEn: 'Wild herbs and local organic products', season: 'winter' },
  mainhot: { name: 'حمامات ماعين', nameEn: "Ma'in Hot Springs", lat: 31.58, lng: 35.68, img: '/mainhot.png', desc: 'شلالات ساخنة علاجية تنبع من الجبال، تجربة استرخاء فريدة وسط الطبيعة ♨️', descEn: 'Therapeutic hot waterfalls flowing from the mountains, a unique relaxation experience amid nature ♨️', food: 'الشاي بالميرمية والمأكولات الشعبية', foodEn: 'Sage tea and traditional dishes', season: 'winter' },
  himma: { name: 'الحمة الأردنية', nameEn: 'Al-Himma (Jordanian Himma)', lat: 32.66, lng: 35.63, img: '/himma.png', desc: 'ينابيع كبريتية ساخنة قرب أم قيس، شهيرة بالعلاج الطبيعي شتاءً ♨️', descEn: 'Hot sulfur springs near Umm Qais, famous for natural therapy in winter ♨️', food: 'المشاوي والشاي البلدي', foodEn: 'Grilled meats and local tea', season: 'winter' },
  azraqcastle: { name: 'قلعة الأزرق', nameEn: 'Azraq Castle', lat: 31.83, lng: 36.82, img: '/azraqcastle.png', desc: 'قلعة أثرية من الحجر البازلتي الأسود وسط الصحراء الشرقية 🏰', descEn: 'An ancient black basalt fortress in the eastern desert 🏰', food: 'الفريكة والمنسف البدوي', foodEn: 'Freekeh and Bedouin Mansaf', season: 'winter' },
  azraqwetland: { name: 'محمية الأزرق', nameEn: 'Azraq Wetland Reserve', lat: 31.85, lng: 36.82, img: '/azraqwetland.png', desc: 'واحة صحراوية فريدة تجمع الماء والطيور المهاجرة وسط الجفاف 🦆', descEn: 'A unique desert oasis with water and migratory birds amid the arid landscape 🦆', food: 'الأسماك المحلية والتمر', foodEn: 'Local fish and dates', season: 'winter' },
  qasramra: { name: 'قصر عمرة', nameEn: 'Qasr Amra', lat: 31.80, lng: 36.59, img: '/qasramra.png', desc: 'قصر صحراوي أموي مدرج على قائمة التراث العالمي لليونسكو 🏜️', descEn: 'An Umayyad desert castle listed as a UNESCO World Heritage Site 🏜️', food: 'القهوة العربية والتمر', foodEn: 'Arabic coffee and dates', season: 'winter' },
  hallabat: { name: 'قصر الحلابات', nameEn: 'Qasr Al-Hallabat', lat: 32.09, lng: 36.33, img: '/hallabat.png', desc: 'قصر صحراوي أموي بأعمدة أثرية وسط الصحراء الشرقية 🏛️', descEn: 'An Umayyad desert castle with ancient columns in the eastern desert 🏛️', food: 'القهوة العربية والتمر', foodEn: 'Arabic coffee and dates', season: 'winter' },
  shobak: { name: 'قلعة الشوبك', nameEn: 'Shobak Castle', lat: 30.53, lng: 35.56, img: '/shobak.png', desc: 'قلعة صليبية شامخة على قمة جبل بالجنوب الأردني 🏰', descEn: 'A towering Crusader castle atop a mountain in southern Jordan 🏰', food: 'المنسف الجبلي', foodEn: 'Mountain-style Mansaf', season: 'winter' },
  ummrasas: { name: 'أم الرصاص', nameEn: 'Umm ar-Rasas', lat: 31.50, lng: 35.92, img: '/ummrasas.png', desc: 'موقع أثري مدرج على قائمة اليونسكو يضم فسيفساء رائعة 🏛️', descEn: 'A UNESCO-listed archaeological site featuring stunning mosaics 🏛️', food: 'الفريكة والمنسف البدوي', foodEn: 'Freekeh and Bedouin Mansaf', season: 'winter' },
  birgish: { name: 'غابات برقش', nameEn: 'Birgish Forest', lat: 32.41, lng: 35.71, img: '/birgish.png', desc: 'غابات خضراء رائعة قرب إربد، وجهة مفضلة للتنزه والفرشة بالربيع 🌳', descEn: 'A beautiful green forest near Irbid, a favorite spring picnic destination 🌳', food: 'الفول والشاي بالنعناع', foodEn: 'Fava beans and mint tea', season: 'spring' },
  ummalnaml: { name: 'أم النمل', nameEn: 'Um Al-Naml', lat: 32.45, lng: 35.69, img: '/ummalnaml.png', desc: 'وادٍ طبيعي خلاب بتلاله الخضراء وتنوعه البيئي، من أجمل وجهات الربيع بشمال الأردن 🌸', descEn: "A stunning natural valley with green hills and rich biodiversity, one of northern Jordan's most beautiful spring spots 🌸", food: 'المقلوبة والعكوب', foodEn: 'Maqluba and Akkoub', season: 'spring' },
};

const summerKeys = ['ajloun', 'irbid', 'jerash', 'umqais', 'deadsea', 'shouna', 'salt', 'amman', 'ummjimal', 'pella', 'mujib', 'tafilah'];
const winterKeys = ['petra', 'wadirum', 'aqaba', 'madaba', 'karak', 'deisa', 'dana', 'mainhot', 'himma', 'azraqcastle', 'azraqwetland', 'qasramra', 'hallabat', 'shobak', 'ummrasas'];
const springKeys = ['birgish', 'ummalnaml'];

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(0);
}

function isHebrewText(text) {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

async function fetchNearbyServices(lat, lng) {
  const radius = 15000;
  const query = `[out:json];(node["amenity"="restaurant"](around:${radius},${lat},${lng});node["shop"="supermarket"](around:${radius},${lat},${lng});node["amenity"="fuel"](around:${radius},${lat},${lng});node["tourism"="hotel"](around:${radius},${lat},${lng}););out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.elements.filter(el => !isHebrewText(el.tags && el.tags.name));
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

function getArabicDateLabel(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[d.getDay()];
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
  return `${dayName} ${dateStr}`;
}

async function getWeatherInfo(lat, lng, dayOffset) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      temp: data.daily.temperature_2m_max[dayOffset],
      rain: data.daily.precipitation_sum[dayOffset],
    };
  } catch (e) {
    return null;
  }
}

async function getRahalResponse(question, userLocation, userPlaces) {
  const q = question.trim();

  const greetings = ['مرحبا', 'مرحباً', 'هاي', 'اهلا', 'أهلا', 'السلام عليكم'];
  if (greetings.some(g => q.includes(g)) && q.length < 15) {
    return 'أهلاً فيكي! 👋 أنا رحال، دليلك السياحي بالأردن. اسأليني عن أي منطقة أو نشاط أو الطقس!';
  }
  if (q.includes('شكرا') || q.includes('شكراً') || q.includes('تسلم')) {
    return 'العفو! 😊 دايماً موجود لمساعدتك، رحلة سعيدة!';
  }
  if (q.includes('مين انت') || q.includes('من انت') || q.includes('شو بتعمل') || q.includes('شو تقدر تعمل')) {
    return 'أنا رحال 🧭 دليلك السياحي الذكي بموقع رحلتي! بقدر أساعدك تلاقي أفضل الأماكن حسب الموسم، الطقس، نوع النشاط، أو حتى وين تروح بكرا 😊';
  }

  const distMatch = (q.includes('كم يبعد') || q.includes('كم بعد') || q.includes('قديش يبعد') || q.includes('المسافة'));
  if (distMatch) {
    const foundDistKey = Object.keys(places).find(k => q.includes(places[k].name));
    if (foundDistKey) {
      const amman = places.amman;
      const km = getDistance(amman.lat, amman.lng, places[foundDistKey].lat, places[foundDistKey].lng);
      return `${places[foundDistKey].name} تبعد حوالي ${km} كم عن عمّان 📏`;
    }
  }

  const foundKey = Object.keys(places).find(k => q.includes(places[k].name) || q.toLowerCase().includes(places[k].nameEn.toLowerCase()));
  if (foundKey) {
    const p = places[foundKey];
    return `${p.name}: ${p.desc}\n🍽️ يشتهر بـ: ${p.food}`;
  }

  if (userPlaces && userPlaces.length) {
    const foundUserPlace = userPlaces.find(p => q.includes(p.name));
    if (foundUserPlace) {
      return `${foundUserPlace.name} (أضافها أحد الزوار 👤): ${foundUserPlace.desc}`;
    }
  }

  const wantsTomorrow = q.includes('بكرا') || q.includes('غدا') || q.includes('غداً');
  const wantsToday = q.includes('اليوم') || q.includes('هلق') || q.includes('هلأ');
  const wantsWeekend = q.includes('ويكند') || q.includes('عطلة') || q.includes('نهاية الأسبوع') || q.includes('الجمعة') || q.includes('السبت');
  const asksWhereToGo = q.includes('وين') || q.includes('روح') || q.includes('نصح') || q.includes('اقترح') || q.includes('مناسب') || q.includes('رحلة') || q.includes('خطط') || q.includes('خطة') || q.includes('مكان اذهب') || q.includes('مكان أذهب');

  if ((wantsTomorrow || wantsToday || wantsWeekend) && asksWhereToGo) {
    const romantic = q.includes('خطيب') || q.includes('خطيبة') || q.includes('زوجي') || q.includes('زوجتي') || q.includes('رومانسي') || q.includes('حبيب');
    if (romantic) {
      return 'لجو رومانسي 💑 جربوا غروب الشمس بوادي رم 🌅، أو ليلة استرخاء بحمامات ماعين ♨️، أو نزهة عالبحر الميت وقت الغروب 🌊';
    }
    if (!userLocation) {
      return 'لازم تسمحيلي بالوصول لموقعك عشان أجيب حالة الطقس بالضبط 🌦️ (اضغطي "السماح" لو المتصفح طلب الإذن). بس بشكل عام: لو الجو حر روحي للبحر الميت أو العقبة للسباحة 🌊، ولو معتدل جربي وادي رم أو عجلون للتنزه والشواء 🍖، ولو بارد جربي حمامات ماعين أو الحمة ♨️';
    }
    const offset = (wantsTomorrow || wantsWeekend) ? 1 : 0;
    const weather = await getWeatherInfo(userLocation.lat, userLocation.lng, offset);
    const dateLabel = getArabicDateLabel(offset);
    if (!weather || weather.temp === undefined) {
      return `ما قدرت أجيب حالة الطقس ${dateLabel} حالياً 🌦️ حاولي مرة ثانية بعد شوي`;
    }
    const { temp, rain } = weather;
    if (rain && rain > 2) {
      return `الجو ${dateLabel} ممطر شوي ☔ بحسها فرصة حلوة للمناطق الأثرية أو حمامات ماعين ♨️ والحمة الأردنية`;
    }
    if (temp >= 30) {
      return `الجو ${dateLabel} حر (${Math.round(temp)}°) ☀️ مناسب جداً للسباحة، جربي البحر الميت 🌊، العقبة، أو محمية وادي الموجب`;
    }
    if (temp >= 20) {
      return `الجو ${dateLabel} معتدل ورائع (${Math.round(temp)}°) 🌤️ مناسب للتنزه والشواء (الزرب)، جربي وادي رم 🏜️، عجلون 🌲، أو غابات برقش للفرشة 🌳`;
    }
    return `الجو ${dateLabel} بارد شوي (${Math.round(temp)}°) ❄️ أنسب شي حمامات ماعين ♨️ أو الحمة الأردنية للدفا`;
  }

  if (q.includes('خطيب') || q.includes('خطيبة') || q.includes('زوجي') || q.includes('زوجتي') || q.includes('رومانسي') || q.includes('حبيب')) {
    return 'لأجواء رومانسية 💑: غروب الشمس بوادي رم 🌅، ليلة هادئة بحمامات ماعين ♨️، أو نزهة على البحر الميت وقت الغروب 🌊';
  }
  if (q.includes('اصحاب') || q.includes('أصحاب') || q.includه === undefined) {}
  if (q.includes('اصحاب') || q.includه === undefined) {}
  if (q.includes('اصحاب') || q.includes('أصحاب') || q.includes('شلة') || q.includes('مجموعة')) {
    return 'للخروجات مع الشلة 👥: وادي رم للتخييم الجماعي 🏜️، وادي الموجب للمغامرة 🏞️، أو غابات برقش للفرشة والشواء 🌳';
  }
  if (q.includes('لحالي') || q.includes('وحدي') || q.includه === undefined) {}
  if (q.includes('لحالي') || q.includes('وحدي')) {
    return 'للسفر لحالك بهدوء 🚶: محمية ضانا 🏔️، الطفيلة ⛰️، أو البتراء لتجربة تأملية';
  }
  if (q.includes('تصوير') || q.includه === undefined) {}
  if (q.includes('تصوير') || q.includes('انستقرام') || q.includes('صور حلوة')) {
    return 'أجمل أماكن للتصوير 📸: البتراء (الخزنة) 🏛️، وادي رم (غروب الشمس) 🌅، البحر الميت، وقلعة عجلون';
  }
  if (q.includes('مشي') || q.includه === undefined) {}
  if (q.includes('مشي') || q.includes('هايكنغ') || q.includes('مسار') || q.includes('مسارات')) {
    return 'مسارات مشي رائعة 🥾: محمية ضانا (مسار الوادي الكامل)، وادي الموجب (المسار المائي)، والبتراء (المسير الطويل للدير)';
  }
  if (q.includes('نجوم') || q.includه === undefined) {}
  if (q.includes('نجوم') || q.includes('تخييم ليلي') || q.includes('سماء')) {
    return 'أفضل مكان لمشاهدة النجوم ⭐ ليلاً: وادي رم 🏜️، بعيد عن أضواء المدن وسماءه صافية جداً بالليل';
  }
  if (q.includes('شلالات') || q.includه === undefined) {}
  if (q.includes('شلالات') || q.includes('شلال')) {
    return 'شلالات جميلة: حمامات ماعين ♨️ (شلالات ساخنة)، ووادي الموجب 🏞️ (مسارات مائية وشلالات)';
  }
  if (q.includes('طيور') || q.includه === undefined) {}
  if (q.includes('طيور') || q.includes('مراقبة الطيور')) {
    return 'لمراقبة الطيور 🦅: محمية الأزرق المائية 🦆، وجهة مهمة للطيور المهاجرة';
  }
  if (q.includes('ثلج') || q.includه === undefined) {}
  if (q.includes('ثلج') || q.includes('تلج')) {
    return 'عجلون من المناطق اللي ممكن يتساقط فيها الثلج شتاءً ❄️🌲 (حسب الموسم)';
  }
  if (q.includes('قلاع') || q.includه === undefined) {}
  if (q.includes('قلاع') || q.includes('قلعة') && !foundKey) {
    return 'قلاع تاريخية رائعة 🏰: الكرك، عجلون، الشوبك، وقلعة الأزرق - كل وحدة بطراز وقصة مختلفة';
  }
  if (q.includes('يونسكو') || q.includه === undefined) {}
  if (q.includes('يونسكو') || q.includes('تراث عالمي')) {
    return 'مواقع مسجلة على قائمة اليونسكو 🏛️: البتراء، أم الرصاص، قصر عمرة، والسلط';
  }
  if (q.includes('ازدحام') || q.includه === undefined) {}
  if (q.includes('ازدحام') || q.includes('مزدحم') || q.includes('بعيد عن الزحمة')) {
    return 'أماكن هادئة بعيدة عن الزحمة 🌿: محمية ضانا، الطفيلة، أم النمل، وغابات برقش';
  }
  if (q.includes('افضل وقت') || q.includه === undefined) {}
  if (q.includes('افضل وقت') || q.includes('أفضل وقت')) {
    return 'بشكل عام: الربيع 🌸 (آذار-أيار) والخريف أفضل وقت لمعظم المناطق (طقس معتدل)، الصيف مناسب للمناطق الجبلية الباردة، والشتاء مناسب للبتراء ووادي رم والعقبة (أدفأ) ☀️';
  }
  if (q.includes('ربيع')) {
    const names = springKeys.map(k => places[k].name).join('، ');
    return `بالربيع بقترح تزوري: ${names} 🌸 (أحسن وقت للفرشة والتنزه بالطبيعة)`;
  }
  if (q.includes('فرشة') || q.includes('فرش') || q.includes('عالارض') || q.includes('على الأرض') || q.includes('تنزه')) {
    return 'لفرشة عالطبيعة أفضل مكانين عنا: غابات برقش 🌳 وأم النمل 🌸 (وادي أخضر خلاب قرب إربد)، وكمان محمية ضانا للطبيعة الجبلية 🏔️';
  }
  if (q.includes('شتاء') || q.includes('شتوي') || q.includes('برد')) {
    const names = winterKeys.map(k => places[k].name).join('، ');
    return `بالشتاء بقترح تزوري: ${names} ❄️`;
  }
  if (q.includes('صيف') || q.includes('صيفي') || q.includes('حر')) {
    const names = summerKeys.map(k => places[k].name).join('، ');
    return `بالصيف بقترح تزوري: ${names} ☀️`;
  }
  if (q.includes('طبيعة') || q.includes('جبال') || q.includes('مناظر') || q.includes('خضرة') || q.includes('خضار') || q.includes('اخضر') || q.includes('أخضر')) {
    return 'أجمل مناطق الطبيعة والخضرة: محمية ضانا 🏔️، وادي الموجب 🏞️، غابات برقش وأم النمل 🌳، والديسة قرب العقبة';
  }
  if (q.includes('مغامرة') || q.includes('رياضة') || q.includes('سفاري')) {
    return 'للمغامرة: وادي رم 🏜️ (سفاري وتخييم)، وادي الموجب 🏞️ (مسارات مائية)، والبتراء للمشي الطويل 🥾';
  }
  if (q.includes('كنائس') || q.includes('دينية') || q.includes('فسيفساء') || q.includes('مقدسة')) {
    return 'مواقع دينية وتراثية: مادبا ⛪ (كنائس وفسيفساء)، وأم الرصاص 🏛️ (موقع يونسكو بفسيفساء رائعة)';
  }
  if (q.includes('تسوق') || q.includes('سوق') || q.includes('مولات')) {
    return 'للتسوق أفضل مكان هو عمّان 🛍️ (فيها أسواق تقليدية ومولات حديثة)';
  }
  if (q.includes('عائلة') || q.includes('اطفال') || q.includes('أطفال')) {
    return 'مناسب للعائلات: البحر الميت 🌊، حمامات ماعين ♨️، وعمّان (فيها أماكن ترفيهية للأطفال) 👨‍👩‍👧';
  }
  if (q.includes('هدوء') || q.includes('استجمام') || q.includes('استرخاء عام')) {
    return 'للهدوء والاستجمام: محمية ضانا 🏔️، الطفيلة ⛰️، أو الديسة 🏞️ - أماكن هادئة بعيدة عن الزحمة';
  }
  if (q.includes('غروب') || q.includes('شروق')) {
    return 'أجمل غروب تشوفيه بوادي رم 🌅 أو العقبة على شاطئ البحر الأحمر 🌇';
  }
  if (q.includes('رخيص') || q.includes('مجاني') || q.includes('بدون فلوس') || q.includes('اقتصادي')) {
    return 'أماكن كتير بدون رسوم دخول: غابات برقش 🌳، أم النمل 🌸، وأغلب المدن زي عمّان وإربد والسلط 🏘️';
  }
  if (q.includes('اكل') || q.includes('أكل') || q.includes('طعام') || q.includes('طبخ') || q.includes('مطاعم')) {
    return 'كل منطقة بالموقع فيها معلومة عن أشهر أكلة فيها 🍽️ قوليلي اسم منطقة محددة وبقلك شو يشتهروا فيها';
  }
  if (q.includes('تخييم') || q.includes('خيمة')) {
    return 'أفضل أماكن للتخييم: وادي رم 🏜️ (تجربة صحراوية لا تُنسى)، أو الديسة قرب العقبة 🏔️';
  }
  if (q.includes('بحر') || q.includes('سباحة') || q.includes('عوم')) {
    return 'للسباحة أو الاسترخاء بالماء: البحر الميت 🌊 (يطفو الجسم لوحده)، أو العقبة والبحر الأحمر للغطس 🐠';
  }
  if (q.includes('اثري') || q.includes('أثري') || q.includes('تاريخ') || q.includes('روماني')) {
    return 'مواقع أثرية رائعة: البتراء 🏛️ (عجائب الدنيا السبع)، جرش، أم قيس، بيلا، أم الرصاص، وقصر عمرة';
  }
  if (q.includes('بدوي') || q.includes('صحراء')) {
    return 'التجربة البدوية الأصيلة تلاقيها بوادي رم 🏜️ والديسة، مع الزرب والشاي البدوي';
  }
  if (q.includes('علاج') || q.includes('صحة')) {
    return 'للعلاج والاسترخاء: حمامات ماعين ♨️، الحمة الأردنية ♨️، أو طمي البحر الميت العلاجي 🌊';
  }
  if (q.includes('عمان') || q.includes('عمّان')) {
    return 'عمّان: عاصمة المملكة، فيها جبل القلعة والمدرج الروماني ووسط البلد النابض بالحياة 🏛️';
  }

  return 'ما قدرت ألاقي جواب دقيق لسؤالك 🤔 جربي تسأليني عن: اسم منطقة، الموسم، الأكل، الطبيعة، الآثار، السباحة، المغامرة، التصوير، القلاع، أو "وين أروح بكرا" وبجاوبك حسب الطقس 😊';
}

function StarRating({ placeKey, ratings, setRatings, user }) {
  const ratingData = ratings[placeKey] || { avg: 0, count: 0 };
  const avg = ratingData.avg || 0;
  const count = ratingData.count || 0;

  const handleRate = async (star) => {
    if (!user) return alert('سجل دخول أولاً لتقييم المنطقة');
    try {
      const ref = doc(db, 'ratings', placeKey);
      const snap = await getDoc(ref);
      let newAvg = star;
      let newCount = 1;
      if (snap.exists()) {
        const old = snap.data();
        newCount = (old.count || 0) + 1;
        newAvg = ((old.avg || 0) * (old.count || 0) + star) / newCount;
      }
      await setDoc(ref, { avg: newAvg, count: newCount });
      setRatings({ ...ratings, [placeKey]: { avg: newAvg, count: newCount } });
    } catch (e) {}
  };

  return (
    <div className="star-rating">
      {[1,2,3,4,5].map(star => (
        <span key={star} onClick={() => handleRate(star)} style={{ cursor:'pointer', fontSize:'1.5rem', color: star <= Math.round(avg) ? '#ffb703' : '#ccc' }}>★</span>
      ))}
      {count > 0 && <span style={{ fontSize:'0.9rem', color:'#555' }}> ({avg.toFixed(1)}/5 | {count} تقييم)</span>}
    </div>
  );
}

function AddPlaceForm({ user, onAdd }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [season, setSeason] = useState('summer');
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [show, setShow] = useState(false);

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rihlati_upload');
    const res = await fetch('https://api.cloudinary.com/v1_1/dohsowqbg/image/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setImgUrl(data.secure_url);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!name || !desc || !imgUrl) return alert('يرجى ملء كل الحقول وتحميل صورة');
    const newPlace = {
      name, desc, season, img: imgUrl,
      addedBy: user.displayName,
      addedAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'userPlaces'), newPlace);
    onAdd(newPlace);
    setName(''); setDesc(''); setImgUrl(''); setShow(false);
  };

  if (!show) return (
    <button className="add-place-btn" onClick={() => setShow(true)}>➕ أضف منطقة جديدة</button>
  );

  return (
    <div className="add-place-form">
      <h3>➕ أضف منطقة جديدة</h3>
      <input placeholder="اسم المنطقة" value={name} onChange={e => setName(e.target.value)} className="form-input" />
      <textarea placeholder="وصف المنطقة" value={desc} onChange={e => setDesc(e.target.value)} className="form-input" rows={3} />
      <select value={season} onChange={e => setSeason(e.target.value)} className="form-input">
        <option value="summer">☀️ صيف</option>
        <option value="winter">❄️ شتاء</option>
        <option value="spring">🌸 ربيع</option>
      </select>
      <label className="upload-btn">
        📸 ارفع صورة
        <input type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
      </label>
      {uploading && <p>⏳ جاري رفع الصورة...</p>}
      {imgUrl && <img src={imgUrl} alt="معاينة" style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} />}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={handleSubmit} className="submit-btn">✅ إضافة</button>
        <button onClick={() => setShow(false)} className="cancel-btn">❌ إلغاء</button>
      </div>
    </div>
  );
}

function RahalChatbot({ userLocation, userPlaces }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ from: 'bot', text: 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟' }]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || loading) return;
    const question = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: question }]);
    setLoading(true);
    const replyText = await getRahalResponse(question, userLocation, userPlaces);
    setChatMessages(prev => [...prev, { from: 'bot', text: replyText }]);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, insetInlineEnd: 20, zIndex: 1000, direction: 'rtl' }}>
      {chatOpen && (
        <div style={{ width: 'min(380px, 90vw)', height: 'min(560px, 75vh)', background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ background: '#b8860b', color: '#fff', padding: '14px 16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!avatarError && (
                <img src="/rahal.png" alt="رحال" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '2px solid #fff' }} onError={() => setAvatarError(true)} />
              )}
              رحال
            </span>
            <span style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setChatOpen(false)}>✕</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#faf6ec' }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ textAlign: m.from === 'bot' ? 'right' : 'left', margin: '10px 0' }}>
                <span style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: m.from === 'bot' ? '#f1e2b3' : '#e0e0e0', fontSize: '0.9rem', whiteSpace: 'pre-line', maxWidth: '85%' }}>{m.text}</span>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'right', margin: '10px 0' }}>
                <span style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: '#f1e2b3', fontSize: '0.9rem' }}>⏳ جاري التفكير...</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
              placeholder="اسأل رحال..."
              style={{ flex: 1, border: 'none', padding: 12, fontSize: '0.9rem', outline: 'none' }}
            />
            <button onClick={sendChatMessage} style={{ border: 'none', background: '#b8860b', color: '#fff', padding: '0 18px', cursor: 'pointer', fontSize: '1.1rem' }}>➤</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{ width: 66, height: 66, borderRadius: '50%', background: avatarError ? '#b8860b' : 'transparent', border: '3px solid #b8860b', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#fff' }}
        aria-label="رحال"
      >
        {avatarError ? '🧭' : (
          <img src="/rahal.png" alt="رحال" width="66" height="66" style={{ display: 'block', width: '66px', height: '66px', objectFit: 'cover', objectPosition: 'top center', borderRadius: '50%' }} onError={() => setAvatarError(true)} />
        )}
      </button>
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
  const [userPlaces, setUserPlaces] = useState([]);

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
          if (docSnap.exists()) newRatings[key] = docSnap.data();
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
    const loadUserPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userPlaces'));
        setUserPlaces(snapshot.docs.map(d => d.data()));
      } catch (e) {}
    };
    loadRatings();
    loadPhotos();
    loadUserPlaces();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handlePhotoUpload = async (placeKey, url) => {
    try {
      await setDoc(doc(db, 'photos', placeKey), { urls: arrayUnion(url) }, { merge: true });
      setPlacePhotos(prev => ({ ...prev, [placeKey]: [...(prev[placeKey] || []), url] }));
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

  const renderPlace = (key, place, isUserPlace = false) => {
    const placeName = isUserPlace ? place.name : (lang === 'ar' ? place.name : place.nameEn);
    const placeDesc = isUserPlace ? place.desc : (lang === 'ar' ? place.desc : place.descEn);
    const placeFood = isUserPlace ? null : (lang === 'ar' ? place.food : place.foodEn);
    const photos = placePhotos[key] || [];

    return (
      <div className="place-card" key={key}>
        <h3>{placeName}</h3>
        {isUserPlace && <span className="user-badge">👤 {place.addedBy}</span>}
        <img src={place.img} alt={placeName} />
        {place.lat && userLocation && (
          <p>📍 {t.distance} {getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} {t.fromLocation}</p>
        )}
        <p>{placeDesc}</p>
        {placeFood && <p className="food-line">🍽️ {lang === 'ar' ? 'يشتهر بـ:' : 'Famous for:'} {placeFood}</p>}
        {!isUserPlace && <StarRating placeKey={key} ratings={ratings} setRatings={setRatings} user={user} />}
        {place.lat && (
          <>
            <button onClick={() => openMap(place)}>{t.map}</button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`} target="_blank" rel="noopener noreferrer" className="directions-btn">{t.directions}</a>
          </>
        )}
        {!isUserPlace && (
          <>
            <button onClick={() => toggleDetails(key)}>{t.services}</button>
            {openPlace === key && (
              <div className="services">
                {loadingServices ? <p>{t.loading}</p>
                  : services.length > 0 ? services.map((s, i) => <p key={i}>{getServiceIcon(s.tags)} {s.tags.name}</p>)
                  : <p>{t.noServices}</p>}
              </div>
            )}
          </>
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
        {user && !isUserPlace && <ImageUpload placeKey={key} onUpload={handlePhotoUpload} />}
        {!user && !isUserPlace && <p className="login-hint">{t.loginHint}</p>}
      </div>
    );
  };

  const userSummerPlaces = userPlaces.filter(p => p.season === 'summer');
  const userWinterPlaces = userPlaces.filter(p => p.season === 'winter');
  const userSpringPlaces = userPlaces.filter(p => p.season === 'spring');

  return (
    <div className="App" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="navbar">
        <h1>{t.title}</h1>
        <div className="navbar-right">
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

      {!searchQuery && season === '' && <p className="welcome-msg">{t.welcome}</p>}

      {!searchQuery && (
        <>
          <button onClick={() => setSeason('summer')}>{t.summer}</button>
          <button onClick={() => setSeason('winter')}>{t.winter}</button>
          <button onClick={() => setSeason('spring')}>{t.spring}</button>
        </>
      )}

      {user && season === '' && !searchQuery && (
        <div style={{ margin: '15px auto', maxWidth: '600px' }}>
          <AddPlaceForm user={user} onAdd={(p) => setUserPlaces(prev => [...prev, p])} />
        </div>
      )}
      {!user && season === '' && !searchQuery && (
        <p className="login-hint" style={{ margin: '10px 0' }}>🔑 سجل دخول لإضافة منطقة جديدة</p>
      )}

      {season !== '' && !searchQuery && <button className="home-btn" onClick={goHome}>{t.home}</button>}

      {searchQuery && (
        <div className="places-grid">
          {Object.keys(places)
            .filter(key => places[key].name.includes(searchQuery) || places[key].nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(key => renderPlace(key, places[key]))}
        </div>
      )}

      {selectedPlace && (
        <div className="map-container">
          <h2>📍 {lang === 'ar' ? selectedPlace.name : (selectedPlace.nameEn || selectedPlace.name)}</h2>
          <div className="map-legend">
            <span>🔴 {t.restaurants}</span>
            <span>🟢 {t.markets}</span>
            <span>🔵 {t.fuel}</span>
            <span>🟠 {t.hotels}</span>
          </div>
          <MapContainer center={[selectedPlace.lat, selectedPlace.lng]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '15px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
              <Popup>{lang === 'ar' ? selectedPlace.name : (selectedPlace.nameEn || selectedPlace.name)}</Popup>
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
          <div className="places-grid">{summerKeys.map(key => renderPlace(key, places[key]))}</div>
          {userSummerPlaces.length > 0 && (
            <div>
              <h2>🌟 مناطق أضافها الزوار</h2>
              <div className="places-grid">{userSummerPlaces.map((p, i) => renderPlace(`user-summer-${i}`, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {season === 'winter' && !selectedPlace && !searchQuery && (
        <div>
          <h2>{t.winterRegions}</h2>
          <div className="places-grid">{winterKeys.map(key => renderPlace(key, places[key]))}</div>
          {userWinterPlaces.length > 0 && (
            <div>
              <h2>🌟 مناطق أضافها الزوار</h2>
              <div className="places-grid">{userWinterPlaces.map((p, i) => renderPlace(`user-winter-${i}`, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {season === 'spring' && !selectedPlace && !searchQuery && (
        <div>
          <h2>{t.springRegions}</h2>
          <div className="places-grid">{springKeys.map(key => renderPlace(key, places[key]))}</div>
          {userSpringPlaces.length > 0 && (
            <div>
              <h2>🌟 مناطق أضافها الزوار</h2>
              <div className="places-grid">{userSpringPlaces.map((p, i) => renderPlace(`user-spring-${i}`, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {lightboxImg && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <img src={lightboxImg} alt="مكبرة" />
        </div>
      )}

      <RahalChatbot userLocation={userLocation} userPlaces={userPlaces} />
    </div>
  );
}

export default App;
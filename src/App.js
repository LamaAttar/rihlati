import './App.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { db } from './firebase';
import { auth, signInWithGoogle, logOut } from './Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, increment, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import L from 'leaflet';
import ImageUpload from './ImageUpload';
import translations from './translations';

const places = {
  ajloun: { name: 'عجلون', nameEn: 'Ajloun', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', descEn: 'A historic castle amid green forests with moderate summer weather 🌲', food: 'المقلوبة والمنسف', foodEn: 'Maqluba and Mansaf', season: 'summer' },
  irbid: { name: 'إربد', nameEn: 'Irbid', lat: 32.56, lng: 35.85, img: '/irbid.png', desc: 'مدينة العلم والثقافة بشمال الأردن، أجواء معتدلة ومعالم تاريخية عريقة 🎓', descEn: 'The city of knowledge and culture in northern Jordan, with a moderate climate and rich historical landmarks 🎓', food: 'المكمورة', foodEn: 'Makmoura (traditional northern Jordanian dish)', season: 'summer' },
  amman: { name: 'عمّان', nameEn: 'Amman', lat: 31.95, lng: 35.93, img: '/amman.png', desc: 'عاصمة المملكة النابضة بالحياة، تجمع بين التاريخ الروماني وحيوية المدينة الحديثة 🏛️', descEn: 'The vibrant capital of the Kingdom, blending Roman history with modern city life 🏛️', food: 'المنسف والكنافة', foodEn: 'Mansaf and Knafeh', season: 'summer' },
  jerash: { name: 'جرش', nameEn: 'Jerash', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', descEn: 'An ancient Roman city, one of the most important historical sites in Jordan 🏛️', food: 'المسخن والمنسف', foodEn: 'Musakhan and Mansaf', season: 'summer' },
  umqais: { name: 'أم قيس', nameEn: 'Um Qais', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', descEn: 'Roman ruins overlooking the Sea of Galilee and the Golan Heights 🏛️', food: 'المسخن وزيت الزيتون البلدي', foodEn: 'Musakhan and local olive oil', season: 'summer' },
  deadsea: { name: 'البحر الميت', nameEn: 'Dead Sea', lat: 31.70, lng: 35.60, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', descEn: 'The lowest point on Earth with healing salt water and therapeutic mud 🌊', food: 'التمر ومنتجات الطمي الطبيعية', foodEn: 'Dates and natural Dead Sea mud products', season: 'summer' },
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

const placeMeta = {
  ajloun: { budget: 'under20', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  irbid: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: '2h' },
  amman: { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'full' },
  jerash: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  umqais: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  deadsea: { budget: 'open', companions: ['alone', 'family', 'friends', 'kids'], duration: 'full' },
  shouna: { budget: 'free', companions: ['alone', 'family'], duration: '2h' },
  salt: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: 'half' },
  ummjimal: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  pella: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  mujib: { budget: 'open', companions: ['alone', 'friends'], duration: 'full' },
  tafilah: { budget: 'free', companions: ['alone', 'family'], duration: '2h' },
  petra: { budget: 'open', companions: ['alone', 'family', 'friends'], duration: 'full' },
  wadirum: { budget: 'open', companions: ['alone', 'family', 'friends'], duration: 'full' },
  aqaba: { budget: 'open', companions: ['alone', 'family', 'friends', 'kids'], duration: 'full' },
  madaba: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  karak: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  deisa: { budget: 'free', companions: ['alone', 'friends'], duration: 'full' },
  dana: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'full' },
  mainhot: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  himma: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  azraqcastle: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: '2h' },
  azraqwetland: { budget: 'under20', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  qasramra: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: '2h' },
  hallabat: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: '2h' },
  shobak: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  ummrasas: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'half' },
  birgish: { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  ummalnaml: { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
};

function durationLabel(d) {
  if (d === '2h') return 'ساعتين تقريباً';
  if (d === 'half') return 'نص يوم';
  return 'يوم كامل';
}

// ============================================================
// نظام بناء الرحلات الذكي المحلي — بدون أي AI خارجي
// بيحلل وصف المستخدم الحر ويبني جدول رحلة كامل من بيانات
// الأماكن الموجودة أصلاً بالتطبيق (places + userPlaces)
// ============================================================

function extractDaysCount(text) {
  const match = text.match(/(\d+)\s*(يوم|أيام|ايام)/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 10) return n;
  }
  return 2; // افتراضي لو ما ذكر عدد الأيام
}

function extractBudgetNumber(text) {
  const match = text.match(/(\d+)\s*(دينار|دنانير)/);
  if (match) return parseInt(match[1], 10);
  return null;
}

// بيدور بالأماكن الرسمية وبالأماكن يلي أضافها الزوار مع بعض
function extractMentionedPlaces(text, userPlaces) {
  const officialMatches = Object.keys(places)
    .filter((key) => text.includes(places[key].name))
    .map((key) => ({ key, place: places[key], isUserPlace: false }));

  const userMatches = (userPlaces || [])
    .filter((p) => p.name && text.includes(p.name))
    .map((p) => ({ key: p.id, place: p, isUserPlace: true }));

  return [...officialMatches, ...userMatches];
}

function budgetRangeForCategory(category) {
  if (category === 'free') return '5-10 دينار (أكل ومصاريف بسيطة فقط)';
  if (category === 'under20') return '15-25 دينار';
  return '30-50 دينار';
}

// ===== أنشطة محددة وحقيقية لكل منطقة — مش وصف عام بس =====
const PLACE_ACTIVITIES = {
  petra: [
    { name: 'زيارة الخزنة (Treasury)', description: 'المعلم الأشهر بالبتراء، أول ما تشوفيه بعد المشي بالسيق الضيق', durationHint: 'ساعة إلى ساعتين' },
    { name: 'المشي لدير البتراء (900 درجة)', description: 'مسير يستاهل التعب، إطلالة رائعة من فوق', durationHint: 'ساعتين إلى ثلاثة' },
    { name: 'استكشاف المدافن الملكية', description: 'نقوش وواجهات صخرية مذهلة بألوان طبيعية رائعة', durationHint: 'ساعة تقريباً' },
  ],
  wadirum: [
    { name: 'جولة سفاري بسيارات الدفع الرباعي', description: 'استكشاف الوادي والكثبان الرملية والصخور الشهيرة', durationHint: 'ساعتين تقريباً' },
    { name: 'تسلق الكثبان الرملية ومشاهدة الغروب', description: 'تجربة لا تُنسى وقت غروب الشمس بألوانها الذهبية', durationHint: 'ساعة تقريباً', idealTime: '05:30 مساءً' },
    { name: 'ركوب الجمال بالصحراء', description: 'تجربة بدوية أصيلة وسط الرمال', durationHint: 'ساعة تقريباً', suitableFor: ['family', 'kids', 'alone'] },
  ],
  aqaba: [
    { name: 'الغطس أو السنوركل بالشعاب المرجانية', description: 'بحر أحمر بألوان وحياة بحرية خلابة', durationHint: 'ساعتين تقريباً', suitableFor: ['friends', 'alone'] },
    { name: 'نزهة على كورنيش العقبة', description: 'إطلالة على البحر الأحمر وأجواء المدينة الساحلية', durationHint: 'ساعة تقريباً' },
    { name: 'زيارة القلعة المملوكية', description: 'معلم تاريخي بوسط المدينة يستاهل زيارة سريعة', durationHint: 'نص ساعة' },
  ],
  deadsea: [
    { name: 'طفو بمياه البحر الميت', description: 'تجربة فريدة عالمياً — جسمك بيطفو لحاله', durationHint: 'ساعة تقريباً' },
    { name: 'تجربة طمي البحر الميت العلاجي', description: 'طمي طبيعي مفيد للبشرة، مأخوذ من نفس المنطقة', durationHint: 'نص ساعة' },
    { name: 'مشاهدة الغروب على البحر الميت', description: 'مناظر خلابة وقت الغروب فوق المياه', durationHint: 'نص ساعة', idealTime: '05:30 مساءً' },
  ],
  jerash: [
    { name: 'جولة بالمدرج الروماني الجنوبي', description: 'آثار رومانية محفوظة بعناية كبيرة', durationHint: 'ساعة تقريباً' },
    { name: 'المشي بشارع الأعمدة (Cardo)', description: 'قلب المدينة الأثرية القديمة', durationHint: 'ساعة تقريباً' },
    { name: 'زيارة معبد أرتميس', description: 'من أهم وأعرق المعابد بالموقع الأثري', durationHint: 'نص ساعة' },
  ],
  ajloun: [
    { name: 'زيارة قلعة عجلون', description: 'قلعة تاريخية بإطلالة رائعة على المنطقة المحيطة', durationHint: 'ساعة تقريباً' },
    { name: 'مسير بغابات عجلون', description: 'طبيعة خضراء وأجواء منعشة، خصوصاً بالربيع والصيف', durationHint: 'ساعتين تقريباً' },
  ],
  madaba: [
    { name: 'زيارة كنيسة الخريطة الفسيفسائية', description: 'أشهر معلم بمادبا، خريطة فسيفساء تاريخية نادرة', durationHint: 'نص ساعة' },
    { name: 'جولة بمتحف الفسيفساء الأردني', description: 'فن الفسيفساء التاريخي بتفاصيل رائعة', durationHint: 'ساعة تقريباً' },
  ],
  karak: [
    { name: 'استكشاف قلعة الكرك الصليبية', description: 'قلعة ضخمة بإطلالة مذهلة على البحر الميت', durationHint: 'ساعتين تقريباً' },
  ],
  dana: [
    { name: 'مسير الوادي الكامل بمحمية ضانا', description: 'طبيعة جبلية خلابة وتنوع بيئي مميز', durationHint: 'نص يوم' },
    { name: 'مراقبة الطيور والحياة البرية', description: 'فرصة لمشاهدة كائنات نادرة بموطنها الطبيعي', durationHint: 'ساعة تقريباً' },
  ],
  mainhot: [
    { name: 'الاستحمام بالشلالات الساخنة', description: 'تجربة علاجية واسترخائية وسط الطبيعة', durationHint: 'ساعة تقريباً' },
  ],
  azraqwetland: [
    { name: 'مراقبة الطيور المهاجرة', description: 'محمية مائية فريدة وسط الصحراء الشرقية', durationHint: 'ساعة تقريباً' },
  ],
  amman: [
    { name: 'زيارة جبل القلعة والمدرج الروماني', description: 'قلب عمّان التاريخي بإطلالة بانورامية على المدينة', durationHint: 'ساعتين تقريباً' },
    { name: 'التجول بوسط البلد', description: 'أسواق تقليدية وأجواء حيوية أصيلة', durationHint: 'ساعة تقريباً' },
  ],
};

// بيرجع أنشطة محددة للمكان لو موجودة، وإلا بيستخدم الوصف العام كـ fallback
function getPlaceActivities(key, place) {
  if (PLACE_ACTIVITIES[key]) return PLACE_ACTIVITIES[key];
  return [{ name: place.name, description: place.desc, durationHint: 'حسب رغبتك' }];
}

// بيكتشف نوع الرفقة من نص المستخدم عشان نختار أنشطة مناسبة
function detectCompanionType(text) {
  const familyWords = ['عائلة', 'عائلتي', 'اهلي', 'أهلي', 'اطفال', 'أطفال', 'ولادي', 'اولادي'];
  const friendsWords = ['اصحاب', 'أصحاب', 'شباب', 'شلة', 'صحابي', 'رفقة', 'رفاق'];
  const aloneWords = ['لحالي', 'وحدي', 'لوحدي'];
  if (familyWords.some((w) => text.includes(w))) return 'family';
  if (friendsWords.some((w) => text.includes(w))) return 'friends';
  if (aloneWords.some((w) => text.includes(w))) return 'alone';
  return null;
}

// بيرجع أنشطة مناسبة للرفقة تحديداً — لو نشاط ماله علامة suitableFor، معناها مناسب للكل
function filterActivitiesByCompanion(activities, companionType) {
  if (!companionType) return activities;
  const filtered = activities.filter((act) => !act.suitableFor || act.suitableFor.includes(companionType));
  return filtered.length > 0 ? filtered : activities; // احتياط: لو ما ضل شي، رجعي القائمة الأصلية
}

// أماكن قريبة بديلة — تُستخدم لما الرحلة كذا يوم بنفس المكان، عشان نتفادى التكرار
const NEARBY_PLACES = {
  petra: ['wadirum'],
  wadirum: ['petra', 'aqaba'],
  aqaba: ['wadirum'],
  deadsea: ['madaba', 'mainhot'],
  madaba: ['deadsea', 'mainhot'],
  mainhot: ['madaba'],
  jerash: ['ajloun', 'amman'],
  ajloun: ['jerash'],
  amman: ['jerash', 'madaba'],
  karak: ['dana'],
  dana: ['karak'],
  azraqwetland: ['amman'],
};

function buildLocalTripPlan(userText, userPlaces) {
  const days = extractDaysCount(userText);
  const userBudget = extractBudgetNumber(userText);
  const mentioned = extractMentionedPlaces(userText, userPlaces);
  const companionType = detectCompanionType(userText);

  // لو المستخدم ذكر أماكن معينة (رسمية أو أضافها زوار)، نستخدمها.
  // غير هيك، منختار مجموعة مميزة افتراضية من الأماكن الرسمية
  const defaultHighlights = ['petra', 'wadirum', 'aqaba', 'deadsea', 'jerash', 'ajloun', 'madaba'].map(
    (key) => ({ key, place: places[key], isUserPlace: false })
  );
  let pool = mentioned.length > 0 ? mentioned : defaultHighlights;

  // لو المستخدم ذكر مكان واحد بس وطلب كذا يوم، منضيف أماكن قريبة
  // للأيام التالية عشان نتفادى تكرار نفس البرنامج كل يوم
  if (pool.length === 1 && days > 1 && !pool[0].isUserPlace) {
    const nearbyKeys = NEARBY_PLACES[pool[0].key] || [];
    const nearbyEntries = nearbyKeys.map((k) => ({ key: k, place: places[k], isUserPlace: false }));
    pool = [pool[0], ...nearbyEntries];
  }

  const dayEntries = [];
  for (let i = 0; i < days; i++) {
    dayEntries.push(pool[i % pool.length]);
  }

  const tripDays = dayEntries.map((entry, index) => {
    const { key, place, isUserPlace } = entry;
    const meta = isUserPlace ? DEFAULT_PLACE_META : getPlaceMeta(key);
    const stops = [];

    stops.push({
      time: '08:00 صباحاً',
      type: 'فطور',
      place: `مطعم محلي بالقرب من ${place.name}`,
      description: 'فطور شعبي بسيط (فول، حمص، مناقيش) قبل بدء اليوم',
      durationHint: 'نص ساعة تقريباً',
    });

    // عدد الأنشطة حسب مدة الزيارة المتوقعة للمكان
    const activityCount = meta.duration === 'full' ? 3 : meta.duration === 'half' ? 2 : 1;
    const rawActivities = isUserPlace
      ? [{ name: place.name, description: place.desc, durationHint: durationLabel(meta.duration) }]
      : filterActivitiesByCompanion(getPlaceActivities(key, place), companionType);
    const activities = rawActivities.slice(0, activityCount);

    // الأنشطة يلي إلها وقت مثالي محدد (زي الغروب) منحطها بمكانها الصح،
    // والباقي منوزعهم صباحاً قبل الغدا
    const eveningActivities = activities.filter((a) => a.idealTime);
    const regularActivities = activities.filter((a) => !a.idealTime);

    const beforeLunch = regularActivities.slice(0, Math.min(2, regularActivities.length));
    const afterLunch = regularActivities.slice(2);
    const morningTimes = ['09:30 صباحاً', '11:30 صباحاً'];

    beforeLunch.forEach((act, i) => {
      stops.push({
        time: morningTimes[i] || '10:30 صباحاً',
        type: 'نشاط',
        place: act.name + (isUserPlace ? ' 🌟 (اكتشفها زائر تاني)' : ''),
        description: act.description,
        durationHint: act.durationHint,
      });
    });

    stops.push({
      time: '01:30 ظهراً',
      type: 'غدا',
      place: place.food ? `مطعم يقدم ${place.food}` : 'مطعم محلي قريب',
      description: place.food
        ? `تجربة أكلة ${place.food} المشهورة بمنطقة ${place.name}`
        : `أكل محلي بمنطقة ${place.name}`,
      durationHint: 'ساعة تقريباً',
    });

    afterLunch.forEach((act) => {
      stops.push({
        time: '03:00 مساءً',
        type: 'نشاط',
        place: act.name,
        description: act.description,
        durationHint: act.durationHint,
      });
    });

    eveningActivities.forEach((act) => {
      stops.push({
        time: act.idealTime,
        type: 'نشاط',
        place: act.name,
        description: act.description,
        durationHint: act.durationHint,
      });
    });

    return {
      dayNumber: index + 1,
      title: `يوم في ${place.name}`,
      estimatedBudget: budgetRangeForCategory(meta.budget),
      stops,
    };
  });

  const placeNames = [...new Set(dayEntries.map((e) => e.place.name))];
  const title = `رحلة ${days} ${days === 1 ? 'يوم' : 'أيام'}: ${placeNames.join('، ')}`;

  const tips = [
    'احملي معك ماء كافي، خصوصاً لو الرحلة بمناطق صحراوية أو بالصيف',
    'خذي كاش معك — مو كل الأماكن الصغيرة عندها إمكانية دفع إلكتروني',
    'احجزي أماكن الإقامة مسبقاً لو الرحلة بموسم الذروة (الصيف أو الأعياد)',
  ];

  if (userBudget) {
    const totalEstimateLow = days * 10;
    const totalEstimateHigh = days * 40;
    if (userBudget < totalEstimateLow) {
      tips.push(
        `ميزانيتك (${userBudget} دينار) أقل من المتوقع لهاي الرحلة — ركزي على الأماكن المجانية والأكل البسيط`
      );
    } else if (userBudget > totalEstimateHigh) {
      tips.push(`ميزانيتك (${userBudget} دينار) مريحة جداً لهاي الرحلة، فيكي تضيفي أنشطة إضافية أو إقامة أفخم`);
    }
  }

  return { title, totalDays: days, days: tripDays, tips };
}

const DEFAULT_PLACE_META = { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' };

function getPlaceMeta(key) {
  return placeMeta[key] || DEFAULT_PLACE_META;
}

function scoreTripPlace(place, key, prefs) {
  const meta = getPlaceMeta(key);
  let score = 0;
  if (place.season === prefs.season) score += 3;
  if (meta.companions && meta.companions.includes(prefs.companion)) score += 2;
  if (meta.budget) {
    if (prefs.budget === 'free' && meta.budget === 'free') score += 2;
    else if (prefs.budget === 'under20' && (meta.budget === 'free' || meta.budget === 'under20')) score += 2;
    else if (prefs.budget === 'open') score += 1;
  }
  if (meta.duration) {
    const rank = { '2h': 1, half: 2, full: 3 };
    if (rank[meta.duration] <= rank[prefs.time]) score += 2;
  }
  return score;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(0);
}

function getLevelInfo(points) {
  if (points > 300) return { label: 'خبير سياحة', icon: '🥇' };
  if (points >= 101) return { label: 'رحالة', icon: '🥈' };
  return { label: 'مستكشف مبتدئ', icon: '🥉' };
}

function isHebrewText(text) {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

async function fetchNearbyRestaurants(lat, lng) {
  const radius = 15000;
  const query = `[out:json];node["amenity"="restaurant"](around:${radius},${lat},${lng});out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.elements.filter(el => !isHebrewText(el.tags && el.tags.name) && el.tags && el.tags.name);
}

async function fetchNearbySupportServices(lat, lng) {
  const radius = 15000;
  const query = `[out:json];(node["amenity"="fuel"](around:${radius},${lat},${lng});node["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng});node["shop"="supermarket"](around:${radius},${lat},${lng});node["amenity"="bank"](around:${radius},${lat},${lng}););out body;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.elements.filter(el => !isHebrewText(el.tags && el.tags.name) && el.tags && el.tags.name);
}

function getServiceIcon(tags) {
  if (tags.amenity === 'restaurant') return '🍽️';
  if (tags.shop === 'supermarket') return '🛒';
  if (tags.amenity === 'fuel') return '⛽';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return '🏥';
  if (tags.amenity === 'bank') return '🏦';
  return '📍';
}

function getMarkerColor(tags) {
  if (tags.amenity === 'restaurant') return 'red';
  if (tags.shop === 'supermarket') return 'green';
  if (tags.amenity === 'fuel') return 'blue';
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'purple';
  if (tags.amenity === 'bank') return 'orange';
  return 'gray';
}

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.5)"></div>`,
    iconSize: [12, 12],
  });
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
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

function isFriendsQuery(q) {
  const friendWords = ['اصحاب', 'أصحاب', 'صاحب', 'صاحبي', 'صاحبتي', 'صديق', 'صديقتي', 'اصدقاء', 'أصدقاء', 'رفقة', 'رفاق', 'شلة', 'شلتي', 'جماعة', 'فريق', 'زملاء', 'جروب', 'شباب', 'شب', 'بنات', 'ولاد', 'friends'];
  const funWords = ['اتسلى', 'أتسلى', 'نتسلى', 'تسلية', 'استمتاع', 'نتفسح', 'فسحة', 'خرجة', 'نطلع', 'طلعة'];
  return friendWords.some(w => q.includes(w)) || funWords.some(w => q.includes(w));
}

const KEYWORD_SYNONYMS = {
  'مطعم': ['مطعم', 'مطاعم', 'restaurant', 'restaurants', 'food', 'eat', 'اكل', 'أكل', 'طعام'],
  'قريب': ['قريب', 'قريبة', 'قريبين', 'near', 'nearby', 'close by'],
  'صيف': ['صيف', 'صيفي', 'صيفية', 'summer'],
  'شتاء': ['شتاء', 'شتوي', 'شتوية', 'winter'],
  'ربيع': ['ربيع', 'ربيعي', 'spring'],
  'طقس': ['طقس', 'weather', 'حرارة', 'درجة الحرارة', 'temperature'],
  'بحر': ['بحر', 'sea', 'سباحة', 'swim', 'swimming', 'beach'],
  'جبال': ['جبال', 'جبل', 'mountain', 'mountains'],
  'اثري': ['اثري', 'أثري', 'اثار', 'آثار', 'ancient', 'roman', 'historical', 'history'],
  'تخييم': ['تخييم', 'خيمة', 'camping', 'camp'],
  'مغامرة': ['مغامرة', 'adventure'],
  'تصوير': ['تصوير', 'photo', 'photography', 'انستقرام', 'instagram'],
  'رومانسي': ['رومانسي', 'romantic', 'حبيب', 'حبيبي', 'خطيب', 'خطيبة', 'زوجي', 'زوجتي'],
  'اصحاب': ['اصحاب', 'أصحاب', 'friends', 'friend', 'frind', 'صحاب', 'شلة'],
  'رحلة': ['رحلة', 'trip', 'holiday', 'vacation', 'travel', 'travelling'],
  'وين': ['وين', 'where'],
  'مرحبا': ['مرحبا', 'مرحباً', 'hi', 'hello', 'hey', 'salam'],
};

function buildPlaceSynonyms() {
  const map = {};
  Object.values(places).forEach((p) => {
    map[p.name] = [p.name, p.nameEn];
  });
  return map;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyIncludes(text, word) {
  if (text.includes(word)) return true;
  if (word.length < 4) return false;
  const tokens = text.split(/[^a-zA-Zء-ي]+/).filter(Boolean);
  return tokens.some((tok) => {
    if (Math.abs(tok.length - word.length) > 2) return false;
    const dist = levenshtein(tok, word);
    return dist <= Math.max(1, Math.floor(word.length * 0.25));
  });
}

function expandSynonyms(text) {
  const lower = text.toLowerCase();
  let extra = '';
  const allSynonyms = { ...KEYWORD_SYNONYMS, ...buildPlaceSynonyms() };
  Object.entries(allSynonyms).forEach(([canonical, variants]) => {
    const matched = variants.some((v) => fuzzyIncludes(lower, String(v).toLowerCase()));
    if (matched && !lower.includes(canonical.toLowerCase())) {
      extra += ' ' + canonical;
    }
  });
  return text + extra;
}
async function getRahalResponse(question, userLocation, userPlaces) {
  const q = expandSynonyms(question.trim());

  const greetings = ['مرحبا', 'مرحباً', 'هاي', 'اهلا', 'أهلا', 'السلام عليكم'];
  if (greetings.some(g => q.includes(g)) && q.length < 30) {
    return 'أهلاً فيكي! 👋 أنا رحال، دليلك السياحي بالأردن. اسأليني عن أي منطقة أو نشاط أو الطقس!';
  }
  if (q.includes('شكرا') || q.includes('شكراً') || q.includes('تسلم')) {
    return 'العفو! 😊 دايماً موجود لمساعدتك، رحلة سعيدة!';
  }
  if (q.includes('مين انت') || q.includes('من انت') || q.includes('شو بتعمل') || q.includes('شو تقدر تعمل')) {
    return 'أنا رحال 🧭 دليلك السياحي الذكي بموقع رحلتي! بقدر أساعدك تلاقي أفضل الأماكن حسب الموسم، الطقس، نوع النشاط، أو حتى وين تروح بكرا 😊';
  }

  if (q.includes('كم يبعد') || q.includes('كم بعد') || q.includes('قديش يبعد') || q.includes('المسافة')) {
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
      const foodLine = foundUserPlace.food ? `\n🍽️ يشتهر بـ: ${foundUserPlace.food}` : '';
      return `${foundUserPlace.name} (أضافها أحد الزوار 👤): ${foundUserPlace.desc}${foodLine}`;
    }
  }

  const wantsTomorrow = q.includes('بكرا') || q.includes('غدا') || q.includes('غداً');
  const wantsToday = q.includes('اليوم') || q.includes('هلق') || q.includes('هلأ');
  const wantsWeekend = q.includes('ويكند') || q.includes('عطلة') || q.includes('نهاية الأسبوع') || q.includes('الجمعة') || q.includes('السبت');
  const asksWhereToGo = q.includes('وين') || q.includes('روح') || q.includes('نصح') || q.includes('اقترح') || q.includes('مناسب') || q.includes('رحلة') || q.includes('خطط') || q.includes('خطة') || q.includes('مكان اذهب') || q.includes('مكان أذهب') || q.includes('مكان اتسلى') || q.includes('مكان أتسلى');

  if ((wantsTomorrow || wantsToday || wantsWeekend) && asksWhereToGo) {
    if (isFriendsQuery(q)) {
      return 'للخروجات مع الشباب والأصدقاء 👥: وادي رم للتخييم الجماعي 🏜️، وادي الموجب للمغامرة 🏞️، غابات برقش للفرشة والشواء 🌳، أو البحر الميت ليوم مرح 🌊';
    }
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

  if (isFriendsQuery(q)) {
    return 'للخروجات مع الشباب والأصدقاء 👥: وادي رم للتخييم الجماعي 🏜️، وادي الموجب للمغامرة 🏞️، غابات برقش للفرشة والشواء 🌳، أو البحر الميت ليوم مرح 🌊';
  }
  if (q.includes('خطيب') || q.includes('خطيبة') || q.includes('زوجي') || q.includes('زوجتي') || q.includes('رومانسي') || q.includes('حبيب')) {
    return 'لأجواء رومانسية 💑: غروب الشمس بوادي رم 🌅، ليلة هادئة بحمامات ماعين ♨️، أو نزهة على البحر الميت وقت الغروب 🌊';
  }
  if (q.includes('لحالي') || q.includes('وحدي')) {
    return 'للسفر لحالك بهدوء 🚶: محمية ضانا 🏔️، الطفيلة ⛰️، أو البتراء لتجربة تأملية';
  }
  if (q.includes('تصوير') || q.includes('انستقرام') || q.includes('صور حلوة')) {
    return 'أجمل أماكن للتصوير 📸: البتراء (الخزنة) 🏛️، وادي رم (غروب الشمس) 🌅، البحر الميت، وقلعة عجلون';
  }
  if (q.includes('مشي') || q.includes('هايكنغ') || q.includes('مسار') || q.includes('مسارات')) {
    return 'مسارات مشي رائعة 🥾: محمية ضانا (مسار الوادي الكامل)، وادي الموجب (المسار المائي)، والبتراء (المسير الطويل للدير)';
  }
  if (q.includes('نجوم') || q.includes('تخييم ليلي') || q.includes('سماء')) {
    return 'أفضل مكان لمشاهدة النجوم ⭐ ليلاً: وادي رم 🏜️، بعيد عن أضواء المدن وسماءه صافية جداً بالليل';
  }
  if (q.includes('شلالات') || q.includes('شلال')) {
    return 'شلالات جميلة: حمامات ماعين ♨️ (شلالات ساخنة)، ووادي الموجب 🏞️ (مسارات مائية وشلالات)';
  }
  if (q.includes('طيور') || q.includes('مراقبة الطيور')) {
    return 'لمراقبة الطيور 🦅: محمية الأزرق المائية 🦆، وجهة مهمة للطيور المهاجرة';
  }
  if (q.includes('ثلج') || q.includes('تلج')) {
    return 'عجلون من المناطق اللي ممكن يتساقط فيها الثلج شتاءً ❄️🌲 (حسب الموسم)';
  }
  if ((q.includes('قلاع') || q.includes('قلعة')) && !foundKey) {
    return 'قلاع تاريخية رائعة 🏰: الكرك، عجلون، الشوبك، وقلعة الأزرق - كل وحدة بطراز وقصة مختلفة';
  }
  if (q.includes('يونسكو') || q.includes('تراث عالمي')) {
    return 'مواقع مسجلة على قائمة اليونسكو 🏛️: البتراء، أم الرصاص، قصر عمرة، والسلط';
  }
  if (q.includes('ازدحام') || q.includes('مزدحم') || q.includes('بعيد عن الزحمة')) {
    return 'أماكن هادئة بعيدة عن الزحمة 🌿: محمية ضانا، الطفيلة، أم النمل، وغابات برقش';
  }
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

const ECO_MESSAGES = [
  '🌿 المحافظة على نظافة الطبيعة مسؤولية الجميع',
  '🔥 التأكد من إطفاء النار بالكامل قبل المغادرة',
  '🌳 عدم قطف أو كسر النباتات والأشجار',
  '🐾 الحفاظ على الحياة البرية وعدم إزعاج الحيوانات',
  '💧 ترشيد استهلاك المياه، خصوصاً بالمناطق الصحراوية',
  '♻️ تفضيل الأدوات القابلة لإعادة الاستخدام بدل البلاستيك',
];

function EcoBanner() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % ECO_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ background: 'linear-gradient(120deg, #6b9b5e, #4f7a45)', color: '#fff', borderRadius: 16, padding: '10px 18px', margin: '12px auto', maxWidth: 600, fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      {ECO_MESSAGES[index]}
    </div>
  );
}

function StarRating({ placeKey, ratings, setRatings, user, onRated }) {
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
      if (onRated) onRated();
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

function LocationPicker({ onSelect, position }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}
function AddPlaceForm({ user, onAdd, onPointsEarned }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [season, setSeason] = useState('summer');
  const [imgUrl, setImgUrl] = useState('');
  const [food, setFood] = useState('');
  const [uploading, setUploading] = useState(false);
  const [show, setShow] = useState(false);
  const [placeLat, setPlaceLat] = useState(null);
  const [placeLng, setPlaceLng] = useState(null);

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
    if (!placeLat || !placeLng) return alert('يرجى تحديد موقع المنطقة على الخريطة 📍');
    const newPlace = {
      name, desc, season, img: imgUrl,
      food: food || null,
      lat: placeLat, lng: placeLng,
      addedBy: user.displayName,
      addedByUid: user.uid,
      addedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'userPlaces'), newPlace);
    onAdd({ id: docRef.id, ...newPlace });
    if (onPointsEarned) onPointsEarned();
    setName(''); setDesc(''); setImgUrl(''); setFood(''); setPlaceLat(null); setPlaceLng(null); setShow(false);
  };

  if (!show) return (
    <button className="add-place-btn" onClick={() => setShow(true)}>➕ أضف منطقة جديدة</button>
  );

  return (
    <div className="add-place-form">
      <h3>➕ أضف منطقة جديدة</h3>
      <input placeholder="اسم المنطقة" value={name} onChange={e => setName(e.target.value)} className="form-input" />
      <textarea placeholder="وصف المنطقة" value={desc} onChange={e => setDesc(e.target.value)} className="form-input" rows={3} />
      <input placeholder="الأكلة المشهورة (اختياري)" value={food} onChange={e => setFood(e.target.value)} className="form-input" />
      <select value={season} onChange={e => setSeason(e.target.value)} className="form-input">
        <option value="summer">☀️ صيف</option>
        <option value="winter">❄️ شتاء</option>
        <option value="spring">🌸 ربيع</option>
      </select>
      <p style={{ fontSize: '0.85rem', color: '#8B6914', margin: '8px 0 6px' }}>📍 دوسي على الخريطة لتحديد موقع المنطقة بالضبط</p>
      <MapContainer center={[31.95, 35.93]} zoom={7} style={{ height: 220, width: '100%', borderRadius: 10, marginBottom: 8 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker
          onSelect={(la, ln) => { setPlaceLat(la); setPlaceLng(ln); }}
          position={placeLat && placeLng ? [placeLat, placeLng] : null}
        />
      </MapContainer>
      {placeLat && placeLng && (
        <p style={{ fontSize: '0.75rem', color: '#777', marginBottom: 8 }}>
          ✅ الموقع المحدد: {placeLat.toFixed(4)}, {placeLng.toFixed(4)}
        </p>
      )}
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

function Avatar({ user, size, gender }) {

  if (gender === "female") {
    return (
      <img
        src="/girl.png"
        alt="girl avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
    );
  }

  if (gender === "male") {
    return (
      <img
        src="/boy.png"
        alt="boy avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover"
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#b8860b",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: size / 2
      }}
    >
      ?
    </div>
  );
}

function WeatherCard({ latitude, longitude, placeName }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!latitude || !longitude) { setLoading(false); return; }
      setLoading(true);
      const data = await getWeatherInfo(latitude, longitude, 0);
      if (!cancelled) { setWeather(data); setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <div className="weather-card-mini weather-card-static">
        🌦️ الموقع غير متاح حالياً
      </div>
    );
  }
  if (loading) {
    return <div className="weather-card-mini weather-card-static">⏳ جاري جلب حالة الطقس...</div>;
  }
  if (!weather || weather.temp === undefined) {
    return null;
  }

  const temp = Math.round(weather.temp);
  const rain = weather.rain || 0;
  let condition = 'مشمس';
  let icon = '☀️';
  let recommendation = 'الجو رائع لزيارة الأماكن الأثرية أو المشي بالطبيعة 🌿';

  if (rain > 2) {
    condition = 'ممطر';
    icon = '🌧️';
    recommendation = 'الجو ممطر شوي، فرصة حلوة لزيارة الأماكن الأثرية أو المسقوفة';
  } else if (temp >= 30) {
    condition = 'حر ومشمس';
    icon = '☀️';
    recommendation = 'الجو حر، خذي معك ماء وواقي شمس ☀️';
  } else if (temp >= 20) {
    condition = 'معتدل';
    icon = '🌤️';
    recommendation = 'الجو معتدل ورائع للزيارة والتنزه 🍃';
  } else {
    condition = 'بارد';
    icon = '❄️';
    recommendation = 'الجو بارد شوي، خذي معك ملابس دافية';
  }

  return (
    <div className="weather-card-wrap">
      <div className={`weather-card-mini ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="weather-temp-mini">
          {icon} {placeName ? `${placeName}: ` : ''}{temp}° · {condition}
        </span>
        <span className="weather-chevron-mini">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="weather-detail-mini">
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
}

function ProfilePanel({ user, userPlaces, favoriteKeys, placePhotos, userLocation, gender, onGenderChange, points, onClose }) {
  const myPlaces = userPlaces.filter(p => p.addedBy === user.displayName);
  const favoritePlacesList = favoriteKeys.map(k => places[k]).filter(Boolean);

  const myPhotos = [];
  Object.keys(placePhotos).forEach(key => {
    (placePhotos[key] || []).forEach(photoObj => {
      if (photoObj.uploadedBy === user.displayName) {
        myPhotos.push({ ...photoObj, placeName: places[key] ? places[key].name : key });
      }
    });
  });

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 500, margin: '15px auto', padding: 20, textAlign: 'right', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Avatar user={user} size={60} gender={gender} />
        <div>
          <h2 style={{ margin: 0 }}>👤 {user.displayName}</h2>
          <p style={{ margin: 0, color: '#777', fontSize: '0.85rem' }}>{user.email}</p>
        </div>
      </div>

{!gender && (
  <div className="gender-select">
    <span>اختر صورة حسابك:</span>

    <button onClick={() => onGenderChange('female')}>
      👩 بنت
    </button>

    <button onClick={() => onGenderChange('male')}>
      👨 شاب
    </button>
  </div>
)}

      <div style={{ background: '#faf6ec', borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.4rem' }}>{getLevelInfo(points).icon}</span>
        <div style={{ textAlign: 'center' }}>
          <strong>{getLevelInfo(points).label}</strong>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>{points} نقطة</p>
        </div>
      </div>

      <WeatherCard latitude={userLocation?.lat} longitude={userLocation?.lng} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', marginTop: 14 }}>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>📍 {myPlaces.length}</strong> مناطق أضفتها
        </div>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>❤️ {favoritePlacesList.length}</strong> أماكن مفضلة
        </div>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>📸 {myPhotos.length}</strong> صور رفعتها
        </div>
      </div>

      <h3>❤️ الأماكن المفضلة</h3>
      {favoritePlacesList.length === 0 ? (
        <p style={{ color: '#999' }}>ما ضفتي أي مكان للمفضلة بعد. اضغطي القلب ❤️ على أي بطاقة منطقة!</p>
      ) : (
        <ul style={{ paddingRight: 20 }}>
          {favoritePlacesList.map(p => <li key={p.name}>{p.name}</li>)}
        </ul>
      )}

      <h3>📸 الصور التي رفعتها</h3>
      {myPhotos.length === 0 ? (
        <p style={{ color: '#999' }}>لسا ما رفعتي أي صورة. رفعي صورة من أي بطاقة منطقة!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {myPhotos.map((p, i) => (
            <div key={i}>
              <img src={p.url} alt={p.placeName} style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 8 }} />
              <p style={{ fontSize: '0.7rem', margin: '2px 0 0', color: '#777' }}>{p.placeName}</p>
            </div>
          ))}
        </div>
      )}

      {myPlaces.length > 0 && (
        <>
          <h3>📍 مناطق أضفتها</h3>
          <ul style={{ paddingRight: 20 }}>
            {myPlaces.map((p, i) => <li key={i}>{p.name}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

function Leaderboard({ onClose }) {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'userProfiles'), orderBy('points', 'desc'), limit(10));
        const snap = await getDocs(q);
        setTopUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 500, margin: '15px auto', padding: 20, textAlign: 'right', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
      <h2 style={{ color: '#8B6914', marginBottom: 16 }}>🏆 أفضل الرحالة</h2>
      {loading ? (
        <p>⏳ جاري التحميل...</p>
      ) : topUsers.length === 0 ? (
        <p style={{ color: '#999' }}>لسا ما في نقاط مسجلة</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf6ec', borderRadius: 12, padding: '10px 14px' }}>
              <strong style={{ width: 22 }}>{i + 1}</strong>
              <Avatar user={u} size={40} gender={u.gender} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{u.name || 'مستخدم'}</div>
                <div style={{ fontSize: '0.8rem', color: '#777' }}>{getLevelInfo(u.points || 0).icon} {getLevelInfo(u.points || 0).label}</div>
              </div>
              <strong style={{ color: '#8B6914' }}>{u.points || 0}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function TripPlanner({ onClose, onOpenMap, userPlaces }) {
  const [season, setSeasonSel] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [time, setTime] = useState(null);
  const [budget, setBudget] = useState(null);
  const [result, setResult] = useState(null);

  const seasonOptions = [
    { key: 'summer', label: '☀️ صيف' },
    { key: 'winter', label: '❄️ شتاء' },
    { key: 'spring', label: '🌸 ربيع' },
  ];
  const companionOptions = [
    { key: 'alone', label: '🚶 لحالي' },
    { key: 'family', label: '👨‍👩‍👧 عائلة' },
    { key: 'friends', label: '👥 أصحاب' },
    { key: 'kids', label: '🧒 مع أطفال' },
  ];
  const timeOptions = [
    { key: '2h', label: '⏱️ ساعتين' },
    { key: 'half', label: '🕐 نص يوم' },
    { key: 'full', label: '🕘 يوم كامل' },
  ];
  const budgetOptions = [
    { key: 'free', label: '🆓 مجاني' },
    { key: 'under20', label: '💵 أقل من 20 دينار' },
    { key: 'open', label: '💰 ميزانية مفتوحة' },
  ];

  const OptionRow = ({ options, value, onSelect }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onSelect(opt.key)}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            border: value === opt.key ? '2px solid #8B6914' : '1px solid #ddd',
            background: value === opt.key ? '#C4952A' : '#faf6ec',
            color: value === opt.key ? '#fff' : '#5a3e1b',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            margin: 0,
            boxShadow: 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const generateTrip = () => {
    if (!season || !companion || !time || !budget) {
      alert('لازم تختاري كل الخيارات الأربعة الأول 🙏');
      return;
    }
    let best = null;
    let bestScore = -1;

    Object.entries(places).forEach(([key, place]) => {
      const score = scoreTripPlace(place, key, { season, companion, time, budget });
      if (score > bestScore) {
        bestScore = score;
        best = { key, place };
      }
    });

    (userPlaces || []).forEach((place) => {
      if (!place.lat || !place.lng) return;
      const score = scoreTripPlace(place, place.id, { season, companion, time, budget });
      if (score > bestScore) {
        bestScore = score;
        best = { key: place.id, place };
      }
    });

    if (best) {
      const meta = getPlaceMeta(best.key);
      const reasons = [];
      if (best.place.season === season) reasons.push('بيناسب الموسم يلي اخترتيه');
      if (meta.companions && meta.companions.includes(companion)) reasons.push('مناسب لنوع الرفقة يلي حددتيها');
      if (meta.budget === 'free') reasons.push('دخول مجاني بالكامل');
      else if (meta.budget === 'under20' && budget !== 'open') reasons.push('يناسب ميزانيتك');
      if (meta.duration) reasons.push(`بياخذ تقريباً ${durationLabel(meta.duration)}، وهاد بيناسب الوقت يلي عندك`);
      if (best.place.addedBy) reasons.push(`مكان اكتشفه زائر تاني (${best.place.addedBy}) وضافه للتطبيق 🌟`);
      setResult({ ...best, reasons, duration: meta.duration });
    }
  };

  const resetPlanner = () => {
    setSeasonSel(null);
    setCompanion(null);
    setTime(null);
    setBudget(null);
    setResult(null);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', textAlign: 'right', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

        {!result ? (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>🗺️ خطط رحلتك</h2>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 18 }}>جاوبي على 4 أسئلة بسيطة ورح نقترحلك أفضل مكان</p>

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>🗓️ أي موسم؟</h4>
            <OptionRow options={seasonOptions} value={season} onSelect={setSeasonSel} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>👥 مع مين رايح؟</h4>
            <OptionRow options={companionOptions} value={companion} onSelect={setCompanion} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>⏱️ قديش عندك وقت؟</h4>
            <OptionRow options={timeOptions} value={time} onSelect={setTime} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>💰 الميزانية؟</h4>
            <OptionRow options={budgetOptions} value={budget} onSelect={setBudget} />

            <button
              onClick={generateTrip}
              style={{ background: 'linear-gradient(135deg, #C4952A, #8B6914)', color: '#fff', width: '100%', padding: 12, borderRadius: 14, fontSize: '1rem', marginTop: 6 }}
            >
              ✨ اقترح رحلتي
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 14 }}>🎉 خططنالك رحلة!</h2>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #f0e0b0' }}>
              <img src={result.place.img} alt={result.place.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
              <div style={{ padding: 16 }}>
                <h3 style={{ color: '#8B6914', marginBottom: 6 }}>{result.place.name}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 10 }}>{result.place.desc}</p>
                <div style={{ background: '#faf6ec', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#8B6914' }}>ليش اخترنالك هاد المكان؟</strong>
                  <ul style={{ margin: '6px 0 0', paddingRight: 18, fontSize: '0.8rem', color: '#555' }}>
                    {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
                {result.duration && (
                  <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: 12 }}>
                    ⏱️ مدة الزيارة المتوقعة: {durationLabel(result.duration)}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { onOpenMap(result.place); onClose(); }}
                    style={{ flex: 1, background: '#5a3e1b', color: '#fff', padding: 10, borderRadius: 10 }}
                  >
                    📍 افتحي على الخريطة
                  </button>
                  <button
                    onClick={resetPlanner}
                    style={{ flex: 1, background: '#faf6ec', color: '#8B6914', padding: 10, borderRadius: 10, border: '1px solid #e8d5a3' }}
                  >
                    🔄 جربي رحلة تانية
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AITripBuilder({ onClose, userPlaces }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);

  const handleGenerate = () => {
    if (!prompt.trim() || prompt.trim().length < 5) {
      setError('اكتبي وصف واضح لرحلتك (مثلاً: معي 3 أيام وبدي أطلع عالعقبة)');
      return;
    }

    setError(null);
    setLoading(true);
    setTrip(null);

    // نظام محلي بالكامل — فوري وبدون أي اتصال خارجي أو مفتاح API
    setTimeout(() => {
      try {
        const result = buildLocalTripPlan(prompt.trim(), userPlaces);
        setTrip(result);
      } catch (err) {
        setError('صار خطأ أثناء بناء الرحلة، جربي مرة ثانية 🙏');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const resetBuilder = () => {
    setTrip(null);
    setError(null);
    setPrompt('');
  };

  const getTypeIcon = (type) => {
    if (type === 'فطور') return '☕';
    if (type === 'غدا') return '🍽️';
    if (type === 'عشاء') return '🌙';
    return '📍';
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', textAlign: 'right', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

        {!trip ? (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>🤖 ابنيلي رحلة بالـ AI</h2>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 18 }}>
              احكيلي عن رحلتك بأي أسلوب، وأنا بجهزلك جدول كامل بالأماكن والفطور والغدا والميزانية
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: معي 3 أيام وبدي أطلع عالعقبة، بحب الأكل البحري والسباحة"
              rows={4}
              style={{
                width: '100%',
                border: '1.5px solid #e8d5a3',
                borderRadius: 12,
                padding: 12,
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: 12,
                background: '#faf6ec',
                color: '#3E2A14',
              }}
            />

            {error && (
              <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: 10 }}>{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #C4952A, #8B6914)',
                color: '#fff',
                width: '100%',
                padding: 12,
                borderRadius: 14,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '⏳ جاري بناء رحلتك...' : '✨ ابني الرحلة'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>🤖 {trip.title}</h2>
            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 16 }}>رحلة {trip.totalDays} يوم مبنية خصيصاً إلك</p>

            {trip.days?.map((day, i) => (
              <div key={i} style={{ background: '#faf6ec', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid #e8d5a3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ color: '#8B6914', margin: 0 }}>اليوم {day.dayNumber}: {day.title}</h4>
                  {day.estimatedBudget && (
                    <span style={{ fontSize: '0.75rem', color: '#8B6914', background: '#fff', padding: '4px 10px', borderRadius: 999, border: '1px solid #e8d5a3' }}>
                      💰 {day.estimatedBudget}
                    </span>
                  )}
                </div>
                {day.stops?.map((stop, si) => (
                  <div key={si} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: si < day.stops.length - 1 ? '1px dashed #e0cfa0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ color: '#5a3e1b', fontSize: '0.9rem' }}>
                        {getTypeIcon(stop.type)} {stop.place}
                      </strong>
                      <span style={{ color: '#8B6914', fontSize: '0.8rem' }}>{stop.time}</span>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>{stop.description}</p>
                    {stop.durationHint && (
                      <p style={{ color: '#999', fontSize: '0.75rem', margin: '2px 0 0' }}>⏱️ {stop.durationHint}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {trip.tips?.length > 0 && (
              <div style={{ background: '#fff8e6', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <strong style={{ fontSize: '0.85rem', color: '#8B6914' }}>💡 نصائح لرحلتك</strong>
                <ul style={{ margin: '8px 0 0', paddingRight: 18, fontSize: '0.8rem', color: '#555' }}>
                  {trip.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}

            <button
              onClick={resetBuilder}
              style={{ width: '100%', background: '#faf6ec', color: '#8B6914', padding: 10, borderRadius: 10, border: '1px solid #e8d5a3' }}
            >
              🔄 ابني رحلة تانية
            </button>
          </>
        )}
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
  const [restaurants, setRestaurants] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [mapServices, setMapServices] = useState([]);
  const [user, setUser] = useState(null);
  const [placePhotos, setPlacePhotos] = useState({});
  const [lang, setLang] = useState('ar');
  const [lightboxData, setLightboxData] = useState(null);
  const [galleryModalData, setGalleryModalData] = useState(null);
  const [userPlaces, setUserPlaces] = useState([]);
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [gender, setGender] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [points, setPoints] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFavoritesPage, setShowFavoritesPage] = useState(false);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showAiTripBuilder, setShowAiTripBuilder] = useState(false);

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
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.items) {
              newPhotos[key] = data.items;
            } else if (data.urls) {
              newPhotos[key] = data.urls.map(u => ({ url: u, uploadedBy: null }));
            }
          }
        }
        setPlacePhotos(newPhotos);
      } catch (e) {}
    };
    const loadUserPlaces = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userPlaces'));
        const loadedPlaces = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUserPlaces(loadedPlaces);

        const userPhotos = {};
        for (const p of loadedPlaces) {
          try {
            const docSnap = await getDoc(doc(db, 'photos', p.id));
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.items) userPhotos[p.id] = data.items;
            }
          } catch (e) {}
        }
        setPlacePhotos(prev => ({ ...prev, ...userPhotos }));
      } catch (e) {}
    };
    loadRatings();
    loadPhotos();
    loadUserPlaces();
   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  setUser(currentUser);

  if (currentUser) {
    try {
      const favDoc = await getDoc(doc(db, 'favorites', currentUser.uid));
      if (favDoc.exists()) {
        setFavoriteKeys(favDoc.data().placeKeys || []);
      }
    } catch (e) {}

    try {
      await setDoc(doc(db, 'userProfiles', currentUser.uid), { name: currentUser.displayName }, { merge: true });
    } catch (e) {}

    try {
      const profileDoc = await getDoc(doc(db, 'userProfiles', currentUser.uid));
      const profileData = profileDoc.exists() ? profileDoc.data() : {};

      if (profileData.gender) {
        setGender(profileData.gender);
      } else {
        setGender(null);
        setShowGenderModal(true);
      }
      setPoints(profileData.points || 0);
    } catch (e) {}

  } else {
    setFavoriteKeys([]);
    setGender(null);
    setShowGenderModal(false);
    setPoints(0);
  }
});

return () => unsubscribe();
}, []);
  const updateGender = async (g) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), { gender: g }, { merge: true });
      setGender(g);
    } catch (e) {}
  };

  const awardPoints = async (amount) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), { points: increment(amount) }, { merge: true });
      setPoints(prev => Math.max(0, prev + amount));
    } catch (e) {}
  };

  const toggleFavorite = async (key) => {
    if (!user) return alert('سجل دخول أولاً لإضافة للمفضلة');
    const isFav = favoriteKeys.includes(key);
    try {
      const ref = doc(db, 'favorites', user.uid);
      if (isFav) {
        await setDoc(ref, { placeKeys: arrayRemove(key) }, { merge: true });
        setFavoriteKeys(prev => prev.filter(k => k !== key));
        awardPoints(-2);
      } else {
        await setDoc(ref, { placeKeys: arrayUnion(key) }, { merge: true });
        setFavoriteKeys(prev => [...prev, key]);
        awardPoints(2);
      }
    } catch (e) {}
  };

  const handlePhotoUpload = async (placeKey, url) => {
    try {
      const photoObj = { url, uploadedBy: user ? user.displayName : null, uploadedAt: new Date().toISOString() };
      await setDoc(doc(db, 'photos', placeKey), { items: arrayUnion(photoObj) }, { merge: true });
      setPlacePhotos(prev => ({ ...prev, [placeKey]: [...(prev[placeKey] || []), photoObj] }));
      awardPoints(5);
    } catch (e) {}
  };

  const handleDeleteUserPlace = async (place) => {
    if (!window.confirm(`متأكدة إنك بدك تحذفي "${place.name}"؟ الإجراء ما بينرجع، وراح تنخصم منك 20 نقطة يلي أخذتيها لما ضفتيها.`)) return;
    try {
      await deleteDoc(doc(db, 'userPlaces', place.id));
      try { await deleteDoc(doc(db, 'photos', place.id)); } catch (e) {}
      setUserPlaces(prev => prev.filter(p => p.id !== place.id));
      setPlacePhotos(prev => {
        const copy = { ...prev };
        delete copy[place.id];
        return copy;
      });
      awardPoints(-20);
    } catch (e) {
      alert('صار خطأ أثناء الحذف، جربي مرة ثانية');
    }
  };

  const handleDeletePhoto = async (placeKey, photoObj) => {
    if (!placeKey || !photoObj) return;
    if (!window.confirm('متأكدة إنك بدك تحذفي هالصورة؟ الإجراء ما بينرجع.')) return;
    try {
      await setDoc(doc(db, 'photos', placeKey), { items: arrayRemove(photoObj) }, { merge: true });
      setPlacePhotos(prev => ({
        ...prev,
        [placeKey]: (prev[placeKey] || []).filter(p => !(p.url === photoObj.url && p.uploadedAt === photoObj.uploadedAt)),
      }));
      if (user && photoObj.uploadedBy === user.displayName) {
        awardPoints(-5);
      }
      closeLightbox();
      closeGalleryModal();
    } catch (e) {
      alert('صار خطأ أثناء حذف الصورة، جربي مرة ثانية');
    }
  };

  const handleToggleLike = async (placeKey, photoObj) => {
    if (!user) return alert('سجلي دخول أولاً عشان تحطي لايك');
    try {
      const currentPhotos = placePhotos[placeKey] || [];
      const updatedPhotos = currentPhotos.map((p) => {
        if (p.url === photoObj.url && p.uploadedAt === photoObj.uploadedAt) {
          const likes = p.likes || [];
          const hasLiked = likes.some((l) => (l && l.uid) === user.uid);
          const newLikes = hasLiked
            ? likes.filter((l) => (l && l.uid) !== user.uid)
            : [...likes, { uid: user.uid, likedAt: new Date().toISOString() }];
          return { ...p, likes: newLikes };
        }
        return p;
      });
      await setDoc(doc(db, 'photos', placeKey), { items: updatedPhotos }, { merge: true });
      setPlacePhotos((prev) => ({ ...prev, [placeKey]: updatedPhotos }));
      setLightboxData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
      setGalleryModalData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
    } catch (e) {}
  };

  const toggleDetails = async (key, place) => {
    if (openPlace === key) { setOpenPlace(''); setServices([]); setRestaurants([]); return; }
    setOpenPlace(key);
    setLoadingServices(true);
    const [supportResult, restaurantResult] = await Promise.all([
      fetchNearbySupportServices(place.lat, place.lng),
      fetchNearbyRestaurants(place.lat, place.lng),
    ]);
    setServices(supportResult.slice(0, 10));
    setRestaurants(restaurantResult.slice(0, 6));
    setLoadingServices(false);
  };

  const openMap = async (place) => {
    setSelectedPlace(place);
    const [supportResult, restaurantResult] = await Promise.all([
      fetchNearbySupportServices(place.lat, place.lng),
      fetchNearbyRestaurants(place.lat, place.lng),
    ]);
    const combined = [...supportResult, ...restaurantResult];
    setMapServices(combined.filter(s => s.lat && s.lon));
  };

  const goHome = () => { setSeason(''); setOpenPlace(''); setSelectedPlace(null); setServices([]); setRestaurants([]); setSearchQuery(''); setMapServices([]); setShowFavoritesPage(false); };
  const openLightbox = (photos, index, placeNameForLightbox, placeKeyForLightbox) => setLightboxData({ photos, index, placeName: placeNameForLightbox, placeKey: placeKeyForLightbox });
  const closeLightbox = () => setLightboxData(null);
  const lightboxPrev = () => setLightboxData(prev => prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null);
  const lightboxNext = () => setLightboxData(prev => prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null);
  const openGalleryModal = (photos, placeNameForGallery, placeKeyForGallery) => setGalleryModalData({ photos, placeName: placeNameForGallery, placeKey: placeKeyForGallery });
  const closeGalleryModal = () => setGalleryModalData(null);
  const openFavoritesPage = () => { setSeason(''); setSelectedPlace(null); setSearchQuery(''); setShowFavoritesPage(true); };

  const renderPlace = (key, place, isUserPlace = false) => {
    const placeName = isUserPlace ? place.name : (lang === 'ar' ? place.name : place.nameEn);
    const placeDesc = isUserPlace ? place.desc : (lang === 'ar' ? place.desc : place.descEn);
    const placeFood = isUserPlace ? place.food : (lang === 'ar' ? place.food : place.foodEn);
    const photos = placePhotos[key] || [];
    const isFav = !isUserPlace && favoriteKeys.includes(key);

    return (
      <div className="place-card" key={key} style={{ position: 'relative' }}>
        {!isUserPlace && (
          <span
            onClick={() => toggleFavorite(key)}
            style={{ position: 'absolute', top: 10, insetInlineEnd: 10, fontSize: '1.4rem', cursor: 'pointer', zIndex: 5 }}
            title={isFav ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
          >
            {isFav ? '❤️' : '🤍'}
          </span>
        )}
        <h3>{placeName}</h3>
        {isUserPlace && <span className="user-badge">👤 {place.addedBy}</span>}
        {isUserPlace && user && place.addedBy === user.displayName && (
          <button
            onClick={() => handleDeleteUserPlace(place)}
            style={{ background: '#c0392b', color: '#fff', width: 'calc(100% - 30px)', margin: '5px 15px', padding: 8, borderRadius: 10, fontSize: '0.85rem' }}
          >
            🗑️ احذفي هالمنطقة
          </button>
        )}
        <img src={place.img} alt={placeName} />
        {place.lat && userLocation && (
          <p>📍 {t.distance} {getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} {t.fromLocation}</p>
        )}
        {place.lat && <WeatherCard latitude={place.lat} longitude={place.lng} placeName={placeName} />}
        <p>{placeDesc}</p>
        {placeFood && <p className="food-line">🍽️ {lang === 'ar' ? 'يشتهر بـ:' : 'Famous for:'} {placeFood}</p>}
        {!isUserPlace && <StarRating placeKey={key} ratings={ratings} setRatings={setRatings} user={user} onRated={() => awardPoints(3)} />}
        {place.lat && (
          <>
            <button onClick={() => openMap(place)}>{t.map}</button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`} target="_blank" rel="noopener noreferrer" className="directions-btn">{t.directions}</a>
          </>
        )}
        {place.lat && (
          <>
            <button onClick={() => toggleDetails(key, place)}>{t.services}</button>
            {openPlace === key && (
              <div className="services">
                {loadingServices ? <p>{t.loading}</p> : (
                  <>
                    <h4>🍽️ {lang === 'ar' ? 'مطاعم قريبة' : 'Nearby Restaurants'}</h4>
                    {restaurants.length > 0 ? restaurants.map((s, i) => <p key={i}>🍽️ {s.tags.name}</p>) : <p>{t.noServices}</p>}
                    <h4>🏥 {lang === 'ar' ? 'خدمات قريبة' : 'Nearby Services'}</h4>
                    {services.length > 0 ? services.map((s, i) => <p key={i}>{getServiceIcon(s.tags)} {s.tags.name}</p>) : <p>{t.noServices}</p>}
                  </>
                )}
              </div>
            )}
          </>
        )}
        {photos.length > 0 && (
          <div className="photo-gallery">
            <h4>{t.photos} ({photos.length})</h4>
            <div className="photos-grid">
              {photos.slice(0, 3).map((photoObj, i) => (
                <img key={i} src={photoObj.url} alt={placeName} className="user-photo" onClick={() => openGalleryModal(photos, placeName, key)} />
              ))}
            </div>
            <button
              onClick={() => openGalleryModal(photos, placeName, key)}
              style={{ marginTop: 8, background: '#faf6ec', color: '#8B6914', border: '1px solid #e8d5a3', padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem', width: 'calc(100% - 0px)' }}
            >
              🖼️ افتحي معرض الصور{photos.length > 3 ? ` (+${photos.length - 3})` : ''}
            </button>
          </div>
        )}
        {user && <ImageUpload placeKey={key} onUpload={handlePhotoUpload} />}
        {!user && <p className="login-hint">{t.loginHint}</p>}
      </div>
    );
  };

  const userSummerPlaces = userPlaces.filter(p => p.season === 'summer');
  const userWinterPlaces = userPlaces.filter(p => p.season === 'winter');
  const userSpringPlaces = userPlaces.filter(p => p.season === 'spring');

  const getPlaceNameForKey = (pKey) => {
    if (places[pKey]) return places[pKey].name;
    const up = userPlaces.find(p => p.id === pKey);
    return up ? up.name : pKey;
  };
  const weekStart = getWeekStart();
  let weeklyTopPhoto = null;
  Object.entries(placePhotos).forEach(([pKey, photosArr]) => {
    (photosArr || []).forEach((p) => {
      const likes = p.likes || [];
      const weeklyLikeCount = likes.filter((l) => l && l.likedAt && new Date(l.likedAt) >= weekStart).length;
      if (weeklyLikeCount > 0) {
        if (!weeklyTopPhoto || weeklyLikeCount > weeklyTopPhoto.likeCount) {
          weeklyTopPhoto = { ...p, likeCount: weeklyLikeCount, placeKey: pKey, placeName: getPlaceNameForKey(pKey) };
        }
      }
    });
  });

  return (
    <div className="App" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {showGenderModal && (
  <div className="gender-modal">
    <h3>اختار صورة حسابك</h3>

    <button onClick={() => {
      updateGender('female');
      setShowGenderModal(false);
    }}>
      👩 بنت
    </button>

    <button onClick={() => {
      updateGender('male');
      setShowGenderModal(false);
    }}>
      👨 شب
    </button>
  </div>
)}
      <div className="navbar">
        <h1>{t.title}</h1>
        <div className="navbar-right">
          <button className="lang-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
            {lang === 'ar' ? '🌐 English' : '🌐 العربية'}
          </button>
          <button className="lang-btn" onClick={() => setShowLeaderboard(prev => !prev)}>
            🏆 أفضل الرحالة
          </button>
          {user && (
            <button className="lang-btn" onClick={openFavoritesPage}>
              ❤️ المفضلة
            </button>
          )}
          {user ? (
            <div className="user-info">
              <span style={{ cursor: 'pointer' }} onClick={() => setShowProfile(prev => !prev)}>
                <Avatar user={user} size={32} gender={gender} />
              </span>
              <span style={{ cursor: 'pointer' }} onClick={() => setShowProfile(prev => !prev)}>{user.displayName}</span>
              <button className="logout-btn" onClick={logOut}>{t.logout}</button>
            </div>
          ) : (
            <button className="login-btn" onClick={signInWithGoogle}>{t.login}</button>
          )}
        </div>
      </div>

      <EcoBanner />

      {showProfile && user && (
        <ProfilePanel
          user={user}
          userPlaces={userPlaces}
          favoriteKeys={favoriteKeys}
          placePhotos={placePhotos}
          userLocation={userLocation}
          gender={gender}
          onGenderChange={updateGender}
          points={points}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      <p>{t.subtitle}</p>
      <input className="search-input" type="text" placeholder={`🔍 ${t.search}`} value={searchQuery} onChange={(e) => { setShowFavoritesPage(false); setSearchQuery(e.target.value); }} />

      {!searchQuery && season === '' && !showFavoritesPage && <p className="welcome-msg">{t.welcome}</p>}

      {!searchQuery && season === '' && !showFavoritesPage && (
        <>
          <button className="add-place-btn" onClick={() => setShowTripPlanner(true)} style={{ marginBottom: 10 }}>
            🗺️ خطط رحلتي
          </button>
          <button className="add-place-btn" onClick={() => setShowAiTripBuilder(true)} style={{ marginBottom: 10, marginRight: 8 }}>
            🤖 ابنيلي رحلة بالـ AI
          </button>
        </>
      )}

      {showTripPlanner && (
        <TripPlanner onClose={() => setShowTripPlanner(false)} onOpenMap={openMap} userPlaces={userPlaces} />
      )}

      {showAiTripBuilder && (
        <AITripBuilder onClose={() => setShowAiTripBuilder(false)} userPlaces={userPlaces} />
      )}

      {weeklyTopPhoto && (
        <button
          onClick={() => openGalleryModal(placePhotos[weeklyTopPhoto.placeKey] || [weeklyTopPhoto], weeklyTopPhoto.placeName, weeklyTopPhoto.placeKey)}
          style={{
            position: 'fixed', bottom: 20, insetInlineStart: 20, zIndex: 999,
            width: 60, height: 60, borderRadius: '50%',
            backgroundImage: `linear-gradient(rgba(139,105,20,0.15), rgba(139,105,20,0.15)), url(${weeklyTopPhoto.url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: '3px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
            padding: 0, cursor: 'pointer', overflow: 'hidden',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          title={`🏆 صورة الأسبوع: ${weeklyTopPhoto.placeName}`}
        >
          <span style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', width: '100%', fontSize: '0.65rem', borderRadius: '0 0 27px 27px', padding: '2px 0' }}>🏆</span>
        </button>
      )}

      {!searchQuery && (
        <>
          <button onClick={() => { setShowFavoritesPage(false); setSeason('summer'); }}>{t.summer}</button>
          <button onClick={() => { setShowFavoritesPage(false); setSeason('winter'); }}>{t.winter}</button>
          <button onClick={() => { setShowFavoritesPage(false); setSeason('spring'); }}>{t.spring}</button>
        </>
      )}

      {user && season === '' && !searchQuery && !showFavoritesPage && (
        <div style={{ margin: '15px auto', maxWidth: '600px' }}>
          <AddPlaceForm user={user} onAdd={(p) => setUserPlaces(prev => [...prev, p])} onPointsEarned={() => awardPoints(20)} />
        </div>
      )}
      {!user && season === '' && !searchQuery && !showFavoritesPage && (
        <p className="login-hint" style={{ margin: '10px 0' }}>🔑 سجل دخول لإضافة منطقة جديدة</p>
      )}

      {(season !== '' || showFavoritesPage) && !searchQuery && <button className="home-btn" onClick={goHome}>{t.home}</button>}

      {showFavoritesPage && !selectedPlace && !searchQuery && (
        <div>
          <h2>❤️ الأماكن المفضلة</h2>
          {favoriteKeys.length === 0 ? (
            <p className="login-hint" style={{ textAlign: 'center' }}>ما ضفتي أي مكان للمفضلة بعد، دوسي ❤️ على أي بطاقة منطقة!</p>
          ) : (
            <div className="places-grid">
              {favoriteKeys.map(key => places[key] ? renderPlace(key, places[key]) : null)}
            </div>
          )}
        </div>
      )}

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
            <span>🔴 {lang === 'ar' ? 'مطاعم' : 'Restaurants'}</span>
            <span>🟢 {lang === 'ar' ? 'ماركت' : 'Markets'}</span>
            <span>🔵 {lang === 'ar' ? 'محطات وقود' : 'Fuel'}</span>
            <span>🟣 {lang === 'ar' ? 'مراكز صحية' : 'Health'}</span>
            <span>🟠 {lang === 'ar' ? 'بنوك' : 'Banks'}</span>
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
              <div className="places-grid">{userSummerPlaces.map((p) => renderPlace(p.id, p, true))}</div>
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
              <div className="places-grid">{userWinterPlaces.map((p) => renderPlace(p.id, p, true))}</div>
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
              <div className="places-grid">{userSpringPlaces.map((p) => renderPlace(p.id, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {galleryModalData && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={closeGalleryModal}
        >
          <div
            style={{ background: '#fff', borderRadius: 20, padding: 20, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', textAlign: 'right' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeGalleryModal} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            <h3 style={{ color: '#8B6914', marginBottom: 4 }}>🖼️ معرض صور {galleryModalData.placeName}</h3>
            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 14 }}>{galleryModalData.photos.length} صورة — دوسي على أي وحدة لتكبيرها</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {galleryModalData.photos.map((photoObj, i) => (
                <img
                  key={i}
                  src={photoObj.url}
                  alt={galleryModalData.placeName}
                  className="user-photo"
                  style={{ height: 110 }}
                  onClick={() => openLightbox(galleryModalData.photos, i, galleryModalData.placeName, galleryModalData.placeKey)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {lightboxData && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>

          {lightboxData.photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              style={{ position: 'absolute', insetInlineStart: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ‹
            </button>
          )}

          <img
            src={lightboxData.photos[lightboxData.index].url}
            alt={lightboxData.placeName}
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxData.photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              style={{ position: 'absolute', insetInlineEnd: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: '1.4rem', cursor: 'pointer' }}
            >
              ›
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); handleToggleLike(lightboxData.placeKey, lightboxData.photos[lightboxData.index]); }}
            style={{ position: 'absolute', bottom: 66, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '6px 16px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {(lightboxData.photos[lightboxData.index].likes || []).some((l) => (l && l.uid) === user?.uid) ? '❤️' : '🤍'} {(lightboxData.photos[lightboxData.index].likes || []).length}
          </button>

          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 20 }}>
            {lightboxData.index + 1} من {lightboxData.photos.length}
            {lightboxData.photos[lightboxData.index].uploadedBy && ` · رفعها ${lightboxData.photos[lightboxData.index].uploadedBy}`}
          </div>

          {user && lightboxData.photos[lightboxData.index].uploadedBy === user.displayName && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeletePhoto(lightboxData.placeKey, lightboxData.photos[lightboxData.index]); }}
              style={{ position: 'absolute', top: 20, left: 20, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              🗑️ احذفي صورتي
            </button>
          )}
        </div>
      )}

      <RahalChatbot userLocation={userLocation} userPlaces={userPlaces} />
    </div>
  );
}

export default App;
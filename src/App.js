import './App.css';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { db } from './firebase';
import { auth, signInWithGoogle, logOut, checkRedirectResult } from './Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, arrayUnion, arrayRemove, collection, addDoc, getDocs, increment, query, orderBy, limit, deleteDoc, where, updateDoc } from 'firebase/firestore';
import L from 'leaflet';
import emailjs from '@emailjs/browser';
import ImageUpload from './ImageUpload';
import translations from './translations';
import AboutPage from './AboutPage';

const places = {
  ajloun: { type: 'historical', name: 'عجلون', nameEn: 'Ajloun', lat: 32.33, lng: 35.75, img: '/ajloun.png', desc: 'قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲', descEn: 'A historic castle amid green forests with moderate summer weather 🌲', food: 'المقلوبة والمنسف', foodEn: 'Maqluba and Mansaf', season: 'summer', priceInfo: 'قلعة عجلون: 3 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: 'Ajloun Castle: 3 JOD for foreigners, 0.25 JOD for Jordanians' },
  irbid: { type: 'urban', name: 'إربد', nameEn: 'Irbid', lat: 32.56, lng: 35.85, img: '/irbid.png', desc: 'مدينة العلم والثقافة بشمال الأردن، أجواء معتدلة ومعالم تاريخية عريقة 🎓', descEn: 'The city of knowledge and culture in northern Jordan, with a moderate climate and rich historical landmarks 🎓', food: 'المكمورة', foodEn: 'Makmoura (traditional northern Jordanian dish)', season: 'summer' },
  amman: { type: 'urban', name: 'عمّان', nameEn: 'Amman', lat: 31.95, lng: 35.93, img: '/amman.png', desc: 'عاصمة المملكة النابضة بالحياة، تجمع بين التاريخ الروماني وحيوية المدينة الحديثة 🏛️', descEn: 'The vibrant capital of the Kingdom, blending Roman history with modern city life 🏛️', food: 'المنسف والكنافة', foodEn: 'Mansaf and Knafeh', season: 'summer' },
  jerash: { type: 'historical', name: 'جرش', nameEn: 'Jerash', lat: 32.28, lng: 35.89, img: '/jerash.png', desc: 'مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️', descEn: 'An ancient Roman city, one of the most important historical sites in Jordan 🏛️', food: 'المسخن والمنسف', foodEn: 'Musakhan and Mansaf', season: 'summer', priceInfo: '10 دنانير للأجانب، نصف دينار للأردنيين', priceInfoEn: '10 JOD for foreigners, 0.5 JOD for Jordanians' },
  umqais: { type: 'historical', name: 'أم قيس', nameEn: 'Um Qais', lat: 32.66, lng: 35.68, img: '/umqais.png', desc: 'أطلال رومانية تطل على بحيرة طبريا والجولان 🏛️', descEn: 'Roman ruins overlooking the Sea of Galilee and the Golan Heights 🏛️', food: 'المسخن وزيت الزيتون البلدي', foodEn: 'Musakhan and local olive oil', season: 'summer', priceInfo: '5 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '5 JOD for foreigners, 0.25 JOD for Jordanians' },
  deadsea: { type: 'relaxation', name: 'البحر الميت', nameEn: 'Dead Sea', lat: 31.70, lng: 35.60, img: '/dead-sea.png', desc: 'أخفض نقطة على سطح الأرض، مياه مالحة وطمي علاجي 🌊', descEn: 'The lowest point on Earth with healing salt water and therapeutic mud 🌊', food: 'التمر ومنتجات الطمي الطبيعية', foodEn: 'Dates and natural Dead Sea mud products', season: 'summer' },
  shouna: { type: 'nature', name: 'الشونة', nameEn: 'Shouna', lat: 32.34, lng: 35.58, img: '/shouna.png', desc: 'منطقة زراعية خضراء جميلة في الأغوار الشمالية 🌿', descEn: 'A beautiful green agricultural area in the Northern Jordan Valley 🌿', food: 'الخضار والفواكه الطازجة', foodEn: 'Fresh fruits and vegetables', season: 'summer' },
  salt: { type: 'historical', name: 'السلط', nameEn: 'Salt', lat: 32.03, lng: 35.72, img: '/salt.png', desc: 'مدينة تراثية عريقة مدرجة على قائمة التراث العالمي 🏘️', descEn: 'An ancient heritage city listed as a UNESCO World Heritage Site 🏘️', food: 'الكعك السلطي والعصبان', foodEn: "Salt-style Ka'ak and Osban", season: 'summer' },
  ummjimal: { type: 'historical', name: 'أم الجمال', nameEn: 'Umm el-Jimal', lat: 32.32, lng: 36.34, img: '/ummjimal.png', desc: 'مدينة أثرية بازلتية سوداء نادرة الطراز شمال شرق الأردن 🏛️', descEn: 'A rare black basalt ancient city in northeastern Jordan 🏛️', food: 'الفريكة ولبن الماعز', foodEn: 'Freekeh and goat yogurt', season: 'summer', priceInfo: '2 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '2 JOD for foreigners, 0.25 JOD for Jordanians' },
  pella: { type: 'historical', name: 'بيلا (طبقة فحل)', nameEn: 'Pella', lat: 32.45, lng: 35.61, img: '/pella.png', desc: 'مدينة أثرية بالأغوار الشمالية تعود لآلاف السنين 🏛️', descEn: 'An ancient city in the Northern Jordan Valley dating back thousands of years 🏛️', food: 'المسخن وزيت الزيتون', foodEn: 'Musakhan and olive oil', season: 'summer', priceInfo: '2 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '2 JOD for foreigners, 0.25 JOD for Jordanians' },
  mujib: { type: 'adventure', name: 'محمية وادي الموجب', nameEn: 'Wadi Mujib Reserve', lat: 31.48, lng: 35.58, img: '/mujib.png', desc: '"الجراند كانيون" الأردني، مسارات مياه ومغامرة وسط الطبيعة 🏞️', descEn: "Jordan's 'Grand Canyon', water trails and adventure amid stunning nature 🏞️", food: 'المنسف والمقلوبة', foodEn: 'Mansaf and Maqluba', season: 'summer', priceInfo: 'يبدأ من 15 دينار للأردنيين وحتى 44 دينار للأجانب حسب المسار (السيق أو الملاقي)', priceInfoEn: 'From 15 JOD (Jordanians) up to 44 JOD (foreigners) depending on the trail (Siq or Malaqi)' },
  tafilah: { type: 'nature', name: 'الطفيلة', nameEn: 'Tafilah', lat: 30.84, lng: 35.60, img: '/tafilah.png', desc: 'مدينة جبلية جنوبية، بوابة محمية ضانا وأجواء معتدلة صيفاً ⛰️', descEn: "A southern mountain city, gateway to Dana Reserve with mild summer weather ⛰️", food: 'زيت الزيتون والمقلوبة', foodEn: 'Olive oil and Maqluba', season: 'summer' },
  petra: { type: 'historical', name: 'البتراء', nameEn: 'Petra', lat: 30.33, lng: 35.44, img: '/petra.png', desc: 'إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️', descEn: 'One of the Seven Wonders of the World with warm winter weather ☀️', food: 'الزرب البدوي والمنسف', foodEn: 'Bedouin Zarb and Mansaf', season: 'winter', priceInfo: '50 دينار للأجانب (يوم واحد، وأرخص لليومين والثلاثة أيام)، 1 دينار للأردنيين', priceInfoEn: '50 JOD for foreigners (1-day pass, cheaper for 2-3 day passes), 1 JOD for Jordanians' },
  wadirum: { type: 'adventure', name: 'وادي رم', nameEn: 'Wadi Rum', lat: 29.58, lng: 35.42, img: '/wadirum.png', desc: 'صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️', descEn: 'A magical desert with golden colors and unforgettable camping experience 🏜️', food: 'الزرب (الطبخ تحت الرمل) والشاي البدوي', foodEn: 'Zarb (sand-buried BBQ) and Bedouin tea', season: 'winter', priceInfo: '5 دينار للأجانب، 1 دينار للأردنيين', priceInfoEn: '5 JOD for foreigners, 1 JOD for Jordanians' },
  aqaba: { type: 'relaxation', name: 'العقبة', nameEn: 'Aqaba', lat: 29.53, lng: 35.01, img: '/aqaba.png', desc: 'مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊', descEn: 'A warm coastal city in winter with the Red Sea and amazing coral reefs 🌊', food: 'السياديّة والمأكولات البحرية', foodEn: 'Sayadieh and fresh seafood', season: 'winter', priceInfo: 'قلعة العقبة: 3 دينار للأجانب، ربع دينار للأردنيين (المدينة نفسها مجانية)', priceInfoEn: 'Aqaba Castle: 3 JOD for foreigners, 0.25 JOD for Jordanians (the city itself is free)' },
  madaba: { type: 'religious', name: 'مادبا', nameEn: 'Madaba', lat: 31.71, lng: 35.79, img: '/madaba.png', desc: 'مدينة الفسيفساء والكنائس التاريخية الرائعة ⛪', descEn: 'The city of mosaics and amazing historic churches ⛪', food: 'المنسف والمقلوبة', foodEn: 'Mansaf and Maqluba', season: 'winter', priceInfo: '3 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '3 JOD for foreigners, 0.25 JOD for Jordanians' },
  karak: { type: 'historical', name: 'الكرك', nameEn: 'Karak', lat: 31.18, lng: 35.70, img: '/karak.png', desc: 'قلعة صليبية شامخة تطل على البحر الميت 🏰', descEn: 'A towering Crusader castle overlooking the Dead Sea 🏰', food: 'المنسف الكركي الأصيل', foodEn: 'Authentic Karak-style Mansaf', season: 'winter', priceInfo: '2 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '2 JOD for foreigners, 0.25 JOD for Jordanians' },
  deisa: { type: 'adventure', name: 'الديسة', nameEn: 'Deisa', lat: 29.69, lng: 35.47, img: '/deisa.png', desc: 'وادي ساحر بين الجبال الحمراء، مشي وطبيعة خلابة 🏔️', descEn: 'An enchanting valley between red mountains with stunning nature 🏔️', food: 'الزرب البدوي', foodEn: 'Bedouin Zarb', season: 'winter' },
  dana: { type: 'nature', name: 'محمية ضانا', nameEn: 'Dana Reserve', lat: 30.67, lng: 35.60, img: '/dana.png', desc: 'أكبر محمية طبيعية بالأردن، تنوع حيوي مذهل وسط جبال ووديان خلابة 🏔️', descEn: 'The largest nature reserve in Jordan, with amazing biodiversity amid stunning mountains and valleys 🏔️', food: 'أعشاب برية ومنتجات محلية عضوية', foodEn: 'Wild herbs and local organic products', season: 'winter', priceInfo: '8 دينار للأجانب، دينارين ونصف للأردنيين', priceInfoEn: '8 JOD for foreigners, 2.5 JOD for Jordanians' },
  mainhot: { type: 'relaxation', name: 'حمامات ماعين', nameEn: "Ma'in Hot Springs", lat: 31.58, lng: 35.68, img: '/mainhot.png', desc: 'شلالات ساخنة علاجية تنبع من الجبال، تجربة استرخاء فريدة وسط الطبيعة ♨️', descEn: 'Therapeutic hot waterfalls flowing from the mountains, a unique relaxation experience amid nature ♨️', food: 'الشاي بالميرمية والمأكولات الشعبية', foodEn: 'Sage tea and traditional dishes', season: 'winter', priceInfo: '15 دينار للأجانب، 10 دنانير للأردنيين', priceInfoEn: '15 JOD for foreigners, 10 JOD for Jordanians' },
  himma: { type: 'relaxation', name: 'الحمة الأردنية', nameEn: 'Al-Himma (Jordanian Himma)', lat: 32.66, lng: 35.63, img: '/himma.png', desc: 'ينابيع كبريتية ساخنة قرب أم قيس، شهيرة بالعلاج الطبيعي شتاءً ♨️', descEn: 'Hot sulfur springs near Umm Qais, famous for natural therapy in winter ♨️', food: 'المشاوي والشاي البلدي', foodEn: 'Grilled meats and local tea', season: 'winter' },
  azraqcastle: { type: 'historical', name: 'قلعة الأزرق', nameEn: 'Azraq Castle', lat: 31.83, lng: 36.82, img: '/azraqcastle.png', desc: 'قلعة أثرية من الحجر البازلتي الأسود وسط الصحراء الشرقية 🏰', descEn: 'An ancient black basalt fortress in the eastern desert 🏰', food: 'الفريكة والمنسف البدوي', foodEn: 'Freekeh and Bedouin Mansaf', season: 'winter', priceInfo: '3 دينار للأجانب، ربع دينار للأردنيين (ضمن مجموعة القصور الصحراوية)', priceInfoEn: '3 JOD for foreigners, 0.25 JOD for Jordanians (part of the desert castles group)' },
  azraqwetland: { type: 'nature', name: 'محمية الأزرق', nameEn: 'Azraq Wetland Reserve', lat: 31.85, lng: 36.82, img: '/azraqwetland.png', desc: 'واحة صحراوية فريدة تجمع الماء والطيور المهاجرة وسط الجفاف 🦆', descEn: 'A unique desert oasis with water and migratory birds amid the arid landscape 🦆', food: 'الأسماك المحلية والتمر', foodEn: 'Local fish and dates', season: 'winter', priceInfo: '8 دينار للأجانب، دينارين ونصف للأردنيين', priceInfoEn: '8 JOD for foreigners, 2.5 JOD for Jordanians' },
  qasramra: { type: 'historical', name: 'قصر عمرة', nameEn: 'Qasr Amra', lat: 31.80, lng: 36.59, img: '/qasramra.png', desc: 'قصر صحراوي أموي مدرج على قائمة التراث العالمي لليونسكو 🏜️', descEn: 'An Umayyad desert castle listed as a UNESCO World Heritage Site 🏜️', food: 'القهوة العربية والتمر', foodEn: 'Arabic coffee and dates', season: 'winter', priceInfo: '3 دينار للأجانب، ربع دينار للأردنيين (ضمن مجموعة القصور الصحراوية)', priceInfoEn: '3 JOD for foreigners, 0.25 JOD for Jordanians (part of the desert castles group)' },
  hallabat: { type: 'historical', name: 'قصر الحلابات', nameEn: 'Qasr Al-Hallabat', lat: 32.09, lng: 36.33, img: '/hallabat.png', desc: 'قصر صحراوي أموي بأعمدة أثرية وسط الصحراء الشرقية 🏛️', descEn: 'An Umayyad desert castle with ancient columns in the eastern desert 🏛️', food: 'القهوة العربية والتمر', foodEn: 'Arabic coffee and dates', season: 'winter', priceInfo: '3 دينار للأجانب، ربع دينار للأردنيين (ضمن مجموعة القصور الصحراوية)', priceInfoEn: '3 JOD for foreigners, 0.25 JOD for Jordanians (part of the desert castles group)' },
  shobak: { type: 'historical', name: 'قلعة الشوبك', nameEn: 'Shobak Castle', lat: 30.53, lng: 35.56, img: '/shobak.png', desc: 'قلعة صليبية شامخة على قمة جبل بالجنوب الأردني 🏰', descEn: 'A towering Crusader castle atop a mountain in southern Jordan 🏰', food: 'المنسف الجبلي', foodEn: 'Mountain-style Mansaf', season: 'winter', priceInfo: '1 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '1 JOD for foreigners, 0.25 JOD for Jordanians' },
  ummrasas: { type: 'religious', name: 'أم الرصاص', nameEn: 'Umm ar-Rasas', lat: 31.50, lng: 35.92, img: '/ummrasas.png', desc: 'موقع أثري مدرج على قائمة اليونسكو يضم فسيفساء رائعة 🏛️', descEn: 'A UNESCO-listed archaeological site featuring stunning mosaics 🏛️', food: 'الفريكة والمنسف البدوي', foodEn: 'Freekeh and Bedouin Mansaf', season: 'winter', priceInfo: '3 دينار للأجانب، ربع دينار للأردنيين', priceInfoEn: '3 JOD for foreigners, 0.25 JOD for Jordanians' },
  birgish: { type: 'nature', name: 'غابات برقش', nameEn: 'Birgish Forest', lat: 32.41, lng: 35.71, img: '/birgish.png', desc: 'غابات خضراء رائعة قرب إربد، وجهة مفضلة للتنزه والفرشة بالربيع 🌳', descEn: 'A beautiful green forest near Irbid, a favorite spring picnic destination 🌳', food: 'الفول والشاي بالنعناع', foodEn: 'Fava beans and mint tea', season: 'spring' },
  ummalnaml: { type: 'nature', name: 'أم النمل', nameEn: 'Um Al-Naml', lat: 32.45, lng: 35.69, img: '/ummalnaml.png', desc: 'وادٍ طبيعي خلاب بتلاله الخضراء وتنوعه البيئي، من أجمل وجهات الربيع بشمال الأردن 🌸', descEn: "A stunning natural valley with green hills and rich biodiversity, one of northern Jordan's most beautiful spring spots 🌸", food: 'المقلوبة والعكوب', foodEn: 'Maqluba and Akkoub', season: 'spring' },
  yarmouk: { type: 'nature', name: 'محمية اليرموك', nameEn: 'Yarmouk Forest Reserve', lat: 32.70, lng: 35.85, img: '/yarmouk.png', desc: 'محمية طبيعية شمالية بغابات كثيفة وتنوع نباتي رائع، وجهة مثالية للتنزه بالربيع 🌲', descEn: 'A northern nature reserve with dense forests and rich plant diversity, an ideal spring destination 🌲', food: 'الفول والزعتر البلدي', foodEn: 'Fava beans and local thyme', season: 'spring' },
  dibeen: { type: 'nature', name: 'غابات دبين', nameEn: 'Dibeen Forest Reserve', lat: 32.27, lng: 35.75, img: '/dibeen.png', desc: 'غابات صنوبر وسنديان كثيفة قرب جرش، من أشهر أماكن الفرشة والتنزه بالربيع 🌲', descEn: 'Dense pine and oak forests near Jerash, one of the most popular spring picnic spots 🌲', food: 'المقلوبة والزعتر', foodEn: 'Maqluba and thyme', season: 'spring', priceInfo: 'رسم دخول عن السيارة: دينارين (سيارة صغيرة) أو 3 دنانير (سيارة كبيرة)', priceInfoEn: 'Per-vehicle fee: 2 JOD (small car) or 3 JOD (large vehicle)' },
  shuaib: { type: 'nature', name: 'وادي شعيب', nameEn: "Wadi Shu'ayb", lat: 32.03, lng: 35.68, img: '/shuaib.png', desc: 'وادٍ أخضر خصب قرب السلط، بيتحول لسجادة خضراء وأزهار برية بالربيع 🌿', descEn: 'A fertile green valley near Salt that turns into a carpet of greenery and wildflowers in spring 🌿', food: 'الزيت والزعتر ومنتجات الوادي', foodEn: 'Olive oil, thyme, and local valley produce', season: 'spring' },
  rayan: { type: 'nature', name: 'وادي الريان', nameEn: 'Wadi Rayan', lat: 32.42, lng: 35.77, img: '/rayan.png', desc: 'وادٍ أخضر خلاب قرب عجلون وإربد، بمياه جارية وشلالات صغيرة ومزارع رمان وتين 🌸', descEn: 'A stunning green valley near Ajloun and Irbid, with flowing water, small waterfalls, and pomegranate and fig farms 🌸', food: 'الرمان والتين البلدي', foodEn: 'Local pomegranates and figs', season: 'spring' },
  binhammad: { type: 'adventure', name: 'وادي بن حماد', nameEn: 'Wadi Bin Hammad', lat: 31.30, lng: 35.58, img: '/binhammad.png', desc: 'وادٍ مائي بشلالات وينابيع معدنية دافئة شمال غرب الكرك، مسار مغامرة وسط الطبيعة 💧', descEn: 'A water valley with waterfalls and warm mineral springs northwest of Karak, an adventure trail through nature 💧', food: 'المنسف الكركي الأصيل', foodEn: 'Authentic Karak-style Mansaf', season: 'spring' },
  feynan: { type: 'nature', name: 'وادي فينان', nameEn: 'Wadi Feynan', lat: 30.65, lng: 35.44, img: '/feynan.png', desc: 'وادٍ صحراوي هادئ بمحمية ضانا، مشهور بسمائه الصافية من التلوث الضوئي وآثار مناجم النحاس القديمة ✨', descEn: 'A quiet desert valley within Dana Reserve, famous for its dark, light-pollution-free skies and ancient copper mine ruins ✨', food: 'أعشاب برية ومنتجات محلية عضوية', foodEn: 'Wild herbs and local organic products', season: 'winter' },
  ziqlab: { type: 'nature', name: 'وادي زقلاب', nameEn: 'Wadi Ziqlab', lat: 32.47, lng: 35.63, img: '/zqalab.png', desc: 'وادٍ دائم الجريان بلواء الكورة قرب دير أبي سعيد، فيه سد شرحبيل بن حسنة ومزارع رمان وحمضيات وموز 🌊', descEn: 'A perennially flowing valley in the Kourah district near Deir Abi Said, home to the Shurahbil bin Hasna Dam and farms of pomegranates, citrus, and bananas 🌊', food: 'الرمان والحمضيات البلدية', foodEn: 'Local pomegranates and citrus', season: 'spring' },
};

const summerKeys = ['ajloun', 'irbid', 'jerash', 'umqais', 'deadsea', 'shouna', 'salt', 'amman', 'ummjimal', 'pella', 'mujib', 'tafilah'];
const winterKeys = ['petra', 'wadirum', 'aqaba', 'madaba', 'karak', 'deisa', 'dana', 'mainhot', 'himma', 'azraqcastle', 'azraqwetland', 'qasramra', 'hallabat', 'shobak', 'ummrasas', 'feynan'];
const springKeys = ['birgish', 'ummalnaml', 'yarmouk', 'dibeen', 'shuaib', 'rayan', 'binhammad', 'ziqlab'];

// أماكن مميزة تظهر بقسم "الأكثر زيارة" بالصفحة الرئيسية
const POPULAR_PLACE_KEYS = ['petra', 'wadirum', 'deadsea', 'jerash'];

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
  yarmouk: { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  dibeen: { budget: 'under20', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  shuaib: { budget: 'free', companions: ['alone', 'family', 'friends'], duration: '2h' },
  rayan: { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' },
  binhammad: { budget: 'free', companions: ['alone', 'friends'], duration: 'half' },
  feynan: { budget: 'under20', companions: ['alone', 'family', 'friends'], duration: 'full' },
};

function durationLabel(d, lang = 'ar') {
  if (lang === 'en') {
    if (d === '2h') return 'about 2 hours';
    if (d === 'half') return 'half a day';
    return 'a full day';
  }
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
  const match = text.match(/(\d+)\s*(يوم|أيام|ايام|days?)/i);
  if (match) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 10) return n;
  }
  return 2; // افتراضي لو ما ذكر عدد الأيام
}

function extractBudgetNumber(text) {
  const match = text.match(/(\d+)\s*(دينار|دنانير|jod|jd)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

// بيدور عن وقت بداية اليوم يلي حددتيه (مثلاً: "بدي أطلع الساعة 11" أو "at 11 o'clock")
function extractStartTime(text) {
  const match = text.match(/الساعة\s*(\d{1,2})|(\d{1,2})\s*(?:o'?clock|am|pm)/i);
  if (match) {
    const h = parseInt(match[1] || match[2], 10);
    if (h >= 1 && h <= 23) return h;
  }
  return null;
}

// بيحول رقم الساعة (ممكن يكون فيه نص ساعة) لصيغة عربية مقروءة
function formatHour(hourDecimal, lang = 'ar') {
  const totalMinutes = Math.round(hourDecimal * 60);
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = lang === 'en' ? (h < 12 ? 'AM' : 'PM') : (h < 12 ? 'صباحاً' : 'مساءً');
  let displayHour = h % 12;
  if (displayHour === 0) displayHour = 12;
  return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// بيبني جدول الأوقات لليوم كامل حسب وقت البداية يلي حددته (أو 8 الصبح افتراضياً)
function buildDaySchedule(startHour, lang = 'ar') {
  const base = startHour !== null ? startHour : 8;
  // لو المستخدم بده يطلع الساعة 10 أو بعدها، منفترض إنه فطر قبل — نتخطى الفطور
  const skipBreakfast = startHour !== null && startHour >= 10;
  const firstHour = skipBreakfast ? base : base + 1.5;
  const secondHour = firstHour + 2;
  const lunchHour = secondHour + 2;
  const afternoonHour = lunchHour + 1.5;
  return {
    skipBreakfast,
    breakfastTime: formatHour(base, lang),
    morningTimes: [formatHour(firstHour, lang), formatHour(secondHour, lang)],
    lunchTime: formatHour(lunchHour, lang),
    afternoonTime: formatHour(afternoonHour, lang),
  };
}

// بيوحّد أشكال الألف المختلفة (أ إ آ ا) عشان المطابقة تكون صح
// حتى لو المستخدم كتب الاسم بشكل مختلف شوي عن المخزّن بالتطبيق
function normalizeArabic(text) {
  return text.replace(/[أإآ]/g, 'ا');
}

// بيدور بالأماكن الرسمية وبالأماكن يلي أضافها الزوار مع بعض
function extractMentionedPlaces(text, userPlaces) {
  const normalizedText = normalizeArabic(text);

  const officialMatches = Object.keys(places)
    .filter((key) => normalizedText.includes(normalizeArabic(places[key].name)) || normalizedText.toLowerCase().includes(places[key].nameEn.toLowerCase()))
    .map((key) => ({ key, place: places[key], isUserPlace: false }));

  const userMatches = (userPlaces || [])
    .filter((p) => p.name && normalizedText.includes(normalizeArabic(p.name)))
    .map((p) => ({ key: p.id, place: p, isUserPlace: true }));

  return [...officialMatches, ...userMatches];
}

function budgetRangeForCategory(category, lang = 'ar') {
  if (lang === 'en') {
    if (category === 'free') return '5-10 JOD (food and small expenses only)';
    if (category === 'under20') return '15-25 JOD';
    return '30-50 JOD';
  }
  if (category === 'free') return '5-10 دينار (أكل ومصاريف بسيطة فقط)';
  if (category === 'under20') return '15-25 دينار';
  return '30-50 دينار';
}

// ===== أنشطة محددة وحقيقية لكل منطقة — مش وصف عام بس =====
const PLACE_ACTIVITIES = {
  petra: [
    { name: 'زيارة الخزنة (Treasury)', nameEn: 'Visit the Treasury (Al-Khazneh)', description: 'المعلم الأشهر بالبتراء، أول ما تشوفه بعد المشي بالسيق الضيق', descriptionEn: "Petra's most iconic landmark, the first thing you see after walking through the narrow Siq", durationHint: 'ساعة إلى ساعتين', durationHintEn: '1 to 2 hours' },
    { name: 'المشي لدير البتراء (900 درجة)', nameEn: 'Hike to the Monastery (900 steps)', description: 'مسير يستاهل التعب، إطلالة رائعة من فوق', descriptionEn: 'A tiring but rewarding hike with a stunning view from the top', durationHint: 'ساعتين إلى ثلاثة', durationHintEn: '2 to 3 hours' },
    { name: 'استكشاف المدافن الملكية', nameEn: 'Explore the Royal Tombs', description: 'نقوش وواجهات صخرية مذهلة بألوان طبيعية رائعة', descriptionEn: 'Stunning rock-cut facades with beautiful natural colors', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  wadirum: [
    { name: 'جولة سفاري بسيارات الدفع الرباعي', nameEn: '4x4 desert safari', description: 'استكشاف الوادي والكثبان الرملية والصخور الشهيرة', descriptionEn: 'Explore the valley, sand dunes, and famous rock formations', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
    { name: 'تسلق الكثبان الرملية ومشاهدة الغروب', nameEn: 'Climb the dunes and watch the sunset', description: 'تجربة لا تُنسى وقت غروب الشمس بألوانها الذهبية', descriptionEn: 'An unforgettable experience as the sun sets in golden colors', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour', idealTime: '05:30 مساءً', idealTimeEn: '5:30 PM' },
    { name: 'ركوب الجمال بالصحراء', nameEn: 'Camel ride in the desert', description: 'تجربة بدوية أصيلة وسط الرمال', descriptionEn: 'An authentic Bedouin experience among the sands', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour', suitableFor: ['family', 'kids', 'alone'] },
  ],
  aqaba: [
    { name: 'الغطس أو السنوركل بالشعاب المرجانية', nameEn: 'Diving or snorkeling at the coral reefs', description: 'بحر أحمر بألوان وحياة بحرية خلابة', descriptionEn: 'The Red Sea with vibrant colors and stunning marine life', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours', suitableFor: ['friends', 'alone'] },
    { name: 'نزهة على كورنيش العقبة', nameEn: 'Stroll along the Aqaba corniche', description: 'إطلالة على البحر الأحمر وأجواء المدينة الساحلية', descriptionEn: 'A view of the Red Sea and the coastal city atmosphere', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'زيارة القلعة المملوكية', nameEn: 'Visit the Mamluk Castle', description: 'معلم تاريخي بوسط المدينة يستاهل زيارة سريعة', descriptionEn: 'A historic landmark downtown worth a quick visit', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  deadsea: [
    { name: 'طفو بمياه البحر الميت', nameEn: 'Float in the Dead Sea', description: 'تجربة فريدة عالمياً — جسمك بيطفو لحاله', descriptionEn: 'A globally unique experience — your body floats on its own', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'تجربة طمي البحر الميت العلاجي', nameEn: 'Try the therapeutic Dead Sea mud', description: 'طمي طبيعي مفيد للبشرة، مأخوذ من نفس المنطقة', descriptionEn: 'Natural mud that benefits the skin, sourced from the area', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
    { name: 'مشاهدة الغروب على البحر الميت', nameEn: 'Watch the sunset over the Dead Sea', description: 'مناظر خلابة وقت الغروب فوق المياه', descriptionEn: 'Stunning views at sunset over the water', durationHint: 'نص ساعة', durationHintEn: 'half an hour', idealTime: '05:30 مساءً', idealTimeEn: '5:30 PM' },
  ],
  jerash: [
    { name: 'جولة بالمدرج الروماني الجنوبي', nameEn: 'Tour the South Roman Theatre', description: 'آثار رومانية محفوظة بعناية كبيرة', descriptionEn: 'Beautifully preserved Roman ruins', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'المشي بشارع الأعمدة (Cardo)', nameEn: 'Walk the Colonnaded Street (Cardo)', description: 'قلب المدينة الأثرية القديمة', descriptionEn: 'The heart of the ancient archaeological city', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'زيارة معبد أرتميس', nameEn: 'Visit the Temple of Artemis', description: 'من أهم وأعرق المعابد بالموقع الأثري', descriptionEn: 'One of the most important and ancient temples at the site', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  ajloun: [
    { name: 'زيارة قلعة عجلون', nameEn: 'Visit Ajloun Castle', description: 'قلعة تاريخية بإطلالة رائعة على المنطقة المحيطة', descriptionEn: 'A historic castle with stunning views over the surrounding area', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'مسير بغابات عجلون', nameEn: 'Hike through the Ajloun forests', description: 'طبيعة خضراء وأجواء منعشة، خصوصاً بالربيع والصيف', descriptionEn: 'Green nature and refreshing air, especially in spring and summer', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
  ],
  madaba: [
    { name: 'زيارة كنيسة الخريطة الفسيفسائية', nameEn: 'Visit the Map Mosaic Church', description: 'أشهر معلم بمادبا، خريطة فسيفساء تاريخية نادرة', descriptionEn: "Madaba's most famous landmark, a rare historic mosaic map", durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
    { name: 'جولة بمتحف الفسيفساء الأردني', nameEn: 'Tour the Jordan Mosaic Museum', description: 'فن الفسيفساء التاريخي بتفاصيل رائعة', descriptionEn: 'Historic mosaic art with stunning detail', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  karak: [
    { name: 'استكشاف قلعة الكرك الصليبية', nameEn: 'Explore the Karak Crusader Castle', description: 'قلعة ضخمة بإطلالة مذهلة على البحر الميت', descriptionEn: 'A massive castle with an amazing view of the Dead Sea', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
  ],
  dana: [
    { name: 'مسير الوادي الكامل بمحمية ضانا', nameEn: 'Hike the full valley trail in Dana Reserve', description: 'طبيعة جبلية خلابة وتنوع بيئي مميز', descriptionEn: 'Stunning mountain nature and remarkable biodiversity', durationHint: 'نص يوم', durationHintEn: 'half a day' },
    { name: 'مراقبة الطيور والحياة البرية', nameEn: 'Birdwatching and wildlife spotting', description: 'فرصة لمشاهدة كائنات نادرة بموطنها الطبيعي', descriptionEn: 'A chance to see rare creatures in their natural habitat', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  mainhot: [
    { name: 'الاستحمام بالشلالات الساخنة', nameEn: 'Bathe in the hot waterfalls', description: 'تجربة علاجية واسترخائية وسط الطبيعة', descriptionEn: 'A therapeutic, relaxing experience amid nature', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  azraqwetland: [
    { name: 'مراقبة الطيور المهاجرة', nameEn: 'Watch migratory birds', description: 'محمية مائية فريدة وسط الصحراء الشرقية', descriptionEn: 'A unique wetland reserve in the eastern desert', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  amman: [
    { name: 'زيارة جبل القلعة والمدرج الروماني', nameEn: 'Visit the Citadel and Roman Theatre', description: 'قلب عمّان التاريخي بإطلالة بانورامية على المدينة', descriptionEn: 'The historic heart of Amman with a panoramic city view', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
    { name: 'التجول بوسط البلد', nameEn: 'Walk around Downtown Amman', description: 'أسواق تقليدية وأجواء حيوية أصيلة', descriptionEn: 'Traditional markets and an authentic lively atmosphere', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  irbid: [
    { name: 'زيارة متحف الآثار بجامعة اليرموك', nameEn: 'Visit the Yarmouk University Archaeology Museum', description: 'قطع أثرية نادرة من شمال الأردن بحرم جامعي جميل', descriptionEn: 'Rare artifacts from northern Jordan on a beautiful campus', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'التجول بحديقة الحسين العامة', nameEn: 'Walk around Al-Hussein Public Park', description: 'مساحة خضراء واسعة بقلب المدينة للتنزه', descriptionEn: 'A large green space downtown, great for a walk', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour', suitableFor: ['family', 'kids'] },
    { name: 'استكشاف بيت عرار الثقافي', nameEn: "Explore Arar's Cultural House", description: 'بيت الشاعر مصطفى وهبي التل، أجواء تراثية وثقافية', descriptionEn: "The home of poet Mustafa Wahbi al-Tal, with a heritage and cultural atmosphere", durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  umqais: [
    { name: 'جولة بالآثار الرومانية (أم قيس القديمة)', nameEn: 'Tour the Roman ruins (ancient Umm Qais)', description: 'أطلال رومانية بإطلالة على بحيرة طبريا والجولان', descriptionEn: 'Roman ruins overlooking the Sea of Galilee and the Golan Heights', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
    { name: 'مشاهدة الغروب من أم قيس', nameEn: 'Watch the sunset from Umm Qais', description: 'من أجمل نقاط مشاهدة الغروب بشمال الأردن', descriptionEn: 'One of the best sunset spots in northern Jordan', durationHint: 'نص ساعة', durationHintEn: 'half an hour', idealTime: '05:30 مساءً', idealTimeEn: '5:30 PM' },
  ],
  shouna: [
    { name: 'جولة بالمزارع والبساتين المحلية', nameEn: 'Tour the local farms and orchards', description: 'تجربة زراعية بمنطقة خصبة بالأغوار الشمالية', descriptionEn: 'An agricultural experience in a fertile Northern Jordan Valley area', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour', suitableFor: ['family', 'kids'] },
    { name: 'شراء خضار وفواكه طازجة من المزارعين', nameEn: 'Buy fresh produce from local farmers', description: 'منتجات طازجة مباشرة من الأرض', descriptionEn: 'Fresh products straight from the land', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  salt: [
    { name: 'التجول بالبلدة القديمة والمباني التراثية', nameEn: 'Walk around the old town and heritage buildings', description: 'عمارة صفراء مميزة مدرجة على قائمة التراث العالمي', descriptionEn: 'Distinctive yellow architecture listed as a UNESCO World Heritage Site', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'زيارة متحف السلط التاريخي', nameEn: 'Visit the Salt History Museum', description: 'قصص وتاريخ المدينة العريقة', descriptionEn: 'Stories and history of the ancient city', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
    { name: 'تذوق الكعك السلطي من أفران البلدة', nameEn: "Try Salt-style Ka'ak from local bakeries", description: 'أكلة محلية شهيرة يستاهل تجربتها', descriptionEn: 'A famous local treat worth trying', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  ummjimal: [
    { name: 'استكشاف المدينة الأثرية البازلتية السوداء', nameEn: 'Explore the black basalt ancient city', description: 'طراز معماري نادر شمال شرق الأردن', descriptionEn: 'A rare architectural style in northeastern Jordan', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  pella: [
    { name: 'زيارة الموقع الأثري بطبقة فحل', nameEn: 'Visit the Pella archaeological site', description: 'مدينة أثرية تعود لآلاف السنين بالأغوار الشمالية', descriptionEn: 'An ancient city thousands of years old in the Northern Jordan Valley', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'استكشاف الكنائس والمعابد القديمة', nameEn: 'Explore the ancient churches and temples', description: 'آثار تاريخية متنوعة بالموقع', descriptionEn: 'A variety of historic ruins at the site', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  mujib: [
    { name: 'مسير المسار المائي بوادي الموجب', nameEn: 'Hike the Wadi Mujib water trail', description: '"الجراند كانيون" الأردني — مغامرة وسط المياه والصخور', descriptionEn: "Jordan's 'Grand Canyon' — an adventure through water and rocks", durationHint: 'ساعتين إلى ثلاثة', durationHintEn: '2 to 3 hours', suitableFor: ['friends', 'alone'] },
  ],
  tafilah: [
    { name: 'التجول بالمدينة الجبلية', nameEn: 'Walk around the mountain city', description: 'أجواء معتدلة وإطلالات جبلية جنوبية هادئة', descriptionEn: 'Mild weather and calm southern mountain views', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'زيارة بوابة محمية ضانا القريبة', nameEn: 'Visit the nearby Dana Reserve gateway', description: 'نقطة انطلاق مثالية لاستكشاف الطبيعة المحيطة', descriptionEn: 'A perfect starting point to explore the surrounding nature', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  deisa: [
    { name: 'مشي بالوادي بين الجبال الحمراء', nameEn: 'Walk the valley between the red mountains', description: 'طبيعة خلابة قريبة من العقبة', descriptionEn: 'Stunning nature close to Aqaba', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours' },
    { name: 'تخييم ليلي بالطبيعة الجبلية', nameEn: 'Overnight camping in the mountains', description: 'تجربة هادئة بعيدة عن صخب المدينة', descriptionEn: 'A calm experience away from city noise', durationHint: 'حسب رغبتك', durationHintEn: 'as long as you like', suitableFor: ['friends', 'alone'] },
  ],
  himma: [
    { name: 'الاستحمام بالينابيع الكبريتية الساخنة', nameEn: 'Bathe in the hot sulfur springs', description: 'تجربة علاجية طبيعية شهيرة شتاءً', descriptionEn: 'A famous natural therapy experience in winter', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  azraqcastle: [
    { name: 'استكشاف قلعة الأزرق الأثرية', nameEn: 'Explore the ancient Azraq Castle', description: 'قلعة بازلتية سوداء وسط الصحراء الشرقية', descriptionEn: 'A black basalt fortress in the eastern desert', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  qasramra: [
    { name: 'زيارة قصر عمرة الأموي', nameEn: 'Visit the Umayyad Qasr Amra', description: 'موقع مسجل على قائمة التراث العالمي لليونسكو', descriptionEn: 'A UNESCO World Heritage listed site', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
    { name: 'مشاهدة الرسومات الجدارية الأثرية', nameEn: 'View the ancient wall paintings', description: 'نقوش نادرة داخل القصر الصحراوي', descriptionEn: 'Rare artwork inside the desert castle', durationHint: 'نص ساعة', durationHintEn: 'half an hour' },
  ],
  hallabat: [
    { name: 'استكشاف قصر الحلابات الأموي', nameEn: 'Explore the Umayyad Qasr Al-Hallabat', description: 'أعمدة وآثار وسط الصحراء الشرقية', descriptionEn: 'Columns and ruins in the eastern desert', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  shobak: [
    { name: 'تسلق قلعة الشوبك الصليبية', nameEn: 'Climb up to Shobak Crusader Castle', description: 'قلعة شامخة على قمة جبل بالجنوب الأردني', descriptionEn: 'A towering castle atop a mountain in southern Jordan', durationHint: 'ساعة إلى ساعتين', durationHintEn: '1 to 2 hours' },
  ],
  ummrasas: [
    { name: 'زيارة موقع أم الرصاص الأثري', nameEn: 'Visit the Umm ar-Rasas archaeological site', description: 'موقع مسجل باليونسكو يضم فسيفساء رائعة', descriptionEn: 'A UNESCO-listed site featuring stunning mosaics', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  birgish: [
    { name: 'فرشة وتنزه بغابات برقش', nameEn: 'Picnic and walk in the Birgish forests', description: 'غابات خضراء رائعة قرب إربد، مفضلة للربيع', descriptionEn: 'Beautiful green forests near Irbid, popular in spring', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours', suitableFor: ['family', 'friends', 'kids'] },
  ],
  ummalnaml: [
    { name: 'مشي بالوادي الأخضر ومشاهدة التلال', nameEn: 'Walk the green valley and view the hills', description: 'وادٍ طبيعي خلاب من أجمل وجهات الربيع', descriptionEn: 'A stunning natural valley, one of the best spring destinations', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours', suitableFor: ['family', 'friends', 'kids'] },
  ],
  yarmouk: [
    { name: 'مسير بغابات المحمية', nameEn: 'Hike through the reserve forests', description: 'غابات كثيفة وتنوع نباتي وحيواني رائع', descriptionEn: 'Dense forests with rich plant and animal diversity', durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours', suitableFor: ['family', 'friends', 'kids'] },
    { name: 'مراقبة الطيور والحياة البرية', nameEn: 'Birdwatching and wildlife spotting', description: 'فرصة مشاهدة كائنات نادرة بموطنها الطبيعي', descriptionEn: 'A chance to see rare creatures in their natural habitat', durationHint: 'ساعة تقريباً', durationHintEn: 'about an hour' },
  ],
  dibeen: [
    { name: 'فرشة وتنزه بغابات الصنوبر', nameEn: 'Picnic among the pine forests', description: 'من أشهر أماكن الفرشة بالأردن، أجواء خضراء منعشة', descriptionEn: "One of Jordan's most popular picnic spots, with fresh green surroundings", durationHint: 'ساعتين تقريباً', durationHintEn: 'about 2 hours', suitableFor: ['family', 'friends', 'kids'] },
    { name: 'مسير مسارات المحمية', nameEn: 'Walk the reserve trails', description: 'مسارات مشي وسط الطبيعة لكل المستويات', descriptionEn: 'Walking trails through nature suitable for all levels', durationHint: 'ساعة ونص تقريباً', durationHintEn: 'about 1.5 hours' },
  ],
  shuaib: [
    { name: 'مشي بالوادي ومشاهدة الأزهار البرية', nameEn: 'Walk the valley and see wildflowers', description: 'سجادة خضراء وأزهار برية بالربيع', descriptionEn: 'A carpet of greenery and wildflowers in spring', durationHint: 'ساعة ونص تقريباً', durationHintEn: 'about 1.5 hours', suitableFor: ['family', 'friends', 'kids'] },
  ],
};

// بيرجع أنشطة محددة للمكان لو موجودة، وإلا بيستخدم الوصف العام كـ fallback
function getPlaceActivities(key, place, lang = 'ar') {
  if (PLACE_ACTIVITIES[key]) {
    return PLACE_ACTIVITIES[key].map((act) => ({
      name: lang === 'en' ? (act.nameEn || act.name) : act.name,
      description: lang === 'en' ? (act.descriptionEn || act.description) : act.description,
      durationHint: lang === 'en' ? (act.durationHintEn || act.durationHint) : act.durationHint,
      idealTime: lang === 'en' ? (act.idealTimeEn || act.idealTime) : act.idealTime,
      suitableFor: act.suitableFor,
    }));
  }
  const fallbackName = lang === 'en' ? (place.nameEn || place.name) : place.name;
  const fallbackDesc = lang === 'en' ? (place.descEn || place.desc) : place.desc;
  return [{ name: fallbackName, description: fallbackDesc, durationHint: lang === 'en' ? 'as long as you like' : 'حسب رغبتك' }];
}

// ============================================================
// معلومات ثقافية موثقة لأهم المواقع التاريخية والتراثية — خلفية
// تاريخية موجزة + نصيحة سلوك مسؤول تناسب طبيعة المكان. عمداً
// اقتصرنا على المواقع يلي عندنا معلومات موثوقة عنها فقط (بدل
// ما نخترع معلومات لكل الـ36 منطقة) — نفس مبدأ الصدق المتبع
// برسوم الدخول
// ============================================================
const CULTURAL_INFO = {
  petra: {
    history: 'بناها الأنباط عاصمة لمملكتهم قبل أكتر من 2000 سنة، واستخدموها كمحطة رئيسية على طريق تجارة البخور والتوابل بين الجزيرة العربية والبحر المتوسط. اتصنّفت إحدى عجائب الدنيا السبع الجديدة، ومسجلة على قائمة التراث العالمي لليونسكو.',
    historyEn: 'Built by the Nabataeans as their capital over 2000 years ago, Petra served as a key stop on the incense and spice trade route between Arabia and the Mediterranean. Named one of the New Seven Wonders of the World and a UNESCO World Heritage Site.',
    tip: 'لا تلمس أو تخدش النقوش الصخرية، والتزم بالمسارات المخصصة، وتجنب التسلق على الواجهات الأثرية.',
    tipEn: "Don't touch or scratch the rock carvings, stick to marked trails, and avoid climbing on the ancient facades.",
  },
  jerash: {
    history: 'واحدة من أفضل المدن الرومانية المحفوظة خارج إيطاليا، كانت جزء من "مدن العشرة" (ديكابوليس) الرومانية. عمرانها يعود لأكتر من 2000 سنة، وفيها شارع الأعمدة والمدرجات الرومانية بحالة استثنائية.',
    historyEn: 'One of the best-preserved Roman cities outside Italy, Jerash was part of the Roman Decapolis. Its architecture dates back over 2000 years, featuring an exceptionally preserved colonnaded street and Roman theatres.',
    tip: 'امشي بس على المسارات الحجرية المخصصة، ولا تجلسي أو تتسلقي على الأعمدة والجدران الأثرية.',
    tipEn: 'Walk only on the designated stone paths, and avoid sitting or climbing on the ancient columns and walls.',
  },
  ajloun: {
    history: 'بناها القائد صلاح الدين الأيوبي سنة 1184م لمراقبة تحركات الصليبيين وحماية طرق التجارة بين الأردن وسوريا. تعتبر من أهم القلاع الإسلامية بالمنطقة.',
    historyEn: "Built in 1184 CE by Saladin's forces to monitor Crusader movements and protect trade routes between Jordan and Syria. One of the most significant Islamic-era castles in the region.",
    tip: 'احترم حدود المسارات المخصصة داخل القلعة، ولا ترمِ نفايات بالغابات المحيطة.',
    tipEn: "Respect the designated paths inside the castle, and don't litter in the surrounding forests.",
  },
  karak: {
    history: 'قلعة صليبية ضخمة بنيت منتصف القرن الـ12، وشهدت معارك مهمة بين الصليبيين وصلاح الدين. تحوي أنفاق ومخازن تحت أرضية توضح فن العمارة الدفاعية بهالفترة.',
    historyEn: "A massive Crusader castle built in the mid-12th century, site of major battles between the Crusaders and Saladin's forces. Its underground tunnels and storerooms showcase medieval defensive architecture.",
    tip: 'انتبه أثناء التجول بالممرات الداخلية المظلمة، ولا تلمس الجدران الحجرية الهشة.',
    tipEn: 'Be careful walking through the dark internal passages, and avoid touching the fragile stone walls.',
  },
  shobak: {
    history: 'أول قلعة صليبية بمنطقة الأردن، بنيت سنة 1115م، وكانت تُعرف باسم "كراك دي مونتريال". استعادها صلاح الدين سنة 1189م بعد حصار طويل.',
    historyEn: 'The first Crusader castle in Jordan, built in 1115 CE and known as "Krak de Montréal". Reclaimed by Saladin in 1189 CE after a long siege.',
    tip: 'الأرضية داخل القلعة غير مستوية بأماكن كتير، احترسي أثناء التجول خصوصاً مع الأطفال.',
    tipEn: 'The ground inside the castle is uneven in many places — be careful while walking, especially with children.',
  },
  umqais: {
    history: 'مدينة "جدارا" الرومانية القديمة، اشتهرت بعلمائها وفلاسفتها بالعصر الروماني، وتطل على بحيرة طبريا وهضبة الجولان. فيها مزيج معماري روماني وبيزنطي وعثماني بنفس الموقع.',
    historyEn: 'The ancient Roman city of "Gadara", once known for its scholars and philosophers. Overlooks the Sea of Galilee and the Golan Heights, with a blend of Roman, Byzantine, and Ottoman architecture in one site.',
    tip: 'تجنب المشي بالمناطق غير المرممة من الموقع الأثري، والتزم بالمسارات المُشار إليها.',
    tipEn: 'Avoid walking through unrestored parts of the site, and stick to marked paths.',
  },
  madaba: {
    history: 'تُعرف بـ"مدينة الفسيفساء"، وفيها خريطة الفسيفساء الأشهر بالعالم لفلسطين والأردن يعود تاريخها للقرن السادس ميلادي، محفوظة بكنيسة القديس جاورجيوس الأرثوذكسية.',
    historyEn: 'Known as the "City of Mosaics", home to the world-famous 6th-century Madaba Map mosaic depicting Palestine and Jordan, preserved inside St. George\'s Orthodox Church.',
    tip: 'خفف صوتك واحترم أوقات الصلاة إذا زرت الكنائس، والتصوير بدون فلاش للمحافظة على الفسيفساء.',
    tipEn: 'Keep your voice down and respect prayer times if visiting the churches, and photograph without flash to help preserve the mosaics.',
  },
  ummrasas: {
    history: 'موقع أثري مسجل باليونسكو، فيه بقايا كنائس بيزنطية بفسيفساء رائعة تعود للقرن الثامن ميلادي، وبرج حجري غامض ما زال سبب بنائه غير مؤكد للباحثين.',
    historyEn: 'A UNESCO-listed site featuring 8th-century Byzantine church mosaics and a mysterious stone tower whose exact purpose remains debated among researchers.',
    tip: 'الموقع بعيد نسبياً وقليل الخدمات — خذ معك ماء كافي، والتزم بالمسارات المرصوفة.',
    tipEn: 'The site is fairly remote with limited services — bring enough water, and stick to the paved paths.',
  },
  wadirum: {
    history: 'موطن قبائل بدوية أردنية عريقة عايشوا هالصحراء لأجيال، واشتهر عالمياً بعد ثورة الشريف حسين ودور لورنس العرب. مسجل على قائمة اليونسكو للتراث الطبيعي والثقافي المختلط.',
    historyEn: "Home to Bedouin tribes who have lived in this desert for generations, made globally famous after the Great Arab Revolt and Lawrence of Arabia's role there. A UNESCO Mixed Natural and Cultural Heritage Site.",
    tip: 'احترم عادات المجتمع البدوي المحلي، أطفئ النار بالكامل قبل المغادرة، ولا تترك نفايات بالصحراء.',
    tipEn: 'Respect local Bedouin customs, fully extinguish fires before leaving, and never litter in the desert.',
  },
  aqaba: {
    history: 'أقدم مدينة ساحلية مأهولة بالعالم (يعود تاريخها لأكتر من 6000 سنة)، وكانت ميناء تجاري مهم على طريق التجارة بين آسيا وأوروبا وأفريقيا منذ العصر البرونزي.',
    historyEn: "One of the oldest continuously inhabited coastal cities in the world (dating back over 6000 years), historically a key trading port linking Asia, Europe, and Africa since the Bronze Age.",
    tip: 'احترم الشعاب المرجانية أثناء الغطس أو السباحة، ولا تلمسها أو تقف عليها.',
    tipEn: "Respect the coral reefs while diving or swimming — don't touch or stand on them.",
  },
  amman: {
    history: 'كانت تُعرف قديماً بـ"فيلادلفيا" بالعصر الروماني، وقبلها "ربّة عمّون" عاصمة مملكة عمّون. جبل القلعة يحوي طبقات حضارية متراكمة من العصر البرونزي حتى الأموي.',
    historyEn: 'Known as "Philadelphia" in Roman times, and before that "Rabbath Ammon", capital of the Ammonite kingdom. The Citadel hill contains layered civilizations from the Bronze Age through the Umayyad period.',
    tip: 'احترم هدوء الأحياء السكنية القديمة بوسط البلد أثناء التجول والتصوير.',
    tipEn: 'Respect the quiet of the old residential neighborhoods in downtown while walking around and taking photos.',
  },
  salt: {
    history: 'مدينة تجارية عريقة ازدهرت أواخر العهد العثماني بفضل تجارة الصابون والحبوب، وفيها عمارة صفراء مميزة بلمسات معمارية عثمانية وأوروبية مختلطة. مسجلة على قائمة التراث العالمي لليونسكو.',
    historyEn: 'A historic trading city that flourished in the late Ottoman era through soap and grain trade, known for its distinctive yellow limestone architecture blending Ottoman and European styles. A UNESCO World Heritage Site.',
    tip: 'المباني التراثية أغلبها مسكونة أو فيها محلات فعلية — احترم خصوصية السكان أثناء التصوير.',
    tipEn: 'Most heritage buildings are still inhabited or in active use as shops — respect residents\' privacy while photographing.',
  },
  deadsea: {
    history: 'أخفض نقطة على سطح اليابسة، ومذكور بالنصوص التوراتية والتاريخية منذ آلاف السنين. استخدمه المصريون القدماء بتحنيط الموتى، والملكة كليوباترا أنشأت مصانع لمستحضرات التجميل بالقرب منه.',
    historyEn: 'The lowest point on Earth\'s land surface, mentioned in biblical and historical texts for thousands of years. Ancient Egyptians used its minerals for embalming, and Cleopatra reportedly established cosmetic factories nearby.',
    tip: 'لا تسبح بمياهه إذا في جروح مفتوحة، وتجنب وصول المياه للعين، واشطف جسمك بالماء العذب بعدها مباشرة.',
    tipEn: "Avoid swimming with open wounds, keep the water away from your eyes, and rinse off with fresh water immediately after.",
  },
  mainhot: {
    history: 'استخدمها الملك هيرودس الكبير بالعصر الروماني كمنتجع علاجي، وذُكرت بكتابات المؤرخ اليهودي يوسيفوس. مياهها الساخنة طبيعية المنشأ من نبع حراري بالجبال المحيطة.',
    historyEn: 'Used by King Herod the Great in Roman times as a therapeutic retreat, and mentioned in the writings of historian Josephus. Its hot waters flow naturally from a thermal spring in the surrounding mountains.',
    tip: 'لا تبقي بالمياه الساخنة أكتر من 15-20 دقيقة متواصلة، واشربي ماء كافي لتفادي الجفاف.',
    tipEn: "Don't stay in the hot water for more than 15-20 minutes at a time, and drink enough water to avoid dehydration.",
  },
  azraqcastle: {
    history: 'قلعة بازلتية سوداء بناها الرومان، وأعاد الأمويون والمماليك ترميمها. اتخذها لورنس العرب مقراً له خلال الثورة العربية الكبرى سنة 1917.',
    historyEn: "A black basalt fortress built by the Romans and later restored by the Umayyads and Mamluks. Lawrence of Arabia used it as his headquarters during the Great Arab Revolt in 1917.",
    tip: 'الحجر البازلتي ممكن يكون زلق وقت المطر — انتبه لخطواتك بالممرات الداخلية.',
    tipEn: 'The basalt stone can be slippery when wet — watch your step in the internal passages.',
  },
  qasramra: {
    history: 'قصر صحراوي أموي من القرن الثامن ميلادي، مشهور برسوماته الجدارية النادرة يلي توضح مشاهد حياة يومية وفلكية، ومسجل على قائمة اليونسكو للتراث العالمي.',
    historyEn: 'An 8th-century Umayyad desert castle famous for its rare wall paintings depicting daily life and astronomical scenes. A UNESCO World Heritage Site.',
    tip: 'ممنوع لمس الرسومات الجدارية القديمة إطلاقاً — أي لمسة بسيطة ممكن تضر بالألوان الأصلية.',
    tipEn: 'Never touch the ancient wall paintings — even light contact can damage the original pigments.',
  },
  hallabat: {
    history: 'بني أساساً كحصن روماني، وحوّله الأمويون لقصر صحراوي بالقرن الثامن ميلادي، وفيه بقايا مسجد قديم ونظام ري متطور كان يخدم الزراعة بالمنطقة.',
    historyEn: "Originally built as a Roman fort, later converted into an Umayyad desert palace in the 8th century, featuring the remains of an old mosque and an advanced irrigation system that once served local agriculture.",
    tip: 'الموقع مفتوح وقليل الظل — يفضل الزيارة الصبح الباكر أو قبل الغروب بالصيف.',
    tipEn: 'The site is open with little shade — visiting early morning or before sunset in summer is best.',
  },
  ummjimal: {
    history: 'مدينة أثرية بازلتية سوداء نادرة الطراز، بنيت أساساً بالعصر النبطي وازدهرت بالعصرين الروماني والبيزنطي، وفيها أكتر من 150 مبنى محفوظ جزئياً بدون استخدام أي ملاط.',
    historyEn: 'A rare black basalt ancient city, originally built in the Nabataean era and flourished during Roman and Byzantine times, featuring over 150 partially preserved buildings built without any mortar.',
    tip: 'الموقع واسع ومكشوف بالكامل — خذ قبعة وواقي شمس، وتجنب الزيارة بساعات الظهيرة بالصيف.',
    tipEn: 'The site is large and fully exposed — bring a hat and sunscreen, and avoid visiting at midday in summer.',
  },
  pella: {
    history: 'مدينة أثرية تعود لآلاف السنين، من أقدم المواقع المأهولة بالعالم، وكانت جزء من "مدن العشرة" الرومانية (ديكابوليس)، وفيها طبقات حضارية من العصر البرونزي حتى الإسلامي.',
    historyEn: 'An ancient city dating back thousands of years, among the oldest continuously inhabited sites in the world, once part of the Roman Decapolis, with layered civilizations from the Bronze Age to the Islamic era.',
    tip: 'الموقع مفتوح للتنقيب الأثري المستمر — التزم بالمسارات المخصصة وابتعد عن مناطق الحفر النشطة.',
    tipEn: 'The site has ongoing archaeological excavations — stick to designated paths and stay away from active dig areas.',
  },
  dana: {
    history: 'أكبر محمية طبيعية بالأردن (تغطي أكتر من 300 كم²)، وبتضم أربع مناطق حياة بيئية مختلفة بمدى ارتفاع واحد — من قمم جبلية بالمتوسط الأبيض حتى صحراء قاحلة، وفيها أكتر من 800 نوع نباتي و45 نوع من الثدييات، بعضها مهدد بالانقراض عالمياً زي النمر العربي.',
    historyEn: "Jordan's largest nature reserve (over 300 km²), spanning four distinct bioclimatic zones within one elevation range — from Mediterranean mountain peaks to arid desert. Home to over 800 plant species and 45 mammal species, some globally endangered like the Arabian leopard.",
    tip: 'ابق على المسارات المخصصة، ولا تطعم أو تقترب من الحياة البرية، واحمل معك كل نفاياتك للخارج.',
    tipEn: "Stay on marked trails, don't feed or approach wildlife, and carry all your trash back out with you.",
  },
  azraqwetland: {
    history: 'واحة صحراوية فريدة كانت يوماً بحيرة دائمة وسط الصحراء الشرقية، ومحطة استراحة رئيسية لملايين الطيور المهاجرة بين أوروبا وأفريقيا. تعرّضت لجفاف شبه كامل بالتسعينيات بسبب الضخ الجائر، وجهود إعادة التأهيل أرجعت جزء من مياهها وحياتها البرية.',
    historyEn: 'A unique desert oasis, once a permanent lake in the Eastern Desert and a vital rest stop for millions of migratory birds between Europe and Africa. It nearly dried up in the 1990s due to over-pumping, and restoration efforts have since revived part of its water and wildlife.',
    tip: 'حافظ على الهدوء قدر الإمكان لتفادي إزعاج الطيور، وابق بالممرات الخشبية المخصصة فوق الأراضي الرطبة.',
    tipEn: 'Keep noise to a minimum to avoid disturbing the birds, and stay on the designated boardwalks over the wetlands.',
  },
  mujib: {
    history: 'أخفض محمية طبيعية بالعالم (تبدأ من 410 متر تحت سطح البحر عند البحر الميت)، وسُميت أحياناً "الجراند كانيون الأردني". الوادي بيصب بالبحر الميت، وتنوعه البيئي الكبير بمدى ارتفاع شاسع خلاه محمية محيط حيوي معترف فيها عالمياً.',
    historyEn: "The lowest-altitude nature reserve in the world (starting at 410m below sea level at the Dead Sea), sometimes called Jordan's 'Grand Canyon'. The wadi drains into the Dead Sea, and its dramatic elevation range gives it globally recognized biosphere reserve status.",
    tip: 'المسارات المائية تحتاج لياقة بدنية جيدة — لا تدخل المسار وحدك، والتزم بتعليمات المرشدين المرخّصين.',
    tipEn: "The water trails require good physical fitness — don't enter alone, and follow the instructions of licensed guides.",
  },
  irbid: {
    history: 'تُعرف بـ"مدينة العلم"، وتضم جامعة اليرموك وجامعة العلوم والتكنولوجيا. بضواحيها موقع "بيت راس" الأثري، وهو مدينة "كابيتولياس" الرومانية القديمة، إحدى مدن الديكابوليس.',
    historyEn: 'Known as the "City of Knowledge", home to Yarmouk University and Jordan University of Science & Technology. Its outskirts include the ancient site of Beit Ras — the Roman city of "Capitolias", one of the Decapolis cities.',
    tip: 'لو زرت بيت راس الأثري، احترم إنه موقع مفتوح وسط منطقة سكنية، وتجنب الإزعاج بأوقات متأخرة.',
    tipEn: "If visiting the Beit Ras archaeological site, keep in mind it's open within a residential area — avoid visiting late or making noise.",
  },
  shouna: {
    history: 'منطقة زراعية خصبة بالأغوار الشمالية، اشتهرت تاريخياً بزراعتها المروية على مدار السنة بفضل مناخها الدافئ وقربها من نهر الأردن.',
    historyEn: "A fertile agricultural region in the Northern Jordan Valley, historically known for year-round irrigated farming thanks to its warm climate and proximity to the Jordan River.",
    tip: 'احترم أراضي المزارعين الخاصة، ولا تدخل المزارع بدون إذن أصحابها.',
    tipEn: "Respect farmers' private land, and don't enter farms without the owners' permission.",
  },
  tafilah: {
    history: 'مدينة جبلية جنوبية عريقة على طريق الملوك التاريخي، كانت محطة تجارية مهمة تربط بين البتراء والبحر الميت، وبوابة رئيسية لمحمية ضانا.',
    historyEn: 'An ancient southern mountain city on the historic King\'s Highway, once an important trading stop linking Petra and the Dead Sea, and a main gateway to Dana Reserve.',
    tip: 'الطرق الجبلية المحيطة ممكن تكون ضبابية شتاءً — خفف السرعة وانتبه للطريق.',
    tipEn: 'The surrounding mountain roads can be foggy in winter — drive carefully and slow down.',
  },
  deisa: {
    history: 'وادٍ صحراوي بين تشكيلات صخرية حمراء قرب العقبة ووادي رم، ومن مناطق السكن التقليدية لقبائل بدوية أردنية عايشت هالصحراء لأجيال.',
    historyEn: 'A desert valley amid red rock formations near Aqaba and Wadi Rum, traditionally home to Bedouin tribes who have lived in this desert for generations.',
    tip: 'احترم عادات المجتمع البدوي المحلي، وأطفئ أي نار بالكامل قبل المغادرة.',
    tipEn: 'Respect local Bedouin customs, and fully extinguish any fire before leaving.',
  },
  himma: {
    history: 'ينابيع كبريتية ساخنة قرب أم قيس، استُخدمت للعلاج الطبيعي منذ العصر الروماني، وهي امتداد جغرافي لنفس النظام الحراري يلي بيغذي حمامات ماعين.',
    historyEn: 'Hot sulfur springs near Umm Qais, used for natural therapy since Roman times — part of the same geothermal system that feeds Ma\'in Hot Springs.',
    tip: 'رائحة الكبريت قوية بالمكان — إذا عندك حساسية تنفسية استشيري طبيبك قبل الزيارة.',
    tipEn: "The sulfur smell is strong on-site — if you have respiratory sensitivities, consult your doctor before visiting.",
  },
  birgish: {
    history: 'غابات طبيعية كثيفة قرب إربد، من أهم مواطن الأشجار المعمّرة بشمال الأردن، ووجهة تقليدية للفرشة العائلية بفصل الربيع منذ أجيال.',
    historyEn: 'Dense natural forests near Irbid, home to some of northern Jordan\'s oldest trees, and a traditional family picnic destination for generations in spring.',
    tip: 'أطفئ أي نار للشواء بالكامل قبل المغادرة، ولا تكسر أو تقطف فروع الأشجار.',
    tipEn: "Fully extinguish any BBQ fire before leaving, and don't break or pick tree branches.",
  },
  ummalnaml: {
    history: 'وادٍ طبيعي خلاب بتلاله الخضراء قرب إربد، بيتحول لمساحة زراعية وسياحية نشطة بفصل الربيع بسبب تربته الخصبة ووفرة الأمطار بالمنطقة.',
    historyEn: 'A stunning natural valley with green hills near Irbid, becoming an active agricultural and tourism spot in spring thanks to its fertile soil and abundant rainfall.',
    tip: 'المسارات ممكن تكون طينية بعد المطر — خذ حذاء مناسب للمشي بالطبيعة.',
    tipEn: 'Trails can get muddy after rain — wear suitable footwear for walking in nature.',
  },
  yarmouk: {
    history: 'محمية طبيعية شمالية بغابات كثيفة، سُميت نسبة لنهر اليرموك القريب، وهو موقع معركة اليرموك التاريخية الشهيرة سنة 636م بين المسلمين والبيزنطيين.',
    historyEn: "A northern nature reserve with dense forests, named after the nearby Yarmouk River — site of the historic Battle of Yarmouk in 636 CE between Muslim and Byzantine forces.",
    tip: 'التزم بمسارات المحمية الرسمية، وتجنب إشعال النار بمناطق غير مخصصة لها.',
    tipEn: 'Stick to the reserve\'s official trails, and avoid lighting fires in undesignated areas.',
  },
  dibeen: {
    history: 'غابات صنوبر وسنديان طبيعية قرب جرش، من آخر الغابات الطبيعية المتبقية بهالحجم بالأردن، وموطن لأنواع نادرة زي السنجاب الفارسي المهدد بالانقراض محلياً.',
    historyEn: "Natural pine and oak forests near Jerash, among the last remaining forests of this size in Jordan, home to rare species like the locally endangered Persian squirrel.",
    tip: 'حافظ على نظافة الغابة، واحمل نفاياتك معك للخارج بدل رميها بين الأشجار.',
    tipEn: "Keep the forest clean, and carry your trash out with you instead of leaving it among the trees.",
  },
  shuaib: {
    history: 'وادٍ أخضر خصب قرب السلط، سُمي نسبة للنبي شعيب عليه السلام حسب الموروث المحلي، وبيتحول لسجادة خضراء وأزهار برية بفصل الربيع.',
    historyEn: 'A fertile green valley near Salt, named after the Prophet Shu\'ayb according to local tradition, turning into a carpet of greenery and wildflowers in spring.',
    tip: 'احترم أراضي المزارعين المحلية، والتزم بالطرق العامة المخصصة للزوار.',
    tipEn: 'Respect local farmland, and stick to the public roads designated for visitors.',
  },
  rayan: {
    history: 'وادٍ أخضر قرب عجلون وإربد بمياه جارية ومزارع رمان وتين، يعكس طبيعة المرتفعات الشمالية الغنية بالمياه الجوفية والينابيع الموسمية.',
    historyEn: "A green valley near Ajloun and Irbid with flowing water and pomegranate and fig farms, reflecting the water-rich nature of Jordan's northern highlands and seasonal springs.",
    tip: 'احترم مزارع السكان المحليين، ولا تقطف الثمار بدون إذن أصحاب الأرض.',
    tipEn: "Respect local farms, and don't pick fruit without the landowners' permission.",
  },
  binhammad: {
    history: 'وادٍ مائي بشلالات وينابيع معدنية دافئة شمال غرب الكرك، استُخدمت مياهه المعدنية تقليدياً من سكان المنطقة لخصائصها العلاجية الطبيعية.',
    historyEn: "A water valley with waterfalls and warm mineral springs northwest of Karak, whose mineral waters have traditionally been used by locals for their natural therapeutic properties.",
    tip: 'المسار فيه تسلق صخور ومياه جارية — خذ حذاء مقاوم للانزلاق ولا تروح لحالك.',
    tipEn: "The trail involves rock scrambling and flowing water — wear non-slip shoes and don't go alone.",
  },
  feynan: {
    history: 'من أقدم مواقع تعدين النحاس بالعالم، استُخرج منه النحاس منذ العصر النحاسي (قبل أكتر من 6000 سنة) وحتى العصر الروماني والبيزنطي. مسجل كأول "محمية سماء مظلمة" بالشرق الأوسط لنقاء سمائه من التلوث الضوئي.',
    historyEn: 'One of the oldest copper mining sites in the world, worked continuously from the Chalcolithic era (over 6000 years ago) through Roman and Byzantine times. Designated the first "Dark Sky Reserve" in the Middle East for its exceptionally clear, light-pollution-free skies.',
    tip: 'قلل استخدام الأضواء الصناعية ليلاً للمحافظة على صفاء السماء يلي يميّز المكان.',
    tipEn: 'Minimize artificial lighting at night to help preserve the exceptionally dark skies this place is known for.',
  },
  ziqlab: {
    history: 'وادٍ دائم الجريان بلواء الكورة، فيه سد شرحبيل بن حسنة المُنشأ بالسبعينيات لتخزين المياه وري الأراضي الزراعية المحيطة بمزارع الرمان والحمضيات والموز.',
    historyEn: 'A perennially flowing valley in the Kourah district, home to the Shurahbil bin Hasna Dam built in the 1970s to store water and irrigate the surrounding farms of pomegranates, citrus, and bananas.',
    tip: 'منطقة السد للنظر بس عادة — تأكد من التعليمات المحلية قبل السباحة أو الاقتراب من حافة السد.',
    tipEn: 'The dam area is usually for viewing only — check local guidance before swimming or approaching the dam edge.',
  },
};

// بيكتشف نوع الرفقة من نص المستخدم عشان نختار أنشطة مناسبة
function detectCompanionType(text) {
  const lower = text.toLowerCase();
  const familyWords = ['عائلة', 'عائلتي', 'اهلي', 'أهلي', 'اطفال', 'أطفال', 'ولادي', 'اولادي', 'family', 'kids', 'children'];
  const friendsWords = ['اصحاب', 'أصحاب', 'شباب', 'شلة', 'صحابي', 'رفقة', 'رفاق', 'friends', 'buddies'];
  const aloneWords = ['لحالي', 'وحدي', 'لوحدي', 'alone', 'solo', 'myself'];
  if (familyWords.some((w) => lower.includes(w))) return 'family';
  if (friendsWords.some((w) => lower.includes(w))) return 'friends';
  if (aloneWords.some((w) => lower.includes(w))) return 'alone';
  return null;
}

// بيرجع أنشطة مناسبة للرفقة تحديداً — لو نشاط ماله علامة suitableFor، معناها مناسب للكل
function filterActivitiesByCompanion(activities, companionType) {
  if (!companionType) return activities;
  const filtered = activities.filter((act) => !act.suitableFor || act.suitableFor.includes(companionType));
  return filtered.length > 0 ? filtered : activities; // احتياط: لو ما ضل شي، رجعي القائمة الأصلية
}

// أماكن قريبة بديلة — تُستخدم لما الرحلة كذا يوم بنفس المكان، عشان نتفادى التكرار
// مبنية على القرب الجغرافي الفعلي بين المناطق بالأردن
const NEARBY_PLACES = {
  // الشمال
  irbid: ['umqais', 'ajloun', 'himma', 'birgish'],
  umqais: ['irbid', 'himma'],
  himma: ['umqais', 'irbid'],
  ajloun: ['jerash', 'irbid', 'pella'],
  jerash: ['ajloun', 'amman', 'pella'],
  birgish: ['irbid', 'ummalnaml'],
  ummalnaml: ['birgish', 'irbid'],
  pella: ['shouna', 'ajloun'],
  shouna: ['pella', 'salt'],

  // الوسط
  amman: ['jerash', 'salt', 'madaba'],
  salt: ['amman', 'shouna'],
  madaba: ['deadsea', 'mainhot', 'ummrasas', 'amman'],
  deadsea: ['madaba', 'mainhot', 'karak'],
  mainhot: ['madaba', 'deadsea'],
  ummrasas: ['madaba'],

  // الجنوب
  karak: ['deadsea', 'mujib', 'tafilah', 'dana'],
  mujib: ['karak', 'madaba'],
  tafilah: ['karak', 'dana', 'shobak'],
  dana: ['karak', 'tafilah', 'shobak'],
  shobak: ['dana', 'tafilah', 'petra'],
  petra: ['wadirum', 'shobak'],
  wadirum: ['petra', 'aqaba', 'deisa'],
  aqaba: ['wadirum', 'deisa'],
  deisa: ['wadirum', 'aqaba'],

  // الصحراء الشرقية
  ummjimal: ['azraqcastle', 'hallabat'],
  azraqcastle: ['azraqwetland', 'ummjimal', 'hallabat'],
  azraqwetland: ['azraqcastle', 'qasramra'],
  qasramra: ['azraqwetland', 'hallabat'],
  hallabat: ['azraqcastle', 'ummjimal', 'qasramra'],
};

// ============================================================
// اكتشاف نوع الاهتمام والموسم من نص المستخدم الحر — عشان نظام
// بناء الرحلة يفهم وصف عام ("بدي طبيعة وهدوء") مش بس أسماء أماكن.
// بتستخدم نفس محرك توسيع المرادفات (expandSynonyms) يلي رحال
// الشات بوت بيستخدمه — يعني نفس القدرة على فهم الأخطاء الإملائية
// والصياغات المختلفة، بدل ما يكون عنا قائمة كلمات منفصلة ومحدودة
// ============================================================
const TYPE_CANONICAL_MAP = {
  nature: ['طبيعة'],
  adventure: ['مغامرة', 'تخييم'],
  historical: ['اثري'],
  religious: ['ديني'],
  relaxation: ['استجمام'],
  urban: ['مدينة'],
};

function detectPlaceTypesFromText(text) {
  const expanded = expandSynonyms(text).toLowerCase();
  const found = [];
  Object.entries(TYPE_CANONICAL_MAP).forEach(([type, canonicalWords]) => {
    if (canonicalWords.some((w) => expanded.includes(w))) found.push(type);
  });
  return found;
}

function detectSeasonFromText(text) {
  const expanded = expandSynonyms(text).toLowerCase();
  if (expanded.includes('صيف')) return 'summer';
  if (expanded.includes('شتاء')) return 'winter';
  if (expanded.includes('ربيع')) return 'spring';
  return null;
}

function buildLocalTripPlan(userText, userPlaces, lang = 'ar', explicitStartHour = null) {
  const days = extractDaysCount(userText);
  const userBudget = extractBudgetNumber(userText);
  const mentioned = extractMentionedPlaces(userText, userPlaces);
  const companionType = detectCompanionType(userText);
  // لو المستخدم اختارت وقت بداية من القائمة بالواجهة، نستخدمه بالأولوية.
  // غير هيك، منجرب نستخرجه من النص المكتوب (مثلاً "الساعة 11")
  const startHour = explicitStartHour !== null && explicitStartHour !== undefined ? explicitStartHour : extractStartTime(userText);
  const schedule = buildDaySchedule(startHour, lang);

  const getName = (place, isUserPlace) => (isUserPlace ? place.name : (lang === 'en' ? (place.nameEn || place.name) : place.name));
  const getFood = (place, isUserPlace) => (isUserPlace ? place.food : (lang === 'en' ? (place.foodEn || place.food) : place.food));

  // لو المستخدم ذكر أماكن معينة (رسمية أو أضافها زوار)، نستخدمها كأولوية.
  // غير هيك، منحلل النص لنفهم نوع الاهتمام (طبيعة/مغامرة/تاريخي...)
  // والموسم والرفقة والميزانية، ومنبني قائمة أماكن مبنية فعلياً على
  // وصف المستخدم بدل ما نرجع دايماً لنفس القائمة الثابتة (بترا+رم)
  let pool;
  let didNotUnderstand = false;
  if (mentioned.length > 0) {
    pool = mentioned;
    // لو المستخدم ذكر مكان واحد بس وطلب كذا يوم، منضيف أماكن قريبة
    // للأيام التالية عشان نتفادى تكرار نفس البرنامج كل يوم
    if (pool.length === 1 && days > 1 && !pool[0].isUserPlace) {
      const nearbyKeys = NEARBY_PLACES[pool[0].key] || [];
      const nearbyEntries = nearbyKeys.map((k) => ({ key: k, place: places[k], isUserPlace: false }));
      pool = [pool[0], ...nearbyEntries];
    }
  } else {
    const detectedTypes = detectPlaceTypesFromText(userText);
    const detectedSeason = detectSeasonFromText(userText);
    const hasSignal = detectedTypes.length > 0 || detectedSeason || companionType || userBudget !== null;

    if (!hasSignal) {
      // ما لقينا أي إشارة بالنص (لا نوع، لا موسم، لا رفقة، لا ميزانية)
      // — منستخدم مجموعة مميزة متنوعة كحل احتياطي، وبنكون صريحين
      // مع المستخدم إنه هاد اقتراح عام مش مبني على تفاصيل وصفه
      pool = ['petra', 'wadirum', 'aqaba', 'deadsea', 'jerash', 'ajloun', 'madaba'].map(
        (key) => ({ key, place: places[key], isUserPlace: false })
      );
      didNotUnderstand = true;
    } else {
      // نحسب نقاط لكل مكان رسمي بناءً على مدى تطابقه مع كل إشارة
      // لقيناها بالنص، ومنرتبهم وناخذ الأنسب — هيك كل وصف مختلف
      // بيرجع أماكن مختلفة فعلياً، مش نفس القائمة الثابتة كل مرة
      const scoredCandidates = Object.keys(places).map((key) => {
        const place = places[key];
        const meta = getPlaceMeta(key);
        let score = 0;
        if (detectedTypes.includes(place.type)) score += 4;
        if (detectedSeason && place.season === detectedSeason) score += 3;
        if (companionType && meta.companions && meta.companions.includes(companionType)) score += 2;
        if (userBudget !== null) {
          if (userBudget <= 10 && meta.budget === 'free') score += 2;
          else if (userBudget <= 25 && (meta.budget === 'free' || meta.budget === 'under20')) score += 2;
          else if (userBudget > 25) score += 1;
        }
        return { key, place, score, isUserPlace: false };
      });
      // كمان نحسب نقاط لمناطق أضافها زوار (وتمت الموافقة عليها فقط)،
      // بنفس منطق التقييم — هيك أي منطقة يضيفها زائر بتصير جزء فعلي
      // من التوصيات الذكية بمجرد ما توافق عليها الإدارة، مش لازم
      // المستخدم يذكرها بالاسم بالضبط عشان تظهر
      const scoredUserCandidates = (userPlaces || [])
        .filter((p) => p.lat && p.lng)
        .map((p) => {
          const meta = DEFAULT_PLACE_META;
          let score = 0;
          if (detectedTypes.includes(p.type)) score += 4;
          if (detectedSeason && p.season === detectedSeason) score += 3;
          if (companionType && meta.companions.includes(companionType)) score += 2;
          if (userBudget !== null) {
            if (userBudget <= 10) score += 2; // مناطق الزوار افتراضياً "مجاني" بالتقييم العام
            else if (userBudget <= 25) score += 2;
            else score += 1;
          }
          return { key: p.id, place: p, score, isUserPlace: true };
        });
      const allScored = [...scoredCandidates, ...scoredUserCandidates];
      allScored.sort((a, b) => b.score - a.score);
      // لو أعلى نقاط طلعت صفر (يعني ولا مكان طابق أي إشارة فعلياً رغم
      // وجود كلمات عامة بالنص)، هاد كمان معناه ما فهمنا بدقة — نبلغ المستخدم
      if ((allScored[0] && allScored[0].score === 0)) {
        didNotUnderstand = true;
      }
      pool = allScored.slice(0, Math.max(days * 2, 6)).map(({ key, place, isUserPlace }) => ({ key, place, isUserPlace }));
    }
  }

  const dayEntries = [];
  for (let i = 0; i < days; i++) {
    dayEntries.push(pool[i % pool.length]);
  }

  const tripDays = dayEntries.map((entry, index) => {
    const { key, place, isUserPlace } = entry;
    const meta = isUserPlace ? DEFAULT_PLACE_META : getPlaceMeta(key);
    const stops = [];
    const placeName = getName(place, isUserPlace);
    const placeFood = getFood(place, isUserPlace);

    if (!schedule.skipBreakfast) {
      stops.push({
        time: schedule.breakfastTime,
        type: 'فطور',
        place: lang === 'en' ? `Local restaurant near ${placeName}` : `مطعم محلي بالقرب من ${placeName}`,
        description: lang === 'en' ? 'A simple local breakfast (foul, hummus, manakeesh) before starting the day' : 'فطور شعبي بسيط (فول، حمص، مناقيش) قبل بدء اليوم',
        durationHint: lang === 'en' ? 'about half an hour' : 'نص ساعة تقريباً',
      });
    }

    // عدد الأنشطة حسب مدة الزيارة المتوقعة للمكان
    const activityCount = meta.duration === 'full' ? 3 : meta.duration === 'half' ? 2 : 1;
    const rawActivities = isUserPlace
      ? [{ name: place.name, description: place.desc, durationHint: durationLabel(meta.duration, lang) }]
      : filterActivitiesByCompanion(getPlaceActivities(key, place, lang), companionType);
    const activities = rawActivities.slice(0, activityCount);

    // الأنشطة يلي إلها وقت مثالي محدد (زي الغروب) منحطها بمكانها الصح،
    // والباقي منوزعهم صباحاً قبل الغدا
    const eveningActivities = activities.filter((a) => a.idealTime);
    const regularActivities = activities.filter((a) => !a.idealTime);

    const beforeLunch = regularActivities.slice(0, Math.min(2, regularActivities.length));
    const afterLunch = regularActivities.slice(2);
    const morningTimes = schedule.morningTimes;

    beforeLunch.forEach((act, i) => {
      stops.push({
        time: morningTimes[i] || (lang === 'en' ? '10:30 AM' : '10:30 صباحاً'),
        type: 'نشاط',
        place: act.name + (isUserPlace ? (lang === 'en' ? ' 🌟 (discovered by another visitor)' : ' 🌟 (اكتشفها زائر تاني)') : ''),
        description: act.description,
        durationHint: act.durationHint,
      });
    });

    stops.push({
      time: schedule.lunchTime,
      type: 'غدا',
      place: placeFood
        ? (lang === 'en' ? `A restaurant serving ${placeFood}` : `مطعم يقدم ${placeFood}`)
        : (lang === 'en' ? 'A nearby local restaurant' : 'مطعم محلي قريب'),
      description: placeFood
        ? (lang === 'en' ? `Try the famous ${placeFood} in ${placeName}` : `تجربة أكلة ${placeFood} المشهورة بمنطقة ${placeName}`)
        : (lang === 'en' ? `Local food in ${placeName}` : `أكل محلي بمنطقة ${placeName}`),
      durationHint: lang === 'en' ? 'about an hour' : 'ساعة تقريباً',
    });

    afterLunch.forEach((act) => {
      stops.push({
        time: schedule.afternoonTime,
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
      title: lang === 'en' ? `Day in ${placeName}` : `يوم في ${placeName}`,
      estimatedBudget: budgetRangeForCategory(meta.budget, lang),
      stops,
    };
  });

  const placeNames = [...new Set(dayEntries.map((e) => getName(e.place, e.isUserPlace)))];
  const title = lang === 'en'
    ? `${days}-Day Trip: ${placeNames.join(', ')}`
    : `رحلة ${days} ${days === 1 ? 'يوم' : 'أيام'}: ${placeNames.join('، ')}`;

  const tips = lang === 'en' ? [
    'Bring enough water, especially for desert areas or summer trips',
    "Carry cash — not every small place accepts electronic payment",
    'Book accommodation in advance if traveling during peak season (summer or holidays)',
  ] : [
    'احملي معك ماء كافي، خصوصاً لو الرحلة بمناطق صحراوية أو بالصيف',
    'خذ كاش معك — مو كل الأماكن الصغيرة عندها إمكانية دفع إلكتروني',
    'احجزي أماكن الإقامة مسبقاً لو الرحلة بموسم الذروة (الصيف أو الأعياد)',
  ];

  if (userBudget) {
    const totalEstimateLow = days * 10;
    const totalEstimateHigh = days * 40;
    if (userBudget < totalEstimateLow) {
      tips.push(
        lang === 'en'
          ? `Your budget (${userBudget} JOD) is lower than expected for this trip — focus on free places and simple food`
          : `ميزانيتك (${userBudget} دينار) أقل من المتوقع لهاي الرحلة — ركزي على الأماكن المجانية والأكل البسيط`
      );
    } else if (userBudget > totalEstimateHigh) {
      tips.push(
        lang === 'en'
          ? `Your budget (${userBudget} JOD) is quite comfortable for this trip — you could add extra activities or fancier accommodation`
          : `ميزانيتك (${userBudget} دينار) مريحة جداً لهاي الرحلة، فيك تضيف أنشطة إضافية أو إقامة أفخم`
      );
    }
  }

  const clarificationNote = didNotUnderstand
    ? (lang === 'en'
        ? "We couldn't clearly understand your specific interests from the description, so this is a general suggestion based on Jordan's most popular destinations. Try being more specific (e.g., \"I want nature and quiet places\") for a more personalized result."
        : 'ما قدرنا نفهم اهتماماتك بالتحديد من الوصف، فهاد اقتراح عام مبني على أشهر الوجهات بالأردن. جرّب تكون أوضح شوي (مثلاً: "بدي طبيعة وأماكن هادئة") لنتيجة أدق ومخصصة أكتر.')
    : null;

  return { title, totalDays: days, days: tripDays, tips, didNotUnderstand, clarificationNote };
}

const DEFAULT_PLACE_META = { budget: 'free', companions: ['alone', 'family', 'friends', 'kids'], duration: 'half' };

function getPlaceMeta(key) {
  return placeMeta[key] || DEFAULT_PLACE_META;
}

// أقصى نقاط ممكنة يقدر يوصلها أي مكان (3 موسم + 2 رفقة + 2 ميزانية + 2 وقت)
// نستخدمها لتحويل النقاط الخام لنسبة مئوية مفهومة للمستخدم (نقطة التوافق)
const MAX_TRIP_SCORE = 9;

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

// بيحول النقاط الخام لنسبة مئوية (0-100%) — هاي النسبة يلي بتنعرض
// للمستخدم كـ"نقطة التوافق"، بدل ما نخليها رقم خفي بالخلفية بس
function getCompatibilityPercent(score) {
  return Math.round((score / MAX_TRIP_SCORE) * 100);
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(0);
}

function getLevelInfo(points, lang = 'ar') {
  if (lang === 'en') {
    if (points > 300) return { label: 'Tourism Expert', icon: '🥇' };
    if (points >= 101) return { label: 'Traveler', icon: '🥈' };
    return { label: 'Beginner Explorer', icon: '🥉' };
  }
  if (points > 300) return { label: 'خبير سياحة', icon: '🥇' };
  if (points >= 101) return { label: 'رحالة', icon: '🥈' };
  return { label: 'مستكشف مبتدئ', icon: '🥉' };
}

// المناطق الطبيعية — تستخدم لتحديد وسام "عاشق الطبيعة"
const NATURE_PLACE_KEYS = ['dana', 'wadirum', 'mujib', 'ajloun', 'mainhot', 'azraqwetland', 'deisa', 'birgish', 'ummalnaml', 'himma'];

// أنواع الأماكن — تستخدم بفلترة الصفحة الرئيسية وبفورم إضافة منطقة
// ⚠️ عدّلي هاد الإيميل ليصير إيميل حسابك أنتِ (نفس إيميل تسجيل الدخول بجوجل)
// عشان زر "لوحة الإدارة" يظهر إلك بس، مش لأي مستخدم تاني
const ADMIN_EMAILS = ['lolonazem5@gmail.com'];

// ============================================================
// إشعارات إيميل حقيقية للإدارة — لما حدا يضيف منطقة أو صورة جديدة
// بتنتظر المراجعة، بيوصل إيميل مباشرة (بدون سيرفر خلفي، بدون تكلفة)
// عبر EmailJS (باقة مجانية حتى 200 إيميل بالشهر)
// ============================================================
const EMAILJS_SERVICE_ID = 'service_wb58vvc';
const EMAILJS_TEMPLATE_ID = 'template_8sshsll';
const EMAILJS_PUBLIC_KEY = 'lr2KV4FG-D8pyc851';

function sendAdminEmailAlert(subject, message) {
  try {
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { subject, message },
      EMAILJS_PUBLIC_KEY
    ).catch(() => {}); // لو صار خطأ بالإرسال، ما منوقف تجربة المستخدم بسببه
  } catch (e) {}
}

const PLACE_TYPES = [
  { key: 'nature', labelAr: '🌿 طبيعة', labelEn: '🌿 Nature' },
  { key: 'adventure', labelAr: '🧗 مغامرة', labelEn: '🧗 Adventure' },
  { key: 'historical', labelAr: '🏛️ تاريخي', labelEn: '🏛️ Historical' },
  { key: 'religious', labelAr: '🕌 ديني/تراثي', labelEn: '🕌 Religious/Heritage' },
  { key: 'relaxation', labelAr: '♨️ استجمام', labelEn: '♨️ Relaxation' },
  { key: 'urban', labelAr: '🏙️ مدينة', labelEn: '🏙️ City' },
];

// ============================================================
// أوسمة محددة بالاسم — بديل/إضافة لنظام المستويات العام
// كل وسام مبني على سلوك فعلي: مناطق قيّمها، مناطق طبيعية زارها، رحلات بناها
// ============================================================
function getBadges(ratedPlaceKeys = [], tripsBuilt = 0, addedPlaceKeys = [], lang = 'ar') {
  const badges = [];
  const rated = ratedPlaceKeys || [];
  if (rated.length >= 5) {
    badges.push({ icon: '🏅', label: lang === 'ar' ? 'مكتشف الأردن' : 'Jordan Discoverer', desc: lang === 'ar' ? 'قيّم أو راجع أو ضاف 5 مناطق أو أكتر' : 'Rated, reviewed, or added 5+ places' });
  }
  const natureCount = rated.filter((k) => NATURE_PLACE_KEYS.includes(k)).length;
  if (natureCount >= 3) {
    badges.push({ icon: '🌿', label: lang === 'ar' ? 'عاشق الطبيعة' : 'Nature Lover', desc: lang === 'ar' ? 'قيّم 3 مناطق طبيعية أو أكتر' : 'Rated 3+ nature places' });
  }
  if (tripsBuilt >= 10) {
    badges.push({ icon: '🧭', label: lang === 'ar' ? 'رحّالة محترف' : 'Pro Traveler', desc: lang === 'ar' ? 'بنى 10 رحلات أو أكتر' : 'Built 10+ trips' });
  }
  if ((addedPlaceKeys || []).length >= 3) {
    badges.push({ icon: '🗺️', label: lang === 'ar' ? 'باني الأردن' : 'Jordan Builder', desc: lang === 'ar' ? 'أضاف 3 مناطق جديدة أو أكتر بنفسه' : 'Personally added 3+ new places' });
  }
  return badges;
}

// ============================================================
// كاش الخدمات القريبة — نخزّن النتيجة 6 ساعات بالمتصفح، عشان
// لما نرجع نفتح نفس المكان ما نستنى الـ API من الصفر كل مرة
// ============================================================
const SERVICES_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 ساعات
const SERVICES_FETCH_TIMEOUT = 7000; // 7 ثواني بالحد الأقصى، وبعدها منوقف الانتظار

function getServicesCacheKey(type, lat, lng) {
  return `rl_v2_${type}_${lat.toFixed(4)}_${lng.toFixed(4)}`;
}

function getCachedServices(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > SERVICES_CACHE_TTL) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setCachedServices(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch (e) {}
}

async function fetchWithTimeout(url, ms = SERVICES_FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

function isHebrewText(text) {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
];

async function runOverpassQuery(query) {
  // نرسل الطلب لكل السيرفرات بنفس الوقت (بالتوازي) للسرعة، بس
  // منستنى ردود الكل (مش أول وحدة بس) عشان نتجنب مشكلة حقيقية:
  // لو سيرفر سريع رجع نتيجة فاضية وسيرفر تاني أبطأ شوي كان رح
  // يرجع بيانات حقيقية، أول وحدة (Promise.any) كانت بتكسب السباق
  // غلط حتى لو فاضية. هلق منفضّل أي سيرفر رجع نتائج فعلية، ولو
  // كلهم فاضيين منقبلها كنتيجة صحيحة (فعلاً ما في خدمات)، ولو
  // كلهم فشلوا اتصال منطلع خطأ حقيقي
  const settled = await Promise.allSettled(
    OVERPASS_SERVERS.map(async (server) => {
      const url = `${server}?data=${encodeURIComponent(query)}`;
      const res = await fetchWithTimeout(url, 9000);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      if (!data || !Array.isArray(data.elements)) throw new Error('invalid response');
      return data.elements;
    })
  );

  const withData = settled.find((r) => r.status === 'fulfilled' && r.value.length > 0);
  if (withData) return withData.value;

  const anySuccess = settled.find((r) => r.status === 'fulfilled');
  if (anySuccess) return anySuccess.value; // نتيجة فاضية حقيقية، مش فشل اتصال

  throw new Error('all servers failed'); // كل السيرفرات فشلت فعلياً (مشكلة اتصال حقيقية)
}

async function fetchNearbyRestaurants(lat, lng) {
  const cacheKey = getServicesCacheKey('restaurants', lat, lng);
  const radius = 15000;
  const query = `[out:json][timeout:9];node["amenity"="restaurant"](around:${radius},${lat},${lng});out body 20;`;
  try {
    const elements = await runOverpassQuery(query);
    const result = elements.filter(el => !isHebrewText(el.tags && el.tags.name) && el.tags && el.tags.name);
    if (result.length > 0) setCachedServices(cacheKey, result);
    return result;
  } catch (e) {
    const cached = getCachedServices(cacheKey);
    const result = cached || [];
    result.failed = !cached;
    return result;
  }
}

async function fetchNearbySupportServices(lat, lng) {
  const cacheKey = getServicesCacheKey('support', lat, lng);
  const radius = 15000;
  const query = `[out:json][timeout:9];(node["amenity"="fuel"](around:${radius},${lat},${lng});node["amenity"="hospital"](around:${radius},${lat},${lng});node["amenity"="clinic"](around:${radius},${lat},${lng});node["shop"="supermarket"](around:${radius},${lat},${lng});node["amenity"="bank"](around:${radius},${lat},${lng}););out body 25;`;
  try {
    const elements = await runOverpassQuery(query);
    const result = elements.filter(el => !isHebrewText(el.tags && el.tags.name) && el.tags && el.tags.name);
    if (result.length > 0) setCachedServices(cacheKey, result);
    return result;
  } catch (e) {
    const cached = getCachedServices(cacheKey);
    const result = cached || [];
    result.failed = !cached;
    return result;
  }
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

function getArabicDateLabel(offsetDays, lang = 'ar') {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const days = lang === 'en'
    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    : ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
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
  const friendWords = ['اصحاب', 'أصحاب', 'صاحب', 'صاحبي', 'صاحبتي', 'صديق', 'صديقتي', 'اصدقاء', 'أصدقاء', 'رفقة', 'رفاق', 'شلة', 'شلتي', 'جماعة', 'فريق', 'زملاء', 'جروب', 'شباب', 'شب', 'بنات', 'ولاد', 'friends', 'buddies', 'group', 'gang'];
  const funWords = ['اتسلى', 'أتسلى', 'نتسلى', 'تسلية', 'استمتاع', 'نتفسح', 'فسحة', 'خرجة', 'نطلع', 'طلعة', 'fun', 'hangout', 'hang out'];
  return friendWords.some(w => q.includes(w)) || funWords.some(w => q.includes(w));
}

const KEYWORD_SYNONYMS = {
  'مطعم': ['مطعم', 'مطاعم', 'restaurant', 'restaurants', 'food', 'eat', 'اكل', 'أكل', 'طعام'],
  'قريب': ['قريب', 'قريبة', 'قريبين', 'near', 'nearby', 'close by'],
  'صيف': ['صيف', 'صيفي', 'صيفية', 'حر', 'حار', 'summer', 'hot'],
  'شتاء': ['شتاء', 'شتوي', 'شتوية', 'برد', 'بارد', 'winter', 'cold'],
  'ربيع': ['ربيع', 'ربيعي', 'ربيعية', 'spring'],
  'طقس': ['طقس', 'weather', 'حرارة', 'درجة الحرارة', 'temperature'],
  'بحر': ['بحر', 'sea', 'سباحة', 'اسبح', 'أسبح', 'عوم', 'swim', 'swimming', 'beach'],
  'طبيعة': ['طبيعة', 'طبيعية', 'خضرة', 'خضراء', 'اخضر', 'أخضر', 'غابة', 'غابات', 'جبال', 'جبل', 'nature', 'green', 'forest', 'mountain', 'mountains'],
  'اثري': ['اثري', 'أثري', 'تاريخي', 'تاريخية', 'اثار', 'آثار', 'قلعة', 'قلاع', 'روماني', 'ancient', 'roman', 'historical', 'history', 'castle', 'ruins'],
  'تخييم': ['تخييم', 'خيمة', 'خيم', 'camping', 'camp'],
  'مغامرة': ['مغامرة', 'مغامرات', 'مغامره', 'تسلق', 'سفاري', 'مسار', 'مسارات', 'هايكنغ', 'adventure', 'hike', 'hiking', 'climbing', 'safari', 'trail'],
  'ديني': ['ديني', 'دينية', 'كنيسة', 'كنائس', 'فسيفساء', 'تراثي', 'مقدس', 'religious', 'church', 'mosaic', 'heritage', 'sacred'],
  'استجمام': ['استجمام', 'استرخاء', 'استرخى', 'علاج', 'شلالات', 'شلال', 'ينابيع', 'حمامات', 'relax', 'relaxation', 'therapy', 'spa', 'waterfall'],
  'مدينة': ['مدينة', 'مدن', 'تسوق', 'سوق', 'مولات', 'city', 'urban', 'shopping', 'mall'],
  'هدوء': ['هدوء', 'هادئ', 'هادية', 'بعيد عن الزحمة', 'مزدحم', 'quiet', 'peaceful', 'calm', 'crowd'],
  'تصوير': ['تصوير', 'صور', 'صورة', 'photo', 'photos', 'photography', 'انستقرام', 'instagram'],
  'رومانسي': ['رومانسي', 'رومنسي', 'romantic', 'حبيب', 'حبيبي', 'حبيبتي', 'خطيب', 'خطيبة', 'زوجي', 'زوجتي'],
  'اصحاب': ['اصحاب', 'أصحاب', 'صحاب', 'شلة', 'شلتي', 'رفقة', 'friends', 'friend', 'frind', 'buddies'],
  'عائلة': ['عائلة', 'عائلتي', 'اهلي', 'أهلي', 'اطفال', 'أطفال', 'family', 'kids', 'children'],
  'لحالي': ['لحالي', 'وحدي', 'لوحدي', 'alone', 'solo', 'myself'],
  'رحلة': ['رحلة', 'رحله', 'trip', 'holiday', 'vacation', 'vacation', 'travel', 'travelling', 'traveling'],
  'وين': ['وين', 'فين', 'where'],
  'مرحبا': ['مرحبا', 'مرحباً', 'هلا', 'hi', 'hello', 'hey', 'salam'],
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
async function getRahalCoreResponse(question, userLocation, userPlaces, lang = 'ar') {
  const q = expandSynonyms(question.trim()).toLowerCase();
  const isEn = lang === 'en';

  const greetings = ['مرحبا', 'مرحباً', 'هاي', 'اهلا', 'أهلا', 'السلام عليكم', 'hi', 'hello', 'hey'];
  if (greetings.some(g => q.includes(g)) && q.length < 30) {
    return isEn
      ? "Hey there! 👋 I'm Rahhal, your Jordan travel guide. Ask me about any place, activity, or the weather!"
      : 'أهلاً فيكي! 👋 أنا رحال، دليلك السياحي بالأردن. اسأليني عن أي منطقة أو نشاط أو الطقس!';
  }
  if (q.includes('شكرا') || q.includes('شكراً') || q.includes('تسلم') || q.includes('thank')) {
    return isEn ? "You're welcome! 😊 Always here to help, happy travels!" : 'العفو! 😊 دايماً موجود لمساعدتك، رحلة سعيدة!';
  }
  if (q.includes('مين انت') || q.includes('من انت') || q.includes('شو بتعمل') || q.includes('شو تقدر تعمل') || q.includes('who are you') || q.includes('what can you do')) {
    return isEn
      ? "I'm Rahhal 🧭 your smart travel guide on Rihlati! I can help you find the best places by season, weather, activity type, or even where to go tomorrow 😊"
      : 'أنا رحال 🧭 دليلك السياحي الذكي بموقع رحلتي! بقدر أساعدك تلاقي أفضل الأماكن حسب الموسم، الطقس، نوع النشاط، أو حتى وين تروح بكرا 😊';
  }

  if (q.includes('كم يبعد') || q.includes('كم بعد') || q.includes('قديش يبعد') || q.includes('المسافة') || q.includes('how far') || q.includes('distance')) {
    const foundDistKey = Object.keys(places).find(k => q.includes(places[k].name) || q.includes(places[k].nameEn.toLowerCase()));
    if (foundDistKey) {
      const amman = places.amman;
      const km = getDistance(amman.lat, amman.lng, places[foundDistKey].lat, places[foundDistKey].lng);
      const pName = isEn ? places[foundDistKey].nameEn : places[foundDistKey].name;
      return isEn ? `${pName} is about ${km} km from Amman 📏` : `${places[foundDistKey].name} تبعد حوالي ${km} كم عن عمّان 📏`;
    }
  }

  const foundKey = Object.keys(places).find(k => q.includes(places[k].name) || q.includes(places[k].nameEn.toLowerCase()));
  if (foundKey) {
    const p = places[foundKey];
    const wantsStory = q.includes('قصة') || q.includes('تاريخ') || q.includes('احكيلي') || q.includes('احكي لي') || q.includes('story') || q.includes('history');
    if (wantsStory && CULTURAL_INFO[foundKey]) {
      const info = CULTURAL_INFO[foundKey];
      const history = isEn ? (info.historyEn || info.history) : info.history;
      const tip = isEn ? (info.tipEn || info.tip) : info.tip;
      return isEn
        ? `📖 ${p.nameEn}\n\n${history}${tip ? `\n\n🌿 Responsible visitor tip: ${tip}` : ''}`
        : `📖 ${p.name}\n\n${history}${tip ? `\n\n🌿 سلوك زائر مسؤول: ${tip}` : ''}`;
    }
    return isEn
      ? `${p.nameEn}: ${p.descEn}\n🍽️ Famous for: ${p.foodEn}`
      : `${p.name}: ${p.desc}\n🍽️ يشتهر بـ: ${p.food}`;
  }

  if (userPlaces && userPlaces.length) {
    const foundUserPlace = userPlaces.find(p => q.includes((p.name || '').toLowerCase()));
    if (foundUserPlace) {
      const foodLine = foundUserPlace.food ? (isEn ? `\n🍽️ Famous for: ${foundUserPlace.food}` : `\n🍽️ يشتهر بـ: ${foundUserPlace.food}`) : '';
      return isEn
        ? `${foundUserPlace.name} (added by a visitor 👤): ${foundUserPlace.desc}${foodLine}`
        : `${foundUserPlace.name} (أضافها أحد الزوار 👤): ${foundUserPlace.desc}${foodLine}`;
    }
  }

  const wantsTomorrow = q.includes('بكرا') || q.includes('غدا') || q.includes('غداً') || q.includes('tomorrow');
  const wantsToday = q.includes('اليوم') || q.includes('هلق') || q.includes('هلأ') || q.includes('today') || q.includes('now');
  const wantsWeekend = q.includes('ويكند') || q.includes('عطلة') || q.includes('نهاية الأسبوع') || q.includes('الجمعة') || q.includes('السبت') || q.includes('weekend');
  const asksWhereToGo = q.includes('وين') || q.includes('روح') || q.includes('نصح') || q.includes('اقترح') || q.includes('مناسب') || q.includes('رحلة') || q.includes('خطط') || q.includes('خطة') || q.includes('مكان اذهب') || q.includes('مكان أذهب') || q.includes('مكان اتسلى') || q.includes('مكان أتسلى') || q.includes('where') || q.includes('suggest') || q.includes('recommend') || q.includes('go to');

  if ((wantsTomorrow || wantsToday || wantsWeekend) && asksWhereToGo) {
    if (isFriendsQuery(q)) {
      return isEn
        ? "For hanging out with friends 👥: Wadi Rum for group camping 🏜️, Wadi Mujib for adventure 🏞️, Birgish Forest for a picnic and BBQ 🌳, or the Dead Sea for a fun day 🌊"
        : 'للخروجات مع الشباب والأصدقاء 👥: وادي رم للتخييم الجماعي 🏜️، وادي الموجب للمغامرة 🏞️، غابات برقش للفرشة والشواء 🌳، أو البحر الميت ليوم مرح 🌊';
    }
    const romantic = q.includes('خطيب') || q.includes('خطيبة') || q.includes('زوجي') || q.includes('زوجتي') || q.includes('رومانسي') || q.includes('حبيب') || q.includes('romantic') || q.includes('husband') || q.includes('wife') || q.includes('fiance');
    if (romantic) {
      return isEn
        ? "For a romantic vibe 💑 try a sunset in Wadi Rum 🌅, a relaxing night at Ma'in Hot Springs ♨️, or a sunset walk by the Dead Sea 🌊"
        : 'لجو رومانسي 💑 جربوا غروب الشمس بوادي رم 🌅، أو ليلة استرخاء بحمامات ماعين ♨️، أو نزهة عالبحر الميت وقت الغروب 🌊';
    }
    if (!userLocation) {
      return isEn
        ? 'I need access to your location to check the exact weather 🌦️ (tap "Allow" if the browser asked). But in general: if it\'s hot go to the Dead Sea or Aqaba for swimming 🌊, if it\'s mild try Wadi Rum or Ajloun for a walk and BBQ 🍖, and if it\'s cold try Ma\'in Hot Springs or Al-Himma ♨️'
        : 'لازم تسمحلي بالوصول لموقعك عشان أجيب حالة الطقس بالضبط 🌦️ (اضغط "السماح" لو المتصفح طلب الإذن). بس بشكل عام: لو الجو حر روح للبحر الميت أو العقبة للسباحة 🌊، ولو معتدل جرب وادي رم أو عجلون للتنزه والشواء 🍖، ولو بارد جرب حمامات ماعين أو الحمة ♨️';
    }
    const offset = (wantsTomorrow || wantsWeekend) ? 1 : 0;
    const weather = await getWeatherInfo(userLocation.lat, userLocation.lng, offset);
    const dateLabel = getArabicDateLabel(offset, lang);
    if (!weather || weather.temp === undefined) {
      return isEn ? `I couldn't fetch the weather for ${dateLabel} right now 🌦️ try again in a bit` : `ما قدرت أجيب حالة الطقس ${dateLabel} حالياً 🌦️ حاولي مرة ثانية بعد شوي`;
    }
    const { temp, rain } = weather;
    if (rain && rain > 2) {
      return isEn
        ? `It's a bit rainy on ${dateLabel} ☔ good chance to visit historical sites or Ma'in Hot Springs ♨️ and Al-Himma`
        : `الجو ${dateLabel} ممطر شوي ☔ بحسها فرصة حلوة للمناطق الأثرية أو حمامات ماعين ♨️ والحمة الأردنية`;
    }
    if (temp >= 30) {
      return isEn
        ? `It's hot on ${dateLabel} (${Math.round(temp)}°) ☀️ great for swimming, try the Dead Sea 🌊, Aqaba, or Wadi Mujib Reserve`
        : `الجو ${dateLabel} حر (${Math.round(temp)}°) ☀️ مناسب جداً للسباحة، جرب البحر الميت 🌊، العقبة، أو محمية وادي الموجب`;
    }
    if (temp >= 20) {
      return isEn
        ? `It's mild and lovely on ${dateLabel} (${Math.round(temp)}°) 🌤️ great for walking and BBQ, try Wadi Rum 🏜️, Ajloun 🌲, or a picnic at Birgish Forest 🌳`
        : `الجو ${dateLabel} معتدل ورائع (${Math.round(temp)}°) 🌤️ مناسب للتنزه والشواء (الزرب)، جرب وادي رم 🏜️، عجلون 🌲، أو غابات برقش للفرشة 🌳`;
    }
    return isEn
      ? `It's a bit cold on ${dateLabel} (${Math.round(temp)}°) ❄️ best to go to Ma'in Hot Springs ♨️ or Al-Himma to warm up`
      : `الجو ${dateLabel} بارد شوي (${Math.round(temp)}°) ❄️ أنسب شي حمامات ماعين ♨️ أو الحمة الأردنية للدفا`;
  }

  if (isFriendsQuery(q)) {
    return isEn
      ? "For hanging out with friends 👥: Wadi Rum for group camping 🏜️, Wadi Mujib for adventure 🏞️, Birgish Forest for a picnic and BBQ 🌳, or the Dead Sea for a fun day 🌊"
      : 'للخروجات مع الشباب والأصدقاء 👥: وادي رم للتخييم الجماعي 🏜️، وادي الموجب للمغامرة 🏞️، غابات برقش للفرشة والشواء 🌳، أو البحر الميت ليوم مرح 🌊';
  }
  if (q.includes('خطيب') || q.includes('خطيبة') || q.includes('زوجي') || q.includes('زوجتي') || q.includes('رومانسي') || q.includes('حبيب') || q.includes('romantic')) {
    return isEn
      ? "For a romantic vibe 💑: a sunset in Wadi Rum 🌅, a quiet night at Ma'in Hot Springs ♨️, or a sunset walk by the Dead Sea 🌊"
      : 'لأجواء رومانسية 💑: غروب الشمس بوادي رم 🌅، ليلة هادئة بحمامات ماعين ♨️، أو نزهة على البحر الميت وقت الغروب 🌊';
  }
  if (q.includes('لحالي') || q.includes('وحدي') || q.includes('alone') || q.includes('solo')) {
    return isEn
      ? 'For a calm solo trip 🚶: Dana Reserve 🏔️, Tafilah ⛰️, or Petra for a reflective experience'
      : 'للسفر لحالك بهدوء 🚶: محمية ضانا 🏔️، الطفيلة ⛰️، أو البتراء لتجربة تأملية';
  }
  if (q.includes('تصوير') || q.includes('انستقرام') || q.includes('صور حلوة') || q.includes('photo') || q.includes('instagram')) {
    return isEn
      ? '📸 Best spots for photography: Petra (the Treasury) 🏛️, Wadi Rum (sunset) 🌅, the Dead Sea, and Ajloun Castle'
      : 'أجمل أماكن للتصوير 📸: البتراء (الخزنة) 🏛️، وادي رم (غروب الشمس) 🌅، البحر الميت، وقلعة عجلون';
  }
  if (q.includes('مشي') || q.includes('هايكنغ') || q.includes('مسار') || q.includes('مسارات') || q.includes('hik') || q.includes('trail')) {
    return isEn
      ? '🥾 Great hiking trails: Dana Reserve (full valley trail), Wadi Mujib (water trail), and Petra (the long hike to the Monastery)'
      : 'مسارات مشي رائعة 🥾: محمية ضانا (مسار الوادي الكامل)، وادي الموجب (المسار المائي)، والبتراء (المسير الطويل للدير)';
  }
  if (q.includes('نجوم') || q.includes('تخييم ليلي') || q.includes('سماء') || q.includes('star') || q.includes('night sky')) {
    return isEn
      ? '⭐ Best place for stargazing at night: Wadi Rum 🏜️, far from city lights with a very clear night sky'
      : 'أفضل مكان لمشاهدة النجوم ⭐ ليلاً: وادي رم 🏜️، بعيد عن أضواء المدن وسماءه صافية جداً بالليل';
  }
  if (q.includes('شلالات') || q.includes('شلال') || q.includes('waterfall')) {
    return isEn
      ? "Beautiful waterfalls: Ma'in Hot Springs ♨️ (hot waterfalls), and Wadi Mujib 🏞️ (water trails and waterfalls)"
      : 'شلالات جميلة: حمامات ماعين ♨️ (شلالات ساخنة)، ووادي الموجب 🏞️ (مسارات مائية وشلالات)';
  }
  if (q.includes('طيور') || q.includes('مراقبة الطيور') || q.includes('bird')) {
    return isEn
      ? '🦅 For birdwatching: Azraq Wetland Reserve 🦆, an important stop for migratory birds'
      : 'لمراقبة الطيور 🦅: محمية الأزرق المائية 🦆، وجهة مهمة للطيور المهاجرة';
  }
  if (q.includes('ثلج') || q.includes('تلج') || q.includes('snow')) {
    return isEn
      ? '❄️🌲 Ajloun is one of the areas where snow can fall in winter (depending on the season)'
      : 'عجلون من المناطق اللي ممكن يتساقط فيها الثلج شتاءً ❄️🌲 (حسب الموسم)';
  }
  if ((q.includes('قلاع') || q.includes('قلعة') || q.includes('castle')) && !foundKey) {
    return isEn
      ? '🏰 Beautiful historic castles: Karak, Ajloun, Shobak, and Azraq Castle — each with its own style and story'
      : 'قلاع تاريخية رائعة 🏰: الكرك، عجلون، الشوبك، وقلعة الأزرق - كل وحدة بطراز وقصة مختلفة';
  }
  if (q.includes('يونسكو') || q.includes('تراث عالمي') || q.includes('unesco') || q.includes('heritage')) {
    return isEn
      ? '🏛️ UNESCO World Heritage sites: Petra, Umm ar-Rasas, Qasr Amra, and Salt'
      : 'مواقع مسجلة على قائمة اليونسكو 🏛️: البتراء، أم الرصاص، قصر عمرة، والسلط';
  }
  if (q.includes('ازدحام') || q.includes('مزدحم') || q.includes('بعيد عن الزحمة') || q.includes('crowd') || q.includes('quiet place')) {
    return isEn
      ? '🌿 Quiet places away from the crowds: Dana Reserve, Tafilah, Umm Al-Naml, and Birgish Forest'
      : 'أماكن هادئة بعيدة عن الزحمة 🌿: محمية ضانا، الطفيلة، أم النمل، وغابات برقش';
  }
  if (q.includes('افضل وقت') || q.includes('أفضل وقت') || q.includes('best time')) {
    return isEn
      ? '☀️ In general: spring (March-May) and autumn are the best time for most areas (mild weather), summer suits cooler mountain areas, and winter suits Petra, Wadi Rum, and Aqaba (warmer)'
      : 'بشكل عام: الربيع 🌸 (آذار-أيار) والخريف أفضل وقت لمعظم المناطق (طقس معتدل)، الصيف مناسب للمناطق الجبلية الباردة، والشتاء مناسب للبتراء ووادي رم والعقبة (أدفأ) ☀️';
  }
  if (q.includes('ربيع') || q.includes('spring')) {
    const names = springKeys.map(k => (isEn ? places[k].nameEn : places[k].name)).join(isEn ? ', ' : '، ');
    return isEn ? `🌸 In spring, I'd suggest visiting: ${names} (the best time for a picnic and enjoying nature)` : `بالربيع بقترح تزوري: ${names} 🌸 (أحسن وقت للفرشة والتنزه بالطبيعة)`;
  }
  if (q.includes('فرشة') || q.includes('فرش') || q.includes('عالارض') || q.includes('على الأرض') || q.includes('تنزه') || q.includes('picnic')) {
    return isEn
      ? "🌳 Best spots for a picnic: Birgish Forest and Umm Al-Naml 🌸 (a stunning green valley near Irbid), and also Dana Reserve for mountain nature 🏔️"
      : 'لفرشة عالطبيعة أفضل مكانين عنا: غابات برقش 🌳 وأم النمل 🌸 (وادي أخضر خلاب قرب إربد)، وكمان محمية ضانا للطبيعة الجبلية 🏔️';
  }
  if (q.includes('شتاء') || q.includes('شتوي') || q.includes('برد') || q.includes('winter') || q.includes('cold')) {
    const names = winterKeys.map(k => (isEn ? places[k].nameEn : places[k].name)).join(isEn ? ', ' : '، ');
    return isEn ? `❄️ In winter, I'd suggest visiting: ${names}` : `بالشتاء بقترح تزوري: ${names} ❄️`;
  }
  if (q.includes('صيف') || q.includes('صيفي') || q.includes('حر') || q.includes('summer') || q.includes('hot')) {
    const names = summerKeys.map(k => (isEn ? places[k].nameEn : places[k].name)).join(isEn ? ', ' : '، ');
    return isEn ? `☀️ In summer, I'd suggest visiting: ${names}` : `بالصيف بقترح تزوري: ${names} ☀️`;
  }
  if (q.includes('طبيعة') || q.includes('جبال') || q.includes('مناظر') || q.includes('خضرة') || q.includes('خضار') || q.includes('اخضر') || q.includes('أخضر') || q.includes('nature') || q.includes('mountain') || q.includes('green')) {
    return isEn
      ? '🏔️ Most beautiful nature and greenery: Dana Reserve, Wadi Mujib 🏞️, Birgish Forest and Umm Al-Naml 🌳, and Deisa near Aqaba'
      : 'أجمل مناطق الطبيعة والخضرة: محمية ضانا 🏔️، وادي الموجب 🏞️، غابات برقش وأم النمل 🌳، والديسة قرب العقبة';
  }
  if (q.includes('مغامرة') || q.includes('رياضة') || q.includes('سفاري') || q.includes('adventure') || q.includes('safari')) {
    return isEn
      ? '🏜️ For adventure: Wadi Rum (safari and camping), Wadi Mujib 🏞️ (water trails), and Petra for a long hike 🥾'
      : 'للمغامرة: وادي رم 🏜️ (سفاري وتخييم)، وادي الموجب 🏞️ (مسارات مائية)، والبتراء للمشي الطويل 🥾';
  }
  if (q.includes('كنائس') || q.includes('دينية') || q.includes('فسيفساء') || q.includes('مقدسة') || q.includes('church') || q.includes('mosaic')) {
    return isEn
      ? '⛪ Religious and heritage sites: Madaba (churches and mosaics), and Umm ar-Rasas 🏛️ (a UNESCO site with stunning mosaics)'
      : 'مواقع دينية وتراثية: مادبا ⛪ (كنائس وفسيفساء)، وأم الرصاص 🏛️ (موقع يونسكو بفسيفساء رائعة)';
  }
  if (q.includes('تسوق') || q.includes('سوق') || q.includes('مولات') || q.includes('shop') || q.includes('mall')) {
    return isEn ? '🛍️ Best place for shopping is Amman (traditional markets and modern malls)' : 'للتسوق أفضل مكان هو عمّان 🛍️ (فيها أسواق تقليدية ومولات حديثة)';
  }
  if (q.includes('عائلة') || q.includes('اطفال') || q.includes('أطفال') || q.includes('family') || q.includes('kids')) {
    return isEn
      ? "👨‍👩‍👧 Great for families: the Dead Sea 🌊, Ma'in Hot Springs ♨️, and Amman (has entertainment spots for kids)"
      : 'مناسب للعائلات: البحر الميت 🌊، حمامات ماعين ♨️، وعمّان (فيها أماكن ترفيهية للأطفال) 👨‍👩‍👧';
  }
  if (q.includes('هدوء') || q.includes('استجمام') || q.includes('استرخاء عام') || q.includes('relax') || q.includes('peace')) {
    return isEn
      ? '🏔️ For calm and relaxation: Dana Reserve, Tafilah ⛰️, or Deisa 🏞️ — quiet places away from the crowds'
      : 'للهدوء والاستجمام: محمية ضانا 🏔️، الطفيلة ⛰️، أو الديسة 🏞️ - أماكن هادئة بعيدة عن الزحمة';
  }
  if (q.includes('غروب') || q.includes('شروق') || q.includes('sunset') || q.includes('sunrise')) {
    return isEn ? '🌅 The most beautiful sunset is in Wadi Rum 🌅 or Aqaba on the Red Sea shore 🌇' : 'أجمل غروب تشوفه بوادي رم 🌅 أو العقبة على شاطئ البحر الأحمر 🌇';
  }
  if (q.includes('رخيص') || q.includes('مجاني') || q.includes('بدون فلوس') || q.includes('اقتصادي') || q.includes('free') || q.includes('cheap')) {
    return isEn
      ? '🏘️ Many places have no entry fees: Birgish Forest 🌳, Umm Al-Naml 🌸, and most cities like Amman, Irbid, and Salt'
      : 'أماكن كتير بدون رسوم دخول: غابات برقش 🌳، أم النمل 🌸، وأغلب المدن زي عمّان وإربد والسلط 🏘️';
  }
  if (q.includes('اكل') || q.includes('أكل') || q.includes('طعام') || q.includes('طبخ') || q.includes('مطاعم') || q.includes('food') || q.includes('eat')) {
    return isEn
      ? '🍽️ Every place on the site has info about its most famous dish — tell me a specific place and I\'ll tell you what it\'s known for'
      : 'كل منطقة بالموقع فيها معلومة عن أشهر أكلة فيها 🍽️ قل لي اسم منطقة محددة وبقلك شو يشتهروا فيها';
  }
  if (q.includes('تخييم') || q.includes('خيمة') || q.includes('camp')) {
    return isEn ? '🏜️ Best places to camp: Wadi Rum (an unforgettable desert experience), or Deisa near Aqaba 🏔️' : 'أفضل أماكن للتخييم: وادي رم 🏜️ (تجربة صحراوية لا تُنسى)، أو الديسة قرب العقبة 🏔️';
  }
  if (q.includes('بحر') || q.includes('سباحة') || q.includes('عوم') || q.includes('sea') || q.includes('swim')) {
    return isEn
      ? '🌊 For swimming or relaxing in the water: the Dead Sea (your body floats on its own), or Aqaba and the Red Sea for diving 🐠'
      : 'للسباحة أو الاسترخاء بالماء: البحر الميت 🌊 (يطفو الجسم لوحده)، أو العقبة والبحر الأحمر للغطس 🐠';
  }
  if (q.includes('اثري') || q.includes('أثري') || q.includes('تاريخ') || q.includes('روماني') || q.includes('ancient') || q.includes('roman') || q.includes('history')) {
    return isEn
      ? '🏛️ Amazing archaeological sites: Petra (one of the Seven Wonders of the World), Jerash, Umm Qais, Pella, Umm ar-Rasas, and Qasr Amra'
      : 'مواقع أثرية رائعة: البتراء 🏛️ (عجائب الدنيا السبع)، جرش، أم قيس، بيلا، أم الرصاص، وقصر عمرة';
  }
  if (q.includes('بدوي') || q.includes('صحراء') || q.includes('bedouin') || q.includes('desert')) {
    return isEn ? 'The authentic Bedouin experience is found in Wadi Rum 🏜️ and Deisa, with Zarb and Bedouin tea' : 'التجربة البدوية الأصيلة تلاقيها بوادي رم 🏜️ والديسة، مع الزرب والشاي البدوي';
  }
  if (q.includes('علاج') || q.includes('صحة') || q.includes('therap') || q.includes('health')) {
    return isEn
      ? "♨️ For therapy and relaxation: Ma'in Hot Springs, Al-Himma, or therapeutic Dead Sea mud 🌊"
      : 'للعلاج والاسترخاء: حمامات ماعين ♨️، الحمة الأردنية ♨️، أو طمي البحر الميت العلاجي 🌊';
  }
  if (q.includes('عمان') || q.includes('عمّان') || q.includes('amman')) {
    return isEn
      ? "🏛️ Amman: the Kingdom's capital, home to the Citadel, the Roman Theatre, and a lively downtown"
      : 'عمّان: عاصمة المملكة، فيها جبل القلعة والمدرج الروماني ووسط البلد النابض بالحياة 🏛️';
  }

  return isEn
    ? "I couldn't find a precise answer to your question 🤔 try asking me about: a place name, the season, food, nature, ruins, swimming, adventure, photography, castles, or \"where should I go tomorrow\" and I'll answer based on the weather 😊"
    : 'ما قدرت ألاقي جواب دقيق لسؤالك 🤔 جرب تسألني عن: اسم منطقة، الموسم، الأكل، الطبيعة، الآثار، السباحة، المغامرة، التصوير، القلاع، أو "وين أروح بكرا" وبجاوبك حسب الطقس 😊';
}

// بيدور على مناطق أضافها زوار (وتمت الموافقة عليها فقط) بتطابق نوع
// الاهتمام المذكور بسؤال المستخدم — عشان رحال يقترحها كمان مش بس
// المناطق الرسمية. هيك أي منطقة يضيفها زائر بتصير جزء فعلي من
// توصيات رحال بمجرد ما توافق عليها الإدارة
function findMatchingApprovedUserPlaces(question, userPlaces, lang = 'ar') {
  const approved = (userPlaces || []).filter((p) => p.status === 'approved' || !p.status);
  if (approved.length === 0) return [];
  const detectedTypes = detectPlaceTypesFromText(question);
  if (detectedTypes.length === 0) return [];
  return approved.filter((p) => detectedTypes.includes(p.type)).slice(0, 3);
}

// الدالة يلي فعلياً بتستدعيها الواجهة — بتاخذ جواب رحال الأساسي
// وبتضيفله (لو في تطابق) اقتراح مناطق اكتشفها زوار تانيين، عشان
// كل منطقة تمت الموافقة عليها تصير جزء فعلي من تجربة الاكتشاف
async function getRahalResponse(question, userLocation, userPlaces, lang = 'ar') {
  const baseAnswer = await getRahalCoreResponse(question, userLocation, userPlaces, lang);
  const matchedUserPlaces = findMatchingApprovedUserPlaces(question, userPlaces, lang);
  if (matchedUserPlaces.length === 0) return baseAnswer;
  const names = matchedUserPlaces.map((p) => p.name).join(lang === 'ar' ? '، ' : ', ');
  const suffix = lang === 'ar'
    ? `\n\n🌟 وكمان في مناطق اكتشفها زوار زيك وضافوها للتطبيق ممكن تعجبك: ${names}`
    : `\n\n🌟 Also, here are places discovered and added by other visitors that might interest you: ${names}`;
  return baseAnswer + suffix;
}

const ECO_MESSAGES = {
  ar: [
    '🌿 المحافظة على نظافة الطبيعة مسؤولية الجميع',
    '🔥 التأكد من إطفاء النار بالكامل قبل المغادرة',
    '🌳 عدم قطف أو كسر النباتات والأشجار',
    '🐾 الحفاظ على الحياة البرية وعدم إزعاج الحيوانات',
    '💧 ترشيد استهلاك المياه، خصوصاً بالمناطق الصحراوية',
    '♻️ تفضيل الأدوات القابلة لإعادة الاستخدام بدل البلاستيك',
  ],
  en: [
    '🌿 Keeping nature clean is everyone\'s responsibility',
    '🔥 Make sure to fully put out fires before leaving',
    '🌳 Don\'t pick or break plants and trees',
    '🐾 Protect wildlife and avoid disturbing animals',
    '💧 Use water wisely, especially in desert areas',
    '♻️ Prefer reusable tools over plastic',
  ],
};

function EcoBanner({ lang = 'ar' }) {
  const [index, setIndex] = useState(0);
  const messages = ECO_MESSAGES[lang] || ECO_MESSAGES.ar;
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [messages.length]);
  return (
    <div style={{ background: 'linear-gradient(120deg, #6b9b5e, #4f7a45)', color: '#fff', borderRadius: 16, padding: '10px 18px', margin: '12px auto', maxWidth: 600, fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
      {messages[index % messages.length]}
    </div>
  );
}

function StarRating({ placeKey, ratings, setRatings, user, onRated, lang = 'ar' }) {
  const ratingData = ratings[placeKey] || { avg: 0, count: 0 };
  const avg = ratingData.avg || 0;
  const count = ratingData.count || 0;

  const handleRate = async (star) => {
    if (!user) return showToast(lang === 'ar' ? 'سجل دخول أولاً لتقييم المنطقة' : 'Please log in first to rate this place');
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
      try {
        await setDoc(doc(db, 'userProfiles', user.uid), { ratedPlaceKeys: arrayUnion(placeKey) }, { merge: true });
      } catch (e) {}
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

// ============================================================
// صندوق المعلومات الثقافية — خلفية تاريخية موجزة + نصيحة سلوك
// مسؤول، قابل للطي عشان ما يثقل بطاقة المنطقة لمين مش مهتم
// ============================================================
// بتفتح شات رحال وتسأله تلقائياً عن قصة مكان معين — نستخدم حدث
// مخصص (زي آلية showToast بالضبط) عشان نقدر نستدعيها من أي بطاقة
// منطقة بدون ما نحتاج نمرر props لمسافات طويلة بين المكونات
// بتقرأ نص بصوت حقيقي باستخدام تقنية "تحويل نص لصوت" المدمجة
// بالمتصفح (Web Speech API) — مجانية بالكامل وما بتحتاج أي
// اشتراك أو اتصال خارجي، بس جودة الصوت العربي بتختلف حسب
// المتصفح ونظام التشغيل (كروم عادة أفضل خيار للعربي)
function speakText(text, lang = 'ar') {
  if (!('speechSynthesis' in window)) {
    showToast(lang === 'ar' ? 'متصفحك ما بيدعم القراءة الصوتية للأسف' : "Sorry, your browser doesn't support text-to-speech");
    return;
  }
  window.speechSynthesis.cancel(); // نوقف أي قراءة سابقة قبل ما نبدأ وحدة جديدة
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function askRahalStory(placeName, lang = 'ar') {
  const question = lang === 'en' ? `Tell me the story of ${placeName}` : `احكيلي قصة ${placeName}`;
  window.dispatchEvent(new CustomEvent('rl-ask-rahal', { detail: { question } }));
}

function CulturalInfoBox({ info, lang = 'ar', placeName, isFav, onToggleFavorite, user }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const keepAliveRef = useRef(null);
  const history = lang === 'ar' ? info.history : (info.historyEn || info.history);
  const tip = lang === 'ar' ? info.tip : (info.tipEn || info.tip);

  // كروم أحياناً بيحاول يشغّل الصوت قبل ما يخلص تحميل قائمة الأصوات
  // المتاحة بالكامل، وهاد بيسبب صوت مشوّش/متقطع. هاي الدالة بتستنى
  // لحد ما القائمة تجهز فعلياً قبل ما نختار صوت ونشغله
  const getVoicesReady = () => new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);
    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    // احتياط لو المتصفح ما أطلق الحدث أبداً (نادراً ما بيصير) — منكمل
    // بعد نص ثانية بأي قائمة موجودة بدل ما نعلّق للأبد
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });

  const clearKeepAlive = () => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  };

  const speakQueueRef = useRef([]);

const splitIntoChunks = (text) => {
  // نقسم لجمل قصيرة عشان نتفادى خلل Chrome يلي بيقطع النصوص الطويلة (~15 ثانية)
  const sentences = text
    .split(/(?<=[.!؟?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length > 0 ? sentences : [text];
};

const handleListen = async () => {
  if (!('speechSynthesis' in window)) {
    showToast(lang === 'ar' ? 'متصفحك ما بيدعم القراءة الصوتية للأسف' : "Sorry, your browser doesn't support text-to-speech");
    return;
  }
  if (speaking) {
    window.speechSynthesis.cancel();
    speakQueueRef.current = [];
    setSpeaking(false);
    return;
  }
  window.speechSynthesis.cancel();
  const targetLangPrefix = lang === 'ar' ? 'ar' : 'en';
  const voices = await getVoicesReady();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));

  const fullText = `${history} ${tip || ''}`.trim();
  speakQueueRef.current = splitIntoChunks(fullText);
  setSpeaking(true);

  const speakNext = () => {
    const next = speakQueueRef.current.shift();
    if (!next) { setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(next);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = 0.95;
    utterance.onend = speakNext;
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  setTimeout(speakNext, 80);
};

  useEffect(() => {
  return () => {
    window.speechSynthesis.cancel();
    speakQueueRef.current = [];
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <div style={{ margin: '10px 0' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{ background: '#faf6ec', color: '#8B6914', border: '1px solid #e8d5a3', borderRadius: 10, padding: '8px 14px', fontSize: '0.85rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}
      >
        <span>ℹ️ {lang === 'ar' ? 'تعرف أكتر على هالمكان' : 'Learn more about this place'}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ background: '#fff8e6', borderRadius: 10, padding: 12, marginTop: 6, fontSize: '0.85rem', color: '#5a3e1b', lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px' }}>{history}</p>
          {tip && (
            <p style={{ margin: 0, color: '#4f7a45', fontWeight: 'bold' }}>
              🌿 {lang === 'ar' ? 'سلوك زائر مسؤول: ' : 'Responsible visitor tip: '}
              <span style={{ fontWeight: 'normal' }}>{tip}</span>
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleListen}
              style={{ background: speaking ? '#c0392b' : '#4f7a45', color: '#fff', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: '0.8rem', margin: 0 }}
            >
              {speaking ? '⏹️' : '🔊'} {speaking
                ? (lang === 'ar' ? 'إيقاف' : 'Stop')
                : (lang === 'ar' ? 'استمع للقصة' : 'Listen to the story')}
            </button>
            <button
              type="button"
              onClick={() => askRahalStory(placeName, lang)}
              style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 20, padding: '7px 16px', fontSize: '0.8rem', margin: 0 }}
            >
              💬 {lang === 'ar' ? 'اقرأ بالشات' : 'Read it in chat'}
            </button>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                style={{ background: isFav ? '#8B6914' : '#faf6ec', color: isFav ? '#fff' : '#8B6914', border: '1px solid #e8d5a3', borderRadius: 20, padding: '7px 16px', fontSize: '0.8rem', margin: 0 }}
              >
                {isFav ? '✅' : '🔖'} {isFav
                  ? (lang === 'ar' ? 'تم الحفظ' : 'Saved')
                  : (lang === 'ar' ? 'احفظ المكان' : 'Save place')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceReviews({ placeKey, user, lang = 'ar', onReviewed }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [draftStars, setDraftStars] = useState(5);
  const [draftText, setDraftText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'reviews', placeKey));
        if (!cancelled && snap.exists()) {
          setReviews((snap.data().items || []).slice().reverse());
        }
      } catch (e) {}
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [placeKey]);

  const submitReview = async () => {
    if (!user) return showToast(lang === 'ar' ? 'سجل دخول أولاً عشان تكتب مراجعة' : 'Please log in first to write a review');
    if (draftText.trim().length < 5) {
      return showToast(lang === 'ar' ? 'لازم كم كلمة عن التجربة على الأقل' : 'Please write at least a few words about your experience');
    }
    setSubmitting(true);
    const newReview = {
      text: draftText.trim(),
      rating: draftStars,
      authorName: user.displayName,
      authorUid: user.uid,
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'reviews', placeKey), { items: arrayUnion(newReview) }, { merge: true });
      setReviews((prev) => [newReview, ...prev]);
      setDraftText('');
      setShowForm(false);
      await setDoc(doc(db, 'userProfiles', user.uid), { ratedPlaceKeys: arrayUnion(placeKey) }, { merge: true }).catch(() => {});
      if (onReviewed) onReviewed();
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ أثناء نشر المراجعة، جرب مرة ثانية' : 'Something went wrong while posting your review, please try again');
    }
    setSubmitting(false);
  };

  const deleteReview = async (reviewToDelete) => {
    try {
      const remaining = reviews.filter(
        (r) => !(r.createdAt === reviewToDelete.createdAt && r.authorUid === reviewToDelete.authorUid)
      );
      await setDoc(doc(db, 'reviews', placeKey), { items: remaining.slice().reverse() }, { merge: false });
      setReviews(remaining);
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ أثناء حذف المراجعة' : 'Something went wrong while deleting the review');
    }
  };

  if (loading) {
    return (
      <div className="rl-reviews">
        <div className="rl-skeleton-line" style={{ width: '60%' }} />
        <div className="rl-skeleton-line" style={{ width: '40%' }} />
      </div>
    );
  }

  return (
    <div className="rl-reviews">
      <div className="rl-reviews-head">
        {reviews.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowList((s) => !s)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <h4 style={{ margin: 0 }}>{lang === 'ar' ? '📝 تجارب الزوار' : '📝 Visitor Reviews'} ({reviews.length})</h4>
            <span style={{ fontSize: '0.8rem', color: '#8B6914' }}>{showList ? '▲' : '▼'}</span>
          </button>
        ) : (
          <h4>{lang === 'ar' ? '📝 تجارب الزوار' : '📝 Visitor Reviews'}</h4>
        )}
        {user && !showForm && (
          <button type="button" className="rl-review-btn" onClick={() => setShowForm(true)}>
            {lang === 'ar' ? '✍️ شارك تجربتك' : '✍️ Share your experience'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="rl-review-form">
          <div style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setDraftStars(star)}
                style={{ cursor: 'pointer', fontSize: '1.3rem', color: star <= draftStars ? '#ffb703' : '#ccc' }}
              >★</span>
            ))}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={lang === 'ar' ? 'أفضل شي أعجبني كان...' : 'The best thing I loved was...'}
            rows={3}
            className="rl-review-textarea"
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={submitReview} disabled={submitting} className="rl-review-submit">
              {submitting ? (lang === 'ar' ? '⏳ جاري النشر...' : '⏳ Posting...') : (lang === 'ar' ? 'نشر' : 'Post')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rl-review-cancel">
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {showList && reviews.length > 0 && (
        <div className="rl-review-list">
          {reviews.slice(0, 4).map((r, i) => (
            <div className="rl-review-item" key={i}>
              <div className="rl-review-item-head">
                <strong>{r.authorName || (lang === 'ar' ? 'زائر' : 'Visitor')}</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="rl-review-stars">{'★'.repeat(r.rating || 0)}</span>
                  {user && r.authorUid === user.uid && (
                    <button
                      onClick={() => deleteReview(r)}
                      style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                      title={lang === 'ar' ? 'احذف مراجعتي' : 'Delete my review'}
                    >🗑️</button>
                  )}
                </span>
              </div>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      )}
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

function compressImageFile(file, maxDimension = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('فشلت معالجة الصورة'))),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذّر تحميل الصورة'));
    };
    img.src = url;
  });
}

const ADD_PLACE_TEXT = {
  ar: {
    addButton: '➕ أضف منطقة جديدة',
    formTitle: '➕ أضف منطقة جديدة',
    namePlaceholder: 'اسم المنطقة',
    descPlaceholder: 'وصف المنطقة',
    foodPlaceholder: 'الأكلة المشهورة (اختياري)',
    summer: '☀️ صيف', winter: '❄️ شتاء', spring: '🌸 ربيع',
    typeLabel: '🏷️ نوع المكان',
    typeNature: '🌿 طبيعة', typeAdventure: '🧗 مغامرة', typeHistorical: '🏛️ تاريخي', typeReligious: '🕌 ديني/تراثي', typeRelaxation: '♨️ استجمام', typeUrban: '🏙️ مدينة',
    mapHint: '📍 دوس على الخريطة لتحديد موقع المنطقة بالضبط',
    locationSet: (lat, lng) => `✅ الموقع المحدد: ${lat}, ${lng}`,
    uploadPhoto: '📸 ارفع صورة',
    uploading: '⏳ جاري رفع الصورة...',
    previewAlt: 'معاينة',
    submit: '✅ إضافة',
    cancel: '❌ إلغاء',
    imgError: 'صار خطأ أثناء معالجة الصورة، جرب صورة تانية',
    fillAllError: 'يرجى ملء كل الحقول وتحميل صورة',
    locationError: 'يرجى تحديد موقع المنطقة على الخريطة 📍',
    pendingNotice: '📋 المنطقة رح تنضاف بعد مراجعة سريعة منّا (عادة بأقل من يوم)',
  },
  en: {
    addButton: '➕ Add New Place',
    formTitle: '➕ Add New Place',
    namePlaceholder: 'Place name',
    descPlaceholder: 'Place description',
    foodPlaceholder: 'Famous dish (optional)',
    summer: '☀️ Summer', winter: '❄️ Winter', spring: '🌸 Spring',
    typeLabel: '🏷️ Place Type',
    typeNature: '🌿 Nature', typeAdventure: '🧗 Adventure', typeHistorical: '🏛️ Historical', typeReligious: '🕌 Religious/Heritage', typeRelaxation: '♨️ Relaxation', typeUrban: '🏙️ City',
    mapHint: '📍 Tap the map to set the exact location',
    locationSet: (lat, lng) => `✅ Selected location: ${lat}, ${lng}`,
    uploadPhoto: '📸 Upload Photo',
    uploading: '⏳ Uploading photo...',
    previewAlt: 'Preview',
    submit: '✅ Add',
    cancel: '❌ Cancel',
    imgError: 'An error occurred while processing the photo, try another one',
    fillAllError: 'Please fill in all fields and upload a photo',
    locationError: 'Please select the location on the map 📍',
    pendingNotice: '📋 The place will appear after a quick review from us (usually under a day)',
  },
};

function AddPlaceForm({ user, onAdd, onPointsEarned, lang = 'ar' }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [season, setSeason] = useState('summer');
  const [placeType, setPlaceType] = useState('nature');
  const [imgUrl, setImgUrl] = useState('');
  const [food, setFood] = useState('');
  const [uploading, setUploading] = useState(false);
  const [show, setShow] = useState(false);
  const [placeLat, setPlaceLat] = useState(null);
  const [placeLng, setPlaceLng] = useState(null);
  const t = ADD_PLACE_TEXT[lang] || ADD_PLACE_TEXT.ar;

  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedBlob = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressedBlob, 'upload.jpg');
      formData.append('upload_preset', 'rihlati_upload');
      const res = await fetch('https://api.cloudinary.com/v1_1/dohsowqbg/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setImgUrl(data.secure_url);
    } catch (e) {
      showToast(t.imgError);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!name || !desc || !imgUrl) return showToast(t.fillAllError);
    if (!placeLat || !placeLng) return showToast(t.locationError);
    const newPlace = {
      name, desc, season, type: placeType, img: imgUrl,
      food: food || null,
      lat: placeLat, lng: placeLng,
      addedBy: user.displayName,
      addedByUid: user.uid,
      addedAt: new Date().toISOString(),
      status: 'pending',
    };
    const docRef = await addDoc(collection(db, 'userPlaces'), newPlace);
    onAdd({ id: docRef.id, ...newPlace });
    createNotification({ toAdmin: true, type: 'place_pending', placeName: name });
    sendAdminEmailAlert(
      `📍 منطقة جديدة بانتظار المراجعة: ${name}`,
      `أضاف ${user.displayName} منطقة جديدة اسمها "${name}" وبتنتظر موافقتك. افتح لوحة الإدارة بموقع رحلتي للمراجعة.`
    );
    if (onPointsEarned) onPointsEarned();
    showToast(t.pendingNotice, 'success');
    try {
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ratedPlaceKeys: arrayUnion(docRef.id),
        addedPlaceKeys: arrayUnion(docRef.id),
      }, { merge: true });
    } catch (e) {}
    setName(''); setDesc(''); setImgUrl(''); setFood(''); setPlaceLat(null); setPlaceLng(null); setShow(false);
  };

  if (!show) return (
    <button className="add-place-btn" onClick={() => setShow(true)}>{t.addButton}</button>
  );

  return (
    <div className="add-place-form">
      <h3>{t.formTitle}</h3>
      <input placeholder={t.namePlaceholder} value={name} onChange={e => setName(e.target.value)} className="form-input" />
      <textarea placeholder={t.descPlaceholder} value={desc} onChange={e => setDesc(e.target.value)} className="form-input" rows={3} />
      <input placeholder={t.foodPlaceholder} value={food} onChange={e => setFood(e.target.value)} className="form-input" />
      <select value={season} onChange={e => setSeason(e.target.value)} className="form-input">
        <option value="summer">{t.summer}</option>
        <option value="winter">{t.winter}</option>
        <option value="spring">{t.spring}</option>
      </select>
      <select value={placeType} onChange={e => setPlaceType(e.target.value)} className="form-input">
        <option value="nature">{t.typeNature}</option>
        <option value="adventure">{t.typeAdventure}</option>
        <option value="historical">{t.typeHistorical}</option>
        <option value="religious">{t.typeReligious}</option>
        <option value="relaxation">{t.typeRelaxation}</option>
        <option value="urban">{t.typeUrban}</option>
      </select>
      <p style={{ fontSize: '0.85rem', color: '#8B6914', margin: '8px 0 6px' }}>{t.mapHint}</p>
      <MapContainer center={[31.95, 35.93]} zoom={7} style={{ height: 220, width: '100%', borderRadius: 10, marginBottom: 8 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationPicker
          onSelect={(la, ln) => { setPlaceLat(la); setPlaceLng(ln); }}
          position={placeLat && placeLng ? [placeLat, placeLng] : null}
        />
      </MapContainer>
      {placeLat && placeLng && (
        <p style={{ fontSize: '0.75rem', color: '#777', marginBottom: 8 }}>
          {t.locationSet(placeLat.toFixed(4), placeLng.toFixed(4))}
        </p>
      )}
      <label className="upload-btn">
        {t.uploadPhoto}
        <input type="file" accept="image/*" onChange={handleImgUpload} style={{ display: 'none' }} />
      </label>
      {uploading && <p>{t.uploading}</p>}
      {imgUrl && <img src={imgUrl} alt={t.previewAlt} style={{ width: '100%', borderRadius: '10px', marginTop: '10px' }} />}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={handleSubmit} className="submit-btn">{t.submit}</button>
        <button onClick={() => setShow(false)} className="cancel-btn">{t.cancel}</button>
      </div>
    </div>
  );
}

function StatStarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C4952A">
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7L12 2z" />
    </svg>
  );
}
function StatBagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4952A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" fill="#C4952A" stroke="none" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function StatPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#C4952A">
      <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  );
}

function showToast(message, type = 'error') {
  window.dispatchEvent(new CustomEvent('rl-toast', { detail: { message, type } }));
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    };
    window.addEventListener('rl-toast', handler);
    return () => window.removeEventListener('rl-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="rl-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`rl-toast rl-toast--${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// نظام الإشعارات — مناطق/صور بانتظار المراجعة (للأدمن)
// وموافقة/رفض/لايك/تعليق (للمستخدم صاحب المحتوى)
// ============================================================
async function createNotification({ toUid = null, toAdmin = false, type, placeName = null }) {
  if (toAdmin === false && !toUid) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      toUid,
      toAdmin,
      type,
      placeName,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {}
}

function getNotificationText(n, lang = 'ar') {
  const p = n.placeName || '';
  const map = {
    place_pending: { ar: `📍 منطقة جديدة "${p}" بانتظار المراجعة`, en: `📍 New place "${p}" pending review` },
    place_approved: { ar: `✅ تمت الموافقة على منطقتك "${p}" 🎉`, en: `✅ Your place "${p}" was approved 🎉` },
    place_rejected: { ar: `❌ للأسف ما تمت الموافقة على منطقتك "${p}"`, en: `❌ Your place "${p}" was not approved` },
    photo_pending: { ar: `📸 صورة جديدة بـ"${p}" بانتظار المراجعة`, en: `📸 New photo in "${p}" pending review` },
    photo_approved: { ar: `✅ تمت الموافقة على صورتك بـ"${p}" 🎉`, en: `✅ Your photo in "${p}" was approved 🎉` },
    photo_rejected: { ar: `❌ للأسف ما تمت الموافقة على صورتك بـ"${p}"`, en: `❌ Your photo in "${p}" was not approved` },
    photo_liked: { ar: `❤️ حدا حط لايك على صورتك بـ"${p}"`, en: `❤️ Someone liked your photo in "${p}"` },
    photo_commented: { ar: `💬 حدا علّق على صورتك بـ"${p}"`, en: `💬 Someone commented on your photo in "${p}"` },
  };
  return (map[n.type] && map[n.type][lang]) || (lang === 'ar' ? '🔔 إشعار جديد' : '🔔 New notification');
}

function NotificationBell({ user, isAdmin, lang = 'ar' }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const field = isAdmin ? 'toAdmin' : 'toUid';
      const value = isAdmin ? true : user.uid;
      const q = query(collection(db, 'notifications'), where(field, '==', value), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadNotifs(); }, [user, isAdmin]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleOpen = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      try {
        await Promise.all(notifs.filter((n) => !n.read).map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true })));
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (e) {}
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button className="lang-btn" onClick={handleOpen} style={{ position: 'relative' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -4, insetInlineEnd: -4, background: '#c0392b', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{ position: 'absolute', top: '110%', insetInlineEnd: 0, width: 'min(340px, 90vw)', maxHeight: 400, overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.25)', zIndex: 2000, padding: 10, textAlign: lang === 'ar' ? 'right' : 'left' }}
        >
          <h4 style={{ margin: '4px 8px 10px', color: '#8B6914' }}>{lang === 'ar' ? '🔔 الإشعارات' : '🔔 Notifications'}</h4>
          {loading ? (
            <p style={{ color: '#999', fontSize: '0.85rem', padding: '0 8px' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          ) : notifs.length === 0 ? (
            <p style={{ color: '#999', fontSize: '0.85rem', padding: '0 8px' }}>{lang === 'ar' ? 'ما في إشعارات لهلق ✨' : 'No notifications yet ✨'}</p>
          ) : (
            notifs.map((n) => (
              <div key={n.id} style={{ padding: '10px 8px', borderBottom: '1px solid #f0e0b0', fontSize: '0.85rem', color: '#444', background: n.read ? 'transparent' : '#faf6ec', borderRadius: 8 }}>
                {getNotificationText(n, lang)}
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 3 }}>{new Date(n.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</div>
              </div>
            ))
          )}
        </div>
      )}
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

function WeatherCard({ latitude, longitude, placeName, lang = 'ar' }) {
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
        {lang === 'ar' ? '🌦️ الموقع غير متاح حالياً' : '🌦️ Location not available'}
      </div>
    );
  }
  if (loading) {
    return (
      <div className="weather-card-mini weather-card-static" style={{ justifyContent: 'flex-start' }}>
        <div className="rl-skeleton-line" style={{ width: '55%', height: 14 }} />
      </div>
    );
  }
  if (!weather || weather.temp === undefined) {
    return null;
  }

  const temp = Math.round(weather.temp);
  const rain = weather.rain || 0;
  let condition, icon, recommendation;

  if (rain > 2) {
    condition = lang === 'ar' ? 'ممطر' : 'Rainy';
    icon = '🌧️';
    recommendation = lang === 'ar'
      ? 'الجو ممطر شوي، فرصة حلوة لزيارة الأماكن الأثرية أو المسقوفة'
      : 'A bit rainy — good chance to visit indoor or historical sites';
  } else if (temp >= 30) {
    condition = lang === 'ar' ? 'حر ومشمس' : 'Hot & sunny';
    icon = '☀️';
    recommendation = lang === 'ar'
      ? 'الجو حر، خذ معك ماء وواقي شمس ☀️'
      : "It's hot — bring water and sunscreen ☀️";
  } else if (temp >= 20) {
    condition = lang === 'ar' ? 'معتدل' : 'Mild';
    icon = '🌤️';
    recommendation = lang === 'ar'
      ? 'الجو معتدل ورائع للزيارة والتنزه 🍃'
      : 'Mild and pleasant for visiting and walking around 🍃';
  } else {
    condition = lang === 'ar' ? 'بارد' : 'Cold';
    icon = '❄️';
    recommendation = lang === 'ar'
      ? 'الجو بارد شوي، خذ معك ملابس دافية'
      : "It's a bit cold — bring warm clothes";
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

function ProfilePanel({ user, userPlaces, favoriteKeys, placePhotos, userLocation, gender, onGenderChange, points, ratedPlaceKeys, tripsBuilt, addedPlaceKeys, onClose, lang }) {
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
    <span>{lang === 'ar' ? 'اختر صورة حسابك:' : 'Choose your avatar:'}</span>

    <button onClick={() => onGenderChange('female')}>
      {lang === 'ar' ? '👩 بنت' : '👩 Female'}
    </button>

    <button onClick={() => onGenderChange('male')}>
      {lang === 'ar' ? '👨 شاب' : '👨 Male'}
    </button>
  </div>
)}

      <div style={{ background: '#faf6ec', borderRadius: 12, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.4rem' }}>{getLevelInfo(points, lang).icon}</span>
        <div style={{ textAlign: 'center' }}>
          <strong>{getLevelInfo(points, lang).label}</strong>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>{points} {lang === 'ar' ? 'نقطة' : 'points'}</p>
        </div>
      </div>

      {(() => {
        const badges = getBadges(ratedPlaceKeys, tripsBuilt, addedPlaceKeys, lang);
        return badges.length > 0 ? (
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{lang === 'ar' ? '🏆 الأوسمة' : '🏆 Badges'}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {badges.map((b, i) => (
                <div key={i} title={b.desc} style={{ background: 'linear-gradient(135deg, #C4952A, #8B6914)', color: '#fff', borderRadius: 12, padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      <WeatherCard latitude={userLocation?.lat} longitude={userLocation?.lng} lang={lang} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', marginTop: 14 }}>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>📍 {myPlaces.length}</strong> {lang === 'ar' ? 'مناطق أضفتها' : 'places you added'}
        </div>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>❤️ {favoritePlacesList.length}</strong> {lang === 'ar' ? 'أماكن مفضلة' : 'favorite places'}
        </div>
        <div style={{ background: '#faf6ec', borderRadius: 10, padding: '10px 16px' }}>
          <strong>📸 {myPhotos.length}</strong> {lang === 'ar' ? 'صور رفعتها' : 'photos uploaded'}
        </div>
      </div>

      <h3>{lang === 'ar' ? '❤️ الأماكن المفضلة' : '❤️ Favorite Places'}</h3>
      {favoritePlacesList.length === 0 ? (
        <p style={{ color: '#999' }}>{lang === 'ar' ? 'ما ضفت أي مكان للمفضلة بعد. اضغط القلب ❤️ على أي بطاقة منطقة!' : "You haven't added any favorites yet. Tap the ❤️ on any place card!"}</p>
      ) : (
        <ul style={{ paddingRight: 20 }}>
          {favoritePlacesList.map(p => <li key={p.name}>{p.name}</li>)}
        </ul>
      )}

      <h3>{lang === 'ar' ? '📸 الصور التي رفعتها' : '📸 Photos You Uploaded'}</h3>
      {myPhotos.length === 0 ? (
        <p style={{ color: '#999' }}>{lang === 'ar' ? 'لسا ما رفعت أي صورة. ارفع صورة من أي بطاقة منطقة!' : "You haven't uploaded any photos yet. Upload one from any place card!"}</p>
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
          <h3>{lang === 'ar' ? '📍 مناطق أضفتها' : '📍 Places You Added'}</h3>
          <ul style={{ paddingRight: 20 }}>
            {myPlaces.map((p, i) => (
              <li key={i}>
                {p.name}
                {p.status === 'pending' && (
                  <span style={{ color: '#c98a1c', fontSize: '0.75rem', marginInlineStart: 8 }}>
                    {lang === 'ar' ? '⏳ بانتظار المراجعة' : '⏳ Pending review'}
                  </span>
                )}
                {p.status === 'rejected' && (
                  <span style={{ color: '#c0392b', fontSize: '0.75rem', marginInlineStart: 8 }}>
                    {lang === 'ar' ? '❌ ما تمت الموافقة عليها' : '❌ Not approved'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function AdminPanel({ onClose, lang = 'ar' }) {
  const [tab, setTab] = useState('places');
  const [pendingPlaces, setPendingPlaces] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    try {
      const placesSnap = await getDocs(collection(db, 'userPlaces'));
      const allPlaces = placesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingPlaces(allPlaces.filter((p) => p.status === 'pending'));

      const photosSnap = await getDocs(collection(db, 'photos'));
      const photoRows = [];
      photosSnap.docs.forEach((d) => {
        const items = d.data().items || [];
        items.forEach((item) => {
          if (item.status === 'pending') {
            photoRows.push({ placeKey: d.id, photo: item });
          }
        });
      });
      setPendingPhotos(photoRows);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const approvePlace = async (place) => {
    try {
      await setDoc(doc(db, 'userPlaces', place.id), { status: 'approved' }, { merge: true });
      setPendingPlaces((prev) => prev.filter((p) => p.id !== place.id));
      createNotification({ toUid: place.addedByUid, type: 'place_approved', placeName: place.name });
      showToast(lang === 'ar' ? '✅ تمت الموافقة على المنطقة' : '✅ Place approved', 'success');
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ، جرب مرة ثانية' : 'Something went wrong, try again');
    }
  };

  const rejectPlace = async (place) => {
    try {
      await setDoc(doc(db, 'userPlaces', place.id), { status: 'rejected' }, { merge: true });
      setPendingPlaces((prev) => prev.filter((p) => p.id !== place.id));
      createNotification({ toUid: place.addedByUid, type: 'place_rejected', placeName: place.name });
      showToast(lang === 'ar' ? 'تم رفض المنطقة' : 'Place rejected', 'success');
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ، جرب مرة ثانية' : 'Something went wrong, try again');
    }
  };

  const updatePhotoStatus = async (row, action) => {
    try {
      const ref = doc(db, 'photos', row.placeKey);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const items = snap.data().items || [];
      let updatedItems;
      if (action === 'approve') {
        updatedItems = items.map((it) =>
          it.uploadedAt === row.photo.uploadedAt && it.uploadedByUid === row.photo.uploadedByUid
            ? { ...it, status: 'approved' }
            : it
        );
      } else {
        updatedItems = items.filter(
          (it) => !(it.uploadedAt === row.photo.uploadedAt && it.uploadedByUid === row.photo.uploadedByUid)
        );
      }
      await setDoc(ref, { items: updatedItems }, { merge: false });
      createNotification({ toUid: row.photo.uploadedByUid, type: action === 'approve' ? 'photo_approved' : 'photo_rejected', placeName: getPlaceDisplayName(row.placeKey) });
      setPendingPhotos((prev) => prev.filter((r) => !(r.placeKey === row.placeKey && r.photo.uploadedAt === row.photo.uploadedAt)));
      showToast(action === 'approve' ? (lang === 'ar' ? '✅ تمت الموافقة على الصورة' : '✅ Photo approved') : (lang === 'ar' ? 'تم رفض الصورة' : 'Photo rejected'), 'success');
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ، جرب مرة ثانية' : 'Something went wrong, try again');
    }
  };

  const getPlaceDisplayName = (key) => (places[key] ? (lang === 'ar' ? places[key].name : places[key].nameEn) : key);

  return (
    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', maxWidth: 620, margin: '15px auto', padding: 20, textAlign: lang === 'ar' ? 'right' : 'left', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
      <h2 style={{ color: '#8B6914', marginBottom: 12 }}>{lang === 'ar' ? '🛡️ لوحة الإدارة' : '🛡️ Admin Panel'}</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab('places')}
          style={{ background: tab === 'places' ? '#8B6914' : '#faf6ec', color: tab === 'places' ? '#fff' : '#8B6914', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', border: '1px solid #e8d5a3' }}
        >
          {lang === 'ar' ? `📍 مناطق (${pendingPlaces.length})` : `📍 Places (${pendingPlaces.length})`}
        </button>
        <button
          onClick={() => setTab('photos')}
          style={{ background: tab === 'photos' ? '#8B6914' : '#faf6ec', color: tab === 'photos' ? '#fff' : '#8B6914', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', border: '1px solid #e8d5a3' }}
        >
          {lang === 'ar' ? `📸 صور (${pendingPhotos.length})` : `📸 Photos (${pendingPhotos.length})`}
        </button>
      </div>

      {loading ? (
        <div className="rl-skeleton-group">
          <div className="rl-skeleton-line" style={{ width: '60%' }} />
          <div className="rl-skeleton-line" style={{ width: '40%' }} />
        </div>
      ) : tab === 'places' ? (
        pendingPlaces.length === 0 ? (
          <p style={{ color: '#999' }}>{lang === 'ar' ? 'ما في مناطق بانتظار المراجعة حالياً ✨' : 'No places pending review right now ✨'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingPlaces.map((p) => (
              <div key={p.id} style={{ display: 'flex', gap: 12, background: '#faf6ec', borderRadius: 12, padding: 12, alignItems: 'flex-start' }}>
                <img src={p.img} alt={p.name} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#5a3e1b' }}>{p.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>{p.desc}</p>
                  <p style={{ fontSize: '0.75rem', color: '#999', margin: 0 }}>
                    {lang === 'ar' ? `أضافها: ${p.addedBy}` : `Added by: ${p.addedBy}`}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => approvePlace(p)} style={{ background: '#4f7a45', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem' }}>
                      {lang === 'ar' ? '✅ موافقة' : '✅ Approve'}
                    </button>
                    <button onClick={() => rejectPlace(p)} style={{ background: '#c0392b', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem' }}>
                      {lang === 'ar' ? '❌ رفض' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : pendingPhotos.length === 0 ? (
        <p style={{ color: '#999' }}>{lang === 'ar' ? 'ما في صور بانتظار المراجعة حالياً ✨' : 'No photos pending review right now ✨'}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingPhotos.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, background: '#faf6ec', borderRadius: 12, padding: 12, alignItems: 'flex-start' }}>
              <img src={row.photo.url} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#5a3e1b' }}>{getPlaceDisplayName(row.placeKey)}</strong>
                <p style={{ fontSize: '0.75rem', color: '#999', margin: '4px 0' }}>
                  {lang === 'ar' ? `رفعها: ${row.photo.uploadedBy || 'زائر'}` : `Uploaded by: ${row.photo.uploadedBy || 'Visitor'}`}
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={() => updatePhotoStatus(row, 'approve')} style={{ background: '#4f7a45', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem' }}>
                    {lang === 'ar' ? '✅ موافقة' : '✅ Approve'}
                  </button>
                  <button onClick={() => updatePhotoStatus(row, 'reject')} style={{ background: '#c0392b', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem' }}>
                    {lang === 'ar' ? '❌ رفض' : '❌ Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Leaderboard({ onClose, lang = 'ar' }) {
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
      <h2 style={{ color: '#8B6914', marginBottom: 16 }}>{lang === 'ar' ? '🏆 أفضل الرحالة' : '🏆 Top Explorers'}</h2>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf6ec', borderRadius: 12, padding: '10px 14px' }}>
              <div className="rl-skeleton-line" style={{ width: 30, height: 30, borderRadius: '50%', marginBottom: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="rl-skeleton-line" style={{ width: '50%', marginBottom: 6 }} />
                <div className="rl-skeleton-line" style={{ width: '30%', height: 8, marginBottom: 0 }} />
              </div>
            </div>
          ))}
        </div>
      ) : topUsers.length === 0 ? (
        <p style={{ color: '#999' }}>{lang === 'ar' ? 'لسا ما في نقاط مسجلة' : 'No points recorded yet'}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf6ec', borderRadius: 12, padding: '10px 14px' }}>
              <strong style={{ width: 22 }}>{i + 1}</strong>
              <Avatar user={u} size={40} gender={u.gender} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{u.name || (lang === 'ar' ? 'مستخدم' : 'User')}</div>
                <div style={{ fontSize: '0.8rem', color: '#777' }}>{getLevelInfo(u.points || 0, lang).icon} {getLevelInfo(u.points || 0, lang).label}</div>
                {getBadges(u.ratedPlaceKeys, u.tripsBuilt, u.addedPlaceKeys, lang).length > 0 && (
                  <div style={{ marginTop: 3 }}>
                    {getBadges(u.ratedPlaceKeys, u.tripsBuilt, u.addedPlaceKeys, lang).map((b, bi) => (
                      <span key={bi} title={b.label} style={{ fontSize: '0.95rem', marginInlineEnd: 4 }}>{b.icon}</span>
                    ))}
                  </div>
                )}
              </div>
              <strong style={{ color: '#8B6914' }}>{u.points || 0}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function TripPlanner({ onClose, onOpenMap, userPlaces, lang = 'ar' }) {
  const [season, setSeasonSel] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [time, setTime] = useState(null);
  const [budget, setBudget] = useState(null);
  const [result, setResult] = useState(null);

  const seasonOptions = lang === 'ar' ? [
    { key: 'summer', label: '☀️ صيف' },
    { key: 'winter', label: '❄️ شتاء' },
    { key: 'spring', label: '🌸 ربيع' },
  ] : [
    { key: 'summer', label: '☀️ Summer' },
    { key: 'winter', label: '❄️ Winter' },
    { key: 'spring', label: '🌸 Spring' },
  ];
  const companionOptions = lang === 'ar' ? [
    { key: 'alone', label: '🚶 لحالي' },
    { key: 'family', label: '👨‍👩‍👧 عائلة' },
    { key: 'friends', label: '👥 أصحاب' },
    { key: 'kids', label: '🧒 مع أطفال' },
  ] : [
    { key: 'alone', label: '🚶 Solo' },
    { key: 'family', label: '👨‍👩‍👧 Family' },
    { key: 'friends', label: '👥 Friends' },
    { key: 'kids', label: '🧒 With kids' },
  ];
  const timeOptions = lang === 'ar' ? [
    { key: '2h', label: '⏱️ ساعتين' },
    { key: 'half', label: '🕐 نص يوم' },
    { key: 'full', label: '🕘 يوم كامل' },
  ] : [
    { key: '2h', label: '⏱️ 2 hours' },
    { key: 'half', label: '🕐 Half a day' },
    { key: 'full', label: '🕘 Full day' },
  ];
  const budgetOptions = lang === 'ar' ? [
    { key: 'free', label: '🆓 مجاني' },
    { key: 'under20', label: '💵 أقل من 20 دينار' },
    { key: 'open', label: '💰 ميزانية مفتوحة' },
  ] : [
    { key: 'free', label: '🆓 Free' },
    { key: 'under20', label: '💵 Under 20 JOD' },
    { key: 'open', label: '💰 Open budget' },
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
      showToast(lang === 'ar' ? 'لازم تختاري كل الخيارات الأربعة الأول 🙏' : 'Please choose all four options first 🙏');
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
      // نبني قائمة أسباب مع نقاطها الفعلية (مش نص عام بس) — كل سبب
      // موضح جنبه قديش ساهم بالنقطة الكلية، عشان يكون النظام شفاف
      const reasons = [];
      if (lang === 'ar') {
        if (best.place.season === season) reasons.push({ text: 'بيناسب الموسم يلي اخترتيه', points: 3 });
        if (meta.companions && meta.companions.includes(companion)) reasons.push({ text: 'مناسب لنوع الرفقة يلي حددتيها', points: 2 });
        if (meta.budget === 'free') reasons.push({ text: 'دخول مجاني بالكامل', points: budget === 'open' ? 1 : 2 });
        else if (meta.budget === 'under20' && budget !== 'open') reasons.push({ text: 'يناسب ميزانيتك', points: 2 });
        else if (budget === 'open') reasons.push({ text: 'يناسب ميزانيتك المفتوحة', points: 1 });
        if (meta.duration) reasons.push({ text: `بياخذ تقريباً ${durationLabel(meta.duration, lang)}، وهاد بيناسب الوقت يلي عندك`, points: 2 });
        if (best.place.addedBy) reasons.push({ text: `مكان اكتشفه زائر تاني (${best.place.addedBy}) وضافه للتطبيق 🌟`, points: 0 });
      } else {
        if (best.place.season === season) reasons.push({ text: 'Matches the season you picked', points: 3 });
        if (meta.companions && meta.companions.includes(companion)) reasons.push({ text: 'A good fit for your travel companions', points: 2 });
        if (meta.budget === 'free') reasons.push({ text: 'Completely free entry', points: budget === 'open' ? 1 : 2 });
        else if (meta.budget === 'under20' && budget !== 'open') reasons.push({ text: 'Fits your budget', points: 2 });
        else if (budget === 'open') reasons.push({ text: 'Fits your open budget', points: 1 });
        if (meta.duration) reasons.push({ text: `Takes about ${durationLabel(meta.duration, lang)}, which suits the time you have`, points: 2 });
        if (best.place.addedBy) reasons.push({ text: `A place discovered by another visitor (${best.place.addedBy}) 🌟`, points: 0 });
      }
      const compatibilityPercent = getCompatibilityPercent(bestScore);
      setResult({ ...best, reasons, duration: meta.duration, compatibilityPercent, rawScore: bestScore });
      if (auth.currentUser) {
        setDoc(doc(db, 'userProfiles', auth.currentUser.uid), { tripsBuilt: increment(1) }, { merge: true }).catch(() => {});
      }
    }
  };

  const resetPlanner = () => {
    setSeasonSel(null);
    setCompanion(null);
    setTime(null);
    setBudget(null);
    setResult(null);
  };

  const resultName = result ? (result.place.addedBy ? result.place.name : (lang === 'ar' ? result.place.name : (result.place.nameEn || result.place.name))) : '';
  const resultDesc = result ? (result.place.addedBy ? result.place.desc : (lang === 'ar' ? result.place.desc : (result.place.descEn || result.place.desc))) : '';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto', textAlign: lang === 'ar' ? 'right' : 'left', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

        {!result ? (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>{lang === 'ar' ? '🗺️ خطط رحلتك' : '🗺️ Plan Your Trip'}</h2>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 18 }}>
              {lang === 'ar' ? 'جاوبي على 4 أسئلة بسيطة ورح نقترحلك أفضل مكان' : "Answer 4 quick questions and we'll suggest the best place for you"}
            </p>

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>{lang === 'ar' ? '🗓️ أي موسم؟' : '🗓️ Which season?'}</h4>
            <OptionRow options={seasonOptions} value={season} onSelect={setSeasonSel} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>{lang === 'ar' ? '👥 مع مين رايح؟' : '👥 Who are you going with?'}</h4>
            <OptionRow options={companionOptions} value={companion} onSelect={setCompanion} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>{lang === 'ar' ? '⏱️ قديش عندك وقت؟' : '⏱️ How much time do you have?'}</h4>
            <OptionRow options={timeOptions} value={time} onSelect={setTime} />

            <h4 style={{ color: '#5a3e1b', marginBottom: 8 }}>{lang === 'ar' ? '💰 الميزانية؟' : '💰 What\'s your budget?'}</h4>
            <OptionRow options={budgetOptions} value={budget} onSelect={setBudget} />

            <button
              onClick={generateTrip}
              style={{ background: 'linear-gradient(135deg, #C4952A, #8B6914)', color: '#fff', width: '100%', padding: 12, borderRadius: 14, fontSize: '1rem', marginTop: 6 }}
            >
              {lang === 'ar' ? '✨ اقترح رحلتي' : '✨ Suggest My Trip'}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 14 }}>{lang === 'ar' ? '🎉 خططنالك رحلة!' : '🎉 Your trip is ready!'}</h2>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid #f0e0b0' }}>
              <div style={{ position: 'relative' }}>
                <img src={result.place.img} alt={resultName} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                {typeof result.compatibilityPercent === 'number' && (
                  <div
                    title={lang === 'ar' ? `نقاط التوافق الخام: ${result.rawScore} من ${MAX_TRIP_SCORE}` : `Raw score: ${result.rawScore} out of ${MAX_TRIP_SCORE}`}
                    style={{
                      position: 'absolute', top: 12, insetInlineEnd: 12,
                      background: 'rgba(0,0,0,0.68)', color: '#fff', borderRadius: 999,
                      padding: '6px 14px', fontSize: '0.9rem', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span>🎯</span>
                    <span>{lang === 'ar' ? `توافق ${result.compatibilityPercent}%` : `${result.compatibilityPercent}% match`}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ color: '#8B6914', marginBottom: 6 }}>{resultName}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 10 }}>{resultDesc}</p>
                <div style={{ background: '#faf6ec', borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#8B6914' }}>{lang === 'ar' ? 'ليش اخترنالك هاد المكان؟' : 'Why we picked this place for you'}</strong>
                  <ul style={{ margin: '6px 0 0', paddingRight: lang === 'ar' ? 18 : 0, paddingLeft: lang === 'ar' ? 0 : 18, fontSize: '0.8rem', color: '#555', listStyle: 'none' }}>
                    {result.reasons.map((r, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '3px 0' }}>
                        <span>✓ {r.text}</span>
                        {r.points > 0 && (
                          <span style={{ color: '#4f7a45', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+{r.points}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                {result.duration && (
                  <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: 12 }}>
                    {lang === 'ar' ? `⏱️ مدة الزيارة المتوقعة: ${durationLabel(result.duration, lang)}` : `⏱️ Expected visit duration: ${durationLabel(result.duration, lang)}`}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { onOpenMap(result.place); onClose(); }}
                    style={{ flex: 1, background: '#5a3e1b', color: '#fff', padding: 10, borderRadius: 10 }}
                  >
                    {lang === 'ar' ? '📍 افتح على الخريطة' : '📍 Open on Map'}
                  </button>
                  <button
                    onClick={resetPlanner}
                    style={{ flex: 1, background: '#faf6ec', color: '#8B6914', padding: 10, borderRadius: 10, border: '1px solid #e8d5a3' }}
                  >
                    {lang === 'ar' ? '🔄 جرب رحلة تانية' : '🔄 Try Another Trip'}
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

function AITripBuilder({ onClose, userPlaces, lang = 'ar' }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);
  // null = بدون اختيار صريح (النظام بيجرب يفهمها من النص، وإلا افتراضي 8 الصبح)
  const [startHour, setStartHour] = useState(null);
  const startHourOptions = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  const handleGenerate = () => {
    if (!prompt.trim() || prompt.trim().length < 5) {
      setError(lang === 'ar' ? 'اكتب وصف واضح لرحلتك (مثلاً: معي 3 أيام وبدي أطلع عالعقبة)' : 'Write a clear description of your trip (e.g., "I have 3 days and want to visit Aqaba")');
      return;
    }

    setError(null);
    setLoading(true);
    setTrip(null);

    setTimeout(() => {
      try {
        const result = buildLocalTripPlan(prompt.trim(), userPlaces, lang, startHour);
        setTrip(result);
        if (auth.currentUser) {
          setDoc(doc(db, 'userProfiles', auth.currentUser.uid), { tripsBuilt: increment(1) }, { merge: true }).catch(() => {});
        }
      } catch (err) {
        setError(lang === 'ar' ? 'صار خطأ أثناء بناء الرحلة، جرب مرة ثانية 🙏' : 'Something went wrong while building the trip, please try again 🙏');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const resetBuilder = () => {
    setTrip(null);
    setError(null);
    setPrompt('');
    setStartHour(null);
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
        style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', textAlign: lang === 'ar' ? 'right' : 'left', position: 'relative', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, left: 12, border: 'none', background: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>

        {!trip ? (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>{lang === 'ar' ? '🤖 ابنيلي رحلة بالـ AI' : '🤖 Build My Trip with AI'}</h2>
            <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: 18 }}>
              {lang === 'ar' ? 'احكيلي عن رحلتك بأي أسلوب، وأنا بجهزلك جدول كامل بالأماكن والفطور والغدا والميزانية' : "Tell me about your trip in your own words, and I'll prepare a full schedule with places, breakfast, lunch, and budget"}
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: معي 3 أيام وبدي أطلع عالعقبة، بحب الأكل البحري والسباحة' : 'Example: I have 3 days and want to visit Aqaba, I love seafood and swimming'}
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

            <label style={{ display: 'block', fontSize: '0.85rem', color: '#5a3e1b', marginBottom: 6 }}>
              {lang === 'ar' ? '🕐 الساعة يلي بدك تبلشي فيها يومك (اختياري)' : '🕐 What time do you want to start your day (optional)'}
            </label>
            <select
              value={startHour === null ? '' : startHour}
              onChange={(e) => setStartHour(e.target.value === '' ? null : parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                border: '1.5px solid #e8d5a3',
                borderRadius: 12,
                padding: 10,
                fontSize: '0.9rem',
                marginBottom: 12,
                background: '#faf6ec',
                color: '#3E2A14',
              }}
            >
              <option value="">{lang === 'ar' ? 'افتراضي (8 الصبح، أو حسب ما تكتبيه بالنص)' : 'Default (8 AM, or as written in the text)'}</option>
              {startHourOptions.map((h) => (
                <option key={h} value={h}>{formatHour(h, lang)}</option>
              ))}
            </select>

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
              {loading ? (lang === 'ar' ? '⏳ جاري بناء رحلتك...' : '⏳ Building your trip...') : (lang === 'ar' ? '✨ ابنِ الرحلة' : '✨ Build the Trip')}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#8B6914', marginBottom: 4 }}>🤖 {trip.title}</h2>
            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: trip.didNotUnderstand ? 10 : 16 }}>
              {lang === 'ar' ? `رحلة ${trip.totalDays} يوم مبنية خصيصاً إلك` : `A ${trip.totalDays}-day trip built just for you`}
            </p>

            {trip.didNotUnderstand && trip.clarificationNote && (
              <div style={{ background: '#fff4e0', border: '1px solid #f0cf8f', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#8B6914', lineHeight: 1.6 }}>{trip.clarificationNote}</p>
              </div>
            )}

            {trip.days?.map((day, i) => (
              <div key={i} style={{ background: '#faf6ec', borderRadius: 14, padding: 16, marginBottom: 12, border: '1px solid #e8d5a3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h4 style={{ color: '#8B6914', margin: 0 }}>{lang === 'ar' ? `اليوم ${day.dayNumber}: ${day.title}` : `Day ${day.dayNumber}: ${day.title}`}</h4>
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
                <strong style={{ fontSize: '0.85rem', color: '#8B6914' }}>{lang === 'ar' ? '💡 نصائح لرحلتك' : '💡 Tips for your trip'}</strong>
                <ul style={{ margin: '8px 0 0', paddingRight: lang === 'ar' ? 18 : 0, paddingLeft: lang === 'ar' ? 0 : 18, fontSize: '0.8rem', color: '#555' }}>
                  {trip.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}

            <button
              onClick={resetBuilder}
              style={{ width: '100%', background: '#faf6ec', color: '#8B6914', padding: 10, borderRadius: 10, border: '1px solid #e8d5a3' }}
            >
              {lang === 'ar' ? '🔄 ابنِ رحلة تانية' : '🔄 Build Another Trip'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RahalChatbot({ userLocation, userPlaces, lang = 'ar' }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ from: 'bot', text: lang === 'ar' ? 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟' : 'Hi! 👋 How can I help you today?' }]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setChatMessages(prev => (prev.length === 1 && prev[0].from === 'bot'
      ? [{ from: 'bot', text: lang === 'ar' ? 'مرحباً! 👋 كيف يمكنني مساعدتك اليوم؟' : 'Hi! 👋 How can I help you today?' }]
      : prev));
  }, [lang]);

  const sendChatMessage = async (presetText) => {
    const question = presetText || chatInput;
    if (!question.trim() || loading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { from: 'user', text: question }]);
    setLoading(true);
    const replyText = await getRahalResponse(question, userLocation, userPlaces, lang);
    setChatMessages(prev => [...prev, { from: 'bot', text: replyText }]);
    setLoading(false);
  };

  // لما زائر يدوس على "خلي رحال يحكيلك القصة" بأي بطاقة منطقة،
  // منفتح شات رحال تلقائياً ومنسأله السؤال مباشرة
  useEffect(() => {
    const handler = (e) => {
      setChatOpen(true);
      sendChatMessage(e.detail.question);
    };
    window.addEventListener('rl-ask-rahal', handler);
    return () => window.removeEventListener('rl-ask-rahal', handler);
  }, [lang, userLocation, userPlaces]);

  const suggestedPrompts = lang === 'ar' ? [
    'اقترح لي رحلة يومين بالشمال',
    'أماكن مناسبة للعائلة',
    'وين أروح بالشتاء؟',
  ] : [
    'Suggest a 2-day trip in the north',
    'Places good for families',
    'Where should I go in winter?',
  ];

  return (
    <div style={{ position: 'fixed', bottom: 20, insetInlineEnd: 20, zIndex: 1000, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {chatOpen && (
        <div style={{ width: 'min(380px, 90vw)', height: 'min(560px, 75vh)', background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ background: '#b8860b', color: '#fff', padding: '14px 16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!avatarError && (
                <img src="/rahal.png" alt="Rahhal" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center', border: '2px solid #fff' }} onError={() => setAvatarError(true)} />
              )}
              {lang === 'ar' ? 'رحال' : 'Rahhal'}
            </span>
            <span style={{ cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => setChatOpen(false)}>✕</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#faf6ec' }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ textAlign: m.from === 'bot' ? (lang === 'ar' ? 'right' : 'left') : (lang === 'ar' ? 'left' : 'right'), margin: '10px 0' }}>
                <span style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: m.from === 'bot' ? '#f1e2b3' : '#e0e0e0', fontSize: '0.9rem', whiteSpace: 'pre-line', maxWidth: '85%' }}>{m.text}</span>
              </div>
            ))}
            {chatMessages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {suggestedPrompts.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => sendChatMessage(sp)}
                    style={{ background: '#fff', border: '1px solid #e8d5a3', color: '#8B6914', borderRadius: 14, padding: '8px 12px', fontSize: '0.82rem', textAlign: lang === 'ar' ? 'right' : 'left', cursor: 'pointer', margin: 0 }}
                  >
                    💡 {sp}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <div style={{ textAlign: lang === 'ar' ? 'right' : 'left', margin: '10px 0' }}>
                <span style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: '#f1e2b3', fontSize: '0.9rem' }}>
                  {lang === 'ar' ? '⏳ جاري التفكير...' : '⏳ Thinking...'}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
              placeholder={lang === 'ar' ? 'اسأل رحال...' : 'Ask Rahhal...'}
              style={{ flex: 1, border: 'none', padding: 12, fontSize: '0.9rem', outline: 'none' }}
            />
            <button onClick={() => sendChatMessage()} style={{ border: 'none', background: '#b8860b', color: '#fff', padding: '0 18px', cursor: 'pointer', fontSize: '1.1rem' }}>➤</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{ width: 66, height: 66, borderRadius: '50%', background: avatarError ? '#b8860b' : 'transparent', border: '3px solid #b8860b', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.35)', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#fff' }}
        aria-label={lang === 'ar' ? 'رحال' : 'Rahhal'}
      >
        {avatarError ? '🧭' : (
          <img src="/rahal.png" alt="Rahhal" width="66" height="66" style={{ display: 'block', width: '66px', height: '66px', objectFit: 'cover', objectPosition: 'top center', borderRadius: '50%' }} onError={() => setAvatarError(true)} />
        )}
      </button>
    </div>
  );
}
function App() {
  const [season, setSeason] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [openPlace, setOpenPlace] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [services, setServices] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [servicesFetchFailed, setServicesFetchFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [mapServices, setMapServices] = useState([]);
  const [user, setUser] = useState(null);
  const [placePhotos, setPlacePhotos] = useState({});
  const [lang, setLang] = useState('ar');
  const [lightboxData, setLightboxData] = useState(null);
  const [showLightboxComments, setShowLightboxComments] = useState(false);
  const [lightboxCommentDraft, setLightboxCommentDraft] = useState('');
  const [galleryModalData, setGalleryModalData] = useState(null);
  const [userPlaces, setUserPlaces] = useState([]);
  const [favoriteKeys, setFavoriteKeys] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [gender, setGender] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [points, setPoints] = useState(0);
  const [userRatedPlaces, setUserRatedPlaces] = useState([]);
  const [userTripsBuilt, setUserTripsBuilt] = useState(0);
  const [userAddedPlaces, setUserAddedPlaces] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFavoritesPage, setShowFavoritesPage] = useState(false);
  const [showTripPlanner, setShowTripPlanner] = useState(false);
  const [showAiTripBuilder, setShowAiTripBuilder] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  // نعرض آخر أرقام محفوظة بالمتصفح فوراً (بدل ما تبين صفر لثانية)، وبعدين
  // منحدثها بهدوء بالخلفية أول ما توصل البيانات الفعلية من Firestore
  const [siteStats, setSiteStats] = useState(() => {
    try {
      const cached = localStorage.getItem('rl_site_stats_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return { places: Object.keys(places).length, users: 0, ratings: 0 };
  });

  const t = translations[lang];

  // كل ما تتحدث الإحصائيات، منخزّن آخر نسخة بالمتصفح — هيك الفتحة الجاية
  // بتبدأ من آخر رقم صحيح بدل ما تبين صفر لحد ما يوصل الرد من Firestore
  useEffect(() => {
    try {
      localStorage.setItem('rl_site_stats_cache', JSON.stringify(siteStats));
    } catch (e) {}
  }, [siteStats]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    checkRedirectResult().catch((err) => {
      showToast(`⚠️ ${err.code || err.message || 'خطأ أثناء تسجيل الدخول'}`);
    });

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
        const totalRatings = Object.values(newRatings).reduce((sum, r) => sum + (r.count || 0), 0);
        setSiteStats(prev => ({ ...prev, ratings: totalRatings }));
      } catch (e) {}
    };
    const loadSiteUserCount = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userProfiles'));
        setSiteStats(prev => ({ ...prev, users: snapshot.size }));
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
        setSiteStats(prev => ({ ...prev, places: Object.keys(places).length + loadedPlaces.length }));

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
    loadSiteUserCount();
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
      setUserRatedPlaces(profileData.ratedPlaceKeys || []);
      setUserTripsBuilt(profileData.tripsBuilt || 0);
      setUserAddedPlaces(profileData.addedPlaceKeys || []);
    } catch (e) {}

  } else {
    setFavoriteKeys([]);
    setGender(null);
    setShowGenderModal(false);
    setPoints(0);
    setUserRatedPlaces([]);
    setUserTripsBuilt(0);
    setUserAddedPlaces([]);
  }
});

return () => unsubscribe();
}, []);

  // لو حدا فتح رابط مشاركة (?place=key أو ?userPlace=id)، منفتحله
  // المنطقة مباشرة على الخريطة بدل ما يوصل للصفحة الرئيسية العامة
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const placeKey = params.get('place');
    const userPlaceId = params.get('userPlace');
    if (!placeKey && !userPlaceId) return;

    let target = null;
    if (placeKey && places[placeKey]) {
      target = places[placeKey];
    } else if (userPlaceId) {
      target = userPlaces.find((p) => p.id === userPlaceId && (p.status === 'approved' || !p.status)) || null;
      if (!target && userPlaces.length === 0) return; // لسا ما وصلت بيانات مناطق الزوار، منستنى تحميلها
    }

    if (target) {
      openMap(target);
      // ننضف الرابط من شريط العنوان عشان لو المستخدم عمل refresh ما يرجع يفتح نفس المكان تلقائياً
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [userPlaces]);

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
      const safeAmount = amount < 0 ? -Math.min(Math.abs(amount), points) : amount;
      await setDoc(doc(db, 'userProfiles', user.uid), { points: increment(safeAmount) }, { merge: true });
      setPoints(prev => Math.max(0, prev + safeAmount));
    } catch (e) {}
  };

  const toggleFavorite = async (key) => {
    if (!user) return showToast(lang === 'ar' ? 'سجل دخول أولاً لإضافة للمفضلة' : 'Please log in first to add favorites');
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
      const photoObj = { url, uploadedBy: user ? user.displayName : null, uploadedByUid: user ? user.uid : null, uploadedAt: new Date().toISOString(), status: 'pending' };
      await setDoc(doc(db, 'photos', placeKey), { items: arrayUnion(photoObj) }, { merge: true });
      setPlacePhotos(prev => ({ ...prev, [placeKey]: [...(prev[placeKey] || []), photoObj] }));
      awardPoints(5);
      createNotification({ toAdmin: true, type: 'photo_pending', placeName: getPlaceNameForKey(placeKey) });
      sendAdminEmailAlert(
        `📸 صورة جديدة بانتظار المراجعة: ${getPlaceNameForKey(placeKey)}`,
        `رفع ${user ? user.displayName : 'زائر'} صورة جديدة بمنطقة "${getPlaceNameForKey(placeKey)}" وبتنتظر موافقتك. افتح لوحة الإدارة بموقع رحلتي للمراجعة.`
      );
      showToast(lang === 'ar' ? '📋 الصورة رح تظهر بعد مراجعة سريعة منّا' : '📋 The photo will appear after a quick review from us', 'success');
    } catch (e) {}
  };

  const handleDeleteUserPlace = async (place) => {
    if (!window.confirm(`متأكد إنك بدك تحذف "${place.name}"؟ الإجراء ما بينرجع، وراح تنخصم منك 20 نقطة يلي أخذتها لما ضفتها.`)) return;
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
      showToast(lang === 'ar' ? 'صار خطأ أثناء الحذف، جرب مرة ثانية' : 'Something went wrong while deleting, please try again');
    }
  };

  const handleDeletePhoto = async (placeKey, photoObj) => {
    if (!placeKey || !photoObj) return;
    if (!window.confirm('متأكد إنك بدك تحذف هالصورة؟ الإجراء ما بينرجع.')) return;
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
      showToast(lang === 'ar' ? 'صار خطأ أثناء حذف الصورة، جرب مرة ثانية' : 'Something went wrong while deleting the photo, please try again');
    }
  };

  const handleToggleLike = async (placeKey, photoObj) => {
    if (!user) return showToast(lang === 'ar' ? 'سجل دخول أولاً عشان تحط لايك' : 'Please log in first to like this');
    try {
      const currentPhotos = placePhotos[placeKey] || [];
      const updatedPhotos = currentPhotos.map((p) => {
        if (p.url === photoObj.url && p.uploadedAt === photoObj.uploadedAt) {
          const likes = p.likes || [];
          const hasLiked = likes.some((l) => (l && l.uid) === user.uid);
          const newLikes = hasLiked
            ? likes.filter((l) => (l && l.uid) !== user.uid)
            : [...likes, { uid: user.uid, likedAt: new Date().toISOString() }];
          if (!hasLiked && p.uploadedByUid && p.uploadedByUid !== user.uid) {
            createNotification({ toUid: p.uploadedByUid, type: 'photo_liked', placeName: getPlaceNameForKey(placeKey) });
          }
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

  const handleAddComment = async (placeKey, photoObj, text) => {
    if (!user) return showToast(lang === 'ar' ? 'سجل دخول أولاً عشان تكتب تعليق' : 'Please log in first to comment');
    if (!text || !text.trim()) return;
    try {
      const currentPhotos = placePhotos[placeKey] || [];
      const newComment = { text: text.trim(), authorName: user.displayName, authorUid: user.uid, createdAt: new Date().toISOString() };
      const updatedPhotos = currentPhotos.map((p) => {
        if (p.url === photoObj.url && p.uploadedAt === photoObj.uploadedAt) {
          const comments = p.comments || [];
          if (p.uploadedByUid && p.uploadedByUid !== user.uid) {
            createNotification({ toUid: p.uploadedByUid, type: 'photo_commented', placeName: getPlaceNameForKey(placeKey) });
          }
          return { ...p, comments: [...comments, newComment] };
        }
        return p;
      });
      await setDoc(doc(db, 'photos', placeKey), { items: updatedPhotos }, { merge: true });
      setPlacePhotos((prev) => ({ ...prev, [placeKey]: updatedPhotos }));
      setLightboxData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
      setGalleryModalData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ أثناء إضافة التعليق' : 'Something went wrong while adding the comment');
    }
  };

  const handleDeleteComment = async (placeKey, photoObj, commentToDelete) => {
    if (!user) return;
    try {
      const currentPhotos = placePhotos[placeKey] || [];
      const updatedPhotos = currentPhotos.map((p) => {
        if (p.url === photoObj.url && p.uploadedAt === photoObj.uploadedAt) {
          const comments = (p.comments || []).filter(
            (c) => !(c.createdAt === commentToDelete.createdAt && c.authorUid === commentToDelete.authorUid)
          );
          return { ...p, comments };
        }
        return p;
      });
      await setDoc(doc(db, 'photos', placeKey), { items: updatedPhotos }, { merge: true });
      setPlacePhotos((prev) => ({ ...prev, [placeKey]: updatedPhotos }));
      setLightboxData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
      setGalleryModalData((prev) => (prev && prev.placeKey === placeKey ? { ...prev, photos: updatedPhotos } : prev));
    } catch (e) {
      showToast(lang === 'ar' ? 'صار خطأ أثناء حذف التعليق' : 'Something went wrong while deleting the comment');
    }
  };

  const toggleDetails = async (key, place) => {
    if (openPlace === key) { setOpenPlace(''); setServices([]); setRestaurants([]); return; }
    setOpenPlace(key);
    setServicesFetchFailed(false);

    const cachedSupport = getCachedServices(getServicesCacheKey('support', place.lat, place.lng));
    const cachedRestaurants = getCachedServices(getServicesCacheKey('restaurants', place.lat, place.lng));
    if (cachedSupport || cachedRestaurants) {
      setServices((cachedSupport || []).slice(0, 10));
      setRestaurants((cachedRestaurants || []).slice(0, 6));
      setLoadingServices(false);
    } else {
      setServices([]);
      setRestaurants([]);
      setLoadingServices(true);
    }

    const [supportResult, restaurantResult] = await Promise.all([
      fetchNearbySupportServices(place.lat, place.lng),
      fetchNearbyRestaurants(place.lat, place.lng),
    ]);
    setOpenPlace((current) => {
      if (current === key) {
        setServices(supportResult.slice(0, 10));
        setRestaurants(restaurantResult.slice(0, 6));
        setLoadingServices(false);
        setServicesFetchFailed(Boolean(supportResult.failed || restaurantResult.failed));
      }
      return current;
    });
  };

  const retryServices = async (key, place) => {
    setLoadingServices(true);
    setServicesFetchFailed(false);
    const [supportResult, restaurantResult] = await Promise.all([
      fetchNearbySupportServices(place.lat, place.lng),
      fetchNearbyRestaurants(place.lat, place.lng),
    ]);
    setOpenPlace((current) => {
      if (current === key) {
        setServices(supportResult.slice(0, 10));
        setRestaurants(restaurantResult.slice(0, 6));
        setLoadingServices(false);
        setServicesFetchFailed(Boolean(supportResult.failed || restaurantResult.failed));
      }
      return current;
    });
  };

  const openMap = async (place) => {
    setSelectedPlace(place);

    const cachedSupport = getCachedServices(getServicesCacheKey('support', place.lat, place.lng));
    const cachedRestaurants = getCachedServices(getServicesCacheKey('restaurants', place.lat, place.lng));
    if (cachedSupport || cachedRestaurants) {
      const combinedCached = [...(cachedSupport || []), ...(cachedRestaurants || [])];
      setMapServices(combinedCached.filter(s => s.lat && s.lon));
    }

    const [supportResult, restaurantResult] = await Promise.all([
      fetchNearbySupportServices(place.lat, place.lng),
      fetchNearbyRestaurants(place.lat, place.lng),
    ]);
    const combined = [...supportResult, ...restaurantResult];
    setMapServices(combined.filter(s => s.lat && s.lon));
  };

  const goHome = () => { setSeason(''); setTypeFilter(''); setOpenPlace(''); setSelectedPlace(null); setServices([]); setRestaurants([]); setSearchQuery(''); setMapServices([]); setShowFavoritesPage(false); };

  // بيبني رابط مباشر لمنطقة معينة (رسمية أو أضافها زائر)، وبيحاول
  // يفتح قائمة المشاركة الجاهزة بالجهاز (واتساب، ماسنجر...) لو
  // مدعومة، وإلا بينسخ الرابط للحافظة كحل احتياطي
  const handleShare = async (key, placeName, placeDesc, isUserPlace) => {
    const base = window.location.origin + window.location.pathname;
    const shareUrl = isUserPlace ? `${base}?userPlace=${encodeURIComponent(key)}` : `${base}?place=${encodeURIComponent(key)}`;
    const shareText = lang === 'ar'
      ? `شوفي هاد المكان الحلو بالأردن: ${placeName} 🗺️\n${placeDesc || ''}`
      : `Check out this beautiful place in Jordan: ${placeName} 🗺️\n${placeDesc || ''}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: placeName, text: shareText, url: shareUrl });
      } catch (e) {} // المستخدم لغى المشاركة، ما في داعي لأي رسالة خطأ
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        showToast(lang === 'ar' ? '🔗 تم نسخ الرابط! شارك مع أصحابك' : '🔗 Link copied! Share it with friends', 'success');
      } catch (e) {
        showToast(lang === 'ar' ? 'تعذر نسخ الرابط' : 'Could not copy the link');
      }
    }
  };
  const openLightbox = (photos, index, placeNameForLightbox, placeKeyForLightbox) => setLightboxData({ photos, index, placeName: placeNameForLightbox, placeKey: placeKeyForLightbox });
  const closeLightbox = () => { setLightboxData(null); setShowLightboxComments(false); setLightboxCommentDraft(''); };
  const lightboxPrev = () => { setShowLightboxComments(false); setLightboxCommentDraft(''); setLightboxData(prev => prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null); };
  const lightboxNext = () => { setShowLightboxComments(false); setLightboxCommentDraft(''); setLightboxData(prev => prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null); };
  const openGalleryModal = (photos, placeNameForGallery, placeKeyForGallery) => setGalleryModalData({ photos, placeName: placeNameForGallery, placeKey: placeKeyForGallery });
  const closeGalleryModal = () => setGalleryModalData(null);
  const openFavoritesPage = () => { setSeason(''); setSelectedPlace(null); setSearchQuery(''); setShowFavoritesPage(true); };

  const renderPlace = (key, place, isUserPlace = false) => {
    const placeName = isUserPlace ? place.name : (lang === 'ar' ? place.name : place.nameEn);
    const placeDesc = isUserPlace ? place.desc : (lang === 'ar' ? place.desc : place.descEn);
    const placeFood = isUserPlace ? place.food : (lang === 'ar' ? place.food : place.foodEn);
    const allPhotosForKey = placePhotos[key] || [];
    const photos = allPhotosForKey.filter((p) => p.status === 'approved' || !p.status || (user && p.uploadedByUid === user.uid));
    const isFav = !isUserPlace && favoriteKeys.includes(key);

    return (
      <div className="place-card" key={key} style={{ position: 'relative', minHeight: 640 }}>
        <div style={{ position: 'absolute', top: 10, insetInlineEnd: 10, zIndex: 5, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            onClick={() => handleShare(key, placeName, placeDesc, isUserPlace)}
            style={{ fontSize: '1.25rem', cursor: 'pointer' }}
            title={lang === 'ar' ? 'شارك' : 'Share'}
          >
            🔗
          </span>
          {!isUserPlace && (
            <span
              onClick={() => toggleFavorite(key)}
              style={{ fontSize: '1.4rem', cursor: 'pointer' }}
              title={isFav ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
            >
              {isFav ? '❤️' : '🤍'}
            </span>
          )}
        </div>
        <h3>{placeName}</h3>
        {isUserPlace && <span className="user-badge">👤 {place.addedBy}</span>}
        {isUserPlace && user && place.addedBy === user.displayName && (
          <button
            onClick={() => handleDeleteUserPlace(place)}
            style={{ background: '#c0392b', color: '#fff', width: 'calc(100% - 30px)', margin: '5px 15px', padding: 8, borderRadius: 10, fontSize: '0.85rem' }}
          >
            🗑️ احذف هالمنطقة
          </button>
        )}
        <img src={place.img} alt={placeName} loading="lazy" />
        {place.lat && userLocation && (
          <p>📍 {t.distance} {getDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)} {t.fromLocation}</p>
        )}
        {place.lat && <WeatherCard latitude={place.lat} longitude={place.lng} placeName={placeName} lang={lang} />}
        <p>{placeDesc}</p>
        {placeFood && <p className="food-line">🍽️ {lang === 'ar' ? 'يشتهر بـ:' : 'Famous for:'} {placeFood}</p>}
        {!isUserPlace && place.priceInfo && (
          <p className="food-line" title={lang === 'ar' ? 'حسب رسوم وزارة السياحة والآثار، قد تتغير — يفضل التأكد محلياً' : 'Based on Ministry of Tourism fees, may change — please verify locally'}>
            🎫 {lang === 'ar' ? place.priceInfo : (place.priceInfoEn || place.priceInfo)}
          </p>
        )}
        {!isUserPlace && CULTURAL_INFO[key] && (
          <>
            <hr style={{ border: 'none', borderTop: '1px dashed #e8d5a3', margin: '12px 0' }} />
            <CulturalInfoBox
              info={CULTURAL_INFO[key]}
              lang={lang}
              placeName={placeName}
              isFav={isFav}
              onToggleFavorite={() => toggleFavorite(key)}
              user={user}
            />
          </>
        )}
        {!isUserPlace && (
          <>
            <hr style={{ border: 'none', borderTop: '1px dashed #e8d5a3', margin: '12px 0' }} />
            <StarRating placeKey={key} ratings={ratings} setRatings={setRatings} user={user} onRated={() => awardPoints(3)} lang={lang} />
            <PlaceReviews placeKey={key} user={user} lang={lang} onReviewed={() => awardPoints(5)} />
          </>
        )}
        {place.lat && <hr style={{ border: 'none', borderTop: '1px dashed #e8d5a3', margin: '12px 0' }} />}
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
                {loadingServices ? (
                  <div className="rl-skeleton-group">
                    <div className="rl-skeleton-line" style={{ width: '40%', height: 14, marginBottom: 10 }} />
                    <div className="rl-skeleton-line" style={{ width: '85%' }} />
                    <div className="rl-skeleton-line" style={{ width: '70%' }} />
                    <div className="rl-skeleton-line" style={{ width: '40%', height: 14, margin: '14px 0 10px' }} />
                    <div className="rl-skeleton-line" style={{ width: '90%' }} />
                    <div className="rl-skeleton-line" style={{ width: '60%' }} />
                  </div>
                ) : servicesFetchFailed ? (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ color: '#c0392b', marginBottom: 8 }}>
                      {lang === 'ar' ? '⚠️ تعذر الاتصال بالخدمة مؤقتاً — مش معناها إنه ما في خدمات، بس السيرفر مشغول هلق' : '⚠️ Temporarily unable to connect — this doesn\'t mean there are no services, the server is just busy right now'}
                    </p>
                    <button
                      onClick={() => retryServices(key, place)}
                      style={{ background: '#faf6ec', color: '#8B6914', padding: '8px 18px', borderRadius: 10, border: '1px solid #e8d5a3', fontSize: '0.85rem' }}
                    >
                      {lang === 'ar' ? '🔄 حاول مرة ثانية' : '🔄 Try Again'}
                    </button>
                  </div>
                ) : (
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
                <div key={i} style={{ position: 'relative' }}>
                  <img src={photoObj.url} alt={placeName} className="user-photo" onClick={() => openGalleryModal(photos, placeName, key)} />
                  {photoObj.status === 'pending' && (
                    <span style={{ position: 'absolute', bottom: 4, insetInlineStart: 4, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 6 }}>
                      {lang === 'ar' ? '⏳ قيد المراجعة' : '⏳ Pending'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => openGalleryModal(photos, placeName, key)}
              style={{ marginTop: 8, background: '#faf6ec', color: '#8B6914', border: '1px solid #e8d5a3', padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem', width: 'calc(100% - 0px)' }}
            >
              🖼️ افتح معرض الصور{photos.length > 3 ? ` (+${photos.length - 3})` : ''}
            </button>
          </div>
        )}
        {user && <ImageUpload placeKey={key} onUpload={handlePhotoUpload} lang={lang} />}
        {!user && <p className="login-hint">{t.loginHint}</p>}
      </div>
    );
  };

  const isApprovedOrLegacy = (p) => p.status === 'approved' || !p.status;
  // نمرر بس المناطق الموافق عليها لأنظمة التوصية (خطط رحلتي، بناء
  // رحلة بالـ AI، رحال) — عشان منطقة لسا قيد المراجعة أو مرفوضة
  // ما توصي فيها الأنظمة لزوار تانيين قبل ما الإدارة توافق عليها
  const approvedUserPlaces = userPlaces.filter(isApprovedOrLegacy);
  const userSummerPlaces = userPlaces.filter(p => p.season === 'summer' && isApprovedOrLegacy(p));
  const userWinterPlaces = userPlaces.filter(p => p.season === 'winter' && isApprovedOrLegacy(p));
  const userSpringPlaces = userPlaces.filter(p => p.season === 'spring' && isApprovedOrLegacy(p));

  const getPlaceNameForKey = (pKey) => {
    if (places[pKey]) return places[pKey].name;
    const up = userPlaces.find(p => p.id === pKey);
    return up ? up.name : pKey;
  };
  const weekStart = getWeekStart();
  let weeklyTopPhoto = null;
  Object.entries(placePhotos).forEach(([pKey, photosArr]) => {
    (photosArr || []).forEach((p) => {
      if (p.status === 'pending') return;
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
      <ToastContainer />
      {showGenderModal && (
  <div className="gender-modal">
    <h3>{lang === 'ar' ? 'اختار صورة حسابك' : 'Choose your avatar'}</h3>

    <button onClick={() => {
      updateGender('female');
      setShowGenderModal(false);
    }}>
      {lang === 'ar' ? '👩 بنت' : '👩 Female'}
    </button>

    <button onClick={() => {
      updateGender('male');
      setShowGenderModal(false);
    }}>
      {lang === 'ar' ? '👨 شب' : '👨 Male'}
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
            {lang === 'ar' ? '🏆 أفضل الرحالة' : '🏆 Top Explorers'}
          </button>
          <NotificationBell user={user} isAdmin={user && ADMIN_EMAILS.includes(user.email)} lang={lang} />
          <button className="lang-btn" onClick={() => setShowAbout(true)}>
            {lang === 'ar' ? 'عن رحلتي' : 'About'}
          </button>
          {user && (
            <button className="lang-btn" onClick={openFavoritesPage}>
              {lang === 'ar' ? '❤️ المفضلة' : '❤️ Favorites'}
            </button>
          )}
          {user && ADMIN_EMAILS.includes(user.email) && (
            <button className="lang-btn" onClick={() => setShowAdminPanel(prev => !prev)}>
              {lang === 'ar' ? '🛡️ لوحة الإدارة' : '🛡️ Admin'}
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
            <button
              className="login-btn"
              onClick={() => {
                signInWithGoogle().catch((err) => {
                  showToast(`⚠️ ${err.code || err.message || (lang === 'ar' ? 'صار خطأ غير متوقع' : 'An unexpected error occurred')}`);
                });
              }}
            >
              {t.login}
            </button>
          )}
        </div>
      </div>

      <EcoBanner lang={lang} />

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
          ratedPlaceKeys={userRatedPlaces}
          tripsBuilt={userTripsBuilt}
          addedPlaceKeys={userAddedPlaces}
          onClose={() => setShowProfile(false)}
          lang={lang}
        />
      )}

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} lang={lang} />
      )}

      {showAbout && (
        <AboutPage lang={lang} onClose={() => setShowAbout(false)} />
      )}

      {showAdminPanel && (
        <AdminPanel lang={lang} onClose={() => setShowAdminPanel(false)} />
      )}

      {!debouncedSearchQuery && season === '' && !showFavoritesPage && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', margin: '15px auto' }}>
          <button className="add-place-btn rl-trip-btn" onClick={() => setShowTripPlanner(true)}>
            <span>🗺️</span>
            <span>{lang === 'ar' ? 'خطط رحلتي' : 'Plan My Trip'}</span>
          </button>
          <button className="add-place-btn rl-trip-btn" onClick={() => setShowAiTripBuilder(true)}>
            <span>🤖</span>
            <span>{lang === 'ar' ? 'ابنيلي رحلة بالـ AI' : 'Build My Trip with AI'}</span>
          </button>
        </div>
      )}

      <div className="rl-stats-card">
        <div className="rl-stat-item">
          <strong className="rl-stat-value"><StatStarIcon /><span>{siteStats.ratings}</span></strong>
          <span>{lang === 'ar' ? 'تقييم من الزوار' : 'Visitor ratings'}</span>
        </div>
        <div className="rl-stat-item">
          <strong className="rl-stat-value"><StatBagIcon /><span>{siteStats.users}</span></strong>
          <span>{lang === 'ar' ? 'رحّالة مسجلين' : 'Registered explorers'}</span>
        </div>
        <div className="rl-stat-item">
          <strong className="rl-stat-value"><StatPinIcon /><span>{siteStats.places}+</span></strong>
          <span>{lang === 'ar' ? 'منطقة سياحية' : 'Destinations'}</span>
        </div>
      </div>

      <p className="rl-app-search-heading">{t.subtitle}</p>
      <input className="search-input" type="text" placeholder={`🔍 ${t.search}`} value={searchQuery} onChange={(e) => { setShowFavoritesPage(false); setSearchQuery(e.target.value); }} />

      {!debouncedSearchQuery && season === '' && !showFavoritesPage && <p className="welcome-msg">{t.welcome}</p>}

      {!debouncedSearchQuery && (
        <div className="rl-season-btn-row">
          <button onClick={() => { setShowFavoritesPage(false); setSeason('spring'); }}>{t.spring}</button>
          <button onClick={() => { setShowFavoritesPage(false); setSeason('winter'); }}>{t.winter}</button>
          <button onClick={() => { setShowFavoritesPage(false); setSeason('summer'); }}>{t.summer}</button>
        </div>
      )}

      {!debouncedSearchQuery && !showFavoritesPage && (
        <div className="rl-type-chip-row">
          {PLACE_TYPES.map((pt) => (
            <button
              key={pt.key}
              className={`rl-type-chip ${typeFilter === pt.key ? 'active' : ''}`}
              onClick={() => { setSeason(''); setTypeFilter((prev) => (prev === pt.key ? '' : pt.key)); }}
            >
              {lang === 'ar' ? pt.labelAr : pt.labelEn}
            </button>
          ))}
        </div>
      )}

      {!debouncedSearchQuery && season === '' && !showFavoritesPage && (
        <div style={{ maxWidth: 1200, margin: '30px auto 10px', padding: '0 20px' }}>
          <h2 style={{ color: '#8B6914', fontSize: '1.5rem', marginBottom: 20, textAlign: 'center' }}>
            {lang === 'ar' ? '🏆 الأماكن الأكثر زيارة' : '🏆 Most Visited Places'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {POPULAR_PLACE_KEYS.map((key) => {
              const p = places[key];
              const placeName = lang === 'ar' ? p.name : p.nameEn;
              const ratingData = ratings[key] || { avg: 0, count: 0 };
              return (
                <div
                  key={key}
                  className="rl-popular-card"
                  style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 20px rgba(139,105,20,0.1)', border: '1px solid rgba(196,149,42,0.15)' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={p.img} alt={placeName} loading="lazy" style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                    <span style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: 'rgba(139,105,20,0.85)', color: '#fff', fontSize: '0.72rem', padding: '4px 10px', borderRadius: 999 }}>
                      {p.season === 'summer' ? '☀️' : p.season === 'winter' ? '❄️' : '🌸'} {lang === 'ar' ? (p.season === 'summer' ? 'صيف' : p.season === 'winter' ? 'شتاء' : 'ربيع') : (p.season === 'summer' ? 'Summer' : p.season === 'winter' ? 'Winter' : 'Spring')}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ color: '#8B6914', fontSize: '1.1rem', marginBottom: 6 }}>{placeName}</h3>
                    <div style={{ fontSize: '1rem', marginBottom: 10, minHeight: 22 }}>
                      {ratingData.count > 0 && (
                        <>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} style={{ color: star <= Math.round(ratingData.avg) ? '#ffb703' : '#ddd' }}>★</span>
                          ))}
                          <span style={{ fontSize: '0.78rem', color: '#888' }}> ({ratingData.avg.toFixed(1)})</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => { setSeason(p.season); }}
                      style={{ width: '100%', background: 'linear-gradient(135deg, #C4952A, #8B6914)', color: '#fff', padding: 10, borderRadius: 10, fontSize: '0.9rem', margin: 0 }}
                    >
                      {lang === 'ar' ? 'استكشف 🔎' : 'Explore 🔎'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showTripPlanner && (
        <TripPlanner onClose={() => setShowTripPlanner(false)} onOpenMap={openMap} userPlaces={approvedUserPlaces} lang={lang} />
      )}

      {showAiTripBuilder && (
        <AITripBuilder onClose={() => setShowAiTripBuilder(false)} userPlaces={approvedUserPlaces} lang={lang} />
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


      {user && season === '' && !debouncedSearchQuery && !showFavoritesPage && (
        <div style={{ margin: '15px auto', maxWidth: '600px' }}>
          <AddPlaceForm user={user} onAdd={(p) => setUserPlaces(prev => [...prev, p])} onPointsEarned={() => awardPoints(20)} lang={lang} />
        </div>
      )}
      {!user && season === '' && !debouncedSearchQuery && !showFavoritesPage && (
        <p className="login-hint" style={{ margin: '10px 0' }}>🔑 سجل دخول لإضافة منطقة جديدة</p>
      )}

      {(season !== '' || typeFilter !== '' || showFavoritesPage) && !debouncedSearchQuery && <button className="home-btn" onClick={goHome}>{t.home}</button>}

      {showFavoritesPage && !selectedPlace && !debouncedSearchQuery && (
        <div>
          <h2>{lang === 'ar' ? '❤️ الأماكن المفضلة' : '❤️ Favorite Places'}</h2>
          {favoriteKeys.length === 0 ? (
            <p className="login-hint" style={{ textAlign: 'center' }}>
              {lang === 'ar' ? 'ما ضفت أي مكان للمفضلة بعد، دوس ❤️ على أي بطاقة منطقة!' : "You haven't added any favorites yet — tap ❤️ on any place card!"}
            </p>
          ) : (
            <div className="places-grid">
              {favoriteKeys.map(key => places[key] ? renderPlace(key, places[key]) : null)}
            </div>
          )}
        </div>
      )}

      {debouncedSearchQuery && (
        <div className="places-grid">
          {Object.keys(places)
            .filter(key => places[key].name.includes(debouncedSearchQuery) || places[key].nameEn.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            .map(key => renderPlace(key, places[key]))}
        </div>
      )}

      {typeFilter && !debouncedSearchQuery && !selectedPlace && (
        <div>
          <h2>{PLACE_TYPES.find((pt) => pt.key === typeFilter) ? (lang === 'ar' ? PLACE_TYPES.find((pt) => pt.key === typeFilter).labelAr : PLACE_TYPES.find((pt) => pt.key === typeFilter).labelEn) : ''}</h2>
          <div className="places-grid">
            {Object.keys(places).filter((key) => places[key].type === typeFilter).map((key) => renderPlace(key, places[key]))}
            {userPlaces.filter((p) => p.type === typeFilter && (p.status === 'approved' || !p.status)).map((p) => renderPlace(p.id, p, true))}
          </div>
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

      {season === 'summer' && !selectedPlace && !debouncedSearchQuery && (
        <div>
          <h2>{t.summerRegions}</h2>
          <div className="places-grid">{summerKeys.map(key => renderPlace(key, places[key]))}</div>
          {userSummerPlaces.length > 0 && (
            <div>
              <h2>{lang === 'ar' ? '🌟 مناطق أضافها الزوار' : '🌟 Places Added by Visitors'}</h2>
              <div className="places-grid">{userSummerPlaces.map((p) => renderPlace(p.id, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {season === 'winter' && !selectedPlace && !debouncedSearchQuery && (
        <div>
          <h2>{t.winterRegions}</h2>
          <div className="places-grid">{winterKeys.map(key => renderPlace(key, places[key]))}</div>
          {userWinterPlaces.length > 0 && (
            <div>
              <h2>{lang === 'ar' ? '🌟 مناطق أضافها الزوار' : '🌟 Places Added by Visitors'}</h2>
              <div className="places-grid">{userWinterPlaces.map((p) => renderPlace(p.id, p, true))}</div>
            </div>
          )}
        </div>
      )}

      {season === 'spring' && !selectedPlace && !debouncedSearchQuery && (
        <div>
          <h2>{t.springRegions}</h2>
          <div className="places-grid">{springKeys.map(key => renderPlace(key, places[key]))}</div>
          {userSpringPlaces.length > 0 && (
            <div>
              <h2>{lang === 'ar' ? '🌟 مناطق أضافها الزوار' : '🌟 Places Added by Visitors'}</h2>
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
            <h3 style={{ color: '#8B6914', marginBottom: 4 }}>{lang === 'ar' ? `🖼️ معرض صور ${galleryModalData.placeName}` : `🖼️ ${galleryModalData.placeName} Photo Gallery`}</h3>
            <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: 14 }}>
              {lang === 'ar' ? `${galleryModalData.photos.length} صورة — دوس على أي وحدة لتكبيرها` : `${galleryModalData.photos.length} photos — tap any one to enlarge`}
            </p>
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
            style={{ position: 'absolute', bottom: 66, left: 'calc(50% - 55px)', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '6px 16px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {(lightboxData.photos[lightboxData.index].likes || []).some((l) => (l && l.uid) === user?.uid) ? '❤️' : '🤍'} {(lightboxData.photos[lightboxData.index].likes || []).length}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowLightboxComments((v) => !v); }}
            style={{ position: 'absolute', bottom: 66, left: 'calc(50% + 55px)', transform: 'translateX(-50%)', background: showLightboxComments ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '6px 16px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            💬 {(lightboxData.photos[lightboxData.index].comments || []).length}
          </button>

          {showLightboxComments && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'absolute', bottom: 100, insetInlineEnd: 16, width: 'min(320px, 85vw)', maxHeight: '55vh', background: '#fff', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
            >
              <div style={{ overflowY: 'auto', flex: 1, marginBottom: 10, maxHeight: '32vh' }}>
                {(lightboxData.photos[lightboxData.index].comments || []).length === 0 ? (
                  <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>
                    {lang === 'ar' ? 'ولسا محدا علّق 💬' : 'No comments yet, be the first! 💬'}
                  </p>
                ) : (
                  (lightboxData.photos[lightboxData.index].comments || []).map((c, i) => (
                    <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0e0b0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.8rem', color: '#8B6914' }}>{c.authorName || (lang === 'ar' ? 'زائر' : 'Visitor')}</strong>
                        <p style={{ fontSize: '0.85rem', color: '#444', margin: '2px 0 0' }}>{c.text}</p>
                      </div>
                      {user && c.authorUid === user.uid && (
                        <button
                          onClick={() => handleDeleteComment(lightboxData.placeKey, lightboxData.photos[lightboxData.index], c)}
                          style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '0.9rem', cursor: 'pointer', padding: 0, margin: 0 }}
                          title={lang === 'ar' ? 'احذف تعليقي' : 'Delete my comment'}
                        >🗑️</button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {user ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={lightboxCommentDraft}
                    onChange={(e) => setLightboxCommentDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && lightboxCommentDraft.trim()) {
                        handleAddComment(lightboxData.placeKey, lightboxData.photos[lightboxData.index], lightboxCommentDraft);
                        setLightboxCommentDraft('');
                      }
                    }}
                    placeholder={lang === 'ar' ? 'اكتب تعليق...' : 'Write a comment...'}
                    style={{ flex: 1, border: '1px solid #e8d5a3', borderRadius: 10, padding: '6px 10px', fontSize: '0.85rem', outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      if (lightboxCommentDraft.trim()) {
                        handleAddComment(lightboxData.placeKey, lightboxData.photos[lightboxData.index], lightboxCommentDraft);
                        setLightboxCommentDraft('');
                      }
                    }}
                    style={{ background: '#b8860b', color: '#fff', border: 'none', borderRadius: 10, padding: '0 14px', cursor: 'pointer' }}
                  >➤</button>
                </div>
              ) : (
                <p style={{ color: '#999', fontSize: '0.78rem', textAlign: 'center' }}>
                  {lang === 'ar' ? 'سجل دخول عشان تكتب تعليق' : 'Log in to write a comment'}
                </p>
              )}
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: 20 }}>
            {lightboxData.index + 1} من {lightboxData.photos.length}
            {lightboxData.photos[lightboxData.index].uploadedBy && ` · رفعها ${lightboxData.photos[lightboxData.index].uploadedBy}`}
          </div>

          {user && lightboxData.photos[lightboxData.index].uploadedBy === user.displayName && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeletePhoto(lightboxData.placeKey, lightboxData.photos[lightboxData.index]); }}
              style={{ position: 'absolute', top: 20, left: 20, background: '#c0392b', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              🗑️ احذف صورتي
            </button>
          )}
        </div>
      )}

      <RahalChatbot userLocation={userLocation} userPlaces={approvedUserPlaces} lang={lang} />
    </div>
  );
}

export default App;
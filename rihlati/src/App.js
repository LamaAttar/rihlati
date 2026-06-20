import './App.css';
import { useState } from 'react';

function App() {
  const [season, setSeason] = useState('');
  const [openPlace, setOpenPlace] = useState('');

  const toggleDetails = (place) => {
    setOpenPlace(openPlace === place ? '' : place);
  };

  return (
    <div className="App">
      <h1>رحلتي 🗺️</h1>
      <p>اكتشف أجمل مناطق الأردن</p>

      <button onClick={() => setSeason('summer')}>☀️ صيف</button>
      <button onClick={() => setSeason('winter')}>❄️ شتاء</button>

      {season === 'summer' && (
        <div>
          <h2>مناطق الصيف</h2>

          <div className="places-grid">
            <div className="place-card">
              <h3>عجلون</h3>
              <img src="/ajloun.png" alt="عجلون" />
              <p>📍 تبعد حوالي 75 كم عن عمان</p>
              <p>قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲</p>
              <button onClick={() => toggleDetails('ajloun')}>عرض الخدمات القريبة</button>
              {openPlace === 'ajloun' && (
                <div className="services">
                  <p>🍽️ مطعم القلعة - 500م</p>
                  <p>🛒 سوبر ماركت عجلون - 1كم</p>
                  <p>⛽ محطة بنزين - 2كم</p>
                </div>
              )}
            </div>

            <div className="place-card">
              <h3>جرش</h3>
              <img src="/jerash.png" alt="جرش" />
              <p>📍 تبعد حوالي 48 كم عن عمان</p>
              <p>مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️</p>
              <button onClick={() => toggleDetails('jerash')}>عرض الخدمات القريبة</button>
              {openPlace === 'jerash' && (
                <div className="services">
                  <p>🍽️ مطعم الأوديون - 300م</p>
                  <p>🛒 ماركت جرش - 800م</p>
                  <p>⛽ محطة بنزين - 1.5كم</p>
                </div>
              )}
            </div>

            <div className="place-card">
              <h3>أم قيس</h3>
              <img src="/umqais.png" alt="أم قيس" />
              <p>📍 تبعد حوالي 110 كم عن عمان</p>
              <p>أطلال رومانية تطل على بحيرة طبريا والجولان، منظر خلاب 🏛️</p>
              <button onClick={() => toggleDetails('umqais')}>عرض الخدمات القريبة</button>
              {openPlace === 'umqais' && (
                <div className="services">
                  <p>🍽️ مطعم أم قيس - 400م</p>
                  <p>🛒 ماركت محلي - 1كم</p>
                  <p>⛽ محطة بنزين - 2.5كم</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {season === 'winter' && (
        <div>
          <h2>مناطق الشتاء</h2>

          <div className="places-grid">
            <div className="place-card">
              <h3>البتراء</h3>
              <img src="/petra.png" alt="البتراء" />
              <p>📍 تبعد حوالي 235 كم عن عمان</p>
              <p>إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️</p>
              <button onClick={() => toggleDetails('petra')}>عرض الخدمات القريبة</button>
              {openPlace === 'petra' && (
                <div className="services">
                  <p>🍽️ مطعم البترا - 200م</p>
                  <p>🛒 ماركت وادي موسى - 1كم</p>
                  <p>⛽ محطة بنزين - 2كم</p>
                </div>
              )}
            </div>

            <div className="place-card">
              <h3>وادي رم</h3>
              <img src="/wadirum.png" alt="وادي رم" />
              <p>📍 تبعد حوالي 300 كم عن عمان</p>
              <p>صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️</p>
              <button onClick={() => toggleDetails('wadirum')}>عرض الخدمات القريبة</button>
              {openPlace === 'wadirum' && (
                <div className="services">
                  <p>🍽️ مطعم البدو - 1كم</p>
                  <p>🛒 ماركت رم - 3كم</p>
                  <p>⛽ محطة بنزين - 5كم</p>
                </div>
              )}
            </div>

            <div className="place-card">
              <h3>العقبة</h3>
              <img src="/aqaba.png" alt="العقبة" />
              <p>📍 تبعد حوالي 330 كم عن عمان</p>
              <p>مدينة ساحلية دافئة بالشتاء، بحر أحمر ومرجان رائع 🌊</p>
              <button onClick={() => toggleDetails('aqaba')}>عرض الخدمات القريبة</button>
              {openPlace === 'aqaba' && (
                <div className="services">
                  <p>🍽️ مطعم العقبة - 300م</p>
                  <p>🛒 ماركت العقبة - 700م</p>
                  <p>⛽ محطة بنزين - 1كم</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
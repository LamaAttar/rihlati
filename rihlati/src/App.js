import './App.css';
import { useState } from 'react';

function App() {
  const [season, setSeason] = useState('');

  return (
    <div className="App">
      <h1>رحلتي 🗺️</h1>
      <p>اكتشف أجمل مناطق الأردن</p>

      <button onClick={() => setSeason('summer')}>☀️ صيف</button>
      <button onClick={() => setSeason('winter')}>❄️ شتاء</button>

      {season === 'summer' && (
        <div>
          <h2>مناطق الصيف</h2>

          <div className="place-card">
            <h3>عجلون</h3>
            <img src="/ajloun.png" alt="عجلون" />
            <p>📍 تبعد حوالي 75 كم عن عمان</p>
            <p>قلعة تاريخية وسط غابات خضراء، أجواء معتدلة بالصيف 🌲</p>
          </div>

          <div className="place-card">
            <h3>جرش</h3>
            <img src="/jerash.png" alt="جرش" />
            <p>📍 تبعد حوالي 48 كم عن عمان</p>
            <p>مدينة رومانية أثرية من أهم المواقع التاريخية بالأردن 🏛️</p>
          </div>
        </div>
      )}

      {season === 'winter' && (
        <div>
          <h2>مناطق الشتاء</h2>

          <div className="place-card">
            <h3>البتراء</h3>
            <img src="/petra.png" alt="البتراء" />
            <p>📍 تبعد حوالي 235 كم عن عمان</p>
            <p>إحدى عجائب الدنيا السبع، أجواء دافئة بالشتاء ☀️</p>
          </div>

          <div className="place-card">
            <h3>وادي رم</h3>
            <img src="/wadirum.png" alt="وادي رم" />
            <p>📍 تبعد حوالي 300 كم عن عمان</p>
            <p>صحراء ساحرة بألوانها الذهبية، تجربة تخييم لا تُنسى 🏜️</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
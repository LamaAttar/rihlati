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
          </div>

          <div className="place-card">
            <h3>جرش</h3>
            <img src="/jerash.png" alt="جرش" />
          </div>
        </div>
      )}

      {season === 'winter' && (
        <div>
          <h2>مناطق الشتاء</h2>

          <div className="place-card">
            <h3>البتراء</h3>
            <img src="/petra.png" alt="البتراء" />
          </div>

          <div className="place-card">
            <h3>وادي رم</h3>
            <img src="/wadirum.png" alt="وادي رم" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
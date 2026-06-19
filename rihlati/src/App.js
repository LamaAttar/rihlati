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
        </div>
      )}

      {season === 'winter' && <p>مناطق الشتاء: البتراء، وادي رم، العقبة</p>}
    </div>
  );
}

export default App;
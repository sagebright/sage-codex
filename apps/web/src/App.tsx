import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import type { HealthResponse } from '@dagger-app/shared-types';

function HomePage() {
  const health: HealthResponse = { status: 'ok', timestamp: new Date().toISOString() };

  return (
    <div>
      <h1>Dagger-Gen</h1>
      <p>Daggerheart TTRPG Adventure Generator</p>
      <p>Status: {health.status}</p>
      <nav>
        <Link to="/adventure">Start New Adventure</Link>
      </nav>
    </div>
  );
}

function AdventurePage() {
  return (
    <div>
      <h1>Adventure Generator</h1>
      <p>Adventure creation workflow coming soon...</p>
      <nav>
        <Link to="/">Back to Home</Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/adventure" element={<AdventurePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

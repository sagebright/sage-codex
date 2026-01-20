import type { HealthResponse } from '@dagger-app/shared-types';

function App() {
  const health: HealthResponse = { status: 'ok', timestamp: new Date().toISOString() };

  return (
    <div>
      <h1>Dagger-Gen</h1>
      <p>Daggerheart TTRPG Adventure Generator</p>
      <p>Status: {health.status}</p>
    </div>
  );
}

export default App;

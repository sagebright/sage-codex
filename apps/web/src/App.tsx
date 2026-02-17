import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DesignSystem } from '@/pages/DesignSystem';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesignSystem />} />
        <Route path="/design-system" element={<DesignSystem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

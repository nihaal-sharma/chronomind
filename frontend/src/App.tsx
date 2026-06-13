import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SimulationDashboard from './pages/SimulationDashboard';
import MemoryCortex from './pages/MemoryCortex';
import FutureComparison from './pages/FutureComparison';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulations" element={<SimulationDashboard />} />
        <Route path="/cortex" element={<MemoryCortex />} />
        <Route path="/comparison" element={<FutureComparison />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ResultPage } from './pages/ResultPage';
import { ScenarioSelectPage } from './pages/ScenarioSelectPage';
import { SimulationPage } from './pages/SimulationPage';
import { TutorialPage } from './pages/TutorialPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select" element={<ScenarioSelectPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

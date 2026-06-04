// Modi React Router 앱
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TradeProvider } from './context/TradeContext';
import { LandingPage } from './pages/LandingPage';
import { LoginCallbackPage } from './pages/LoginCallbackPage';
import { LoginPage } from './pages/LoginPage';
import { ModeSelectPage } from './pages/ModeSelectPage';
import { ResultPage } from './pages/ResultPage';
import { ScenarioSelectPage } from './pages/ScenarioSelectPage';
import { SimulationPage } from './pages/SimulationPage';
import { TradeDashboardPage } from './pages/TradeDashboardPage';
import { TutorialPage } from './pages/TutorialPage';

// 앱 라우터 컴포넌트
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TradeProvider>
          <Routes>
            {/* 시나리오 투자 주요 흐름 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/mode-select" element={<ModeSelectPage />} />
            <Route path="/select" element={<ScenarioSelectPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<LoginCallbackPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/simulation" element={<SimulationPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/trade" element={<TradeDashboardPage />} />
            {/* 알 수 없는 경로 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TradeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

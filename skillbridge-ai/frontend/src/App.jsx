import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import SketchBackground from './components/SketchBackground';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import JobMatchPage from './pages/JobMatchPage';
import ResumePage from './pages/ResumePage';
import SkillGapPage from './pages/SkillGapPage';
import InterviewPage from './pages/InterviewPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SketchBackground />
        <div className="relative min-h-screen bg-base" style={{ zIndex: 1 }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobMatchPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/skills" element={<SkillGapPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A2E',
              color: '#E2E8F0',
              border: '1px solid #2A2A4A',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#0D0D1A' } },
            error: { iconTheme: { primary: '#F43F5E', secondary: '#0D0D1A' } },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}


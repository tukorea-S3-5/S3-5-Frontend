import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import { AppContainer } from './components/Layout';
import { BottomNav } from './components';
import HomePage from './pages/HomePage';

function AppContent() {
  const navItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/exercises', label: '운동', icon: '💪' },
    { path: '/record', label: '기록', icon: '📊' },
    { path: '/profile', label: '프로필', icon: '👤' },
  ];

  return (
    <AppContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/exercises" element={<div style={{ padding: '20px' }}>운동 페이지</div>} />
        <Route path="/record" element={<div style={{ padding: '20px' }}>기록 페이지</div>} />
        <Route path="/profile" element={<div style={{ padding: '20px' }}>프로필 페이지</div>} />
      </Routes>

      <BottomNav items={navItems} />
    </AppContainer>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exercises" element={<div style={{ padding: '20px' }}>운동 페이지</div>} />
            <Route path="/record" element={<div style={{ padding: '20px' }}>기록 페이지</div>} />
            <Route path="/profile" element={<div style={{ padding: '20px' }}>프로필 페이지</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
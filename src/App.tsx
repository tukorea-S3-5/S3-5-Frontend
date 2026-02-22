import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SplashPage from "./pages/SplashPage";
import SafetyCheckPage from "./pages/Onboarding/SafetyCheckPage";
import ExpertConsultPage from "./pages/Onboarding/ExpertConsultPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding">
            <Route path="safety" element={<SafetyCheckPage />} />
            <Route path="expert" element={<ExpertConsultPage />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route
              path="/exercises"
              element={<div style={{ padding: "20px" }}>운동 페이지</div>}
            />
            <Route
              path="/record"
              element={<div style={{ padding: "20px" }}>기록 페이지</div>}
            />
            <Route
              path="/profile"
              element={<div style={{ padding: "20px" }}>프로필 페이지</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ExerciseListPage from "./pages/ExerciseList/ExerciseListPage";
import ExercisePage from './pages/Exercise/ExercisePage';
import SplashPage from "./pages/SplashPage";
import SafetyCheckPage from "./pages/Onboarding/SafetyCheckPage";
import ExpertConsultPage from "./pages/Onboarding/ExpertConsultPage";
import OnboardingLayout from "./pages/Onboarding/components/OnboardingLayout";
import ReportPage from "./pages/Exercise/ReportPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingLayout />}>
            <Route path="safety" element={<SafetyCheckPage />} />
            <Route path="expert" element={<ExpertConsultPage />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/exercises" element={<ExerciseListPage />} />
            <Route path="/exercise" element={<ExercisePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/record" element={<div style={{ padding: '20px' }}>기록 페이지</div>} />
            <Route path="/profile" element={<div style={{ padding: '20px' }}>프로필 페이지</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
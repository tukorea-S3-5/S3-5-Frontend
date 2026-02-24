import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ExerciseListPage from "./pages/ExerciseList/ExerciseListPage";
import SplashPage from "./pages/SplashPage";
import SafetyCheckPage from "./pages/Onboarding/SafetyCheckPage";
import ExpertConsultPage from "./pages/Onboarding/ExpertConsultPage";
import OnboardingLayout from "./pages/Onboarding/components/OnboardingLayout";
import { useEffect } from "react";
import { setAccessToken, setOnAuthFail } from "./api/http";
import { logout } from "./api/auth";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    setOnAuthFail(async () => {
      try {
        await logout();
      } catch {
        // 이미 만료/실패여도 프론트는 로그아웃 상태로 전환
      } finally {
        setAccessToken(null);
        navigate("/auth/login", { replace: true });
      }
    });

    return () => setOnAuthFail(null);
  }, [navigate]);

  return (
    <Routes>
      <Route
        element={<Layout showHeader={false} showBottomNav={false} />}
      ></Route>
      <Route path="/" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingLayout />}>
        <Route path="safety" element={<SafetyCheckPage />} />
        <Route path="expert" element={<ExpertConsultPage />} />
      </Route>
      <Route
        path="/auth"
        element={<Layout showHeader={false} showBottomNav={false} />}
      >
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/exercises" element={<ExerciseListPage />} />
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
  );
}

export default App;

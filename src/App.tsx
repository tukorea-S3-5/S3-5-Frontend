import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/GlobalStyle";
import { theme } from "./styles/theme";
import Layout from "./components/Layout";
import HomePage from "./pages/Home/HomePage";
import ExerciseListPage from "./pages/ExerciseList/ExerciseListPage";
import ExercisePage from "./pages/Exercise/ExercisePage";
import SplashPage from "./pages/SplashPage";
import SafetyCheckPage from "./pages/Onboarding/SafetyCheckPage";
import ExpertConsultPage from "./pages/Onboarding/ExpertConsultPage";
import OnboardingLayout from "./pages/Onboarding/components/OnboardingLayout";
import { useEffect, useState } from "react";
import { setAccessToken, setOnAuthFail } from "./api/http";
import { logout, refresh } from "./api/auth";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoadingOverlay from "./components/LoadingOverlay";
import ReportPage from "./pages/Exercise/ReportPage";
import PregnancyOnboardingPage from "./pages/PregnancyOnboarding/PregnancyOnboardingPage";

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
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [showBootLoading, setShowBootLoading] = useState(false);

  // 새로고침 로딩 및 인증 여부 확인
  useEffect(() => {
    const t = window.setTimeout(() => {
      setShowBootLoading(true);
    }, 300);

    refresh()
      .then((r) => setAccessToken(r.accessToken))
      .catch(() => setAccessToken(null))
      .finally(() => {
        setIsAuthLoaded(true);
        window.clearTimeout(t);
        setShowBootLoading(false);
      });

    return () => window.clearTimeout(t);
  }, []);

  // 인증 실패(401 후 refresh도 실패) 시 로그아웃 처리 콜백 등록
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

  if (!isAuthLoaded) {
    return showBootLoading ? <LoadingOverlay /> : null;
  }

  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/" element={<SplashPage />} />
      <Route path="onboarding" element={<OnboardingLayout />}>
        <Route path="safety" element={<SafetyCheckPage />} />
        <Route path="expert" element={<ExpertConsultPage />} />
      </Route>
      <Route
        path="auth"
        element={<Layout showHeader={false} showBottomNav={false} />}
      >
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      {/* 앱 내부 라우트 */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout showHeader={false} showBottomNav={false} />}>
          <Route
            path="pregnancy-onboarding"
            element={<PregnancyOnboardingPage />}
          />
        </Route>
        <Route element={<Layout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="exercises" element={<ExerciseListPage />} />
          <Route path="exercise" element={<ExercisePage />} />
          <Route path="report" element={<ReportPage />} />
          <Route
            path="record"
            element={<div style={{ padding: "20px" }}>기록 페이지</div>}
          />
          <Route
            path="profile"
            element={<div style={{ padding: "20px" }}>프로필 페이지</div>}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

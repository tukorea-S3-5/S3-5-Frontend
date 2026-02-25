// 인증 라우트
// 로그인 안 한 사용자가 인증 후 사용할 수 있는 페이지(/home, /exercise)에 들어가면
// 자동으로 /auth/login으로 보내기
// 로그인한 상태면 그대로 접근 허용
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../api/http";

export default function ProtectedRoute() {
  const location = useLocation();
  const token = getAccessToken();

  // accessToken 없으면 로그인 페이지로
  if (!token) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}

import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../api/http"; // 경로 확인 필요

export default function PublicRoute() {
  const token = getAccessToken();

  // 이미 로그인 상태(메모리 토큰 존재)라면 홈 화면('/home')으로 리다이렉트
  if (token) {
    return <Navigate to="/home" replace />;
  }

  // 로그인 상태가 아니라면 하위 페이지(로그인, 가입 등) 노출
  return <Outlet />;
}

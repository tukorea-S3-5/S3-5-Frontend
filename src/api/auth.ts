// 로그인/회원가입 API
import { postJson } from "./http";

/**
 * 로그인 요청 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 타입
 */
export interface LoginResponse {
  accessToken: string;
}

/**
 * 로그인 API 호출
 */
export async function login(body: LoginRequest) {
  return postJson<LoginResponse>("/auth/login", body);
}

/**
 * 회원가입 요청 타입
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  birth_date: string;
}

/**
 * 회원가입 API 호출
 */
export async function signup(body: SignupRequest) {
  return postJson<{ message?: string }>("/auth/signup", body);
}

/**
 * 리프레시 토큰 발급 응답 타입
 */
export interface RefreshResponse {
  accessToken: string;
}

/**
 * 리프레시 토큰 발급 API 호출
 */
export async function refresh() {
  return postJson<RefreshResponse>("/auth/refresh");
}

/**
 * 로그아웃 API 호출
 */
export async function logout() {
  return postJson<{ message?: string }>("/auth/logout");
}

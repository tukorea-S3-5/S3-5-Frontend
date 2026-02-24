// fetch/axios 공통 설정
// --------------------------------------------------
// 공통 HTTP 유틸
// - BASE_URL은 .env에서 관리
// - 요청을 JSON 형태로 전송
// - 에러 발생 시 메시지 가공 + 콘솔 로그 출력
// --------------------------------------------------

import { refresh } from "./auth";

// API 기본 주소
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * 내부 공통 요청 함수
 * - 모든 HTTP 요청의 실제 처리 담당
 * - method/headers/body를 공통 처리
 * - res.ok가 아니면 에러 메시지 파싱 후 throw
 */
async function requestJson<TResponse>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  init?: RequestInit,
  retried?: boolean,
): Promise<TResponse> {
  const url = `${BASE_URL}${path}`;

  try {
    const hasBody = body !== undefined;
    const token = getAccessToken();

    const res = await fetch(url, {
      method,
      credentials: "include", // 쿠키(refreshToken) 전송
      headers: {
        // 토큰이 있을 때만 Authorization 헤더 추가
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
      ...init,
    });

    // 401 Unauthorized: accessToken 만료/무효
    // - refreshToken은 httpOnly 쿠키로 자동 전송됨(credentials: "include")
    // - /auth/refresh 호출로 새 accessToken 발급
    // - 원래 요청을 1회 재시도
    if (res.status === 401 && !retried && path !== "/auth/refresh") {
      try {
        const newToken = await getNewAccessToken();

        // 새 토큰으로 원 요청 재시도
        return requestJson<TResponse>(
          method,
          path,
          body,
          {
            ...init,
            headers: {
              ...(init?.headers ?? {}),
              ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
            },
          },
          true,
        );
      } catch (e) {
        // refresh 실패 시 메모리 토큰 제거 후 아래 공통 에러 처리로 넘김
        setAccessToken(null);
        console.error("[AUTH] refresh 실패", e);
        onAuthFail?.();
        // 아래 !res.ok에서 원래 401 에러 처리
      }
    }

    // HTTP 상태 코드가 200번대가 아니면 에러 처리
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;

      try {
        const data = await res.json();
        msg = data?.message ?? msg;
      } catch (parseError) {
        console.error("[HTTP] 응답 파싱 실패:", parseError);
      }

      console.error("[HTTP ERROR]", {
        method,
        url,
        status: res.status,
        message: msg,
      });

      const error = new Error(msg) as any;
      error.status = res.status;
      throw error;
    }

    // 204 No Content면 json 파싱하면 에러 나니까 null 반환
    if (res.status === 204) {
      return null as TResponse;
    }

    // 정상 응답(JSON) 반환
    console.log(getAccessToken()); // 상태에 액세스토큰 저장되어 있는지 디버깅용
    return (await res.json()) as TResponse;
  } catch (error) {
    console.error("[NETWORK ERROR]", { method, url, error });
    throw error;
  }
}

/**
 * GET JSON
 * @param path - API 경로 (예: "/pregnancy/me")
 */
export function getJson<TResponse>(path: string, init?: RequestInit) {
  return requestJson<TResponse>("GET", path, undefined, init);
}

/**
 * POST JSON
 * @param path - API 경로 (예: "/auth/login")
 * @param body - 요청 바디
 */
export function postJson<TResponse>(
  path: string,
  body?: unknown,
  init?: RequestInit,
) {
  return requestJson<TResponse>("POST", path, body, init);
}

/**
 * PUT JSON
 */
export function putJson<TResponse>(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  return requestJson<TResponse>("PUT", path, body, init);
}

/**
 * PATCH JSON
 */
export function patchJson<TResponse>(
  path: string,
  body: unknown,
  init?: RequestInit,
) {
  return requestJson<TResponse>("PATCH", path, body, init);
}

/**
 * DELETE JSON
 * - body가 필요한 API면 body를 넣어 호출해도 됨 (선택)
 */
export function deleteJson<TResponse>(
  path: string,
  body?: unknown,
  init?: RequestInit,
) {
  return requestJson<TResponse>("DELETE", path, body, init);
}

// --------------------------------------------------
// 인증을 위한 변수 및 함수
// --------------------------------------------------

// 메모리 토큰 저장소
let accessToken: string | null = null;

// refresh 실패 시 강제 로그아웃을 위한 콜백함수
let onAuthFail: (() => void) | null = null;

export function setOnAuthFail(handler: (() => void) | null) {
  onAuthFail = handler;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// 401 에러면 refresh 함수 호출해서 새 accessToken 저장
let refreshingPromise: Promise<string> | null = null;

async function getNewAccessToken() {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      const res = await refresh();
      setAccessToken(res.accessToken);
      return res.accessToken;
    })();
  }

  try {
    return await refreshingPromise;
  } finally {
    refreshingPromise = null;
  }
}

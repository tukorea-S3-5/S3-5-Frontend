import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";

/**
 * Splash 페이지에서 쓰는 프레임
 */
export function FullscreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      <Screen>{children}</Screen>
    </Container>
  );
}

/**
 * Onboarding 전용 레이아웃(중첩 라우팅 시 사용)
 * <Route path="/onboarding" element={<OnboardingLayout />}> ...
 */
export default function OnboardingLayout() {
  return (
    <Container>
      <Screen>
        <Outlet />
      </Screen>
    </Container>
  );
}

const Container = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  min-height: ${({ theme }) => theme.layout.minHeight};
  margin: 0 auto;
  background-color: #fff9f8;

  display: flex;
  justify-content: center;
  align-items: center;

  /* 모바일 디바이스처럼 보이게 */
  @media (min-width: 481px) {
    border-radius: 0;
  }
`;

const Screen = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 481px) {
    max-width: 430px;
    border-radius: 20px;
    overflow: hidden;
    min-height: calc(100vh - 48px);
  }
`;

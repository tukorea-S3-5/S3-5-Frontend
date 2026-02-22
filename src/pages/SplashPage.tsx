import styled from "styled-components";
import splashLogo from "../assets/icons/splash_logo.svg";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FullscreenFrame } from "./Onboarding/components/OnboardingLayout";

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding/safety");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <FullscreenFrame>
      <ContentWrapper>
        {/* 로고 아이콘 */}
        <LogoIcon src={splashLogo} alt="Momfit Logo" />

        {/* 서브타이틀 */}
        <Subtitle>임산부를 위한 맞춤 운동 가이드</Subtitle>
      </ContentWrapper>
    </FullscreenFrame>
  );
};

// 컨텐츠 싸개 스타일
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 로고 크기
const LogoIcon = styled.img`
  width: 310px;
  height: 130px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

// 서브 타이틀 스타일
const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

export default SplashPage;

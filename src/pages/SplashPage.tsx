import styled from "styled-components";
import splashLogo from "../assets/icons/splash_logo.svg";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import CenteredFrame, { FullscreenFrame } from "../components/CenteredFrame";

const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding/safety");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <CenteredFrame>
      <ContentWrapper>
        {/* 로고 아이콘 */}
        <LogoIcon src={splashLogo} alt="Momfit Logo" />
      </ContentWrapper>
    </CenteredFrame>
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
  height: 160px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export default SplashPage;

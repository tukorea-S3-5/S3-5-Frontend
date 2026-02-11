import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  weekInfo?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
  weekInfo = '40주차',
}) => {
  return (
    <AppContainer>
      {showHeader && (
        <Header
          weekInfo={weekInfo}
          onNotificationClick={() => console.log('알림')}
          onSettingsClick={() => console.log('설정')}
        />
      )}

      <PageContainer>{children}</PageContainer>

      {showBottomNav && <BottomNav />}
    </AppContainer>
  );
};

const AppContainer = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  min-height: ${({ theme }) => theme.layout.minHeight};
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  
  /* 모바일 디바이스처럼 보이게 */
  @media (min-width: 481px) {
    border-radius: 0;
  }
`;

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 100vh;
  padding-bottom: 80px; /* 하단 네비게이션 공간 확보 */
`;

export default Layout;
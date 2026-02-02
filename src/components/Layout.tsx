import styled from 'styled-components';

export const AppContainer = styled.div`
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

export const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 100vh;
  padding-bottom: 80px; /* 하단 네비게이션 공간 확보 */
`;

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: ${({ theme }) => theme.layout.maxWidth};
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme, $active }) => 
    $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
  transition: color 0.2s;
  
  &:active {
    opacity: 0.7;
  }
`;

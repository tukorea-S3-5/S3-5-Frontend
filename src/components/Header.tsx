import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface HeaderProps {
  weekInfo?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  weekInfo,
  showBackButton = false,
  onBackClick,
}) => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      {showBackButton ? (
        <BackButton onClick={onBackClick}>←</BackButton>
      ) : (
        <Logo>MOMFIT</Logo>
      )}

      {weekInfo && <WeekInfo>{weekInfo}</WeekInfo>}

      <Icons>
        <IconButton onClick={() => navigate('/mypage')} aria-label="마이페이지">
          👤
        </IconButton>
      </Icons>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 229, 229, 0.8);
  position: relative;
`;
const Logo = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #333;
`;
const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #333;
`;
const WeekInfo = styled.span`
  font-size: 14px;
  color: #666;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;
const Icons = styled.div`
  display: flex;
  gap: 12px;
`;
const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
`;

export default Header;
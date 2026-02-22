import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";

interface NavItemType {
  path: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items?: NavItemType[];
}

const defaultItems: NavItemType[] = [
  { path: "/home", label: "홈", icon: "🏠" },
  { path: "/exercises", label: "운동", icon: "💪" },
  { path: "/postnatal", label: "산후", icon: "😊" },
];

const BottomNav: React.FC<BottomNavProps> = ({ items = defaultItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Nav>
      {items.map((item) => (
        <NavItem
          key={item.path}
          $active={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        >
          <NavIcon>{item.icon}</NavIcon>
          <NavLabel>{item.label}</NavLabel>
        </NavItem>
      ))}
    </Nav>
  );
};

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const NavItem = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  opacity: ${(props) => (props.$active ? 1 : 0.5)};
  transition: opacity 0.2s;
  padding: 4px 12px;

  &:hover {
    opacity: 1;
  }
`;

const NavIcon = styled.div`
  font-size: 24px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

export default BottomNav;

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { getJson } from "../api/http";

interface LayoutProps {
  children?: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
}) => {
  const [weekInfo, setWeekInfo] = useState<string | undefined>(undefined);

  useEffect(() => {
    getJson<{ week: number }>('/pregnancy/me')
      .then(res => setWeekInfo(`${res.week}주차`))
      .catch(() => setWeekInfo(undefined));
  }, []);

  return (
    <AppContainer>
      {showHeader && (
        <Header weekInfo={weekInfo} />
      )}

      <PageContainer $showBottomNav={showBottomNav}>
        {children ?? <Outlet />}
      </PageContainer>

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

  @media (min-width: 481px) {
    border-radius: 0;
  }
`;

const PageContainer = styled.div<{ $showBottomNav: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 100vh;
  padding-bottom: ${({ $showBottomNav }) => ($showBottomNav ? "80px" : "0")};
`;

export default Layout;
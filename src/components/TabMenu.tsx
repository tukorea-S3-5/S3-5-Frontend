import React from 'react';
import styled from 'styled-components';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabMenuProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <TabContainer>
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          $active={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && ` (${tab.count})`}
        </Tab>
      ))}
    </TabContainer>
  );
};

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: none;
  font-size: 14px;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  background: ${props => props.$active ? '#FF6B6B' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

export default TabMenu;

import React from 'react';
import styled from 'styled-components';

interface CardProps {
  variant?: 'warning' | 'info' | 'default';
  icon?: string;
  title?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  icon,
  title,
  children,
}) => {
  return (
    <CardContainer>
      {icon && <CardIcon>{icon}</CardIcon>}
      <CardContent>
        {title && (
          <CardTitle variant={variant}>{title}</CardTitle>
        )}
        <CardBody>{children}</CardBody>
      </CardContent>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 0 20px 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const CardIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3<{ variant: string }>`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  
  ${props => {
    switch (props.variant) {
      case 'warning':
        return 'color: #FF6B6B;';
      case 'info':
        return 'color: #FF6B6B;';
      default:
        return 'color: #333;';
    }
  }}
`;

const CardBody = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 6px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  p {
    margin: 0;
  }
`;

export default Card;

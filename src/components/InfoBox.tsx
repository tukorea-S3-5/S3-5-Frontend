import React from "react";
import styled from "styled-components";

interface InfoBoxProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

export default function InfoBox({
  icon,
  title,
  subtitle,
  children,
}: InfoBoxProps) {
  return (
    <Box>
      {(icon || title || subtitle) && (
        <Header>
          {icon && <IconWrap aria-hidden>{icon}</IconWrap>}
          {title && <Title>{title}</Title>}
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Header>
      )}
      {children && <Body>{children}</Body>}
    </Box>
  );
}

const Box = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Header = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const IconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
  justify-content: center;

  /* icon svg/img 크기 기본값 */
  svg,
  img {
    width: 32px;
    height: 32px;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary};
`;

const Subtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.sm} 0 0 0;
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Body = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

import React from "react";
import styled from "styled-components";

interface InfoBoxProps {
  title?: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

export default function InfoBox({ title, subtitle, children }: InfoBoxProps) {
  return (
    <Box>
      {(title || subtitle) && (
        <Header>
          {title && <Title>{title}</Title>}
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </Header>
      )}
      <Body>{children}</Body>
    </Box>
  );
}

const Box = styled.div`
  background: #fff;
  border-radius: 16px;
  border: 1px solid #ffd0c5;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 14px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary ?? "#FF6B6B"};
`;

const Subtitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: ${({ theme }) => theme?.colors?.text?.secondary ?? "#666"};
`;

const Body = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.text?.secondary ?? "#666"};
  line-height: 1.6;
`;

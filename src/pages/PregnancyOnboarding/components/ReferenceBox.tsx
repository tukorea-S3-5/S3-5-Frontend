import styled from "styled-components";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function ReferenceBox({ title = "참고:", children }: Props) {
  return (
    <Wrap>
      <Title>{title}</Title>
      <Body>{children}</Body>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.6);
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.point};
  margin-bottom: 6px;
`;

const Body = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

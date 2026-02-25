import styled from "styled-components";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  maxWidth?: number;
};

export default function CenteredFrame({ children, maxWidth = 420 }: Props) {
  return (
    <Screen>
      <Frame $maxWidth={maxWidth}>{children}</Frame>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: center; /* 세로 중앙 */
  padding: 24px 16px;
`;

const Frame = styled.div<{ $maxWidth: number }>`
  width: 100%;
  max-width: ${({ $maxWidth }) => `${$maxWidth}px`};
`;

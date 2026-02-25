import styled from "styled-components";

type Props = {
  total: number; // 총 단계 수
  current: number; // 현재 단계 index
};

export default function StepIndicator({ total, current }: Props) {
  return (
    <Wrap aria-label="진행 단계">
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} $active={i === current} />
      ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 28px 0 18px;
`;

const Dot = styled.div<{ $active: boolean }>`
  height: 6px;
  width: ${({ $active }) => ($active ? "24px" : "6px")};
  border-radius: 999px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.point : theme.colors.middle};
  transition: width 150ms ease;
`;

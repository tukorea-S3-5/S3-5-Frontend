import styled from "styled-components";

type Props = {
  total: number; // 총 단계 수
  current: number; // 현재 단계 index
};

export default function StepIndicator({ total, current }: Props) {
  const now = Math.min(total, Math.max(1, current + 1));

  return (
    <Wrap aria-label="진행 단계">
      <SrOnly aria-live="polite">
        {now} / {total} 단계
      </SrOnly>

      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} $active={i === current} aria-hidden="true" />
      ))}
    </Wrap>
  );
}

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`;

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

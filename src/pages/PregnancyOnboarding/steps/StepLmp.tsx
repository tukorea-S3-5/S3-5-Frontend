import styled from "styled-components";
import type { Dispatch } from "react";
import type { PregnancyAction } from "../usePregnancyOnboarding";
import InputBox from "@/components/InputBox";
import { useMemo } from "react";

type Props = {
  value: string;
  dispatch: Dispatch<PregnancyAction>;
};

export default function StepLmp({ value, dispatch }: Props) {
  const dueDateText = useMemo(() => {
    if (!value) return null;

    // value: "2026-02-01" 같은 형태
    const lmp = new Date(value + "T00:00:00"); // 로컬 타임존 이슈 줄이기
    if (Number.isNaN(lmp.getTime())) return null;

    const due = new Date(lmp);
    due.setDate(due.getDate() + 280); // 40주 = 280일

    // YYYY-MM-DD 포맷
    const yyyy = due.getFullYear();
    const mm = String(due.getMonth() + 1).padStart(2, "0");
    const dd = String(due.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  }, [value]);

  return (
    <Wrap>
      <InputBox
        label="마지막 생리 시작일 (LMP)"
        type="date"
        value={value}
        onChange={(v) => dispatch({ type: "SET_LMP", value: v })}
      />
      <Hint>💡 마지막 생리가 시작된 첫날을 선택해 주세요.</Hint>
      {dueDateText && <Preview>출산 예정일: {dueDateText}</Preview>}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Preview = styled.div`
  padding: 5px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Hint = styled.div`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

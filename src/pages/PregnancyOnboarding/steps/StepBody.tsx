import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { Dispatch } from "react";
import type { PregnancyAction } from "../usePregnancyOnboarding";

type Props = {
  height?: number;
  preWeight?: number;
  dispatch: Dispatch<PregnancyAction>;
};

export default function StepBody({ height, preWeight, dispatch }: Props) {
  const [heightText, setHeightText] = useState(height?.toString() ?? "");
  const [weightText, setWeightText] = useState(preWeight?.toString() ?? "");
  const weightRef = useRef<HTMLInputElement | null>(null);

  // 다른 스텝 갔다가 돌아왔을 때(또는 외부에서 값 바뀔 때) UI 문자열 동기화
  useEffect(() => setHeightText(height?.toString() ?? ""), [height]);
  useEffect(() => setWeightText(preWeight?.toString() ?? ""), [preWeight]);

  // 키 전용 핸들러
  const handleHeightChange = (raw: string) => {
    const normalized = normalizeNumberInput(raw);
    setHeightText(normalized);

    if (normalized === "" || normalized === ".") {
      dispatch({ type: "SET_HEIGHT", value: undefined });
      return;
    }

    const n = Number(normalized);
    dispatch({
      type: "SET_HEIGHT",
      value: Number.isFinite(n) ? n : undefined,
    });
  };

  // 몸무게 전용 핸들러
  const handleWeightChange = (raw: string) => {
    const normalized = normalizeNumberInput(raw);
    setWeightText(normalized);

    if (normalized === "" || normalized === ".") {
      dispatch({ type: "SET_PRE_WEIGHT", value: undefined });
      return;
    }

    const n = Number(normalized);
    dispatch({
      type: "SET_PRE_WEIGHT",
      value: Number.isFinite(n) ? n : undefined,
    });
  };

  // BMI 미리보기(둘 다 입력했을 때만)
  const bmi = useMemo(() => {
    if (!height || !preWeight) return null;
    const h = height / 100;
    if (h <= 0) return null;
    const value = preWeight / (h * h);
    return Math.round(value * 10) / 10; // 소수 1자리
  }, [height, preWeight]);

  return (
    <Wrap>
      <Row>
        <Field>
          <Label>키 (cm)</Label>
          <Input
            inputMode="decimal"
            pattern="[0-9.]*"
            placeholder="예: 160"
            value={heightText}
            onChange={(e) => handleHeightChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                weightRef.current?.focus();
              }
            }}
          />
        </Field>

        <Field>
          <Label>임신 전 몸무게 (kg)</Label>
          <Input
            ref={weightRef}
            inputMode="decimal"
            pattern="[0-9.]*"
            placeholder="예: 50"
            value={weightText}
            onChange={(e) => handleWeightChange(e.target.value)}
          />
        </Field>
      </Row>

      {bmi != null && (
        <Preview>
          BMI 미리보기: <strong>{bmi}</strong>
        </Preview>
      )}

      <Hint>💡 입력하신 값은 개인 맞춤 운동 강도 추천에 사용돼요.</Hint>
    </Wrap>
  );
}

// 숫자(소수 포함) 정규화 공통 로직
const normalizeNumberInput = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  return parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join("")}`;
};

const Wrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 360px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.div`
  ${({ theme }) => theme.typography.label};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  background: ${({ theme }) => theme.colors.white};
  outline: none;

  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    border-color: ${({ theme }) => theme.colors.point};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }
`;

const Preview = styled.div`
  ${({ theme }) => theme.typography.body2};
  color: ${({ theme }) => theme.colors.text.primary};

  strong {
    font-weight: ${({ theme }) => theme.fontWeight.bold};
  }
`;

const Hint = styled.div`
  ${({ theme }) => theme.typography.caption};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

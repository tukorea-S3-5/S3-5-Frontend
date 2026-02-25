import styled from "styled-components";
import type { Dispatch } from "react";
import type { PregnancyAction } from "../usePregnancyOnboarding";

type Props = {
  height?: number;
  preWeight?: number;
  dispatch: Dispatch<PregnancyAction>;
};

export default function StepBody({ height, preWeight, dispatch }: Props) {
  return (
    <Wrap>
      <Field>
        <Label>키 (cm)</Label>
        <Input
          type="number"
          min="0"
          step="0.1"
          value={height ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_HEIGHT",
              value: Number(e.target.value) || 0,
            })
          }
        />
      </Field>
      <Field>
        <Label>임신 전 몸무게 (kg)</Label>
        <Input
          type="number"
          min="0"
          step="0.1"
          value={preWeight ?? ""}
          onChange={(e) =>
            dispatch({
              type: "SET_PRE_WEIGHT",
              value: Number(e.target.value) || 0,
            })
          }
        />
      </Field>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.sub};
  background: ${({ theme }) => theme.colors.white};
  outline: none;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.point};
  }
`;

import styled from "styled-components";
import type { Dispatch } from "react";
import { FitnessLevel } from "@/api/pregnancyInfo";
import type { PregnancyAction } from "../usePregnancyOnboarding";

type Props = {
  value?: FitnessLevel;
  dispatch: Dispatch<PregnancyAction>;
};

export default function StepFitness({ value, dispatch }: Props) {
  return (
    <Wrap>
      <Choice
        type="button"
        $active={value === FitnessLevel.ACTIVE}
        onClick={() =>
          dispatch({ type: "SET_FITNESS_LEVEL", value: FitnessLevel.ACTIVE })
        }
      >
        규칙적으로 운동했어요
      </Choice>
      <Choice
        type="button"
        $active={value === FitnessLevel.SEDENTARY}
        onClick={() =>
          dispatch({ type: "SET_FITNESS_LEVEL", value: FitnessLevel.SEDENTARY })
        }
      >
        거의 운동하지 않았어요
      </Choice>
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Choice = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.point : theme.colors.sub};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.light : theme.colors.white};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 600;
`;

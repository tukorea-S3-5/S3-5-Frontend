import styled from "styled-components";
import type { Dispatch } from "react";
import { PregnancyCondition } from "@/api/pregnancyInfo";
import type { PregnancyAction } from "../usePregnancyOnboarding";

type Props = {
  values: PregnancyCondition[];
  hasNoConditionSelected: boolean;
  dispatch: Dispatch<PregnancyAction>;
};

const conditionLabels: { value: PregnancyCondition; label: string }[] = [
  { value: PregnancyCondition.HYPERTENSION, label: "만성 고혈압" },
  { value: PregnancyCondition.THYROID_DISEASE, label: "갑상선 질환" },
  { value: PregnancyCondition.GESTATIONAL_DIABETES, label: "임신성 당뇨" },
  { value: PregnancyCondition.ANEMIA, label: "심한 빈혈" },
  { value: PregnancyCondition.BMI_RISK, label: "저체중 또는 고도 비만" },
];

export default function StepConditions({
  values,
  hasNoConditionSelected,
  dispatch,
}: Props) {
  return (
    <Wrap>
      {conditionLabels.map(({ value, label }) => {
        const active = values.includes(value);
        return (
          <Choice
            key={value}
            type="button"
            $active={active}
            onClick={() => dispatch({ type: "TOGGLE_CONDITION", value })}
          >
            {label}
          </Choice>
        );
      })}

      <NoCondition
        type="button"
        $active={hasNoConditionSelected}
        onClick={() => dispatch({ type: "SELECT_NO_CONDITION" })}
      >
        해당 사항 없음
      </NoCondition>
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

const NoCondition = styled(Choice)``;

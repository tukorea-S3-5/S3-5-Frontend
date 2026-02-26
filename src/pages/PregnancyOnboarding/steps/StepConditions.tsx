import styled from "styled-components";
import type { Dispatch } from "react";
import { PregnancyCondition } from "@/api/pregnancyInfo";
import type { PregnancyAction } from "../usePregnancyOnboarding";
import Checkbox from "@/components/Checkbox";

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
      <ListBox>
        {conditionLabels.map(({ value, label }) => (
          <Item key={value}>
            <Checkbox
              checked={values.includes(value)}
              onChange={() => dispatch({ type: "TOGGLE_CONDITION", value })}
              label={label}
            />
          </Item>
        ))}

        <Divider />

        <Item>
          <Checkbox
            checked={hasNoConditionSelected}
            onChange={() => dispatch({ type: "SELECT_NO_CONDITION" })}
            label="해당 사항 없음"
          />
        </Item>
      </ListBox>
    </Wrap>
  );
}

const Wrap = styled.div`
  width: 100%;
`;

const ListBox = styled.div`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: 16px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.white};
`;

const Item = styled.div`
  padding: 10px 2px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.colors.middle};
  opacity: 0.6;
  margin: 4px 0;
`;

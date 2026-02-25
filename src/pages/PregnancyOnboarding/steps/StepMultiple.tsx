import type { Dispatch } from "react";
import type { PregnancyAction } from "../usePregnancyOnboarding";
import ToggleButtonGroup from "../components/TogleButton";

type Props = {
  value?: boolean;
  dispatch: Dispatch<PregnancyAction>;
};

export default function StepMultiple({ value, dispatch }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      layout="row"
      options={[
        { value: false, title: "단태아", description: "(한 명)" },
        { value: true, title: "다태아", description: "(쌍둥이)" },
      ]}
      onChange={(v) => dispatch({ type: "SET_IS_MULTIPLE", value: v })}
    />
  );
}

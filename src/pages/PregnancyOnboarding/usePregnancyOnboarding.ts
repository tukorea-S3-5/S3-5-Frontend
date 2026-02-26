import { FitnessLevel, PregnancyCondition } from "@/api/pregnancyInfo";

// 멀티스텝 온보딩에서 모아 관리할 상태(현재 스텝 + 폼 데이터)
export type PregnancyState = {
  step: number; // 0~N
  lastMenstrualPeriod?: string;
  isMultiple?: boolean;
  height?: number;
  preWeight?: number;
  fitnessLevel?: FitnessLevel;
  conditions: PregnancyCondition[]; // 없으면 []
  hasNoConditionSelected: boolean;
};

// 초기 상태
export const initialState: PregnancyState = {
  step: 0,
  conditions: [],
  hasNoConditionSelected: false,
};

// action: 어떤 변경을 할지를 의미하는 이벤트
export type PregnancyAction =
  | { type: "SET_LMP"; value: string }
  | { type: "SET_IS_MULTIPLE"; value?: boolean }
  | { type: "SET_HEIGHT"; value?: number }
  | { type: "SET_PRE_WEIGHT"; value?: number }
  | { type: "SET_FITNESS_LEVEL"; value: FitnessLevel }
  | { type: "TOGGLE_CONDITION"; value: PregnancyCondition }
  | { type: "SELECT_NO_CONDITION" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "RESET" };

// reducer: action에 따라 상태를 규칙대로 업데이트하는 함수
export function pregnancyReducer(
  state: PregnancyState,
  action: PregnancyAction,
): PregnancyState {
  switch (action.type) {
    case "SET_LMP":
      return { ...state, lastMenstrualPeriod: action.value };

    case "SET_IS_MULTIPLE":
      return { ...state, isMultiple: action.value };

    case "SET_HEIGHT":
      return { ...state, height: action.value };

    case "SET_PRE_WEIGHT":
      return { ...state, preWeight: action.value };

    case "SET_FITNESS_LEVEL":
      return { ...state, fitnessLevel: action.value };

    // 다른 질환을 누르면 '해당 사항 없음' 자동 해제
    case "TOGGLE_CONDITION": {
      const exists = state.conditions.includes(action.value);
      const nextConditions = exists
        ? state.conditions.filter((c) => c !== action.value)
        : [...state.conditions, action.value];

      return {
        ...state,
        conditions: nextConditions,
        hasNoConditionSelected: false,
      };
    }

    // 해당 사항 없음 클릭시 위에 체크된 질환들을 전부 취소
    case "SELECT_NO_CONDITION":
      return {
        ...state,
        conditions: [],
        hasNoConditionSelected: true,
      };

    case "NEXT":
      return { ...state, step: Math.min(TOTAL_STEPS - 1, state.step + 1) };

    case "PREV":
      return { ...state, step: Math.max(0, state.step - 1) };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// 스텝별 다음 가능 여부
export function canGoNext(state: PregnancyState) {
  switch (state.step) {
    case 0:
      return !!state.lastMenstrualPeriod;
    case 1:
      return true;
    case 2:
      return (
        state.height != null &&
        state.height > 0 &&
        state.preWeight != null &&
        state.preWeight > 0
      );
    case 3:
      return !!state.fitnessLevel;
    case 4:
      // 질환 스텝은 "무조건 체크 후 넘어가게" 하기로 했었지
      return state.hasNoConditionSelected || state.conditions.length > 0;
    default:
      return true;
  }
}

export const TOTAL_STEPS = 5;

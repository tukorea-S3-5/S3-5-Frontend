import { useMemo, useReducer } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Button";
import StepIndicator from "./components/StepIndicator";
import OnboardingStepFrame from "./components/OnboardingStepFrame";
import ReferenceBox from "./components/ReferenceBox";

import lmpIcon from "@/assets/icons/pregnancy-onboarding/lmp.svg";
import isMultipleIcon from "@/assets/icons/pregnancy-onboarding/isMultiple.svg";
import bodyIcon from "@/assets/icons/pregnancy-onboarding/body.svg";
import exerciseIcon from "@/assets/icons/pregnancy-onboarding/exercise.svg";
import conditionIcon from "@/assets/icons/pregnancy-onboarding/condition.svg";

import { registerPregnancyInfo } from "../../api/pregnancyInfo";
import {
  TOTAL_STEPS,
  canGoNext,
  initialState,
  pregnancyReducer,
} from "./usePregnancyOnboarding";

import StepLmp from "./steps/StepLmp";
import StepMultiple from "./steps/StepMultiple";

export default function PregnancyOnboardingPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(pregnancyReducer, initialState);

  const nextEnabled = useMemo(() => canGoNext(state), [state]);
  const isLast = state.step === TOTAL_STEPS - 1;

  const isMultipleUnselected =
    state.step === 1 && state.isMultiple === undefined;

  // 이전/다음 처리
  const handlePrev = () => dispatch({ type: "PREV" });

  const handleNext = async () => {
    if (!nextEnabled) return;

    if (state.step === 1 && state.isMultiple === undefined) {
      dispatch({ type: "NEXT" });
      return;
    }

    // 마지막 스텝이면 제출
    if (isLast) {
      // 필수값 체크
      if (
        !state.lastMenstrualPeriod ||
        !state.height ||
        !state.preWeight ||
        !state.fitnessLevel
      ) {
        alert("필수 정보를 입력해 주세요.");
        return;
      }

      try {
        await registerPregnancyInfo({
          lastMenstrualPeriod: state.lastMenstrualPeriod,
          isMultiple: state.isMultiple ?? false, // 건너뛰면 false 처리
          height: state.height,
          preWeight: state.preWeight,
          fitnessLevel: state.fitnessLevel,
          conditions: state.hasNoConditionSelected ? [] : state.conditions,
        });

        navigate("/home", { replace: true });
      } catch (e) {
        console.error(e);
        alert("임신 정보 등록에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
      return;
    }

    dispatch({ type: "NEXT" });
  };

  // 스텝별 타이틀/서브타이틀
  const { title, subtitle } = useMemo(() => {
    switch (state.step) {
      case 0:
        return {
          title: "마지막 생리일을 알려주세요",
          subtitle:
            "마지막 생리 시작일(LMP)을 기준으로 출산 예정일을 계산합니다.",
        };
      case 1:
        return {
          title: "다태아 여부를 알려주세요",
          subtitle: "다태아 임신 여부를 선택해 주세요",
        };
      case 2:
        return {
          title: "키와 임신 전 몸무게를 알려주세요",
          subtitle: "체질량지수(BMI)를 계산하여 건강 관리에 활용합니다.",
        };
      case 3:
        return {
          title: "임신 전, 평소 운동을 즐겨 하셨나요?",
          subtitle: "운동 수준에 따라 안전한 강도를 추천해드릴게요.",
        };
      case 4:
        return {
          title: "현재 앓고 계신 질환이 있나요?",
          subtitle:
            "해당 항목이 있다면 안전을 위해 저강도 운동부터 추천해 드릴게요.",
        };
      default:
        return { title: "", subtitle: "" };
    }
  }, [state.step]);

  // 스텝별 아이콘
  const iconSrc = useMemo(() => {
    switch (state.step) {
      case 0:
        return lmpIcon;
      case 1:
        return isMultipleIcon;
      case 2:
        return bodyIcon;
      case 3:
        return exerciseIcon;
      case 4:
        return conditionIcon;
      default:
        return lmpIcon;
    }
  }, [state.step]);

  return (
    <Screen>
      {/* 단계 표시 */}
      <StepIndicator total={TOTAL_STEPS} current={state.step} />

      {/* 공통 프레임(InfoBox + 입력 영역 + 참고박스) */}
      <OnboardingStepFrame
        icon={<InfoIcon src={iconSrc} alt="onboarding icon" />}
        title={title}
        subtitle={<>{subtitle}</>}
        helper={
          state.step === 0 ? (
            <ReferenceBox>
              마지막 생리일(LMP)을 기준으로 임신 주차가 계산됩니다. 정확한
              주차는 산부인과 초음파 검사로 확인하세요.
            </ReferenceBox>
          ) : state.step === 1 ? (
            <ReferenceBox>
              다태아 임신은 단태아보다 더 많은 주의와 관리가 필요합니다. 맞춤형
              가이드를 제공합니다.
            </ReferenceBox>
          ) : state.step === 2 ? (
            <ReferenceBox>
              키와 체중 정보는 체질량지수(BMI)를 계산하여 임신 중 적정 체중
              증가량을 안내하는 데 사용됩니다.
            </ReferenceBox>
          ) : undefined
        }
      >
        {state.step === 0 && (
          <StepLmp
            value={state.lastMenstrualPeriod ?? ""}
            dispatch={dispatch}
          />
        )}

        {state.step === 1 && (
          <StepMultiple value={state.isMultiple} dispatch={dispatch} />
        )}
      </OnboardingStepFrame>

      {/* 하단 버튼 */}
      <Footer>
        <Button
          variant="outlined"
          size="long"
          onClick={handlePrev}
          disabled={state.step === 0}
          type="button"
        >
          이전
        </Button>

        <Button
          variant="primary"
          size="long"
          onClick={handleNext}
          disabled={!nextEnabled}
          type="button"
        >
          {isLast ? "완료" : isMultipleUnselected ? "건너뛰기" : "다음"}
        </Button>
      </Footer>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100vh;
  padding: 70px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const InfoIcon = styled.img`
  width: 34px;
  height: 34px;
`;

const Footer = styled.div`
  width: 100%;
  max-width: 420px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

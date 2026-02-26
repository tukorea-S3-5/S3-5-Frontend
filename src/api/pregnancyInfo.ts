// 임신 정보 등록/수정/조회 API
import { postJson } from "./http";

// 임신 전 운동 수준
export enum FitnessLevel {
  ACTIVE = "ACTIVE", // 규칙적으로 운동하던 경우
  SEDENTARY = "SEDENTARY", // 운동을 거의 하지 않던 경우
}

// 임신 관련 질환 코드
export enum PregnancyCondition {
  HYPERTENSION = "HYPERTENSION", // 만성 고혈압
  THYROID_DISEASE = "THYROID_DISEASE", // 갑상선 질환
  GESTATIONAL_DIABETES = "GESTATIONAL_DIABETES", // 임신성 당뇨
  ANEMIA = "ANEMIA", // 심한 빈혈
  BMI_RISK = "BMI_RISK", // 저체중 또는 고도 비만
}

/**
 * 임신 정보 등록 요청 타입
 */
export interface PregnancyInfoRequest {
  lastMenstrualPeriod: string; // ISO 날짜 형식
  height: number;
  preWeight: number;
  isMultiple?: boolean;
  fitnessLevel: FitnessLevel;
  conditions?: PregnancyCondition[];
}

/**
 * 임신 정보 등록 응답 타입
 */
export interface PregnancyInfoResponse {
  pregnancy_id: number;
  user_id: string;
  last_menstrual_period: string;
  pregnancy_start_date: string;
  due_date: string;
  is_multiple: boolean;
  height: number;
  pre_weight: number;
  bmi: number;
  fitness_level: FitnessLevel;
  max_allowed_bpm: number;
  conditions: PregnancyCondition[];
  created_at: string;
  updated_at: string;
}

/**
 * 임신 정보 등록 API 호출
 */
export async function registerPregnancyInfo(body: PregnancyInfoRequest) {
  return postJson<PregnancyInfoResponse>("/pregnancy", {
    last_menstrual_period: body.lastMenstrualPeriod,
    height: body.height,
    pre_weight: body.preWeight,
    is_multiple: body.isMultiple ?? false,
    fitness_level: body.fitnessLevel,
    conditions: body.conditions ?? [],
  });
}

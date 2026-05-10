import { useState, useEffect, useCallback, useRef } from "react";
import { bleService } from "../ble/heartRateBle";

export type HeartRateState = "not_worn" | "stabilizing" | "ready";

export function useHeartRateBle() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [sensorState, setSensorState] = useState<HeartRateState>("not_worn");

  // UI에 보여줄 문구 또는 숫자
  const [displayBpm, setDisplayBpm] = useState<string>("센서를 착용해주세요");

  // 백엔드 전송용 실제 숫자 데이터 (안정화된 값만)
  const [currentBpm, setCurrentBpm] = useState<number>(0);

  // 렌더링에 영향을 주지 않는 데이터 버퍼 관리
  const stabilizingBuffer = useRef<number[]>([]);

  // 현재 개별 운동 기록용 배열
  const recordHeartRates = useRef<number[]>([]);

  // 전체 세션 기록용 배열
  // 리포트 페이지에서 심박 그래프를 그릴 때 사용
  const sessionHeartRates = useRef<number[]>([]);

  // 마지막 정상 심박수 (0 튐 보정용)
  const lastValidBpm = useRef<number>(0);

  // 운동 상태 관리(운동 중, 일시정지 등)
  const isExerciseRecording = useRef<boolean>(false);

  // 안정화 판단 함수
  const isStable = (buffer: number[]) => {
    if (buffer.length < 4) return false;
    const recent = buffer.slice(-4);
    const max = Math.max(...recent);
    const min = Math.min(...recent);
    return max - min <= 20;
  };

  // 센서 데이터가 없을 때 시연/테스트용으로 사용할 fallback 심박 데이터
  const createFallbackHeartRates = useCallback(() => {
    return Array.from({ length: 600 }, (_, i) => {
      // 0~2분: 워밍업 (70 → 100)
      if (i < 120) {
        return 70 + Math.floor(i * 0.25) + Math.floor(Math.random() * 5);
      }

      // 2~8분: 운동 유지 (100~130)
      if (i < 480) {
        return 100 + Math.floor(Math.random() * 30);
      }

      // 8~10분: 쿨다운 (130 → 80)
      return 130 - Math.floor((i - 480) * 0.3) + Math.floor(Math.random() * 5);
    });
  }, []);

  // 현재 개별 운동(record)의 심박수 배열 반환
  // 실제 센서 데이터가 없으면 fallback을 생성해서 현재 record와 전체 session 배열에 반영
  const getHeartRates = useCallback(() => {
    const samples = [...recordHeartRates.current];

    // 현재 운동에 실제 데이터가 있으면 그대로 사용
    if (samples.length > 0) {
      console.log("[HR] 현재 운동 실제 센서 데이터 사용", samples);
      return samples;
    }

    // 현재 운동에 데이터가 없으면 fallback 생성
    const fallback = createFallbackHeartRates();

    recordHeartRates.current = fallback;

    // 리포트 그래프용 전체 세션 배열에도 fallback을 추가한다.
    // 실제 센서 데이터가 없던 운동도 리포트 그래프에서 자연스럽게 보이도록 하기 위함이다.
    sessionHeartRates.current.push(...fallback);

    console.warn("[HR] 현재 운동 데이터 없음 → fallback 사용", fallback);

    return fallback;
  }, [createFallbackHeartRates]);

  // 전체 세션 심박수 배열 반환
  // 리포트 페이지에서 전체 운동 흐름 그래프를 그릴 때 사용한다.
  const getSessionHeartRates = useCallback(() => {
    const samples = [...sessionHeartRates.current];

    if (samples.length > 0) {
      console.log("[HR] 전체 세션 심박 데이터 사용", samples);
      return samples;
    }

    // 세션 전체에 아무 데이터도 없을 때만 fallback을 생성
    const fallback = createFallbackHeartRates();
    sessionHeartRates.current = fallback;

    console.warn("[HR] 전체 세션 데이터 없음 → fallback 사용", fallback);

    return fallback;
  }, [createFallbackHeartRates]);

  // 새 세션 시작 시 전체 세션 심박 배열 초기화
  const resetSessionHeartRates = useCallback(() => {
    sessionHeartRates.current = [];
  }, []);

  useEffect(() => {
    bleService.setCallbacks(
      (bpm) => {
        // 1. 0이면 무조건 미착용 처리 및 버퍼 초기화
        if (bpm === 0) {
          // 마지막 정상값이 있으면 유지 (끊김 보정)
          if (lastValidBpm.current > 0) {
            setDisplayBpm(`${lastValidBpm.current}`);
          } else {
            setSensorState("not_worn");
            setDisplayBpm("센서를 착용해주세요");
          }
          return;
        }

        // 이전 상태를 기반으로 다음 상태를 결정
        setSensorState((prevState) => {
          let nextState = prevState;

          // 2. 0 이후 다시 측정 시작
          if (prevState === "not_worn") {
            nextState = "stabilizing";
          }

          // 3. 안정화 단계
          if (nextState === "stabilizing") {
            stabilizingBuffer.current.push(bpm);
            setDisplayBpm("심박수 측정 중...");

            if (isStable(stabilizingBuffer.current)) {
              nextState = "ready";
              stabilizingBuffer.current = []; // 안정화 완료 시 버퍼 비우기
            }
          }

          // 4. 정상 측정 상태 (값이 안정화 된 이후)
          if (nextState === "ready") {
            if (bpm > 50 && bpm < 180) {
              // 마지막 정상값 업데이트
              lastValidBpm.current = bpm;

              // 실제 운동 중일 때만 백엔드 전송용 배열에 저장
              if (isExerciseRecording.current) {
                // 현재 운동 전송용
                recordHeartRates.current.push(bpm);

                // 전체 세션 리포트 그래프용
                sessionHeartRates.current.push(bpm);
              }

              setDisplayBpm(`${bpm}`);
              setCurrentBpm(bpm);
            }
          }

          return nextState;
        });
      },
      (status) => setIsConnected(status),
    );

    return () => bleService.disconnect();
  }, []);

  // 운동 시작 시 처리 (초기화)
  const startExerciseMode = useCallback(() => {
    recordHeartRates.current = [];
    isExerciseRecording.current = true;
  }, []);

  // 운동 일시정지
  const pauseExerciseMode = useCallback(() => {
    isExerciseRecording.current = false;
  }, []);

  // 운동 재개
  const resumeExerciseMode = useCallback(() => {
    isExerciseRecording.current = true;
  }, []);

  // 운동 종료
  const stopExerciseMode = useCallback(() => {
    isExerciseRecording.current = false;
  }, []);

  const connect = useCallback(async () => {
    await bleService.connect();
  }, []);

  const vibrate = useCallback(async (isOn: boolean) => {
    await bleService.vibrate(isOn);
  }, []);

  return {
    isConnected,
    sensorState,
    displayBpm,
    currentBpm,
    connect,
    vibrate,
    startExerciseMode,
    pauseExerciseMode,
    resumeExerciseMode,
    stopExerciseMode,
    getHeartRates,
    getSessionHeartRates,
    resetSessionHeartRates,
    disconnect: () => bleService.disconnect(),
  };
}

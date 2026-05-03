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

  // 운동 전체 기록용 배열
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

  useEffect(() => {
    bleService.setCallbacks(
      (bpm) => {
        // 1. 0이면 무조건 미착용 처리 및 버퍼 초기화
        if (bpm === 0) {
          stabilizingBuffer.current = [];
          setSensorState("not_worn");
          setCurrentBpm(0);

          // 마지막 정상값이 있으면 유지 (끊김 보정)
          if (lastValidBpm.current > 0) {
            setDisplayBpm(`${lastValidBpm.current}`);
          } else {
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
    sessionHeartRates.current = [];
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

  // 심박수 배열 전달 처리 (정상/fallback 상황)
  const getHeartRateSamples = useCallback(() => {
    const samples = [...sessionHeartRates.current];

    // 실제 데이터 있으면 그대로 사용
    if (samples.length > 0) {
      console.log("[HR] 실제 센서 데이터 사용", samples);
      return samples;
    }

    // fallback 데이터 생성 (졸작용)
    const fallback = Array.from({ length: 600 }, (_, i) => {
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

    console.warn("[HR] 센서 데이터 없음 → fallback 사용", fallback);

    return fallback;
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
    getHeartRateSamples,
    disconnect: () => bleService.disconnect(),
  };
}

import { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { postJson } from "../api/http";
import { useHeartRateBle } from "../services/hooks/userHeartRateBle";
import heartbeatGif from "../assets/icons/heartbeat.gif";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (bpm: number) => void;
}

type Step = "connect" | "measuring" | "done";

const MEASURE_SEC = 60;

export default function RestingHeartRateModal({
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const { isConnected, currentBpm, sensorState, connect } = useHeartRateBle();

  const [step, setStep] = useState<Step>("connect");
  const [countdown, setCountdown] = useState(MEASURE_SEC);
  const [bpmSamples, setBpmSamples] = useState<number[]>([]);
  const [avgBpm, setAvgBpm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // BLE 연결 완료 → measuring
  useEffect(() => {
    if (isConnected && step === "connect") {
      setStep("measuring");
      setCountdown(MEASURE_SEC);
      setBpmSamples([]);
    }
  }, [isConnected, step]);

  // 카운트다운 + BPM 수집
  useEffect(() => {
    if (step !== "measuring") return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
      if (currentBpm && currentBpm > 30 && currentBpm < 200) {
        setBpmSamples((prev) => [...prev, currentBpm]);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, currentBpm]);

  // 카운트다운 0 → 평균 계산 + 저장
  useEffect(() => {
    if (step !== "measuring" || countdown > 0) return;
    const avg =
      bpmSamples.length > 0
        ? Math.round(bpmSamples.reduce((a, b) => a + b, 0) / bpmSamples.length)
        : null;
    setAvgBpm(avg);
    setStep("done");
    if (avg) {
      setSaving(true);
      postJson("/heart-rate/resting", { bpm: avg })
        .then(() => onSaved?.(avg))
        .catch((e) => console.error("[RestingHR] 저장 실패:", e))
        .finally(() => setSaving(false));
    }
  }, [countdown, step, bpmSamples, onSaved]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("connect");
    setCountdown(MEASURE_SEC);
    setBpmSamples([]);
    setAvgBpm(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Backdrop onClick={handleClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        {/* ── 연결 단계 ── */}
        {step === "connect" && (
          <>
            <Title>안정 심박수 측정</Title>
            <Desc>
              워치와 블루투스를 연결한 뒤{"\n"}1분간 안정 심박수를 측정합니다.
              {"\n"}편안하게 앉아 센서에 손가락을 올려주세요.
            </Desc>
            <PrimaryBtn onClick={connect}>블루투스 연결하기</PrimaryBtn>
            <TextBtn onClick={handleClose}>나중에 할게요</TextBtn>
          </>
        )}

        {/* ── 측정 중 단계 ── */}
        {step === "measuring" && (
          <>
            <Title>측정 중...</Title>
            <Desc>편안하게 앉아 움직이지 마세요</Desc>

            <img
              src={heartbeatGif}
              alt="측정 중"
              style={{ width: 140, height: 140, objectFit: "contain" }}
            />

            <BpmRow>
              <BpmNum>{currentBpm ?? "—"}</BpmNum>
              <BpmUnit>bpm</BpmUnit>
            </BpmRow>

            {sensorState !== "ready" && (
              <SensorHint>센서를 손가락에 안정적으로 올려주세요</SensorHint>
            )}

            <RingWrap>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#fbe3dd"
                  strokeWidth="7"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#e88b8b"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (countdown / MEASURE_SEC)}`}
                  transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <RingLabel>{countdown}초</RingLabel>
            </RingWrap>

            <OutlineBtn onClick={handleClose}>취소</OutlineBtn>
          </>
        )}

        {/* ── 완료 단계 ── */}
        {step === "done" && (
          <>
            <BigEmoji>🎉</BigEmoji>
            <Title>측정 완료!</Title>
            <Desc>오늘의 평소 심박수</Desc>
            <BpmRow>
              <BpmNum>{avgBpm ?? "—"}</BpmNum>
              <BpmUnit>bpm</BpmUnit>
            </BpmRow>
            {saving && <SensorHint>저장 중...</SensorHint>}
            <PrimaryBtn onClick={handleClose} disabled={saving}>
              확인
            </PrimaryBtn>
          </>
        )}
      </Card>
    </Backdrop>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.93); }
  to   { opacity: 1; transform: scale(1); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 28px;
  padding: 32px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  animation: ${fadeIn} 0.25s ease;
`;

const BigEmoji = styled.div`
  font-size: 52px;
  line-height: 1;
  margin-bottom: 4px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #2c1b1b;
  margin: 0;
  text-align: center;
`;

const Desc = styled.p`
  font-size: 14px;
  color: #7c7070;
  margin: 0;
  text-align: center;
  white-space: pre-line;
  line-height: 1.7;
`;

const BpmRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const BpmNum = styled.span`
  font-size: 52px;
  font-weight: 800;
  color: #e88b8b;
  line-height: 1;
`;

const BpmUnit = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #a8a8a8;
`;

const SensorHint = styled.p`
  font-size: 12px;
  color: #a8a8a8;
  margin: 0;
  text-align: center;
`;

const RingWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
`;

const RingLabel = styled.span`
  position: absolute;
  font-size: 18px;
  font-weight: 800;
  color: #2c1b1b;
`;

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #e88b8b;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  transition: filter 0.15s;
  &:hover:not(:disabled) {
    filter: brightness(0.93);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OutlineBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: none;
  border: 1px solid #f4c9c2;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #a8a8a8;
  cursor: pointer;
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: #bbb;
  cursor: pointer;
  padding: 4px;
  &:hover {
    color: #999;
  }
`;

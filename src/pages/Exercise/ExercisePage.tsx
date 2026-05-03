import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Modal from "@components/Modal";
import DeviceConnection from "./components/DeviceConnection";
import ExerciseListItem from "./components/ExerciseListItem";
import { getJson, postJson } from "../../api/http";
import { useHeartRateBle } from "../../services/hooks/userHeartRateBle";

// YouTube IFrame API를 window.YT로 사용하기 위한 타입 선언
declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  getDuration(): number;
  destroy(): void;
}

// 운동 화면에서 사용하는 최소 운동 정보
// ExerciseListPage에서 선택한 운동 목록이 location.state로 전달
interface Exercise {
  id: number;
  title: string;
  videoUrl: string;
}

// 백엔드에서 생성한 운동 기록 단위
// exercise_id와 record_id를 매칭해서 pause/resume/end API를 호출
interface SessionRecord {
  record_id: number;
  exercise_id: number;
}

// /pregnancy/me 응답 중 이 화면에서 필요한 값만 정의
// max_allowed_bpm을 넘으면 진동 알림
interface PregnancyMeResponse {
  max_allowed_bpm?: number | null;
}

type PlayState = "idle" | "playing" | "paused";

// 초 단위 시간을 0:00 형태로 표시하기 위한 유틸 함수
const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// YouTube URL에서 영상 ID만 추출
const toVideoId = (url: string) =>
  url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)?.[1] ?? "";

export default function ExercisePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { exercises, session } = (location.state as {
    exercises: Exercise[];
    session?: { session_id: number; records: SessionRecord[] };
  }) ?? { exercises: [] };

  // BLE 관련 상태와 제어 함수는 커스텀 훅에서 가져옴
  // 이 페이지는 UI/운동 흐름을 담당하고
  // 실제 블루투스 통신은 useHeartRateBle 내부에서 처리
  const {
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
  } = useHeartRateBle();

  // 현재 몇 번째 운동을 진행 중인지 나타내는 인덱스
  const [currentIndex, setCurrentIndex] = useState(0);

  // 영상 재생 상태: idle(대기), playing(운동 중), paused(일시정지)
  const [playState, setPlayState] = useState<PlayState>("idle");

  // 영상 전체 길이와 현재 진행 시간을 초 단위로 관리
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // YouTube IFrame API가 로드되었는지 여부
  const [ytReady, setYtReady] = useState(false);

  // 전체 운동 종료 확인 모달 상태
  const [stopModal, setStopModal] = useState(false);

  // 운동 목록에서 다른 운동을 눌렀을 때 전환 확인 모달 상태
  const [switchModal, setSwitchModal] = useState<{
    open: boolean;
    targetIndex: number;
  }>({ open: false, targetIndex: 0 });

  // 사용자별 최대 허용 심박수
  // 백엔드 /pregnancy/me에서 조회한 값을 저장
  const [maxAllowedBpm, setMaxAllowedBpm] = useState<number | null>(null);

  // YouTube Player 객체 저장
  // player 객체 변경이 화면 렌더링을 유발할 필요는 없어서 ref 사용
  const playerRef = useRef<YTPlayer | null>(null);

  // YouTube Player가 들어갈 div DOM을 참조
  const playerElRef = useRef<HTMLDivElement>(null);

  // 운동 경과 시간 타이머의 interval id를 저장
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 진동이 너무 자주 울리지 않도록 마지막 진동 시각을 저장
  const lastVibrationAtRef = useRef<number>(0);

  // 현재 화면에서 재생할 운동 정보
  const current = exercises[currentIndex];

  // 마지막 운동인지 여부
  const isLast = currentIndex === exercises.length - 1;

  // 현재 운동의 exercise_id에 해당하는 record_id 탐색
  // 백엔드 record API는 exercise_id가 아니라 record_id를 기준으로 동작
  const getRecordId = (exerciseId: number | string) =>
    session?.records?.find((r) => r.exercise_id === Number(exerciseId))
      ?.record_id ?? null;

  // YouTube IFrame API 로드
  // 이미 로드되어 있으면 바로 ytReady를 true로 만들고
  // 없으면 script 태그를 한 번만 추가
  useEffect(() => {
    if (window.YT?.Player) {
      setYtReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // 사용자별 최대 허용 심박수 조회
  // 운동 중 currentBpm이 이 값을 넘으면 ESP32로 진동 명령 전송
  useEffect(() => {
    getJson<PregnancyMeResponse>("/pregnancy/me")
      .then((data) => {
        if (typeof data.max_allowed_bpm === "number") {
          setMaxAllowedBpm(data.max_allowed_bpm);
        }
      })
      .catch((error) => {
        console.error("[pregnancy/me] 최대 허용 심박수 조회 실패:", error);
      });
  }, []);

  // 운동이 바뀌거나 BLE 연결이 완료되면 YouTube Player 생성
  // autoplay는 0으로 두고 심박 측정이 안정화된 뒤 사용자가 직접 시작하게 함
  useEffect(() => {
    if (!current) return;
    if (!ytReady || !playerElRef.current || !isConnected) return;

    playerRef.current?.destroy();
    setPlayState("idle");
    setElapsed(0);
    setDuration(0);

    playerRef.current = new window.YT.Player(playerElRef.current, {
      videoId: toVideoId(current.videoUrl),
      playerVars: { controls: 0, rel: 0, modestbranding: 1, autoplay: 0 },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          setDuration(e.target.getDuration());
          setPlayState("idle");
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            setPlayState("idle");
            stopExerciseMode();

            handleRecordEnd(current.id, () => {
              isLast ? finishAll() : goNext();
            });
          }
        },
      },
    });
  }, [ytReady, currentIndex, isConnected, current, isLast, stopExerciseMode]);

  // 영상이 playing 상태일 때만 1초마다 경과 시간 증가
  // paused/idle 상태에서는 타이머 정지
  useEffect(() => {
    if (playState === "playing") {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playState]);

  // 운동 중 심박수가 최대 허용 심박수를 넘으면 진동 알림 전송
  // 10초 쿨다운을 두어 계속 진동하지 않도록 제한
  useEffect(() => {
    if (playState !== "playing") return;
    if (!maxAllowedBpm) return;
    if (!currentBpm || currentBpm <= maxAllowedBpm) return;

    const now = Date.now();
    const vibrationCooldownMs = 10000;

    if (now - lastVibrationAtRef.current < vibrationCooldownMs) return;

    lastVibrationAtRef.current = now;

    vibrate(true).catch((error) => {
      console.error("[vibration] 진동 명령 전송 실패:", error);
    });
  }, [currentBpm, maxAllowedBpm, playState, vibrate]);

  // 현재 진행 중인 운동의 record_id를 가져오는 helper
  const getActiveRecordId = () => getRecordId(current.id);

  // 현재 운동 record를 종료 처리
  // 성공/실패 관계없이 onDone 실행해서 다음 운동 또는 리포트로 이동
  const handleRecordEnd = async (exerciseId: number, onDone: () => void) => {
    const recordId = getRecordId(exerciseId);
    console.log(
      "[record/end] exerciseId:",
      exerciseId,
      "| recordId:",
      recordId,
    );

    if (recordId) {
      try {
        const res = await postJson("/exercise/record/end", {
          record_id: recordId,
        });
        console.log("[record/end] 성공:", res);
      } catch (e) {
        console.error("[record/end] 실패:", e);
      }
    } else {
      console.warn(
        "[record/end] recordId 없음 - session.records:",
        JSON.stringify(session?.records),
      );
    }

    console.log("[heart-rate samples]", getHeartRateSamples());
    onDone();
  };

  // 현재 운동 record를 일시정지 상태로 변경
  const handleRecordPause = async () => {
    const recordId = getActiveRecordId();
    console.log(
      "[record/pause] recordId:",
      recordId,
      "| playState:",
      playState,
    );

    if (recordId) {
      try {
        const res = await postJson("/exercise/record/pause", {
          record_id: recordId,
        });
        console.log("[record/pause] 성공:", res);
      } catch (e) {
        console.error("[record/pause] 실패:", e);
      }
    }
  };

  // 일시정지된 현재 운동 record를 다시 진행 상태로 변경
  const handleRecordResume = async () => {
    const recordId = getActiveRecordId();

    if (recordId) {
      try {
        await postJson("/exercise/record/resume", { record_id: recordId });
      } catch (e) {
        console.error("[record/resume] 실패:", e);
      }
    }
  };

  // 전체 운동을 중도 종료할 때 현재 진행 중인 record만 종료
  // 이후 리포트 화면으로 이동
  const handleSessionEnd = async () => {
    const recordId = getActiveRecordId();
    console.log(
      "[session/end] 중도종료 | recordId:",
      recordId,
      "| session_id:",
      session?.session_id,
    );

    if (recordId) {
      try {
        const res = await postJson("/exercise/record/end", {
          record_id: recordId,
        });
        console.log("[session/end] record/end 성공:", res);
      } catch (e) {
        console.error("[session/end] record/end 실패:", e);
      }
    }
  };

  // 다음 운동으로 이동
  const goNext = () => setCurrentIndex((p) => p + 1);

  // 모든 운동이 끝났거나 중도 종료했을 때 리포트 화면으로 이동
  const finishAll = () => {
    console.log("[finishAll] sessionId:", session?.session_id);
    navigate("/report", {
      state: { exercises, sessionId: session?.session_id },
    });
  };

  // 시작 버튼 클릭 시 실행
  const handleStart = () => {
    if (!isConnected) return;

    playerRef.current?.playVideo();
    setPlayState("playing");
    startExerciseMode();
  };

  // 일시정지 버튼 클릭 시 실행
  // 영상과 record 멈추고 심박 배열 저장도 중단
  const handlePause = async () => {
    playerRef.current?.pauseVideo();
    setPlayState("paused");
    pauseExerciseMode();
    await handleRecordPause();
  };

  // 재개 버튼 클릭 시 실행
  // 영상과 record를 재개하고 기존 심박 배열에 이어서 저장
  const handleResume = async () => {
    playerRef.current?.playVideo();
    setPlayState("playing");
    resumeExerciseMode();
    await handleRecordResume();
  };

  // 현재 운동을 완료하고 다음 운동 또는 리포트로 이동
  const handleCurrentEnd = () => {
    stopExerciseMode();
    playerRef.current?.pauseVideo();

    handleRecordEnd(current.id, () => {
      isLast ? finishAll() : goNext();
    });
  };

  // 전체 운동 종료 모달 열기
  const handleStopAll = () => setStopModal(true);

  // 전체 운동 종료를 확정했을 때 실행
  // 현재 record를 종료하고 리포트로 이동
  const handleStopConfirm = async () => {
    stopExerciseMode();
    setStopModal(false);
    await handleSessionEnd();
    finishAll();
  };

  // 운동 목록에서 다른 운동으로 이동하기를 확정했을 때 실행
  // 현재 운동 중이면 pause 처리 후 선택한 운동으로 전환
  const handleSwitchConfirm = async () => {
    const target = switchModal.targetIndex;
    setSwitchModal({ open: false, targetIndex: 0 });

    if (playState === "playing") {
      playerRef.current?.pauseVideo();
      setPlayState("paused");
      pauseExerciseMode();
      await handleRecordPause();
    }

    setCurrentIndex(target);
  };

  // location.state에 운동 정보가 없으면 렌더링 안함
  if (!current) return null;

  // displayBpm이 숫자면 bpm 단위를 붙이고
  // "센서를 착용해주세요" 같은 문구면 단위 안붙임
  const isDisplayNumeric = !isNaN(Number(displayBpm));

  // IoT 연결되면 운동 시작 버튼 활성화
  const canStartExercise = isConnected;

  return (
    <>
      {/* BLE 연결 모달 */}
      <DeviceConnection
        isOpen={!isConnected}
        onConnect={connect}
        onConnected={() => console.log("BLE 연결 완료")}
        onCancel={() => navigate(-1)}
      />

      {isConnected && (
        <Container>
          <Header>
            <PageTitle>영상을 보고 따라해보세요!</PageTitle>
            <StopAllButton onClick={handleStopAll}>운동 종료</StopAllButton>
          </Header>

          <VideoBox>
            <div ref={playerElRef} style={{ width: "100%", height: "100%" }} />
          </VideoBox>

          {/* 남은 시간과 실시간 심박수 표시 영역 */}
          <StatsRow>
            <StatCard>
              <StatLabel>남은 시간</StatLabel>
              <StatValue>
                {duration > 0
                  ? formatTime(Math.max(duration - elapsed, 0))
                  : "--:--"}
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>❤️ 심박수</StatLabel>
              <StatValue
                style={{ fontSize: isDisplayNumeric ? "30px" : "15px" }}
              >
                {displayBpm}
                {isDisplayNumeric && <StatUnit>bpm</StatUnit>}
              </StatValue>

              {sensorState !== "ready" && (
                <div style={{ fontSize: "12px", color: "#999" }}>
                  센서를 손가락에 안정적으로 올려주세요
                </div>
              )}
            </StatCard>
          </StatsRow>

          <ExerciseInfo>
            <ExTitle>{current.title}</ExTitle>
            <ExMeta>
              {currentIndex + 1}/{exercises.length}
            </ExMeta>
          </ExerciseInfo>

          {/* 시작/일시정지/재개/다음 운동 버튼 */}
          <ControlRow>
            {playState === "idle" && (
              <ActionButton disabled={!canStartExercise} onClick={handleStart}>
                {canStartExercise ? "▷ 시작하기" : "심박 측정 후 시작 가능"}
              </ActionButton>
            )}

            {playState === "playing" && (
              <>
                <ActionButton $variant="outline" onClick={handlePause}>
                  일시정지
                </ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {isLast ? "운동 완료" : "다음 운동"}
                </ActionButton>
              </>
            )}

            {playState === "paused" && (
              <>
                <ActionButton onClick={handleResume}>▷ 재개하기</ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {isLast ? "운동 완료" : "다음 운동"}
                </ActionButton>
              </>
            )}
          </ControlRow>

          {/* 전체 운동 목록 */}
          <ListSection>
            <ListTitle>운동 목록</ListTitle>
            {exercises.map((ex, idx) => (
              <ExerciseListItem
                key={ex.id}
                index={idx + 1}
                title={ex.title}
                isActive={idx === currentIndex}
                onClick={() =>
                  idx !== currentIndex &&
                  setSwitchModal({ open: true, targetIndex: idx })
                }
              />
            ))}
          </ListSection>

          <Modal
            isOpen={stopModal}
            onClose={() => setStopModal(false)}
            showCloseButton={false}
          >
            <ModalBody>
              <ModalEmoji>⚠️</ModalEmoji>
              <ModalTitle>운동을 종료할까요?</ModalTitle>
              <ModalDesc>
                운동이 아직 남아있어요.{"\n"}지금 종료하면 리포트로 이동합니다.
              </ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setStopModal(false)}>
                  계속할게요
                </ModalOutlineBtn>
                <ModalFillBtn onClick={handleStopConfirm}>
                  종료하기
                </ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>

          <Modal
            isOpen={switchModal.open}
            onClose={() => setSwitchModal({ open: false, targetIndex: 0 })}
            showCloseButton={false}
          >
            <ModalBody>
              <ModalTitle>다른 운동으로 이동할까요?</ModalTitle>
              <ModalDesc>
                현재 <strong>{current.title}</strong>을 중단하고
                <br />
                <strong>{exercises[switchModal.targetIndex]?.title}</strong>으로
                이동합니다
              </ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn
                  onClick={() =>
                    setSwitchModal({ open: false, targetIndex: 0 })
                  }
                >
                  돌아가기
                </ModalOutlineBtn>
                <ModalFillBtn onClick={handleSwitchConfirm}>
                  {exercises[switchModal.targetIndex]?.title} 시작
                </ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 24px 16px 120px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  ${({ theme }) => theme.typography.heading2}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const StopAllButton = styled.button`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: 6px 14px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.point};
    color: ${({ theme }) => theme.colors.point};
  }
`;

const VideoBox = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-shrink: 0;
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatCard = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;

const StatValue = styled.p`
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.point};
  margin: 0;
  line-height: 1.2;
`;

const StatUnit = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
  margin-left: 4px;
`;

const ExerciseInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ExTitle = styled.h2`
  ${({ theme }) => theme.typography.heading2}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const ExMeta = styled.p`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;

const ControlRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionButton = styled.button<{ $variant?: "outline" | "danger" }>`
  flex: 1;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case "outline":
        return `
          background: transparent;
          border: 1.5px solid ${theme.colors.point};
          color: ${theme.colors.point};

          &:hover {
            background: ${theme.colors.light};
          }
        `;
      case "danger":
        return `
          background: ${theme.colors.point};
          border: none;
          color: ${theme.colors.white};

          &:hover {
            filter: brightness(0.92);
          }
        `;
      default:
        return `
          background: ${theme.colors.light};
          border: 1px solid ${theme.colors.point};
          color: ${theme.colors.point};

          &:hover {
            background: ${theme.colors.sub};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ListTitle = styled.h3`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const ModalEmoji = styled.span`
  font-size: 40px;
`;

const ModalTitle = styled.p`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const ModalDesc = styled.p`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
  white-space: pre-line;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ModalOutlineBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.point};
  background: transparent;
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.light};
  }
`;

const ModalFillBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme }) => theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;

  &:hover {
    filter: brightness(0.92);
  }
`;

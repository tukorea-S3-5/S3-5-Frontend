import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Modal from "@components/Modal";
import DeviceConnection from "./components/DeviceConnection";
import ExerciseListItem from "./components/ExerciseListItem";
import RestingHeartRateModal from "../../components/RestingHeartRateModal";
import { getJson, postJson } from "../../api/http";
import { useHeartRateBle } from "../../services/hooks/userHeartRateBle";

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

interface Exercise {
  id: number;
  title: string;
  videoUrl: string;
}

interface SessionRecord {
  record_id: number;
  exercise_id: number;
}

interface PregnancyMeResponse {
  max_allowed_bpm?: number | null;
}

interface HeartRateRecord {
  date: string;
  bpm: number;
}

type PlayState = "idle" | "playing" | "paused";

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const toVideoId = (url: string) =>
  url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)?.[1] ?? "";

export default function ExercisePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { exercises, session } = (location.state as {
    exercises: Exercise[];
    session?: { session_id: number; records: SessionRecord[] };
  }) ?? { exercises: [] };

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
    getHeartRates,
    getSessionHeartRates,
    resetSessionHeartRates,
  } = useHeartRateBle();

  const allowNavigationRef   = useRef(false);
  const playerRef            = useRef<YTPlayer | null>(null);
  const playerElRef          = useRef<HTMLDivElement>(null);
  const timerRef             = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastVibrationAtRef   = useRef<number>(0);

  const [currentIndex, setCurrentIndex]   = useState(0);
  const [playState, setPlayState]         = useState<PlayState>("idle");
  const [duration, setDuration]           = useState(0);
  const [elapsed, setElapsed]             = useState(0);
  const [ytReady, setYtReady]             = useState(false);
  const [endedExerciseIds, setEndedExerciseIds] = useState<number[]>([]);
  const [stopModal, setStopModal]         = useState(false);
  const [leaveModal, setLeaveModal]       = useState(false);
  const [switchModal, setSwitchModal]     = useState<{ open: boolean; targetIndex: number }>({ open: false, targetIndex: 0 });
  const [maxAllowedBpm, setMaxAllowedBpm] = useState<number | null>(null);

  // ── 오늘 안정 심박수 여부 ─────────────────────────────────
  const [hasTodayHR, setHasTodayHR]       = useState<boolean | null>(null); // null = 로딩 중
  const [showHRModal, setShowHRModal]     = useState(false);

  // 오늘 심박수 확인: GET /heartrate/weekly
  useEffect(() => {
    getJson<HeartRateRecord[]>('/heartrate/weekly')
      .then((data) => {
        const todayRec = data.find(
          (r) => new Date(r.date).toDateString() === new Date().toDateString()
        );
        const has = !!todayRec;
        setHasTodayHR(has);
        // 없으면 바로 모달 오픈
        if (!has) setShowHRModal(true);
      })
      .catch(() => setHasTodayHR(true)); // 실패 시 막지 않음
  }, []);

  const current = exercises[currentIndex];

  const getRecordId = (exerciseId: number | string) =>
    session?.records?.find((r) => r.exercise_id === Number(exerciseId))
      ?.record_id ?? null;

  useEffect(() => {
    if (window.YT?.Player) { setYtReady(true); return; }
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  useEffect(() => { resetSessionHeartRates(); }, [resetSessionHeartRates]);

  useEffect(() => {
    getJson<PregnancyMeResponse>("/pregnancy/me")
      .then((data) => {
        if (typeof data.max_allowed_bpm === "number") setMaxAllowedBpm(data.max_allowed_bpm);
      })
      .catch((e) => console.error("[pregnancy/me] 조회 실패:", e));
  }, []);

  useEffect(() => {
    if (!current || !ytReady || !playerElRef.current || !isConnected) return;

    playerRef.current?.destroy();
    setPlayState("idle"); setElapsed(0); setDuration(0);

    playerRef.current = new window.YT.Player(playerElRef.current, {
      videoId: toVideoId(current.videoUrl),
      playerVars: { controls: 0, rel: 0, modestbranding: 1, autoplay: 0 },
      events: {
        onReady: (e: { target: YTPlayer }) => { setDuration(e.target.getDuration()); setPlayState("idle"); },
        onStateChange: (e: { data: number }) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            setPlayState("idle"); stopExerciseMode();
            handleRecordEnd(current.id, () => {
              hasNextAvailableExercise ? goNext(current.id) : finishAll();
            });
          }
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, currentIndex, isConnected, current, stopExerciseMode]);

  useEffect(() => {
    if (playState === "playing") {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playState]);

  useEffect(() => {
    if (playState !== "playing" || !maxAllowedBpm) return;
    if (!currentBpm || currentBpm <= maxAllowedBpm) return;
    const now = Date.now();
    if (now - lastVibrationAtRef.current < 10000) return;
    lastVibrationAtRef.current = now;
    vibrate(true).catch((e) => console.error("[vibration] 실패:", e));
  }, [currentBpm, maxAllowedBpm, playState, vibrate]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!session?.session_id || allowNavigationRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session?.session_id]);

  const getActiveRecordId = () => getRecordId(current.id);

  const handleRecordEnd = async (exerciseId: number, onDone: () => void) => {
    const recordId = getRecordId(exerciseId);
    if (recordId) {
      try {
        await postJson("/exercise/record/end", { record_id: recordId, heart_rates: getHeartRates() });
        setEndedExerciseIds((prev) => prev.includes(Number(exerciseId)) ? prev : [...prev, Number(exerciseId)]);
        onDone();
      } catch (e) { console.error("[record/end] 실패:", e); }
    }
  };

  const handleRecordPause = async () => {
    const recordId = getActiveRecordId();
    if (recordId) {
      try { await postJson("/exercise/record/pause", { record_id: recordId }); }
      catch (e) { console.error("[record/pause] 실패:", e); }
    }
  };

  const handleRecordResume = async () => {
    const recordId = getActiveRecordId();
    if (!recordId) return false;
    try { await postJson("/exercise/record/resume", { record_id: recordId }); return true; }
    catch (e) { console.error("[record/resume] 실패:", e); return false; }
  };

  const handleSessionEnd = async () => {
    if (!session?.session_id) return false;
    try { await postJson("/exercise/session/abort", { session_id: session.session_id, heart_rates: getHeartRates() }); return true; }
    catch (e) { console.error("[session/abort] 실패:", e); return false; }
  };

  const goNext = (justEndedId?: number) => {
    const ended = new Set(endedExerciseIds);
    if (justEndedId) ended.add(justEndedId);
    for (let i = currentIndex + 1; i < exercises.length; i++) {
      if (!ended.has(Number(exercises[i].id))) { setCurrentIndex(i); return; }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (!ended.has(Number(exercises[i].id))) { setCurrentIndex(i); return; }
    }
    finishAll();
  };

  const hasNextAvailableExercise = exercises.some(
    (ex) => Number(ex.id) !== Number(current?.id) && !endedExerciseIds.includes(Number(ex.id))
  );

  const finishAll = () => {
    allowNavigationRef.current = true;
    navigate("/report", { state: { exercises, sessionId: session?.session_id, heartRates: getSessionHeartRates() } });
  };

  const handleStart = async () => {
    if (!isConnected) return;
    const success = await handleRecordResume();
    if (!success) return;
    playerRef.current?.playVideo(); setPlayState("playing"); startExerciseMode();
  };

  const handlePause = async () => {
    playerRef.current?.pauseVideo(); setPlayState("paused"); pauseExerciseMode();
    await handleRecordPause();
  };

  const handleResume = async () => {
    const success = await handleRecordResume();
    if (!success) return;
    playerRef.current?.playVideo(); setPlayState("playing"); resumeExerciseMode();
  };

  const handleCurrentEnd = () => {
    stopExerciseMode(); playerRef.current?.pauseVideo();
    handleRecordEnd(current.id, () => { hasNextAvailableExercise ? goNext(current.id) : finishAll(); });
  };

  const handleStopConfirm = async () => {
    stopExerciseMode(); setStopModal(false);
    const success = await handleSessionEnd();
    if (!success) return;
    finishAll();
  };

  const handleSwitchConfirm = async () => {
    const target = switchModal.targetIndex;
    setSwitchModal({ open: false, targetIndex: 0 });
    if (playState === "playing" || playState === "paused") {
      stopExerciseMode(); playerRef.current?.pauseVideo();
      await handleRecordEnd(current.id, () => setCurrentIndex(target));
      return;
    }
    setCurrentIndex(target);
  };

  const handleLeaveConfirm = async () => {
    stopExerciseMode(); playerRef.current?.pauseVideo(); setLeaveModal(false);
    const success = await handleSessionEnd();
    if (!success) return;
    allowNavigationRef.current = true; navigate("/home");
  };

  if (!current) return null;

  const isDisplayNumeric = !isNaN(Number(displayBpm));
  const canStartExercise = isConnected;

  return (
    <>
      {/* ── 오늘 안정 심박수 없으면 먼저 측정 ── */}
      <RestingHeartRateModal
        isOpen={showHRModal}
        onClose={() => setShowHRModal(false)}
        onSaved={() => { setHasTodayHR(true); setShowHRModal(false); }}
      />

      {/* ── BLE 연결 모달 (심박 측정 완료 후에만 보임) ── */}
      {!showHRModal && (
        <DeviceConnection
          isOpen={!isConnected}
          onConnect={connect}
          onConnected={() => console.log("BLE 연결 완료")}
          onCancel={() => navigate(-1)}
        />
      )}

      {isConnected && !showHRModal && (
        <Container>
          <Header>
            <PageTitle>영상을 보고 따라해보세요!</PageTitle>
          </Header>

          <VideoBox>
            <div ref={playerElRef} style={{ width: "100%", height: "100%" }} />
          </VideoBox>

          <StatsRow>
            <StatCard>
              <StatLabel>남은 시간</StatLabel>
              <StatValue>{duration > 0 ? formatTime(Math.max(duration - elapsed, 0)) : "--:--"}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>❤️ 심박수</StatLabel>
              <StatValue style={{ fontSize: isDisplayNumeric ? "30px" : "15px" }}>
                {displayBpm}
                {isDisplayNumeric && <StatUnit>bpm</StatUnit>}
              </StatValue>
              {sensorState !== "ready" && (
                <div style={{ fontSize: "12px", color: "#999" }}>센서를 손가락에 안정적으로 올려주세요</div>
              )}
            </StatCard>
          </StatsRow>

          <ExerciseInfo>
            <ExTitle>{current.title}</ExTitle>
            <ExMeta>{currentIndex + 1}/{exercises.length}</ExMeta>
          </ExerciseInfo>

          <ControlRow>
            {playState === "idle" && (
              <ActionButton disabled={!canStartExercise} onClick={handleStart}>
                {canStartExercise ? "▷ 시작하기" : "심박 측정 후 시작 가능"}
              </ActionButton>
            )}
            {playState === "playing" && (
              <>
                <ActionButton $variant="outline" onClick={handlePause}>일시정지</ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {hasNextAvailableExercise ? "다음 운동" : "운동 종료"}
                </ActionButton>
              </>
            )}
            {playState === "paused" && (
              <>
                <ActionButton onClick={handleResume}>▷ 재개하기</ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {hasNextAvailableExercise ? "다음 운동" : "운동 종료"}
                </ActionButton>
              </>
            )}
          </ControlRow>

          <ListSection>
            <ListTitle>운동 목록</ListTitle>
            {exercises.map((ex, idx) => {
              const isEnded = endedExerciseIds.includes(Number(ex.id));
              return (
                <ExerciseItemWrapper key={ex.id} $isEnded={isEnded}>
                  <ExerciseListItem
                    index={idx + 1}
                    title={isEnded ? `${ex.title} 완료` : ex.title}
                    isActive={idx === currentIndex}
                    onClick={() => {
                      if (isEnded || idx === currentIndex) return;
                      setSwitchModal({ open: true, targetIndex: idx });
                    }}
                  />
                </ExerciseItemWrapper>
              );
            })}
          </ListSection>

          <EmergencyStop onClick={() => setStopModal(true)}>
            ⚠️ 몸이 불편하거나 운동을 중단해야 한다면
            <EmergencyStopLabel>지금 바로 운동 중단하기</EmergencyStopLabel>
          </EmergencyStop>

          {/* ── 모달들 ── */}
          <Modal isOpen={stopModal} onClose={() => setStopModal(false)} showCloseButton={false}>
            <ModalBody>
              <ModalEmoji>⚠️</ModalEmoji>
              <ModalTitle>운동을 종료할까요?</ModalTitle>
              <ModalDesc>운동이 아직 남아있어요.{"\n"}지금 종료하면 리포트로 이동합니다.</ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setStopModal(false)}>계속할게요</ModalOutlineBtn>
                <ModalFillBtn onClick={handleStopConfirm}>종료하기</ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>

          <Modal isOpen={switchModal.open} onClose={() => setSwitchModal({ open: false, targetIndex: 0 })} showCloseButton={false}>
            <ModalBody>
              <ModalTitle>다른 운동으로 이동할까요?</ModalTitle>
              <ModalDesc>
                현재 <strong>{current.title}</strong>을 종료하고{"\n"}
                <strong>{exercises[switchModal.targetIndex]?.title}</strong>으로 이동합니다.{"\n"}
                종료된 운동은 다시 실행할 수 없어요.
              </ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setSwitchModal({ open: false, targetIndex: 0 })}>돌아가기</ModalOutlineBtn>
                <ModalFillBtn onClick={handleSwitchConfirm}>{exercises[switchModal.targetIndex]?.title} 시작</ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>

          <Modal isOpen={leaveModal} onClose={() => setLeaveModal(false)} showCloseButton={false}>
            <ModalBody>
              <ModalEmoji>⚠️</ModalEmoji>
              <ModalTitle>운동을 종료하고 나가시겠어요?</ModalTitle>
              <ModalDesc>현재 운동 기록이 중단 처리됩니다.{"\n"}이동 후에는 이 운동 세션을 이어서 진행할 수 없어요.</ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setLeaveModal(false)}>계속 운동하기</ModalOutlineBtn>
                <ModalFillBtn onClick={handleLeaveConfirm}>종료하고 나가기</ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>
        </Container>
      )}
    </>
  );
}

// ── Styled (기존과 동일) ───────────────────────────────────────
const Container = styled.div`
  display: flex; flex-direction: column;
  height: 100%; overflow-y: auto; padding: 24px 16px 120px;
`;
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
`;
const PageTitle = styled.h1`
  ${({ theme }) => theme.typography.heading2}
  color: ${({ theme }) => theme.colors.text.primary}; margin: 0;
`;
const VideoBox = styled.div`
  width: 100%; aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden; margin-bottom: ${({ theme }) => theme.spacing.md}; flex-shrink: 0;
`;
const StatsRow = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.md}; margin-bottom: ${({ theme }) => theme.spacing.md};
`;
const StatCard = styled.div`
  flex: 1; background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex; flex-direction: column; gap: 4px;
`;
const StatLabel = styled.p`
  ${({ theme }) => theme.typography.caption} color: ${({ theme }) => theme.colors.subtext}; margin: 0;
`;
const StatValue = styled.p`
  font-size: 30px; font-weight: 700; color: ${({ theme }) => theme.colors.point}; margin: 0; line-height: 1.2;
`;
const StatUnit = styled.span`
  ${({ theme }) => theme.typography.body2} color: ${({ theme }) => theme.colors.subtext}; margin-left: 4px;
`;
const ExerciseInfo = styled.div`margin-bottom: ${({ theme }) => theme.spacing.md};`;
const ExTitle = styled.h2`
  ${({ theme }) => theme.typography.heading2} color: ${({ theme }) => theme.colors.text.primary}; margin: 0 0 4px;
`;
const ExMeta = styled.p`
  ${({ theme }) => theme.typography.body2} color: ${({ theme }) => theme.colors.subtext}; margin: 0;
`;
const ControlRow = styled.div`
  display: flex; gap: ${({ theme }) => theme.spacing.sm}; margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
const ActionButton = styled.button<{ $variant?: "outline" | "danger" }>`
  flex: 1; height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  ${({ theme }) => theme.typography.button} cursor: pointer; transition: all 0.2s;
  ${({ $variant, theme }) => {
    switch ($variant) {
      case "outline": return `background:transparent;border:1.5px solid ${theme.colors.point};color:${theme.colors.point};&:hover{background:${theme.colors.light};}`;
      case "danger":  return `background:${theme.colors.point};border:none;color:${theme.colors.white};&:hover{filter:brightness(0.92);}`;
      default:        return `background:${theme.colors.light};border:1px solid ${theme.colors.point};color:${theme.colors.point};&:hover{background:${theme.colors.sub};}`;
    }
  }}
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:active { transform: scale(0.98); }
`;
const ListSection = styled.div`display:flex;flex-direction:column;gap:${({ theme }) => theme.spacing.sm};`;
const ListTitle = styled.h3`
  ${({ theme }) => theme.typography.body2} color:${({ theme }) => theme.colors.subtext};
  margin:0 0 ${({ theme }) => theme.spacing.sm};
`;
const EmergencyStop = styled.button`
  width:100%;margin-top:${({ theme }) => theme.spacing.lg};padding:18px 16px 14px;
  background:#fff5f5;border:2px solid #e53935;border-radius:${({ theme }) => theme.borderRadius.lg};
  color:#e53935;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;
  ${({ theme }) => theme.typography.caption}font-weight:500;transition:all 0.2s;
  &:hover{background:#ffebee;}&:active{transform:scale(0.98);}
`;
const EmergencyStopLabel = styled.span`font-size:17px;font-weight:700;color:#e53935;letter-spacing:-0.3px;`;
const ModalBody = styled.div`display:flex;flex-direction:column;align-items:center;gap:${({ theme }) => theme.spacing.sm};text-align:center;`;
const ModalEmoji = styled.span`font-size:40px;`;
const ModalTitle = styled.p`${({ theme }) => theme.typography.heading3}color:${({ theme }) => theme.colors.text.primary};margin:0;`;
const ModalDesc = styled.p`${({ theme }) => theme.typography.body2}color:${({ theme }) => theme.colors.subtext};margin:0;white-space:pre-line;`;
const ModalButtons = styled.div`display:flex;gap:${({ theme }) => theme.spacing.sm};width:100%;margin-top:${({ theme }) => theme.spacing.sm};`;
const ModalOutlineBtn = styled.button`
  flex:1;padding:12px;border-radius:${({ theme }) => theme.borderRadius.md};
  border:1.5px solid ${({ theme }) => theme.colors.point};background:transparent;
  color:${({ theme }) => theme.colors.point};${({ theme }) => theme.typography.button}cursor:pointer;
  &:hover{background:${({ theme }) => theme.colors.light};}
`;
const ModalFillBtn = styled.button`
  flex:1;padding:12px;border-radius:${({ theme }) => theme.borderRadius.md};border:none;
  background:${({ theme }) => theme.colors.point};color:${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}cursor:pointer;&:hover{filter:brightness(0.92);}
`;
const ExerciseItemWrapper = styled.div<{ $isEnded: boolean }>`
  opacity:${({ $isEnded }) => ($isEnded ? 0.45 : 1)};
  filter:${({ $isEnded }) => ($isEnded ? "grayscale(0.4)" : "none")};
  pointer-events:${({ $isEnded }) => ($isEnded ? "none" : "auto")};
  transition:opacity 0.2s ease,filter 0.2s ease;
`;

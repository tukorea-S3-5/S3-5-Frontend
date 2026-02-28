import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Modal from '@components/Modal';
import DeviceConnection from './components/DeviceConnection';
import ExerciseListItem from './components/ExerciseListItem';
import { postJson } from '../../api/http';

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

type PlayState = 'idle' | 'playing' | 'paused';

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const toVideoId = (url: string) =>
  url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)?.[1] ?? '';

export default function ExercisePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { exercises, currentHeartRate = 0, session } = (location.state as {
    exercises: Exercise[];
    currentHeartRate?: number;
    session?: { session_id: number; records: SessionRecord[] };
  }) ?? { exercises: [] };

  const [isConnected, setIsConnected] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [ytReady, setYtReady] = useState(false);
  const [stopModal, setStopModal] = useState(false);
  const [switchModal, setSwitchModal] = useState<{ open: boolean; targetIndex: number }>({ open: false, targetIndex: 0 });

  const playerRef = useRef<YTPlayer | null>(null);
  const playerElRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;

  const getRecordId = (exerciseId: number | string) =>
    session?.records?.find(r => r.exercise_id === Number(exerciseId))?.record_id ?? null;

  // YouTube IFrame API 로드
  useEffect(() => {
    if (window.YT) { setYtReady(true); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setYtReady(true);
  }, []);

  // 운동 바뀌면 플레이어 생성 후 자동 시작
  useEffect(() => {
    if (!ytReady || !playerElRef.current) return;
    playerRef.current?.destroy();
    setPlayState('idle');
    setElapsed(0);
    setDuration(0);
    playerRef.current = new window.YT.Player(playerElRef.current, {
      videoId: toVideoId(current.videoUrl),
      playerVars: { controls: 0, rel: 0, modestbranding: 1, autoplay: 1 },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          setDuration(e.target.getDuration());
          e.target.playVideo();
          setPlayState('playing');
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === window.YT.PlayerState.ENDED) {
            setPlayState('idle');
            handleRecordEnd(current.id, () => {
              isLast ? finishAll() : goNext();
            });
          }
        },
      },
    });
  }, [ytReady, currentIndex]);

  // 경과 시간 타이머
  useEffect(() => {
    if (playState === 'playing') {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playState]);

  const getActiveRecordId = () => getRecordId(current.id);

  // record/end → 다음 운동 또는 완료
  const handleRecordEnd = async (exerciseId: number, onDone: () => void) => {
    const recordId = getRecordId(exerciseId);
    if (recordId) {
      try { await postJson('/exercise/record/end', { record_id: recordId }); } catch { }
    }
    onDone();
  };

  // record/pause
  const handleRecordPause = async () => {
    const recordId = getActiveRecordId();
    if (recordId) {
      try { await postJson('/exercise/record/pause', { record_id: recordId }); } catch { }
    }
  };

  // record/resume
  const handleRecordResume = async () => {
    const recordId = getActiveRecordId();
    if (recordId) {
      try { await postJson('/exercise/record/resume', { record_id: recordId }); } catch { }
    }
  };

  // session/abort
  const handleSessionAbort = async () => {
    if (session?.session_id) {
      try { await postJson('/exercise/session/abort', { session_id: session.session_id }); } catch { }
    }
  };

  const goNext = () => setCurrentIndex(p => p + 1);

  const finishAll = () => navigate('/report', { state: { exercises, sessionId: session?.session_id } });

  const handleStart = () => {
    playerRef.current?.playVideo();
    setPlayState('playing');
  };

  const handlePause = async () => {
    playerRef.current?.pauseVideo();
    setPlayState('paused');
    await handleRecordPause();
  };

  const handleResume = async () => {
    playerRef.current?.playVideo();
    setPlayState('playing');
    await handleRecordResume();
  };

  const handleCurrentEnd = () => {
    playerRef.current?.pauseVideo();
    handleRecordEnd(current.id, () => {
      isLast ? finishAll() : goNext();
    });
  };

  // 우상단 운동 종료 → abort 후 리포트
  const handleStopAll = () => setStopModal(true);
  const handleStopConfirm = async () => {
    setStopModal(false);
    await handleSessionAbort();
    finishAll();
  };

  const handleSwitchConfirm = async () => {
    const target = switchModal.targetIndex;
    setSwitchModal({ open: false, targetIndex: 0 });
    // 현재 운동 pause 처리 후 전환
    await handleRecordPause();
    setCurrentIndex(target);
  };

  if (!current) return null;

  return (
    <>
      <DeviceConnection
        isOpen={!isConnected}
        onConnected={() => setIsConnected(true)}
        onCancel={() => navigate(-1)}
      />

      {isConnected && (
        <Container>
          <Header>
            <PageTitle>영상을 보고 따라해보세요!</PageTitle>
            <StopAllButton onClick={handleStopAll}>운동 종료</StopAllButton>
          </Header>

          <VideoBox>
            <div ref={playerElRef} style={{ width: '100%', height: '100%' }} />
          </VideoBox>

          <StatsRow>
            <StatCard>
              <StatLabel>남은 시간</StatLabel>
              <StatValue>{duration > 0 ? formatTime(Math.max(duration - elapsed, 0)) : '--:--'}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>❤️ 심박수</StatLabel>
              <StatValue>{currentHeartRate}<StatUnit>bpm</StatUnit></StatValue>
            </StatCard>
          </StatsRow>

          <ExerciseInfo>
            <ExTitle>{current.title}</ExTitle>
            <ExMeta>{currentIndex + 1}/{exercises.length}</ExMeta>
          </ExerciseInfo>

          <ControlRow>
            {playState === 'idle' && (
              <ActionButton onClick={handleStart}>▷ 시작하기</ActionButton>
            )}
            {playState === 'playing' && (
              <>
                <ActionButton $variant="outline" onClick={handlePause}>일시정지</ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {isLast ? '운동 완료' : '다음 운동'}
                </ActionButton>
              </>
            )}
            {playState === 'paused' && (
              <>
                <ActionButton onClick={handleResume}>▷ 재개하기</ActionButton>
                <ActionButton $variant="danger" onClick={handleCurrentEnd}>
                  {isLast ? '운동 완료' : '다음 운동'}
                </ActionButton>
              </>
            )}
          </ControlRow>

          <ListSection>
            <ListTitle>운동 목록</ListTitle>
            {exercises.map((ex, idx) => (
              <ExerciseListItem
                key={ex.id}
                index={idx + 1}
                title={ex.title}
                isActive={idx === currentIndex}
                onClick={() => idx !== currentIndex && setSwitchModal({ open: true, targetIndex: idx })}
              />
            ))}
          </ListSection>

          {/* 전체 운동 종료 모달 */}
          <Modal isOpen={stopModal} onClose={() => setStopModal(false)} showCloseButton={false}>
            <ModalBody>
              <ModalEmoji>⚠️</ModalEmoji>
              <ModalTitle>운동을 종료할까요?</ModalTitle>
              <ModalDesc>운동이 아직 남아있어요.{'\n'}지금 종료하면 리포트로 이동합니다.</ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setStopModal(false)}>계속할게요</ModalOutlineBtn>
                <ModalFillBtn onClick={handleStopConfirm}>종료하기</ModalFillBtn>
              </ModalButtons>
            </ModalBody>
          </Modal>

          {/* 운동 전환 모달 */}
          <Modal isOpen={switchModal.open} onClose={() => setSwitchModal({ open: false, targetIndex: 0 })} showCloseButton={false}>
            <ModalBody>
              <ModalTitle>다른 운동으로 이동할까요?</ModalTitle>
              <ModalDesc>현재 <strong>{current.title}</strong>을 중단하고<br /><strong>{exercises[switchModal.targetIndex]?.title}</strong>으로 이동합니다</ModalDesc>
              <ModalButtons>
                <ModalOutlineBtn onClick={() => setSwitchModal({ open: false, targetIndex: 0 })}>돌아가기</ModalOutlineBtn>
                <ModalFillBtn onClick={handleSwitchConfirm}>{exercises[switchModal.targetIndex]?.title} 시작</ModalFillBtn>
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
  &:hover { border-color: ${({ theme }) => theme.colors.point}; color: ${({ theme }) => theme.colors.point}; }
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
const ExerciseInfo = styled.div`margin-bottom: ${({ theme }) => theme.spacing.md};`;
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
const ActionButton = styled.button<{ $variant?: 'outline' | 'danger' }>`
  flex: 1;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'outline': return `background: transparent; border: 1.5px solid ${theme.colors.point}; color: ${theme.colors.point}; &:hover { background: ${theme.colors.light}; }`;
      case 'danger': return `background: ${theme.colors.point}; border: none; color: ${theme.colors.white}; &:hover { filter: brightness(0.92); }`;
      default: return `background: ${theme.colors.light}; border: 1px solid ${theme.colors.point}; color: ${theme.colors.point}; &:hover { background: ${theme.colors.sub}; }`;
    }
  }}
  &:active { transform: scale(0.98); }
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
const ModalEmoji = styled.span`font-size: 40px;`;
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
  flex: 1; padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.point};
  background: transparent;
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`;
const ModalFillBtn = styled.button`
  flex: 1; padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme }) => theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover { filter: brightness(0.92); }
`;
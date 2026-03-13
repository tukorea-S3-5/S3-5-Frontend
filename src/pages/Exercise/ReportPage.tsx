import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MomiCompleted from '@assets/icons/images/MOMI_completed.png';
import { getJson } from '../../api/http';

interface ExerciseSummary {
  exercise_name: string;
  duration: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
}

interface ReportResponse {
  total_duration: number;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  exercises: ExerciseSummary[];
}

interface LocationState {
  sessionId?: number;
}

const formatDuration = (seconds: number) => {
  if (!seconds) return '0분';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}분 ${s}초` : `${m}분`;
};

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId } = (location.state as LocationState) ?? {};

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const MAX_RETRY = 5;
    const RETRY_DELAY = 1000;

    const fetchReport = async (attempt: number) => {
      try {
        console.log(`[ReportPage] GET /report/session/${sessionId} 시도 ${attempt}/${MAX_RETRY}`);
        const res = await getJson<ReportResponse>(`/report/session/${sessionId}`);
        if (!cancelled) {
          console.log('[ReportPage] 리포트 성공:', res);
          setReport(res);
          setLoading(false);
        }
      } catch (e: any) {
        console.warn(`[ReportPage] 실패 (${attempt}/${MAX_RETRY}):`, e?.message);
        if (attempt < MAX_RETRY && !cancelled) {
          setTimeout(() => fetchReport(attempt + 1), RETRY_DELAY);
        } else if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchReport(1);
    return () => { cancelled = true; };
  }, [sessionId]);

  const handleHome = () => navigate('/home');

  const handleShare = () => {
    if (!report) return;
    const text = `🤰 오늘의 운동 리포트\n총 운동시간: ${formatDuration(report.total_duration)}\n평균 심박수: ${report.avg_heart_rate ?? '--'}bpm\n#MOMFIT #임산부운동`;
    if (navigator.share) {
      navigator.share({ title: 'MOMFIT 운동 리포트', text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사되었어요! 📋'));
    }
  };

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <Container><LoadingText>리포트 불러오는 중...</LoadingText></Container>;

  return (
    <Container>
      <Title>운동을 완료했어요!</Title>
      <CharacterImage src={MomiCompleted} alt="운동 완료" />

      {error || !report ? (
        <ErrorCard>
          <ErrorText>리포트를 불러오지 못했어요 😢</ErrorText>
        </ErrorCard>
      ) : (
        <>
          <StatsGrid>
            <StatCardFull>
              <StatLabel>🕐 총 운동 시간</StatLabel>
              <StatValue>{formatDuration(report.total_duration)}</StatValue>
            </StatCardFull>

            <StatCard>
              <StatLabel>❤️ 평균 심박수</StatLabel>
              <StatValue>
                {report.avg_heart_rate ?? '--'}
                <StatUnit>bpm</StatUnit>
              </StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>📈 최고 심박수</StatLabel>
              <StatValue>
                {report.max_heart_rate ?? '--'}
                <StatUnit>bpm</StatUnit>
              </StatValue>
            </StatCard>
          </StatsGrid>

          {/* 운동별 수행 시간 */}
          <ExerciseListCard>
            <SectionTitle>운동별 수행 시간</SectionTitle>
            {report.exercises.map((ex, i) => (
              <ExerciseRow key={i}>
                <ExerciseName>{ex.exercise_name}</ExerciseName>
                <ExerciseDuration>
                  {ex.duration != null ? formatDuration(ex.duration) : '-'}
                </ExerciseDuration>
              </ExerciseRow>
            ))}
          </ExerciseListCard>

        </>
      )}

      <ButtonRow>
        <OutlineButton onClick={handleShare}>🔗 공유하기</OutlineButton>
        <OutlineButton onClick={handleSave} $saved={saved}>
          {saved ? '✓ 저장됨' : '🔖 저장하기'}
        </OutlineButton>
      </ButtonRow>
      <HomeButton onClick={handleHome}>홈으로 돌아가기</HomeButton>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 32px 16px 120px;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.background} 0%,
    ${({ theme }) => theme.colors.white} 100%
  );
`;
const LoadingText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;
const Title = styled.h1`
  ${({ theme }) => theme.typography.heading1}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;
const CharacterImage = styled.img`
  width: 200px;
  height: auto;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  display: block;
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const StatCardFull = styled(StatCard)`
  grid-column: 1 / -1;
  align-items: center;
`;
const StatLabel = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;
const StatValue = styled.p`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  line-height: 1.2;
`;
const StatUnit = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.subtext};
  margin-left: 4px;
`;
const ExerciseListCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const SectionTitle = styled.h3`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
`;
const ExerciseRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
const ExerciseName = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.primary};
`;
const ExerciseDuration = styled.span`
  ${({ theme }) => theme.typography.body2}
  font-weight: 700;
  color: ${({ theme }) => theme.colors.point};
`;
const ErrorCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ErrorText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;
const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;
const OutlineButton = styled.button<{ $saved?: boolean }>`
  flex: 1;
  height: 52px;
  background: ${({ $saved, theme }) => $saved ? theme.colors.light : theme.colors.white};
  border: 1.5px solid ${({ $saved, theme }) => $saved ? theme.colors.point : theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ $saved, theme }) => $saved ? theme.colors.point : theme.colors.text.primary};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.point}; color: ${({ theme }) => theme.colors.point}; }
  &:active { transform: scale(0.98); }
`;
const HomeButton = styled.button`
  width: 100%;
  height: 56px;
  background: ${({ theme }) => theme.colors.point};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;
  &:hover { filter: brightness(0.92); }
  &:active { transform: scale(0.98); }
`;
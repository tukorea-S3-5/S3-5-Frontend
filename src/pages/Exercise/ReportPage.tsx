import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MomiCompleted from '@assets/icons/images/MOMI_completed.png';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface Exercise {
  id: number;
  title: string;
  videoUrl: string;
}

interface HeartRateDataPoint {
  time: string;
  heartRate: number;
}

interface ReportState {
  exercises: Exercise[];
  totalDuration?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  heartRateData?: HeartRateDataPoint[];
  feedback?: string;
}

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    totalDuration = 0,
    avgHeartRate = 0,
    maxHeartRate = 0,
    heartRateData = [],
    feedback = '',
  } = (location.state as ReportState) ?? {};

  const handleSave = () => {
    // TODO: 서버에 운동 기록 저장
    +  alert('저장 기능은 준비 중입니다.');
  };

  const handleComplete = () => {
    navigate('/');
  };

  return (
    <Container>
      <Title>운동을 완료했어요!</Title>

      <CharacterImage src={MomiCompleted} alt="운동 완료" />

      <StatsGrid>
        <StatCardFull>
          <StatLabel>🕐 총 운동 시간</StatLabel>
          <StatValue>{totalDuration}분</StatValue>
        </StatCardFull>

        <StatCard>
          <StatLabel>❤️ 평균 심박수</StatLabel>
          <StatValue>{avgHeartRate} <StatUnit>bpm</StatUnit></StatValue>
        </StatCard>

        <StatCard>
          <StatLabel>📈 최고 심박수</StatLabel>
          <StatValue>{maxHeartRate} <StatUnit>bpm</StatUnit></StatValue>
        </StatCard>
      </StatsGrid>

      <ChartCard>
        <ChartTitle>〜 심박수 변화</ChartTitle>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={heartRateData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD4CC" />
            <XAxis
              dataKey="time"
              stroke="#8B7E74"
              tick={{ fontSize: 10, fill: '#8B7E74' }}
              interval={Math.max(0, Math.floor(heartRateData.length / 6) - 1)}
            />
            <YAxis
              stroke="#8B7E74"
              tick={{ fontSize: 10, fill: '#8B7E74' }}
              domain={[60, 140]}
              ticks={[60, 80, 100, 120, 140]}
            />
            <Area
              type="monotone"
              dataKey="heartRate"
              stroke="#FF3B30"
              strokeWidth={2}
              fill="url(#hrGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <FeedbackSection>
        <FeedbackTitle>오늘의 운동 한마디</FeedbackTitle>
        {feedback && <FeedbackText>{feedback}</FeedbackText>}
      </FeedbackSection>

      <ButtonRow>
        <OutlineButton onClick={handleSave}>💾 저장하기</OutlineButton>
        <FillButton onClick={handleComplete}>완료</FillButton>
      </ButtonRow>
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
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ChartTitle = styled.h3`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const FeedbackSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FeedbackTitle = styled.h2`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const FeedbackText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: pre-line;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OutlineButton = styled.button`
  flex: 1;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.point};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
  &:active { transform: scale(0.98); }
`;

const FillButton = styled.button`
  flex: 1;
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
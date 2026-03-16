import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Pencil } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Dot,
  Tooltip,
} from 'recharts';
import { getJson, postJson, putJson } from '../../api/http';

type CardState = 'input' | 'saved' | 'editing';

interface WeightLog {
  weight_log_id: number;
  pregnancy_id: number;
  week: number;
  weight: number;
  created_at: string;
}

interface WeightSummary {
  start_weight: number;
  current_weight: number;
  total_gain: number;
}

interface WeightResponse {
  summary: WeightSummary;
  logs: WeightLog[];
}

interface WeightTrend {
  based_on: string;
  slope: number;
  expected_slope: number;
  status: string;
}

interface PregnancyInfo {
  week: number;
}

type StatusType = 'normal' | 'excessive' | 'warning';

const getStatusType = (status: string): StatusType => {
  if (status === '정상 증가 추세') return 'normal';
  if (status.includes('과도')) return 'excessive';
  return 'warning';
};

export default function WeightPage() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [cardState, setCardState] = useState<CardState>('input');
  const [inputValue, setInputValue] = useState('');
  const [editValue, setEditValue] = useState('');
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pregnancyError, setPregnancyError] = useState(false);
  const [trend, setTrend] = useState<WeightTrend | null>(null);

  // 임신 주차 조회
  const fetchPregnancyInfo = async () => {
    try {
      const res = await getJson<PregnancyInfo>('/pregnancy/me');
      setCurrentWeek(res.week);
      setSelectedWeek(res.week);
      setPregnancyError(false);
      return res.week;
    } catch {
      setPregnancyError(true);
      throw new Error('임신 정보를 불러올 수 없습니다.');
    }
  };

  // 체중 데이터 조회
  const fetchWeight = async (week?: number) => {
    try {
      const [weightRes, trendRes] = await Promise.allSettled([
        getJson<WeightResponse>('/pregnancy/weight'),
        getJson<WeightTrend>('/pregnancy/weight-trend'),
      ]);
      if (weightRes.status === 'fulfilled') {
        setSummary(weightRes.value.summary);
        setLogs(weightRes.value.logs);
        const targetWeek = week ?? selectedWeek;
        const log = weightRes.value.logs.find(l => l.week === targetWeek);
        setCardState(log ? 'saved' : 'input');
      } else {
        setError('데이터를 불러오지 못했어요. 다시 시도해주세요.');
      }
      if (trendRes.status === 'fulfilled') {
        setTrend(trendRes.value);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    setPregnancyError(false);
    setLoading(true);
    try {
      const week = await fetchPregnancyInfo();
      await fetchWeight(week);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleWeekChange = (week: number) => {
    if (isSubmitting) return;
    setSelectedWeek(week);
    setInputValue('');
    setEditValue('');
    setError(null);
    const log = logs.find(l => l.week === week);
    setCardState(log ? 'saved' : 'input');
  };

  const thisWeekLog = logs.find(l => l.week === selectedWeek);

  // cardState 'saved'인데 해당 주차 로그 없으면 'input'으로 복구
  useEffect(() => {
    if (cardState === 'saved' && !thisWeekLog) {
      setCardState('input');
    }
  }, [cardState, thisWeekLog]);
  const chartData = logs
    .slice()
    .sort((a, b) => a.week - b.week)
    .map(l => ({ week: l.week, weight: l.weight }));

  const totalGain = summary?.total_gain != null ? summary.total_gain : null;
  const weights = chartData.map(d => d.weight);
  const minW = weights.length ? Math.floor(Math.min(...weights)) - 2 : 40;
  const maxW = weights.length ? Math.ceil(Math.max(...weights)) + 2 : 90;
  const baseWeight = summary?.start_weight != null ? summary.start_weight : null;

  // 신규 저장
  const handleSave = async () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0 || isSubmitting || pregnancyError) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await postJson('/pregnancy/weight', { week: selectedWeek, weight: val });
      await fetchWeight(selectedWeek);
      setInputValue('');
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수정 시작
  const handleEdit = () => {
    setEditValue(String(thisWeekLog?.weight ?? ''));
    setError(null);
    setCardState('editing');
  };

  // 수정 저장
  const handleUpdate = async () => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0 || isSubmitting || pregnancyError) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await putJson(`/pregnancy/weight/${selectedWeek}`, { weight: val });
      await fetchWeight(selectedWeek);
      setEditValue('');
    } catch {
      setError('수정에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setCardState('saved');
  };

  if (loading) return <Container><LoadingText>불러오는 중...</LoadingText></Container>;

  return (
    <Container>
      {/* 이번 주 요약 카드 */}
      <SummaryCard>
        <SectionLabel>이번 주 요약</SectionLabel>
        <GainRow>
          <GainLabel>총 증가량</GainLabel>
          <GainValue>
            {totalGain !== null
              ? `${totalGain >= 0 ? '+' : ''}${totalGain.toFixed(1)}kg`
              : '-'}
          </GainValue>
        </GainRow>
        {trend && (
          <TrendCard statusType={getStatusType(trend.status)}>
            <TrendRow>
              <TrendItem>
                <TrendLabel>최근 4주 평균 증가량</TrendLabel>
                <TrendValue accent>{(trend.slope ?? 0).toFixed(2)}kg<TrendUnit>/주</TrendUnit></TrendValue>
              </TrendItem>
              <TrendDivider />
              <TrendItem>
                <TrendLabel>임신 평균 권장 증가량</TrendLabel>
                <TrendValue>{(trend.expected_slope ?? 0).toFixed(2)}kg<TrendUnit>/주</TrendUnit></TrendValue>
              </TrendItem>
            </TrendRow>
            <TrendStatus statusType={getStatusType(trend.status)}>
              👉 {trend.status}
            </TrendStatus>
          </TrendCard>
        )}
      </SummaryCard>

      {/* 체중 기록 카드 */}
      <RecordCard>
        <WeekSelectRow>
          <RecordTitle>체중 기록</RecordTitle>
          <WeekSelect
            value={selectedWeek}
            onChange={e => handleWeekChange(Number(e.target.value))}
            disabled={isSubmitting}
            aria-label="주차 선택"
          >
            {Array.from({ length: currentWeek }, (_, i) => i + 1).map(w => (
              <option key={w} value={w}>{w}주차</option>
            ))}
          </WeekSelect>
        </WeekSelectRow>

        <label htmlFor="weight-input">
          <RecordSubLabel>현재 체중 (kg)</RecordSubLabel>
        </label>

        {cardState === 'input' && (
          <>
            <Input
              id="weight-input"
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="체중을 입력하세요"
              disabled={isSubmitting}
            />
            <ButtonRow>
              <PrimaryButton onClick={handleSave} disabled={isSubmitting || pregnancyError}>
                {isSubmitting ? '저장 중...' : '체중 기록하기'}
              </PrimaryButton>
            </ButtonRow>
          </>
        )}

        {cardState === 'saved' && thisWeekLog && (
          <SavedRow>
            <SavedWeight aria-label={`${selectedWeek}주차 체중 ${thisWeekLog.weight}kg`}>
              {thisWeekLog.weight.toFixed(1)}
            </SavedWeight>
            <EditButton onClick={handleEdit} aria-label="체중 수정">
              <Pencil size={16} />
            </EditButton>
          </SavedRow>
        )}

        {cardState === 'editing' && (
          <>
            <Input
              id="weight-input"
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              $focused
              disabled={isSubmitting}
            />
            <ButtonRow>
              <PrimaryButton onClick={handleUpdate} disabled={isSubmitting || pregnancyError}>
                {isSubmitting ? '저장 중...' : '저장하기'}
              </PrimaryButton>
              <SecondaryButton onClick={handleCancel} disabled={isSubmitting}>
                취소하기
              </SecondaryButton>
            </ButtonRow>
          </>
        )}

        {pregnancyError && (
          <ErrorText role="alert">
            임신 정보를 불러올 수 없어요.{' '}
            <RetryButton onClick={initializeData}>다시 시도</RetryButton>
          </ErrorText>
        )}
        {error && <ErrorText role="alert">{error}</ErrorText>}
      </RecordCard>

      {/* 체중 변화 추이 그래프 */}
      <ChartCard>
        <RecordTitle>체중 변화 추이</RecordTitle>
        <ChartMeta>
          {baseWeight !== null && <>시작 체중: {baseWeight}kg</>}
          {totalGain !== null && (
            <> | 현재 증가량: <Accent>{totalGain >= 0 ? '+' : ''}{totalGain.toFixed(1)}kg</Accent></>
          )}
        </ChartMeta>

        <div role="img" aria-label="주차별 체중 변화 그래프 — 빨간선은 실제 측정 체중(kg)">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e5" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: '#8b7e74' }}
                tickLine={false}
                label={{ value: '주차', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#8b7e74' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#8b7e74' }}
                tickLine={false}
                domain={[minW, maxW]}
                label={{ value: 'kg', angle: -90, position: 'insideLeft', offset: 16, fontSize: 10, fill: '#8b7e74' }}
              />
              <Tooltip
                formatter={(v) => [`${v}kg`, '체중']}
                labelFormatter={(l) => `${l}주차`}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #f0e8e5' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff5038"
                strokeWidth={2}
                dot={<Dot r={3} fill="#ff5038" stroke="#ff5038" />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  box-sizing: border-box;
`;
const LoadingText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;
const SectionLabel = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;
const GainRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
`;
const GainLabel = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.primary};
`;
const GainValue = styled.span`
  ${({ theme }) => theme.typography.body1}
  font-weight: 700;
  color: ${({ theme }) => theme.colors.point};
`;
const RecordCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`;
const RecordTitle = styled.p`
  ${({ theme }) => theme.typography.body1}
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;
const RecordSubLabel = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;
const Input = styled.input<{ $focused?: boolean }>`
  width: 100%;
  border: 1.5px solid ${({ theme, $focused }) => $focused ? theme.colors.point : theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px ${({ theme }) => theme.spacing.md};
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${({ theme }) => theme.colors.point}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const PrimaryButton = styled.button`
  flex: 1;
  height: 48px;
  background: ${({ theme }) => theme.colors.point};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover:not(:disabled) { filter: brightness(0.92); }
  &:active:not(:disabled) { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const SavedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SavedWeight = styled.span`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;
const EditButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.subtext};
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.point}; color: ${({ theme }) => theme.colors.point}; }
`;
const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: 4px;
`;
const SecondaryButton = styled.button`
  flex: 1;
  height: 48px;
  background: ${({ theme }) => theme.colors.light};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover:not(:disabled) { filter: brightness(0.95); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const ErrorText = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.point};
  margin: 4px 0 0 0;
`;
const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;
const ChartMeta = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;
const TrendCard = styled.div<{ statusType: StatusType }>`
  background: ${({ statusType }) => ({
    normal: '#f0faf0',
    excessive: '#fff5f5',
    warning: '#fffbf0',
  }[statusType])};
  border: 1.5px solid ${({ statusType }) => ({
    normal: '#a5d6a7',
    excessive: '#ffb3b3',
    warning: '#ffe082',
  }[statusType])};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
const TrendItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const TrendDivider = styled.div`
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.sub};
`;
const TrendLabel = styled.span`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
`;
const TrendValue = styled.span<{ accent?: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ accent, theme }) => accent ? theme.colors.point : theme.colors.text.primary};
`;
const TrendUnit = styled.span`
  font-size: 10px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.subtext};
  margin-left: 1px;
`;
const TrendStatus = styled.p<{ statusType: StatusType }>`
  ${({ theme }) => theme.typography.caption}
  font-weight: 600;
  margin: 0;
  color: ${({ statusType }) => ({
    normal: '#2e7d32',
    excessive: '#c62828',
    warning: '#f57f17',
  }[statusType])};
`;
const Accent = styled.span`
  color: ${({ theme }) => theme.colors.point};
  font-weight: 700;
`;
const WeekSelectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;
const RetryButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.caption}
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;
const WeekSelect = styled.select`
  border: 1.5px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 4px 8px;
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.white};
  outline: none;
  cursor: pointer;
  &:focus { border-color: ${({ theme }) => theme.colors.point}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
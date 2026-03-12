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

interface PregnancyInfo {
  week: number;
}

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

  // 임신 주차 조회
  const fetchPregnancyInfo = async () => {
    try {
      const res = await getJson<PregnancyInfo>('/pregnancy/me');
      setCurrentWeek(res.week);
      setSelectedWeek(res.week);
      return res.week;
    } catch {
      setCurrentWeek(40);
      setSelectedWeek(40);
      return 40;
    }
  };

  // 체중 데이터 조회
  const fetchWeight = async (week?: number) => {
    try {
      const res = await getJson<WeightResponse>('/pregnancy/weight');
      setSummary(res.summary);
      setLogs(res.logs);
      const targetWeek = week ?? selectedWeek;
      const log = res.logs.find(l => l.week === targetWeek);
      setCardState(log ? 'saved' : 'input');
    } catch (e: any) {
      setError('데이터를 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const week = await fetchPregnancyInfo();
      await fetchWeight(week);
    })();
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
  const chartData = logs
    .slice()
    .sort((a, b) => a.week - b.week)
    .map(l => ({ week: l.week, weight: l.weight }));

  const totalGain = summary?.total_gain ?? null;
  const baseWeight = summary?.start_weight ?? null;

  // 신규 저장
  const handleSave = async () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0 || isSubmitting) return;
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
    if (isNaN(val) || val <= 0 || isSubmitting) return;
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
      {/* 총 증가량 카드 */}
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
          <RecordSubLabel>
            {selectedWeek === currentWeek ? '현재 체중 (kg)' : `${selectedWeek}주차 체중 (kg)`}
          </RecordSubLabel>
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
              <PrimaryButton onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '체중 기록하기'}
              </PrimaryButton>
            </ButtonRow>
          </>
        )}

        {cardState === 'saved' && (
          <SavedRow>
            <SavedWeight aria-label={`${selectedWeek}주차 체중 ${thisWeekLog?.weight}kg`}>
              {thisWeekLog?.weight}
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
              <PrimaryButton onClick={handleUpdate} disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : '저장하기'}
              </PrimaryButton>
              <SecondaryButton onClick={handleCancel} disabled={isSubmitting}>
                취소하기
              </SecondaryButton>
            </ButtonRow>
          </>
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
        <ResponsiveContainer width="100%" height={200} style={{ flex: 1 }}>
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
              domain={[40, 90]}
              ticks={[40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90]}
              label={{ value: 'kg', angle: -90, position: 'insideLeft', offset: 16, fontSize: 10, fill: '#8b7e74' }}
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
  height: 100%;
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;
const ChartMeta = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
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
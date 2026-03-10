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

interface WeightPageProps {
  currentWeek?: number;
}

export default function WeightPage({ currentWeek = 20 }: WeightPageProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [cardState, setCardState] = useState<CardState>('input');
  const [inputValue, setInputValue] = useState('');
  const [editValue, setEditValue] = useState('');
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 조회
  const fetchWeight = async (week?: number) => {
    try {
      const res = await getJson<WeightResponse>('/pregnancy/weight');
      setSummary(res.summary);
      setLogs(res.logs);

      const targetWeek = week ?? selectedWeek;
      const log = res.logs.find(l => l.week === targetWeek);
      setCardState(log ? 'saved' : 'input');
    } catch {
      // 기록 없어도 input 상태 유지
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeight(); }, []);

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    setInputValue('');
    setEditValue('');
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
    if (isNaN(val) || val <= 0) return;
    try {
      await postJson('/pregnancy/weight', { week: selectedWeek, weight: val });
      await fetchWeight(selectedWeek);
      setCardState('saved');
      setInputValue('');
    } catch {}
  };

  // 수정 시작
  const handleEdit = () => {
    setEditValue(String(thisWeekLog?.weight ?? ''));
    setCardState('editing');
  };

  // 수정 저장
  const handleUpdate = async () => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0) return;
    try {
      await putJson(`/pregnancy/weight/${selectedWeek}`, { weight: val });
      await fetchWeight(selectedWeek);
      setCardState('saved');
      setEditValue('');
    } catch {}
  };

  const handleCancel = () => setCardState('saved');

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
          >
            {Array.from({ length: currentWeek }, (_, i) => i + 1).map(w => (
              <option key={w} value={w}>{w}주차</option>
            ))}
          </WeekSelect>
        </WeekSelectRow>
        <RecordSubLabel>현재 체중 (kg)</RecordSubLabel>

        {cardState === 'input' && (
          <>
            <Input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="체중을 입력하세요"
            />
            <ButtonRow>
              <PrimaryButton onClick={handleSave}>체중 기록하기</PrimaryButton>
            </ButtonRow>
          </>
        )}

        {cardState === 'saved' && (
          <SavedRow>
            <SavedWeight>{thisWeekLog?.weight}</SavedWeight>
            <EditButton onClick={handleEdit}>
              <Pencil size={16} />
            </EditButton>
          </SavedRow>
        )}

        {cardState === 'editing' && (
          <>
            <Input
              type="number"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              $focused
            />
            <ButtonRow>
              <PrimaryButton onClick={handleUpdate}>저장하기</PrimaryButton>
              <SecondaryButton onClick={handleCancel}>취소하기</SecondaryButton>
            </ButtonRow>
          </>
        )}
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
  margin: 0 0 4px 0;
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
  &:hover { filter: brightness(0.92); }
  &:active { transform: scale(0.98); }
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
  &:hover { filter: brightness(0.95); }
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
`;
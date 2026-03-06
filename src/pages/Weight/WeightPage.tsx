import { useState } from 'react';
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

type CardState = 'input' | 'saved' | 'editing';

const DEFAULT_CHART_DATA = [
  { week: 1, weight: 58 },
  { week: 3, weight: 58.3 },
  { week: 5, weight: 58.7 },
  { week: 7, weight: 59.2 },
  { week: 9, weight: 59.8 },
  { week: 11, weight: 60.1 },
  { week: 13, weight: 60.6 },
  { week: 15, weight: 61.0 },
  { week: 17, weight: 61.4 },
  { week: 20, weight: 62.3 },
];

interface WeightPageProps {
  currentWeek?: number;
  baseWeight?: number;
  weeklyData?: { week: number; weight: number }[];
}

export default function WeightPage({
  currentWeek = 20,
  baseWeight = 58,
  weeklyData = DEFAULT_CHART_DATA,
}: WeightPageProps) {
  const [cardState, setCardState] = useState<CardState>('input');
  const [inputValue, setInputValue] = useState('');
  const [savedWeight, setSavedWeight] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const totalGain = savedWeight !== null
    ? (savedWeight - baseWeight).toFixed(1)
    : null;

  const chartData = savedWeight !== null
    ? [...weeklyData.filter(d => d.week < currentWeek), { week: currentWeek, weight: savedWeight }]
    : weeklyData;

  const handleSave = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && val > 0) {
      setSavedWeight(val);
      setCardState('saved');
    }
  };

  const handleEdit = () => {
    setEditValue(String(savedWeight ?? ''));
    setCardState('editing');
  };

  const handleUpdate = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val > 0) {
      setSavedWeight(val);
      setCardState('saved');
    }
  };

  const handleCancel = () => {
    setCardState('saved');
  };

  return (
    <Container>
      {/* 총 증가량 카드 */}
      <SummaryCard>
        <SectionLabel>이번 주 요약</SectionLabel>
        <GainRow>
          <GainLabel>총 증가량</GainLabel>
          <GainValue>{totalGain !== null ? `+${totalGain}kg` : '-'}</GainValue>
        </GainRow>
      </SummaryCard>

      {/* 체중 기록 카드 */}
      <RecordCard>
        <RecordTitle>{currentWeek}주차 체중 기록</RecordTitle>
        <RecordSubLabel>현재 체중 (kg)</RecordSubLabel>

        {cardState === 'input' && (
          <>
            <Input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="체중을 입력하세요"
            />
            <PrimaryButton onClick={handleSave}>체중 기록하기</PrimaryButton>
          </>
        )}

        {cardState === 'saved' && (
          <SavedRow>
            <SavedWeight>{savedWeight}</SavedWeight>
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
          시작 체중: {baseWeight}kg
          {totalGain !== null && (
            <> | 현재 증가량: <Accent>+{totalGain}kg</Accent></>
          )}
        </ChartMeta>
        <ResponsiveContainer width="100%" height={200}>
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
              domain={['auto', 'auto']}
              label={{ value: '체중 (kg)', angle: -90, position: 'insideLeft', offset: 16, fontSize: 10, fill: '#8b7e74' }}
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
  padding-bottom: 120px;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  overflow-y: auto;
`;
const SummaryCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.sub};
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
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
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
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  &:focus { border-color: ${({ theme }) => theme.colors.point}; }
`;
const PrimaryButton = styled.button`
  flex: 1;
  width: 100%;
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
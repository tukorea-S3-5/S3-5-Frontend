import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Card, TabMenu } from '../../components';
import ExerciseCard from './components/ExerciseCard';
import MOMI_empty from '@assets/icons/images/MOMI_empty.png';
import { getJson, postJson } from '../../api/http';

interface ExerciseFromAPI {
  exercise_id: number;
  exercise_name: string;
  category_name: string;
  intensity: string;
  position_type: string;
  fall_risk: boolean;
  allowed_trimesters: number[];
  description: string;
  difficulty_label: string;
}

interface SessionResponse {
  session: {
    session_id: number;
    status: string;
    started_at: string;
  };
  records: {
    record_id: number;
    exercise_id: number;
    exercise_name: string;
    order_index: number;
  }[];
}

interface RecommendResponse {
  recommend: ExerciseFromAPI[];
  caution: ExerciseFromAPI[];
  not_recommend: ExerciseFromAPI[];
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  videoUrl: string;
}

const toExercise = (e: ExerciseFromAPI): Exercise => ({
  id: String(e.exercise_id),
  title: e.exercise_name,
  description: e.description,
  category: e.category_name,
  difficulty: e.difficulty_label,
  videoUrl: e.video_url ?? '',
});

const TAB_KEYS = ['추천', '주의', '비추천'] as const;
type TabKey = typeof TAB_KEYS[number];

const ExerciseListPage = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<TabKey>('추천');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [data, setData] = useState<RecommendResponse>({ recommend: [], caution: [], not_recommend: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getJson<RecommendResponse>(`/recommend?t=${Date.now()}`)
      .then(json => setData(json))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const exercisesByTab: Record<TabKey, Exercise[]> = {
    추천: data.recommend.map(toExercise),
    주의: data.caution.map(toExercise),
    비추천: data.not_recommend.map(toExercise),
  };

  const tabs = TAB_KEYS.map(key => ({
    key,
    label: key,
    count: exercisesByTab[key].length,
  }));

  const exercises = exercisesByTab[selectedTab];

  const handleExerciseClick = (id: string) => {
    setSelectedExercises(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleStartAll = async () => {
    try {
      const res = await postJson<SessionResponse>('/exercise/session/start');
      navigate('/exercise', { state: { exercises, session: { ...res.session, records: res.records } } });
    } catch {
      navigate('/exercise', { state: { exercises } });
    }
  };

  const handleStartSelected = async () => {
    const selected = exercises.filter(e => selectedExercises.includes(e.id));
    try {
      const res = await postJson<SessionResponse>('/exercise/record/start', {
        exercise_ids: selected.map(e => Number(e.id)),
      });
      navigate('/exercise', { state: { exercises: selected, session: { ...res.session, records: res.records } } });
    } catch {
      navigate('/exercise', { state: { exercises: selected } });
    }
  };

  return (
    <Container>
      <Title>오늘의 추천 운동</Title>

      <Card variant="warning" icon="⚠️" title="운동 전 주의사항">
        <p>운동 시작 전 반드시 담당 의사와 상담하세요. 출혈, 어지러움, 호흡곤란 등의 증상이 나타나면 즉시 중단하세요.</p>
      </Card>

      <Card variant="info" icon="💡" title="3분기 운동 가이드라인 (ACOG)">
        <ul>
          <li>운동 강도와 시간을 점진적으로 줄이기</li>
          <li>낙상 위험이 높은 운동 피하기</li>
          <li>골반저근 운동(케겔) 지속</li>
          <li>조기 진통 징후 시 즉시 운동 중단</li>
        </ul>
      </Card>

      <TabMenu
        tabs={tabs}
        activeTab={selectedTab}
        onTabChange={(key) => {
          setSelectedTab(key as TabKey);
          setSelectedExercises([]);
        }}
      />

      <ExerciseList>
        {loading ? (
          <EmptyState><EmptyText>운동 목록을 불러오는 중...</EmptyText></EmptyState>
        ) : error ? (
          <EmptyState><EmptyText>운동 목록을 불러오지 못했어요 😢{'\n'}잠시 후 다시 시도해주세요</EmptyText></EmptyState>
        ) : exercises.length === 0 ? (
          <EmptyState>
            <EmptyImage src={MOMI_empty} alt="운동 없음" />
            <EmptyText>조건에 맞는 추천 운동이 없네요!{'\n'}오늘은 푹 쉬세요 🌸</EmptyText>
          </EmptyState>
        ) : (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              id={exercise.id}
              title={exercise.title}
              description={exercise.description}
              category={exercise.category}
              difficulty={exercise.difficulty}
              selected={selectedExercises.includes(exercise.id)}
              onClick={() => handleExerciseClick(exercise.id)}
            />
          ))
        )}
      </ExerciseList>

      {exercises.length > 0 && (
        <ButtonArea>
          <OutlineButton onClick={handleStartAll}>전체 시작</OutlineButton>
          <FillButton disabled={selectedExercises.length === 0} onClick={handleStartSelected}>
            선택한 운동 시작
          </FillButton>
        </ButtonArea>
      )}
    </Container>
  );
};

const Container = styled.div`padding-bottom: 100px;`;

const Title = styled.h1`
  ${({ theme }) => theme.typography.heading1}
  color: ${({ theme }) => theme.colors.point};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  gap: ${({ theme }) => theme.spacing.md};
`;

const EmptyImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
`;

const EmptyText = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
  white-space: pre-line;
  margin: 0;
`;

const ButtonArea = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 430px;
  width: calc(100% - 40px);
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const OutlineButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.point};
  background: transparent;
  color: ${({ theme }) => theme.colors.point};
  ${({ theme }) => theme.typography.button}
  cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
  &:active { transform: scale(0.98); }
`;

const FillButton = styled.button<{ disabled: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, disabled }) => disabled ? theme.colors.middle : theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.typography.button}
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  &:hover:not(:disabled) { filter: brightness(0.9); }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

export default ExerciseListPage;
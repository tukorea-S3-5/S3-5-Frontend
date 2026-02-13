import React, { useState } from 'react';
import styled from 'styled-components';
import { Card, TabMenu } from '../../components';
import ExerciseCard from './components/ExerciseCard';

interface Exercise {
    id: string;
    title: string;
    description: string;
    category: '요가' | '근력' | '유산소' | '스트레칭';
    difficulty: '초급' | '중급' | '고급';
}

const ExerciseListPage: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<string>('추천');
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

    const exercises: Exercise[] = [
        {
            id: '1',
            title: '임신부 요가',
            description: '유연성과 호흡을 중점으로 하는 부드러운 운동',
            category: '요가',
            difficulty: '초급',
        },
        {
            id: '2',
            title: '케겔 운동',
            description: '골반저근 강화를 위한 필수 운동',
            category: '근력',
            difficulty: '초급',
        },
        {
            id: '3',
            title: '가벼운 걷기',
            description: '임신 초기에 가장 안전하고 효과적인 유산소 운동',
            category: '유산소',
            difficulty: '초급',
        },
        {
            id: '4',
            title: '스트레칭',
            description: '몸의 긴장을 풀고 유연성을 높이는 운동',
            category: '스트레칭',
            difficulty: '초급',
        },
    ];

    const tabs = [
        { key: '추천', label: '추천', count: 7 },
        { key: '주의', label: '주의', count: 1 },
        { key: '비추천', label: '비추천', count: 4 },
    ];

    const handleExerciseClick = (exerciseId: string) => {
        setSelectedExercises(prev => {
            if (prev.includes(exerciseId)) {
                return prev.filter(id => id !== exerciseId);
            } else {
                return [...prev, exerciseId];
            }
        });
    };

    return (
        <Container>
            <Title>오늘의 추천 운동</Title>

            <Card variant="warning" icon="⚠️" title="운동 전 주의사항">
                <p>
                    운동 시작 전 반드시 담당 의사와 상담하세요. 출혈, 어지러움, 호흡곤란 등의 증상이 나타나면 즉시 중단하세요.
                </p>
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
                onTabChange={(key) => setSelectedTab(key)}
            />

            <ExerciseList>
                {exercises.map((exercise) => (
                    <ExerciseCardWrapper
                        key={exercise.id}
                        $selected={selectedExercises.includes(exercise.id)}
                        onClick={() => handleExerciseClick(exercise.id)}
                    >
                        <ExerciseCard
                            id={exercise.id}
                            title={exercise.title}
                            description={exercise.description}
                            category={exercise.category}
                            difficulty={exercise.difficulty}
                        />
                        {selectedExercises.includes(exercise.id) && (
                            <CheckIcon>✓</CheckIcon>
                        )}
                    </ExerciseCardWrapper>
                ))}
            </ExerciseList>

            <ButtonArea>
                <ResetButton>전체 시작</ResetButton>
                <StartButton disabled={selectedExercises.length === 0}>
                    선택한 운동 시작
                </StartButton>
            </ButtonArea>
        </Container>
    );
};

const Container = styled.div`
  padding-bottom: 100px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #FF6B6B;
  margin: 0 0 24px 0;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const ExerciseCardWrapper = styled.div<{ $selected: boolean }>`
  position: relative;
  border: ${props => props.$selected ? '2px solid #FF6B6B' : '2px solid transparent'};
  border-radius: 18px;
  transition: border 0.2s;
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  background: #FF6B6B;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
`;

const ButtonArea = styled.div`
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 430px;
  width: calc(100% - 40px);
  display: flex;
  gap: 12px;
`;

const ResetButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 1.5px solid #FF6B6B;
  background: transparent;
  color: #FF6B6B;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #FFF5F5;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StartButton = styled.button<{ disabled: boolean }>`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: ${props => props.disabled ? '#FFD4D4' : '#FF6B6B'};
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: #FF5252;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export default ExerciseListPage;
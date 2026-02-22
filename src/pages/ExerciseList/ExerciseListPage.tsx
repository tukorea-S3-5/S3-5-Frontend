import React, { useState } from "react";
import styled from "styled-components";
import { Card, TabMenu } from "../../components";
import ExerciseCard from "./components/ExerciseCard";
import { theme } from "../../styles/theme";
import noExercise from "../../assets/icons/images/noexercise.png";

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: "요가" | "근력 운동" | "유산소" | "필라테스" | "기능성/이완";
  difficulty: "초급" | "중급" | "고급";
}

const ExerciseListPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>("추천");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  // 탭별로 exercises를 받아오는 구조 — 현재는 추천만 데이터 있음
  const exercisesByTab: Record<string, Exercise[]> = {
    추천: [
      {
        id: "1",
        title: "임신부 요가",
        description: "유연성과 호흡을 중점으로 하는 부드러운 운동",
        category: "요가",
        difficulty: "초급",
      },
      {
        id: "2",
        title: "케겔 운동",
        description: "골반저근 강화를 위한 필수 운동",
        category: "근력 운동",
        difficulty: "초급",
      },
      {
        id: "3",
        title: "가벼운 걷기",
        description: "임신 초기에 가장 안전하고 효과적인 유산소 운동",
        category: "유산소",
        difficulty: "초급",
      },
      {
        id: "4",
        title: "스트레칭",
        description: "몸의 긴장을 풀고 유연성을 높이는 운동",
        category: "기능성/이완",
        difficulty: "초급",
      },
    ],
    주의: [],
    비추천: [],
  };

  const tabs = [
    { key: "추천", label: "추천", count: 7 },
    { key: "주의", label: "주의", count: 1 },
    { key: "비추천", label: "비추천", count: 4 },
  ];

  const exercises = exercisesByTab[selectedTab] ?? [];

  const handleExerciseClick = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId],
    );
  };

  return (
    <Container>
      <Title>오늘의 추천 운동</Title>

      <Card variant="warning" icon="⚠️" title="운동 전 주의사항">
        <p>
          운동 시작 전 반드시 담당 의사와 상담하세요. 출혈, 어지러움, 호흡곤란
          등의 증상이 나타나면 즉시 중단하세요.
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
        {exercises.length === 0 ? (
          <EmptyState>
            <EmptyImage src={noExercise} alt="운동 없음" />
            <EmptyText>
              조건에 맞는 추천 운동이 없네요!{"\n"}오늘은 푹 쉬세요 🌸
            </EmptyText>
          </EmptyState>
        ) : (
          exercises.map((exercise) => (
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
          <ResetButton onClick={() => setSelectedExercises([])}>
            전체 시작
          </ResetButton>
          <StartButton disabled={selectedExercises.length === 0}>
            선택한 운동 시작
          </StartButton>
        </ButtonArea>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding-bottom: 100px;
`;

const Title = styled.h1`
  ${theme.typography.heading1}
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
  ${theme.typography.body1}
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

const ResetButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.point};
  background: transparent;
  color: ${({ theme }) => theme.colors.point};
  ${theme.typography.button}
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.light};
  }
  &:active {
    transform: scale(0.98);
  }
`;

const StartButton = styled.button<{ disabled: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.middle : theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  ${theme.typography.button}
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    filter: brightness(0.9);
  }
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

export default ExerciseListPage;

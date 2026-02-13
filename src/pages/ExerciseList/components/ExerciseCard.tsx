import React from 'react';
import styled from 'styled-components';
import DifficultyChip from './DifficultyChip';

interface ExerciseCardProps {
  id: string;
  title: string;
  description: string;
  category: '요가' | '근력' | '유산소' | '스트레칭';
  difficulty?: '초급' | '중급' | '고급';
  duration?: number;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  category,
  difficulty,
  onClick,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '요가':
        return '#FFD4D4';
      case '근력':
        return '#FFE4D4';
      case '유산소':
        return '#FFE4E4';
      case '스트레칭':
        return '#FFD4E4';
      default:
        return '#F5F5F5';
    }
  };

  const getCategoryTextColor = (cat: string) => {
    switch (cat) {
      case '요가':
        return '#FF6B6B';
      case '근력':
        return '#FF8C6B';
      case '유산소':
        return '#FF8C8C';
      case '스트레칭':
        return '#FF6B8C';
      default:
        return '#999';
    }
  };

  return (
    <CardContainer onClick={onClick}>
      <CategoryIcon
        $bgColor={getCategoryColor(category)}
        $textColor={getCategoryTextColor(category)}
      >
        {category}
      </CategoryIcon>

      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        {difficulty && <DifficultyChip level={difficulty} />}
      </CardContent>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div<{ $bgColor: string; $textColor: string }>`
  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  height: fit-content;
  flex-shrink: 0;
  min-width: 50px;
  text-align: center;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTitle = styled.h4`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
`;

export default ExerciseCard;
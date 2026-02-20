import React from 'react';
import styled from 'styled-components';

interface ExerciseCardProps {
  id: string;
  title: string;
  description: string;
  category:
  | '유산소'
  | '요가'
  | '필라테스'
  | '근력 운동'
  | '기능성/이완';
  difficulty?: '초급' | '중급' | '고급';
  selected?: boolean;
  onClick?: () => void;
}

const CATEGORY_STYLE = {
  '유산소': { bg: '#F3E6E2', text: '#FF5A5A' },
  '요가': { bg: '#F3E6E2', text: '#FF5A5A' },
  '필라테스': { bg: '#F3E6E2', text: '#FF5A5A' },
  '근력 운동': { bg: '#F3E6E2', text: '#FF5A5A' },
  '기능성/이완': { bg: '#F3E6E2', text: '#FF5A5A' },
} as const;

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  category,
  difficulty,
  selected = false,
  onClick,
}) => {
  const style = CATEGORY_STYLE[category];

  return (
    <CardContainer onClick={onClick} $selected={selected}>
      {selected && <CheckMark>✓</CheckMark>}

      <CategoryIcon $bgColor={style.bg} $textColor={style.text}>
        {category}
      </CategoryIcon>

      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        {difficulty && (
          <DifficultyChip level={difficulty}>
            {difficulty}
          </DifficultyChip>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default ExerciseCard;


const CardContainer = styled.div<{ $selected: boolean }>`
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 16px;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;

  border: 2px solid
    ${props => (props.$selected ? '#FF6B6B' : 'transparent')};

  &:hover {
    transform: translateY(-2px);
  }
`;

const CheckMark = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;

  width: 24px;
  height: 24px;
  border-radius: 50%;

  background: #FF6B6B;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 14px;
  font-weight: bold;
`;

const CategoryIcon = styled.div`
  width: 56px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #F3E6E2; //todo:  light 테마색 적용
  color: #FF5A5A;  //todo:  point 테마색 적용

  border-radius: 16px;

  font-size: 14px;
  font-weight: 700;

  text-align: center;
  line-height: 1.2;
  padding: 6px;

  flex-shrink: 0;
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

const DifficultyChip = styled.span<{ level: '초급' | '중급' | '고급' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: fit-content;
  white-space: nowrap;

  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  ${({ level }) => {
    switch (level) {
      case '초급':
        return `
          background: #FFE5E5;
          color: #FF6B6B;
        `;
      case '중급':
        return `
          background: #FFF4E5;
          color: #FF9800;
        `;
      case '고급':
        return `
          background: #E8F5E9;
          color: #4CAF50;
        `;
    }
  }}
`;
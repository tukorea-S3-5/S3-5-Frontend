import React from 'react';
import styled from 'styled-components';

interface ExerciseCardProps {
  id: string;
  title: string;
  description: string;
  category: '유산소' | '요가' | '필라테스' | '근력 운동' | '기능성/이완';
  difficulty?: '초급' | '중급' | '고급';
  selected?: boolean;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  category,
  difficulty,
  selected = false,
  onClick,
}) => {
  return (
    <CardContainer onClick={onClick} $selected={selected}>
      {selected && <CheckMark>✓</CheckMark>}

      <CategoryIcon>{category}</CategoryIcon>

      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {difficulty && (
          <DifficultyChip $level={difficulty}>{difficulty}</DifficultyChip>
        )}
      </CardContent>
    </CardContainer>
  );
};

export default ExerciseCard;

const CardContainer = styled.div<{ $selected: boolean }>`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${({ theme, $selected }) =>
    $selected ? theme.colors.point : 'transparent'};

  &:hover {
    transform:;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CheckMark = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme }) => theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

const CategoryIcon = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.light};  /* light 테마색 */
  color: ${({ theme }) => theme.colors.point};        /* point 테마색 */
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  text-align: center;
  line-height: 1.2;
  padding: 6px;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CardTitle = styled.h4`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CardDescription = styled.p`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const DifficultyChip = styled.span<{ $level: '초급' | '중급' | '고급' }>`
  ${({ theme }) => theme.typography.caption}
  display: inline-flex;
  align-items: center;
  width: fit-content;
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};

  ${({ theme, $level }) => {
    switch ($level) {
      case '초급':
        return `background: ${theme.colors.light}; color: ${theme.colors.point};`;
      case '중급':
        return `background: #FFF4E5; color: ${theme.colors.warning};`;
      case '고급':
        return `background: #E8F5E9; color: ${theme.colors.success};`;
    }
  }}
`;

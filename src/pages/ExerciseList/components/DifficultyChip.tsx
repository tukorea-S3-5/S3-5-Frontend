import React from 'react';
import styled from 'styled-components';

interface DifficultyChipProps {
  level: '초급' | '중급' | '고급';
}

const DifficultyChip: React.FC<DifficultyChipProps> = ({ level }) => {
  const getChipColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return {
          bg: '#FFE5E5',
          text: '#FF6B6B',
        };
      case '중급':
        return {
          bg: '#FFF4E5',
          text: '#FF9800',
        };
      case '고급':
        return {
          bg: '#E8F5E9',
          text: '#4CAF50',
        };
      default:
        return {
          bg: '#F5F5F5',
          text: '#999',
        };
    }
  };

  const colors = getChipColor(level);

  return (
    <Chip $bgColor={colors.bg} $textColor={colors.text}>
      {level}
    </Chip>
  );
};

const Chip = styled.span<{ $bgColor: string; $textColor: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  align-self: flex-start;  
  width: fit-content;
  white-space: nowrap; 

  background: ${props => props.$bgColor};
  color: ${props => props.$textColor};

  padding: 4px 12px;
  border-radius: 10px;

  font-size: 12px;
  font-weight: 600;
`;

export default DifficultyChip;

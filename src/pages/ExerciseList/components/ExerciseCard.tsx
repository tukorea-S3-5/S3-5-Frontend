import React from "react";
import styled from "styled-components";

interface ExerciseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  aiComment?: string;
  selected?: boolean;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  category,
  difficulty,
  aiComment,
  selected = false,
  onClick,
}) => {
  return (
    <CardContainer onClick={onClick} $selected={selected}>
      {selected && <CheckMark>✓</CheckMark>}

      <CardTopRow>
        <CategoryIcon>{category}</CategoryIcon>

        <CardContent>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {difficulty && (
            <DifficultyChip $level={difficulty}>{difficulty}</DifficultyChip>
          )}
        </CardContent>
      </CardTopRow>

      {aiComment && (
        <AiCommentBox>
          <AiIcon>✨</AiIcon>
          <AiText>
            <strong>MOMI AI:</strong>{" "}
            {aiComment.startsWith(title)
              ? aiComment.replace(title, "").replace(/^은\s|^는\s/, "")
              : aiComment}
          </AiText>
        </AiCommentBox>
      )}
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
  flex-direction: column; /* 추가: 전체 레이아웃을 위아래로 쌓음 */
  gap: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.point : "transparent"};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CardTopRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start; /* 아이콘과 텍스트 상단 선 맞춤 */
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
  background: ${({ theme }) => theme.colors.light};
  color: ${({ theme }) => theme.colors.point};
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

const DifficultyChip = styled.span<{ $level: string }>`
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
      case "초급":
        return `background: ${theme.colors.light}; color: ${theme.colors.point};`;
      case "중급":
        return `background: #FFF4E5; color: ${theme.colors.warning};`;
      case "고급":
        return `background: #E8F5E9; color: ${theme.colors.success};`;
      default:
        return `background: ${theme.colors.light}; color: ${theme.colors.subtext};`;
    }
  }}
`;

const AiCommentBox = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.point}20;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: flex-start;
`;

const AiIcon = styled.span`
  font-size: ${({ theme }) => theme.fontSize.sm};
  margin-top: 2px; /* 텍스트와 높이 맞춤 */
`;

const AiText = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  word-break: keep-all; /* 단어 단위로 줄바꿈되도록 설정 */
  line-height: 1.4;

  strong {
    color: ${({ theme }) => theme.colors.point};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin-right: 4px;
  }
`;

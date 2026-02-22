import styled from 'styled-components';

interface ExerciseListItemProps {
  index: number;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function ExerciseListItem({
  index,
  title,
  isActive = false,
  onClick,
}: ExerciseListItemProps) {
  return (
    <Item $active={isActive} onClick={onClick}>
      <Badge $active={isActive}>{index}</Badge>
      <Info>
        <Title $active={isActive}>{title}</Title>
      </Info>
    </Item>
  );
}

const Item = styled.button<{ $active: boolean }>`
  width: 100%;
  height: 70px;
  background: ${({ theme, $active }) => $active ? theme.colors.light : theme.colors.white};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.point : theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover { background: ${({ theme }) => theme.colors.light}; }
  &:active { transform: scale(0.98); }
`;

const Badge = styled.div<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  background: ${({ theme, $active }) => $active ? theme.colors.point : '#f5f5f5'};
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.subtext};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.typography.label}
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
`;

const Title = styled.p<{ $active: boolean }>`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme, $active }) => $active ? theme.colors.point : theme.colors.text.primary};
  margin: 0;
`;

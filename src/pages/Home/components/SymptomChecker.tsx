import { useState } from 'react';
import styled from 'styled-components';

interface Symptom {
  id: string;
  emoji: string;
  label: string;
  checked: boolean;
}

interface SymptomCheckerProps {
  onSubmit?: (symptoms: Symptom[]) => void;
  onNoSymptom?: () => void;
}

const DEFAULT_SYMPTOMS: Symptom[] = [
  { id: '1', emoji: '🤰', label: '배뭉침', checked: false },
  { id: '2', emoji: '💢', label: '골반통증', checked: false },
  { id: '3', emoji: '🔙', label: '요통', checked: false },
  { id: '4', emoji: '🦵', label: '다리부종', checked: false },
  { id: '5', emoji: '✋', label: '손발저림', checked: false },
  { id: '6', emoji: '🍽️', label: '소화불량', checked: false },
  { id: '7', emoji: '😴', label: '불면증', checked: false },
  { id: '8', emoji: '😫', label: '피로감', checked: false },
];

export default function SymptomChecker({ onSubmit, onNoSymptom }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState<Symptom[]>(DEFAULT_SYMPTOMS);

  const hasSelected = symptoms.some(s => s.checked);

  const toggle = (id: string) =>
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));

  return (
    <Card>
      <CardTitle>오늘의 증상을 선택하세요</CardTitle>

      <Grid>
        {symptoms.map(symptom => (
          <SymptomButton key={symptom.id} $checked={symptom.checked} onClick={() => toggle(symptom.id)}>
            <Emoji>{symptom.emoji}</Emoji>
            <Label>{symptom.label}</Label>
            <Checkbox $checked={symptom.checked}>
              {symptom.checked && (
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '100%', height: '100%', color: 'white' }}>
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </Checkbox>
          </SymptomButton>
        ))}
      </Grid>

      <SubmitButton
        $active={hasSelected}
        onClick={() => hasSelected && onSubmit?.(symptoms.filter(s => s.checked))}
        disabled={!hasSelected}
      >
        {hasSelected ? '증상 기록하기' : '증상을 선택해주세요'}
      </SubmitButton>

      <NoSymptomButton onClick={onNoSymptom}>
        😊 오늘은 증상이 없어요
      </NoSymptomButton>
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 2px solid ${({ theme }) => theme.colors.point};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const CardTitle = styled.h3`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.point};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SymptomButton = styled.button<{ $checked: boolean }>`
  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme, $checked }) => $checked ? theme.colors.point : theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.light}; }
`;

const Emoji = styled.span`font-size: 20px;`;

const Label = styled.span`
  flex: 1;
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
`;

const Checkbox = styled.div<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid ${({ theme, $checked }) => $checked ? theme.colors.point : theme.colors.sub};
  background: ${({ theme, $checked }) => $checked ? theme.colors.point : theme.colors.white};
  flex-shrink: 0;
`;

const SubmitButton = styled.button<{ $active: boolean }>`
  width: 100%;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: ${({ theme, $active }) => $active ? theme.colors.point : theme.colors.sub};
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.subtext};
  ${({ theme }) => theme.typography.button}
  cursor: ${({ $active }) => $active ? 'pointer' : 'not-allowed'};
  transition: background 0.15s;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NoSymptomButton = styled.button`
  width: 100%;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1.5px solid ${({ theme }) => theme.colors.sub};
  background: transparent;
  color: ${({ theme }) => theme.colors.subtext};
  ${({ theme }) => theme.typography.body2}
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.point};
    color: ${({ theme }) => theme.colors.point};
  }
`;

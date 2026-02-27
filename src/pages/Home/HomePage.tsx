import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SymptomChecker from './components/SymptomChecker';
import { postJson } from '../../api/http';

interface Symptom {
  id: string;
  emoji: string;
  label: string;
  code: string;
  checked: boolean;
}

// SymptomChecker label → API 코드 매핑


interface HomePageProps {
  weekNumber?: number;
  currentWeek?: number;
  remainingWeeks?: number;
  weightGain?: number;
  babySize?: string;
  recommendedWeightRange?: string;
}

export default function HomePage({
  weekNumber = 40,
  currentWeek = 20,
  remainingWeeks = 40,
  weightGain = 0.0,
  babySize = '작은 호박 크기',
  recommendedWeightRange = '13-16kg',
}: HomePageProps) {
  const navigate = useNavigate();
  const progressPercentage = (currentWeek / 40) * 100;

  const handleSymptomSubmit = async (symptoms: Symptom[]) => {
    const codes = symptoms.map(s => s.code);
    try {
      await postJson('/symptom', { symptoms: codes });
    } catch {
      // 실패해도 운동 목록으로 이동
    }
    navigate('/exercises');
  };

  const handleNoSymptom = () => {
    // 증상 없음 → /symptom 호출 없이 바로 이동 (빈 배열은 validation 에러)
    navigate('/exercises');
  };

  return (
    <Container>
      <PregnancyCard>
        <PregnancyMeta>현재 임신</PregnancyMeta>
        <PregnancyWeek>{weekNumber}주차</PregnancyWeek>
        <PregnancyTrimester>3분기 • 출산 예정일</PregnancyTrimester>

        <InfoRow>
          <InfoBox>
            <InfoLabel>⚡ 체중 증가</InfoLabel>
            <InfoValue>+{weightGain.toFixed(1)}kg</InfoValue>
          </InfoBox>
          <InfoBox>
            <InfoLabel>🍼 아기 크기</InfoLabel>
            <InfoValue $small>{babySize}</InfoValue>
          </InfoBox>
        </InfoRow>

        <ProgressRow>
          <ProgressLabel>현재 <strong>{currentWeek}주차</strong></ProgressLabel>
          <ProgressLabel>남은 기간 <strong>{remainingWeeks}주</strong></ProgressLabel>
        </ProgressRow>
        <ProgressBarTrack>
          <ProgressBarFill style={{ width: `${progressPercentage}%` }} />
        </ProgressBarTrack>
      </PregnancyCard>

      <SymptomChecker
        onSubmit={handleSymptomSubmit}
        onNoSymptom={handleNoSymptom}
      />

      <HealthCard>
        <HealthTitle>➕ 이번 주 건강 정보</HealthTitle>

        <HealthSection>
          <HealthSectionLabel>권장 체중 증가</HealthSectionLabel>
          <HealthSectionValue>{recommendedWeightRange}</HealthSectionValue>
        </HealthSection>

        <Divider />

        <HealthSectionTitle>관련 증상</HealthSectionTitle>
        <HealthList>
          <HealthListItem>갑작스런 수축</HealthListItem>
          <HealthListItem>양수 터짐 가능</HealthListItem>
          <HealthListItem>진통</HealthListItem>
        </HealthList>

        <Divider />

        <HealthSectionTitle $accent>오늘의 팁</HealthSectionTitle>
        <HealthList>
          <HealthListItem>즉시 병원 방문</HealthListItem>
          <HealthListItem>차분하게 호흡</HealthListItem>
        </HealthList>
      </HealthCard>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: 120px;
  min-height: 100%;
`;
const PregnancyCard = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border: 2px solid ${({ theme }) => theme.colors.point};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;
const PregnancyMeta = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.point};
  margin: 0 0 4px 0;
`;
const PregnancyWeek = styled.h1`
  font-size: 30px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.point};
  margin: 0 0 4px 0;
  line-height: 1.2;
`;
const PregnancyTrimester = styled.p`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.point};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;
const InfoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
const InfoBox = styled.div`
  flex: 1;
  min-width: 0;
  background: rgba(255,255,255,0.6);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const InfoLabel = styled.span`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.point};
  white-space: nowrap;
`;
const InfoValue = styled.span<{ $small?: boolean }>`
  font-size: ${({ $small }) => $small ? '14px' : '18px'};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.point};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const ProgressRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;
const ProgressLabel = styled.span`
  ${({ theme }) => theme.typography.caption}
  color: ${({ theme }) => theme.colors.text.primary};
`;
const ProgressBarTrack = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) => theme.colors.point};
  overflow: hidden;
`;
const ProgressBarFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.point};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.3s ease;
`;
const HealthCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.sub};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;
const HealthTitle = styled.h3`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;
const HealthSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;
const HealthSectionLabel = styled.span`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.point};
`;
const HealthSectionValue = styled.span`
  ${({ theme }) => theme.typography.body1}
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;
const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.sub};
  margin: ${({ theme }) => theme.spacing.md} 0;
`;
const HealthSectionTitle = styled.p<{ $accent?: boolean }>`
  ${({ theme }) => theme.typography.body1}
  font-weight: 700;
  color: ${({ theme, $accent }) => $accent ? theme.colors.point : theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;
const HealthList = styled.ul`
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const HealthListItem = styled.li`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.primary};
`;
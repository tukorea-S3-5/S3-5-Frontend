import styled from 'styled-components';
import { Button } from '../components/index';

const HomePage = () => {
  return (
    <Container>
      <Content>
        <WelcomeSection>
          <Title>안녕하세요! 👋</Title>
          <Subtitle>오늘도 건강한 하루 보내세요</Subtitle>
        </WelcomeSection>

        <ExerciseCard>
          <CardHeader>
            <CardTitle>오늘의 운동</CardTitle>
            <Badge>추천</Badge>
          </CardHeader>
          <CardContent>
            <ExerciseImage>🤰</ExerciseImage>
            <ExerciseInfo>
              <ExerciseName>임산부 요가</ExerciseName>
              <ExerciseTime>15분 • 초급</ExerciseTime>
            </ExerciseInfo>
          </CardContent>
          <Button size="long" variant="primary" onClick={() => console.log('운동 시작')}>
            시작하기
          </Button>
        </ExerciseCard>

        <Section>
          <SectionTitle>운동 카테고리</SectionTitle>
          <CategoryGrid>
            <CategoryCard onClick={() => console.log('요가')}>
              <CategoryIcon>🧘‍♀️</CategoryIcon>
              <CategoryName>요가</CategoryName>
            </CategoryCard>
            <CategoryCard onClick={() => console.log('걷기')}>
              <CategoryIcon>🚶‍♀️</CategoryIcon>
              <CategoryName>걷기</CategoryName>
            </CategoryCard>
            <CategoryCard onClick={() => console.log('스트레칭')}>
              <CategoryIcon>💪</CategoryIcon>
              <CategoryName>스트레칭</CategoryName>
            </CategoryCard>
            <CategoryCard onClick={() => console.log('유산소')}>
              <CategoryIcon>🏃‍♀️</CategoryIcon>
              <CategoryName>유산소</CategoryName>
            </CategoryCard>
          </CategoryGrid>
        </Section>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  min-height: ${({ theme }) => theme.layout.minHeight};
  background: ${({ theme }) => theme.colors.background};
  margin: 0 auto;
  position: relative;
  padding-bottom: 80px;
`;

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const WelcomeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  ${({ theme }) => theme.typography.heading1}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Subtitle = styled.p`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ExerciseCard = styled.div`
  background-color: ${({ theme }) => theme.colors.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CardTitle = styled.h2`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Badge = styled.span`
  ${({ theme }) => theme.typography.caption}
  background-color: ${({ theme }) => theme.colors.point};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

const CardContent = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ExerciseImage = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
`;

const ExerciseInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ExerciseName = styled.h3`
  ${({ theme }) => theme.typography.heading3}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ExerciseTime = styled.p`
  ${({ theme }) => theme.typography.body2}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  ${({ theme }) => theme.typography.heading2}
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryCard = styled.button`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const CategoryIcon = styled.div`
  font-size: 40px;
`;

const CategoryName = styled.span`
  ${({ theme }) => theme.typography.body1}
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default HomePage;

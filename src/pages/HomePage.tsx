import styled from 'styled-components';
import { Header, Button } from '../components/index';

const HomePage = () => {
  return (
    <Container>
      <Header
        weekInfo="40주차"
        onNotificationClick={() => console.log('알림')}
        onSettingsClick={() => console.log('설정')}
      />

      <Content>
        <WelcomeSection>
          <Title>안녕하세요! 👋</Title>
          <Subtitle>오늘도 건강한 하루 보내세요</Subtitle>
        </WelcomeSection>

        <ExerciseCard>
          <CardHeader>
            <CardTitle>오늘의 운동</CardTitle>
            <BadgeStyled>추천</BadgeStyled>
          </CardHeader>
          <CardContent>
            <ExerciseImage>🤰</ExerciseImage>
            <ExerciseInfo>
              <ExerciseName>임산부 요가</ExerciseName>
              <ExerciseTime>15분 • 초급</ExerciseTime>
            </ExerciseInfo>
          </CardContent>
          <Button
            size="long"
            variant="primary"
            onClick={() => console.log('운동 시작')}
          >
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
  max-width: 430px;
  min-height: 100vh;
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
  font-size: ${({ theme }) => theme.fontSize.xxl};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ExerciseCard = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
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
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BadgeStyled = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.xs};
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
  background-color: white;
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
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ExerciseTime = styled.p`
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryCard = styled.button`
  background-color: white;
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
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default HomePage;
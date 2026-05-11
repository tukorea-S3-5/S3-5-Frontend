import React, { useEffect, useState } from 'react';
import ProfileSection from './components/ProfileSection';
import PregnancyInfoCard from './components/PregnancyInfoCard';
import HeartRateCard, { DailyHeartRate } from './components/HeartRateCard';
import PostsTab from './components/PostsTab';
import styles from './MyPage.module.css';

// TODO: 실제 API 연동 시 아래 mock 데이터를 교체하세요
const MOCK_WEEKLY_HR: DailyHeartRate[] = [
  { day: '월', bpm: 72 },
  { day: '화', bpm: 75 },
  { day: '수', bpm: 70 },
  { day: '목', bpm: 73 },
  { day: '금', bpm: 71 },
  { day: '토', bpm: 69 },
  { day: '오늘', bpm: null }, // 오늘 데이터 없으면 null
];

const MyPage: React.FC = () => {
  const [hasTodayHR, setHasTodayHR] = useState(false);

  // 오늘 심박수 데이터 존재 여부 확인
  useEffect(() => {
    const today = MOCK_WEEKLY_HR.find((d) => d.day === '오늘');
    setHasTodayHR(today?.bpm !== null);
  }, []);

  const weeklyAvg = (() => {
    const valid = MOCK_WEEKLY_HR.filter((d) => d.bpm !== null).map((d) => d.bpm as number);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  })();

  const handleMeasure = () => {
    // TODO: 운동 시작 전 1분 심박 측정 화면으로 이동
    console.log('측정하기 클릭');
  };

  return (
    <div className={styles.page}>
      {/* 프로필 */}
      <ProfileSection
        name="홍길동"
        handle="@me"
        postCount={0}
        likeCount={1}
        exerciseCount={12}
      />

      <div className={styles.scrollContent}>
        {/* 임신 정보 */}
        <PregnancyInfoCard
          dueDate="2026년 7월 20일"
          dDay={98}
          weeksLeft={14}
          currentWeek={26}
        />

        {/* 평소 심박수 */}
        <HeartRateCard
          weeklyData={MOCK_WEEKLY_HR}
          weeklyAvg={weeklyAvg}
          hasTodayData={hasTodayHR}
          onMeasure={handleMeasure}
        />

        {/* 게시물 */}
        <PostsTab posts={[]} likedPosts={[]} />
      </div>
    </div>
  );
};

export default MyPage;

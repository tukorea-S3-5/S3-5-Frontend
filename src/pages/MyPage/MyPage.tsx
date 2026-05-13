import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from './components/ProfileSection';
import PregnancyInfoCard from './components/PregnancyInfoCard';
import HeartRateCard, { DailyHeartRate } from './components/HeartRateCard';
import PostsTab from './components/PostsTab';
import RestingHeartRateModal from '../../components/RestingHeartRateModal';
import styles from './MyPage.module.css';
import { getJson } from '../../api/http';

// ── 타입 ──────────────────────────────────────────────────────
interface PregnancyInfo {
  due_date: string;
  current_week: number;
}

interface UserInfo {
  user_id: string;
  nickname: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  userId: string;
  user: UserInfo;
}

interface HeartRateRecord {
  date: string;
  bpm: number;
}

// ── 헬퍼 ──────────────────────────────────────────────────────
const DAYS = ['월', '화', '수', '목', '금', '토', '오늘'] as const;

function calcDDay(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const dDay = Math.ceil(diff / 86400000);
  return { dDay, weeksLeft: Math.floor(dDay / 7) };
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

// ── Page ──────────────────────────────────────────────────────
// ── Page ──────────────────────────────────────────────────────
export default function MyPage() {
  const [user, setUser]             = useState<UserInfo | null>(null);
  const [pregnancy, setPregnancy]   = useState<PregnancyInfo | null>(null);
  const [weeklyHR, setWeeklyHR]     = useState<DailyHeartRate[]>(
    DAYS.map((day) => ({ day, bpm: null }))
  );
  const [myPosts, setMyPosts]       = useState<Post[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [showHRModal, setShowHRModal] = useState(false);

  // ── 유저 정보: GET /user/me ───────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const data = await getJson<UserInfo>('/user/me');
      setUser(data);
    } catch (e) {
      console.error('[MyPage] 유저 정보 로드 실패:', e);
    }
  }, []);

  // ── 임신 정보: GET /pregnancy/me ─────────────────────────
  const loadPregnancy = useCallback(async () => {
    try {
      const data = await getJson<PregnancyInfo>('/pregnancy/me');
      setPregnancy(data);
    } catch (e) {
      console.error('[MyPage] 임신 정보 로드 실패:', e);
    }
  }, []);

  // ── 주간 심박수: GET /heartrate/weekly ───────────────────
  const loadHeartRate = useCallback(async () => {
    try {
      const data = await getJson<HeartRateRecord[]>('/heartrate/weekly');
      const today = new Date();

      const mapped: DailyHeartRate[] = DAYS.map((day, i) => {
        if (day === '오늘') {
          const rec = data.find((r) => isToday(r.date));
          return { day, bpm: rec?.bpm ?? null };
        }
        // 이번 주 월~토 날짜 계산
        const target = new Date(today);
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
        target.setDate(today.getDate() - dayOfWeek + i + 1);
        const rec = data.find(
          (r) => new Date(r.date).toDateString() === target.toDateString()
        );
        return { day, bpm: rec?.bpm ?? null };
      });

      setWeeklyHR(mapped);
    } catch (e) {
      console.error('[MyPage] 심박수 로드 실패:', e);
    }
  }, []);

  // ── 내 게시물: GET /community/posts → userId 필터 ────────
  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      const all = await getJson<Post[]>('/community/posts');
      setMyPosts(all.filter((p) => p.userId === user.user_id));
    } catch (e) {
      console.error('[MyPage] 게시물 로드 실패:', e);
    }
  }, [user]);

  // ── 운동 횟수: GET /exercise/session/count ───────────────
  const loadExerciseCount = useCallback(async () => {
    try {
      const data = await getJson<{ count: number }>('/exercise/session/count');
      setExerciseCount(data.count);
    } catch (e) {
      console.error('[MyPage] 운동 횟수 로드 실패:', e);
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadPregnancy();
    loadHeartRate();
    loadExerciseCount();
  }, [loadUser, loadPregnancy, loadHeartRate, loadExerciseCount]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── 파생값 ────────────────────────────────────────────────
  const hasTodayHR = weeklyHR.find((d) => d.day === '오늘')?.bpm !== null;

  const weeklyAvg = (() => {
    const valid = weeklyHR
      .filter((d) => d.bpm !== null)
      .map((d) => d.bpm as number);
    if (!valid.length) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  })();

  const { dDay, weeksLeft } = pregnancy
    ? calcDDay(pregnancy.due_date)
    : { dDay: 0, weeksLeft: 0 };

  // 측정 완료 후 심박수 카드 새로고침
  const handleHRSaved = (bpm: number) => {
    setWeeklyHR((prev) =>
      prev.map((d) => (d.day === '오늘' ? { ...d, bpm } : d))
    );
    setShowHRModal(false);
  };

  return (
    <div className={styles.page}>
      <ProfileSection
        name={user?.nickname ?? ''}
        handle="@me"
        postCount={myPosts.length}
        likeCount={0}
        exerciseCount={exerciseCount}
      />

      <div className={styles.scrollContent}>
        {pregnancy && (
          <PregnancyInfoCard
            dueDate={formatDueDate(pregnancy.due_date)}
            dDay={dDay}
            weeksLeft={weeksLeft}
            currentWeek={pregnancy.current_week}
          />
        )}

        <HeartRateCard
          weeklyData={weeklyHR}
          weeklyAvg={weeklyAvg}
          hasTodayData={hasTodayHR}
          onMeasure={() => setShowHRModal(true)} // 모달 오픈
        />

        <PostsTab posts={myPosts} likedPosts={[]} />
      </div>

      {/* 오늘 심박 없을 때만 모달 */}
      <RestingHeartRateModal
        isOpen={showHRModal && !hasTodayHR}
        onClose={() => setShowHRModal(false)}
        onSaved={handleHRSaved}
      />
    </div>
  );
}

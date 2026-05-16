import { useEffect, useState, useCallback } from "react";
import ProfileSection from "./components/ProfileSection";
import PregnancyInfoCard from "./components/PregnancyInfoCard";
import HeartRateCard, { DailyHeartRate } from "./components/HeartRateCard";
import PostsTab from "./components/PostsTab";
import RestingHeartRateModal from "../../components/RestingHeartRateModal";
import styles from "./MyPage.module.css";
import { getJson, putJson } from "../../api/http";
import NameEditModal from "./components/NameEditModal";
import PregnancyEditModal from "./components/PregnancyEditModal";

// ── 타입 ──────────────────────────────────────────────────────
interface PregnancyInfo {
  due_date: string;
  week: number;
  pre_weight?: number;
  is_multiple?: boolean;
}

interface UserInfo {
  user_id: string;
  name: string;
  profileImage: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  commentsCount: number;

  user: {
    user_id: string;
    name: string;
    profileImage?: string;
  };
  isLiked: boolean;
}

interface HeartRateRecord {
  date: string;
  bpm: number;
}

interface ExerciseHistoryResponse {
  sessions: {
    session_id: number;
    status: string;
  }[];
}

const DAYS = ["월", "화", "수", "목", "금", "토", "오늘"] as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getKstDateOnlyTime(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);

  return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
}

function calcDDay(iso: string) {
  // D-day는 한국 기준 날짜 차이로 계산
  const todayKst = getKstDateOnlyTime(new Date());
  const dueKst = getKstDateOnlyTime(new Date(iso));
  const dDay = Math.ceil((dueKst - todayKst) / MS_PER_DAY);

  return { dDay, weeksLeft: Math.floor(dDay / 7) };
}

function formatDueDate(iso: string) {
  const d = new Date(new Date(iso).getTime() + KST_OFFSET_MS);

  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`;
}

function isToday(dateStr: string) {
  return (
    getKstDateOnlyTime(new Date(dateStr)) === getKstDateOnlyTime(new Date())
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyInfo | null>(null);
  const [weeklyHR, setWeeklyHR] = useState<DailyHeartRate[]>(
    DAYS.map((day) => ({ day, bpm: null })),
  );
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [showHRModal, setShowHRModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isEditingPregnancy, setIsEditingPregnancy] = useState(false);
  const [preWeightInput, setPreWeightInput] = useState(0);
  const [dueDateInput, setDueDateInput] = useState("");
  const [isMultipleInput, setIsMultipleInput] = useState(false);
  const [isSavingPregnancy, setIsSavingPregnancy] = useState(false);

  // ── 유저 정보: GET /user/me ───────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const data = await getJson<UserInfo>("/user/me");
      setUser(data);
    } catch (e) {
      console.error("[MyPage] 유저 정보 로드 실패:", e);
    }
  }, []);

  // ── 임신 정보: GET /pregnancy/me ─────────────────────────
  const loadPregnancy = useCallback(async () => {
    try {
      const data = await getJson<PregnancyInfo>("/pregnancy/me");
      setPregnancy(data);
    } catch (e) {
      console.error("[MyPage] 임신 정보 로드 실패:", e);
    }
  }, []);

  // ── 주간 심박수: GET /heart-rate/weekly ───────────────────
  const loadHeartRate = useCallback(async () => {
    try {
      const data = await getJson<HeartRateRecord[]>("/heart-rate/weekly");
      const today = new Date();

      // ✅ Fix: 이번 주 월요일을 기준점으로 고정한 뒤 i일씩 더함
      // 기존 코드는 평일에 실행하면 i가 커질수록 미래 날짜가 되는 버그가 있었음
      // 예) 월요일(dow=1)에 실행: i=1(화) → today+1(내일), i=5(토) → today+5(5일 후)
      const monday = new Date(today);
      const dow = today.getDay() === 0 ? 7 : today.getDay(); // 일요일=0 → 7로 변환
      monday.setDate(today.getDate() - dow + 1); // 이번 주 월요일
      monday.setHours(0, 0, 0, 0);

      const mapped: DailyHeartRate[] = DAYS.map((day, i) => {
        if (day === "오늘") {
          const rec = data.find((r) => isToday(r.date));
          return { day, bpm: rec?.bpm ?? null };
        }
        // i=0: 월, i=1: 화, ..., i=5: 토 → 항상 이번 주 과거/현재 날짜
        const target = new Date(monday);
        target.setDate(monday.getDate() + i);
        const rec = data.find(
          (r) => new Date(r.date).toDateString() === target.toDateString(),
        );
        return { day, bpm: rec?.bpm ?? null };
      });

      setWeeklyHR(mapped);
    } catch (e) {
      console.error("[MyPage] 심박수 로드 실패:", e);
    }
  }, []);

  // ── 내 게시물/좋아요한 게시물 조회 ────────────────────
  const loadPosts = useCallback(async () => {
    try {
      const my = await getJson<Post[]>("/community/posts/me");
      const liked = await getJson<Post[]>("/community/posts/liked");

      setMyPosts(my);
      setLikedPosts(liked);
    } catch (e) {
      console.error("[MyPage] 게시물 로드 실패:", e);
    }
  }, []);

  // ── 운동 횟수: GET /exercise/history ───────────────
  const loadExerciseCount = useCallback(async () => {
    try {
      const data = await getJson<ExerciseHistoryResponse>("/exercise/history");
      setExerciseCount(data.sessions.length);
    } catch (e) {
      console.error("[MyPage] 운동 횟수 로드 실패:", e);
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadPregnancy();
    loadHeartRate();
    loadExerciseCount();
  }, [loadUser, loadPregnancy, loadHeartRate, loadExerciseCount]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ── 파생값 ────────────────────────────────────────────────
  const hasTodayHR = weeklyHR.find((d) => d.day === "오늘")?.bpm !== null;

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
      prev.map((d) => (d.day === "오늘" ? { ...d, bpm } : d)),
    );
    setShowHRModal(false);
  };

  const handleOpenNameEdit = () => {
    setNameInput(user?.name ?? "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    try {
      const updatedUser = await putJson<UserInfo>("/user/me", {
        name: nameInput.trim(),
      });

      setUser(updatedUser);
      setIsEditingName(false);
    } catch (e) {
      console.error("[MyPage] 이름 수정 실패:", e);
    }
  };

  const handleOpenPregnancyEdit = () => {
    setPreWeightInput(pregnancy?.pre_weight ?? 0);
    setDueDateInput(pregnancy?.due_date?.slice(0, 10) ?? "");
    setIsMultipleInput(pregnancy?.is_multiple ?? false);
    setIsEditingPregnancy(true);
  };

  const handleSavePregnancy = async () => {
    if (!dueDateInput || isSavingPregnancy) return;

    try {
      setIsSavingPregnancy(true);

      const updatedPregnancy = await putJson<PregnancyInfo>("/pregnancy/me", {
        pre_weight: preWeightInput,
        due_date: dueDateInput,
        is_multiple: isMultipleInput,
      });

      setPregnancy(updatedPregnancy);
      setIsEditingPregnancy(false);
    } catch (e) {
      console.error("[MyPage] 임신 정보 수정 실패:", e);
    } finally {
      setIsSavingPregnancy(false);
    }
  };

  return (
    <div className={styles.page}>
      <ProfileSection
        name={user?.name ?? ""}
        profileImage={user?.profileImage ?? null}
        postCount={myPosts.length}
        likeCount={likedPosts.length}
        exerciseCount={exerciseCount}
        onEditProfile={handleOpenNameEdit}
      />

      <div className={styles.scrollContent}>
        {pregnancy && (
          <div>
            <PregnancyInfoCard
              dueDate={formatDueDate(pregnancy.due_date)}
              dDay={dDay}
              weeksLeft={weeksLeft}
              currentWeek={pregnancy.week}
              onEdit={handleOpenPregnancyEdit}
            />
          </div>
        )}

        <HeartRateCard
          weeklyData={weeklyHR}
          weeklyAvg={weeklyAvg}
          hasTodayData={hasTodayHR}
          onMeasure={() => setShowHRModal(true)}
        />

        <PostsTab posts={myPosts} likedPosts={likedPosts} />
      </div>

      <NameEditModal
        isOpen={isEditingName}
        value={nameInput}
        isSaving={false}
        onChange={setNameInput}
        onClose={() => setIsEditingName(false)}
        onSave={handleSaveName}
      />

      <PregnancyEditModal
        isOpen={isEditingPregnancy}
        preWeight={preWeightInput}
        dueDate={dueDateInput}
        isMultiple={isMultipleInput}
        isSaving={isSavingPregnancy}
        onPreWeightChange={setPreWeightInput}
        onDueDateChange={setDueDateInput}
        onIsMultipleChange={setIsMultipleInput}
        onClose={() => setIsEditingPregnancy(false)}
        onSave={handleSavePregnancy}
      />

      {/* 오늘 심박 없을 때 모달 */}
      <RestingHeartRateModal
        isOpen={showHRModal && !hasTodayHR}
        onClose={() => setShowHRModal(false)}
        onSaved={handleHRSaved}
      />
    </div>
  );
}

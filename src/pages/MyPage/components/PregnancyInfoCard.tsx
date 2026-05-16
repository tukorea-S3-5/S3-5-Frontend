import React from "react";
import styles from "../MyPage.module.css";
import { PencilIcon } from "lucide-react";

interface PregnancyInfoCardProps {
  dueDate: string; // "2026년 7월 20일"
  dDay: number; // 98
  weeksLeft: number; // 14
  currentWeek: number; // 26
  onEdit?: () => void;
}

const PregnancyInfoCard: React.FC<PregnancyInfoCardProps> = ({
  dueDate,
  dDay,
  weeksLeft,
  currentWeek,
  onEdit,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.cardIcon}>🤰</span>
          임신 정보
        </div>
        <button type="button" className={styles.cardAction} onClick={onEdit}>
          <PencilIcon size={15} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.dueDateRow}>
        <span className={styles.dueDateIcon}>📅</span>
        <div>
          <p className={styles.dueDateLabel}>출산 예정일</p>
          <p className={styles.dueDateValue}>{dueDate}</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.ddayBox}>
        <div className={styles.ddayLeft}>
          <p className={styles.ddaySub}>아기와 만나는 날까지</p>
          <p className={styles.ddayNum}>D-{dDay}</p>
          <p className={styles.ddayWeeks}>약 {weeksLeft}주</p>
        </div>
        <div className={styles.weekBadge}>
          <span>현재 임신</span>
          <strong>{currentWeek}주차</strong>
        </div>
      </div>
    </div>
  );
};

export default PregnancyInfoCard;

import React from 'react';
import styles from '../MyPage.module.css';

export interface DailyHeartRate {
  day: string;    // "월", "화", ... "오늘"
  bpm: number | null; // null = 데이터 없음
}

interface HeartRateCardProps {
  weeklyData: DailyHeartRate[];   // 길이 7
  weeklyAvg: number | null;
  hasTodayData: boolean;
  onMeasure?: () => void;
}

const MAX_BAR_HEIGHT = 40; // px
const BPM_MAX = 90;
const BPM_MIN = 55;

function calcBarHeight(bpm: number): number {
  const ratio = Math.min(Math.max((bpm - BPM_MIN) / (BPM_MAX - BPM_MIN), 0.15), 1);
  return Math.round(ratio * MAX_BAR_HEIGHT);
}

const HeartRateCard: React.FC<HeartRateCardProps> = ({
  weeklyData,
  weeklyAvg,
  hasTodayData,
  onMeasure,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.cardIcon}>💓</span>
          평소 심박수
        </div>
        <button className={styles.cardAction}>주간 기록</button>
      </div>

      {/* 평균 */}
      <div className={styles.hrAvgRow}>
        <span className={styles.hrAvgLabel}>이번 주 평균</span>
        <span className={styles.hrAvgValue}>
          {weeklyAvg !== null ? `${weeklyAvg} bpm` : '— bpm'}
        </span>
      </div>

      {/* 주간 바 차트 */}
      <div className={styles.hrBarsRow}>
        {weeklyData.map((d) => (
          <div key={d.day} className={styles.hrDayCol}>
            <div className={styles.hrBarWrap}>
              {d.bpm !== null ? (
                <div
                  className={styles.hrBar}
                  style={{ height: calcBarHeight(d.bpm) }}
                />
              ) : (
                <div className={`${styles.hrBar} ${styles.hrBarMissing}`} style={{ height: 36 }} />
              )}
            </div>
            <span className={`${styles.hrValue} ${d.bpm === null ? styles.hrValueMissing : ''}`}>
              {d.bpm !== null ? d.bpm : '—'}
            </span>
            <span className={`${styles.hrDayLabel} ${d.day === '오늘' ? styles.hrDayLabelToday : ''}`}>
              {d.day}
            </span>
          </div>
        ))}
      </div>

      {/* 오늘 데이터 없을 때 배너 */}
      {!hasTodayData && (
        <div className={styles.hrMissingBanner}>
          <span className={styles.hrPulseDot} />
          <span className={styles.hrMissingText}>
            오늘 워치 미착용 — 운동 전 1분 측정 필요
          </span>
          <button className={styles.hrMeasureBtn} onClick={onMeasure}>
            측정하기
          </button>
        </div>
      )}
    </div>
  );
};

export default HeartRateCard;

import React from 'react';
import styles from '../MyPage.module.css';

interface ProfileSectionProps {
  name: string;
  handle: string;
  postCount: number;
  likeCount: number;
  exerciseCount: number;
  onEditProfile?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  handle,
  postCount,
  likeCount,
  exerciseCount,
  onEditProfile,
}) => {
  const initial = name.charAt(0);

  return (
    <div className={styles.profileSection}>
      {/* Avatar */}
      <div className={styles.profileRow}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>{initial}</div>
          <button className={styles.cameraBtn} aria-label="프로필 사진 변경">📷</button>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>
            {name}
            <button className={styles.editBtn} onClick={onEditProfile} aria-label="이름 수정">
              ✏️
            </button>
          </div>
          <div className={styles.profileHandle}>{handle}</div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{postCount}</span>
          <span className={styles.statLabel}>게시물</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{likeCount}</span>
          <span className={styles.statLabel}>좋아요</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum}>{exerciseCount}</span>
          <span className={styles.statLabel}>운동 횟수</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;

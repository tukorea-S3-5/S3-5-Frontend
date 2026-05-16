import React from "react";
import styles from "../MyPage.module.css";
import { PencilIcon, CameraIcon } from "lucide-react";

interface ProfileSectionProps {
  name: string;
  profileImage?: string | null;
  postCount: number;
  likeCount: number;
  exerciseCount: number;
  onEditProfile?: () => void;
  onChangeProfileImage?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  profileImage,
  postCount,
  likeCount,
  exerciseCount,
  onEditProfile,
  onChangeProfileImage,
}) => {
  const initial = name.charAt(0);
  const hasProfileImage = Boolean(profileImage);

  return (
    <div className={styles.profileSection}>
      {/* Avatar */}
      <div className={styles.profileRow}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {hasProfileImage ? (
              <img
                src={profileImage ?? ""}
                alt={`${name} 프로필 이미지`}
                className={styles.avatarImage}
              />
            ) : (
              initial
            )}
          </div>
          <button
            type="button"
            className={styles.cameraBtn}
            onClick={onChangeProfileImage}
            aria-label="프로필 사진 변경"
          >
            <CameraIcon size={12} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>
            {name}
            <button
              type="button"
              className={styles.editBtn}
              onClick={onEditProfile}
              aria-label="이름 수정"
            >
              <PencilIcon size={15} strokeWidth={2} />
            </button>
          </div>
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

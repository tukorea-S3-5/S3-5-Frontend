import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../MyPage.module.css";

interface Post {
  id: number;
  title: string;
  // 필요에 따라 확장
}

interface PostsTabProps {
  posts: Post[];
  likedPosts: Post[];
}

const PostsTab: React.FC<PostsTabProps> = ({ posts, likedPosts }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my" | "liked">("my");

  const currentList = activeTab === "my" ? posts : likedPosts;

  return (
    <div
      className={styles.card}
      style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}
    >
      {/* 탭 헤더 */}
      <div className={styles.postsTabRow}>
        <button
          className={`${styles.postsTab} ${activeTab === "my" ? styles.postsTabActive : ""}`}
          onClick={() => setActiveTab("my")}
        >
          📄 내 게시물&nbsp;
          <span className={styles.postsCount}>{posts.length}</span>
        </button>
        <button
          className={`${styles.postsTab} ${activeTab === "liked" ? styles.postsTabActive : ""}`}
          onClick={() => setActiveTab("liked")}
        >
          ♡ 좋아요&nbsp;
          <span className={styles.postsCount}>{likedPosts.length}</span>
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className={styles.postsContent}>
        {currentList.length === 0 ? (
          <div className={styles.postsEmpty}>
            <span className={styles.postsEmptyIcon}>📄</span>
            <p>
              {activeTab === "my"
                ? "아직 작성한 게시물이 없어요. 첫 게시물을 올려보세요!"
                : "좋아요한 게시물이 없어요."}
            </p>
          </div>
        ) : (
          currentList.map((post) => (
            <button
              key={post.id}
              type="button"
              className={styles.postItem}
              onClick={() => navigate(`/community/posts/${post.id}`)}
            >
              {post.title}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default PostsTab;

import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { getJson, postJson } from "../../api/http";
import PostCard, { PostItem } from "./components/PostCard";

const DUMMY: PostItem[] = [
  {
    id: 1,
    title: "임신 16주 식단 추천",
    content: "입덧이 심한데 뭐가 좋을까요? 다들 어떻게 드셨어요?",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    likes: 10,
    userId: "u1",
    user: { user_id: "u1", nickname: "홍길동" },
    isLiked: false,
  },
  {
    id: 2,
    title: "오늘 운동 완료!",
    content: "처음으로 임산부 요가 30분 했어요 💪 몸이 한결 가벼워진 느낌!",
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    likes: 24,
    userId: "u2",
    user: { user_id: "u2", nickname: "김산모" },
    isLiked: true,
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostItem[]>(DUMMY); // 초기값 더미
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJson<PostItem[]>("/community/posts");
      // 실제 데이터 있을 때만 교체
      if (data && data.length > 0) {
        setPosts(data.map((p) => ({ ...p, isLiked: false })));
      }
    } catch {
      // 실패해도 더미 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleLike = async (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      const res = await postJson(`/community/posts/${postId}/like`, {}) as {
        liked: boolean;
        likes: number;
      };
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: res.liked, likes: res.likes } : p
        )
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  };

  return (
    <Feed>
      {loading && <Hint>불러오는 중...</Hint>}
      {posts.map((post, i) => (
        <PostCard
          key={post.id}
          post={post}
          delay={i * 80}
          onToggleLike={toggleLike}
        />
      ))}
    </Feed>
  );
}

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 14px 16px 100px;
  gap: 14px;
  background: linear-gradient(180deg, #fbd7d0 0%, #fff 220px);
`;

const Hint = styled.p<{ $error?: boolean }>`
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: ${(p) => (p.$error ? "#E88B8B" : "#a8a8a8")};
`;
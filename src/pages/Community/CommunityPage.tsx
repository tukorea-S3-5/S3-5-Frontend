import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { getJson, postJson } from "../../api/http";
import PostCard, { PostItem } from "./components/PostCard";


export default function CommunityPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 글쓰기 상태
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  // GET /community/posts
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJson<PostItem[]>("/community/posts");
      if (data && data.length > 0) {
        // ✅ Fix: 서버 응답의 isLiked 값을 우선 사용, 없으면 false로 폴백
        // 백엔드가 isLiked를 내려주면 그 값을 그대로 쓰고,
        // 아직 미지원이면 기존처럼 false로 초기화됨
        setPosts(data.map((p) => ({ ...p, isLiked: p.isLiked ?? false })));
      }
    } catch (e) {
      console.error("[Community] 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // POST /community/posts
  const submitPost = async () => {
    if (!title.trim() || !content.trim() || busy) return;
    setBusy(true);
    try {
      await postJson("/community/posts", { title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
      setExpanded(false);
      await load();
    } catch (e) {
      console.error("[Community] 글 작성 실패:", e);
    } finally {
      setBusy(false);
    }
  };

  const cancelPost = () => {
    setTitle("");
    setContent("");
    setExpanded(false);
  };

  // POST /community/posts/:id/like → { liked, likes }
  const toggleLike = async (postId: number) => {
    // 낙관적 업데이트
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      const res = await postJson(`/community/posts/${postId}/like`, {}) as {
        liked: boolean; likes: number;
      };
      // 서버 응답으로 정확한 상태 동기화
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: res.liked, likes: res.likes } : p
        )
      );
    } catch {
      // 실패 시 낙관적 업데이트 원복
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
      {/* ── 글쓰기 카드 ── */}
      <WriteCard>
        <TriggerRow onClick={() => !expanded && setExpanded(true)}>
          <Av />
          {!expanded ? (
            <Placeholder>오늘 어떠셨나요? 글을 작성해보세요 ✍️</Placeholder>
          ) : (
            <TitleInput
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </TriggerRow>

        {expanded && (
          <>
            <ContentTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요..."
              maxLength={500}
            />
            <WriteFooter>
              <CharCount>{content.length}/500</CharCount>
              <BtnRow>
                <CancelBtn onClick={cancelPost}>취소</CancelBtn>
                <SubmitBtn
                  onClick={submitPost}
                  disabled={!title.trim() || !content.trim() || busy}
                >
                  {busy ? "등록 중..." : "등록"}
                </SubmitBtn>
              </BtnRow>
            </WriteFooter>
          </>
        )}
      </WriteCard>

      {/* ── 게시글 목록 ── */}
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

// ── Styled ────────────────────────────────────────────────────
const Feed = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 14px 16px 120px;
  gap: 14px;
  background: linear-gradient(180deg, #fbd7d0 0%, #fff 220px);
`;

const Hint = styled.p`
  text-align: center; padding: 40px 0;
  font-size: 14px; color: #a8a8a8;
`;

const WriteCard = styled.div`
  background: #fff;
  border: 1px solid #f4c9c2;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(232, 139, 139, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TriggerRow = styled.div`
  display: flex; align-items: center; gap: 10px; cursor: text;
`;

const Av = styled.div`
  width: 34px; height: 34px; border-radius: 50%;
  background: #d9d9d9; flex-shrink: 0;
`;

const Placeholder = styled.span`
  font-size: 14px; color: #bfbfbf; flex: 1;
`;

const TitleInput = styled.input`
  flex: 1; border: none; outline: none;
  font-size: 15px; font-weight: 600; color: #2c1b1b;
  background: transparent;
  &::placeholder { color: #bfbfbf; font-weight: 400; }
`;

const ContentTextarea = styled.textarea`
  width: 100%;
  border: 1px solid #f4c9c2;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px; color: #2c1b1b;
  outline: none; resize: none; height: 100px;
  box-sizing: border-box;
  font-family: inherit; line-height: 1.6;
  &::placeholder { color: #bfbfbf; }
  &:focus { border-color: #e88b8b; }
`;

const WriteFooter = styled.div`
  display: flex; align-items: center; justify-content: space-between;
`;

const CharCount = styled.span`
  font-size: 12px; color: #a8a8a8;
`;

const BtnRow = styled.div`
  display: flex; gap: 8px;
`;

const CancelBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #f4c9c2; border-radius: 10px;
  background: none; font-size: 13px; font-weight: 600;
  color: #a8a8a8; cursor: pointer;
`;

const SubmitBtn = styled.button`
  padding: 8px 20px;
  border: none; border-radius: 10px;
  background: #e88b8b; font-size: 13px; font-weight: 700;
  color: #fff; cursor: pointer;
  transition: filter 0.15s;
  &:hover:not(:disabled) { filter: brightness(0.93); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
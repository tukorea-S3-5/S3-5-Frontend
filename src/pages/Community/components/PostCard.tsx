import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import CommentSection from "./CommentSection";

export interface PostItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  userId: string;
  user: { user_id: string; nickname: string };
  isLiked?: boolean;
}

interface Props {
  post: PostItem;
  delay?: number;
  onToggleLike: (id: number) => Promise<void>;
}

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function PostCard({ post, delay = 0, onToggleLike }: Props) {
  const [showComments, setShowComments] = useState(false);

  return (
    <Card $delay={delay}>
      {/* 작성자 */}
      <AuthorRow>
        <Avatar />
        <AuthorMeta>
          <AuthorName>{post.user?.nickname ?? "알 수 없음"}</AuthorName>
          <TimeText>{timeAgo(post.createdAt)}</TimeText>
        </AuthorMeta>
      </AuthorRow>

      {/* 본문 */}
      <Body>{post.content}</Body>

      <Divider />

      {/* 액션 */}
      <ActionsRow>
        <ActionItem onClick={() => onToggleLike(post.id)}>
          <Heart
            size={18}
            color={post.isLiked ? "#E88B8B" : "#9a9a9a"}
            fill={post.isLiked ? "#E88B8B" : "none"}
          />
          <ActionCount>{post.likes}</ActionCount>
        </ActionItem>

        <ActionItem onClick={() => setShowComments((p) => !p)}>
          <MessageCircle size={18} color="#9a9a9a" />
          {showComments ? (
            <ChevronUp size={14} color="#9a9a9a" />
          ) : (
            <ChevronDown size={14} color="#9a9a9a" />
          )}
        </ActionItem>
      </ActionsRow>

      {/* 댓글 */}
      {showComments && (
        <>
          <Divider style={{ marginTop: 10 }} />
          <CommentSection postId={post.id} />
        </>
      )}
    </Card>
  );
}

// ── Styled ────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Card = styled.div<{ $delay: number }>`
  background: #ffffff;
  border: 1px solid #f4c9c2;
  border-radius: 16px;
  padding: 14px 16px 10px;
  box-shadow: 0 2px 8px rgba(232, 139, 139, 0.06);
  animation: ${fadeIn} 0.3s ease both;
  animation-delay: ${(p) => p.$delay}ms;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #d9d9d9;
  flex-shrink: 0;
`;

const AuthorMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const AuthorName = styled.span`
  font-weight: 700;
  font-size: 14.5px;
  color: #2c1b1b;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #a8a8a8;
`;

const Body = styled.p`
  font-size: 14px;
  color: #c9baba;
  line-height: 1.6;
  padding: 12px 0;
  margin: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: #f1b9b0;
  margin: 0 -2px;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 10px 0 4px;
`;

const ActionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const ActionCount = styled.span`
  font-size: 13px;
  color: #7c7070;
`;

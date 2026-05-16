import styled, { keyframes } from "styled-components";
import CommentSection from "./CommentSection";
import likeIcon from "@assets/icons/like.svg";
import likeFilledIcon from "@assets/icons/like_filled.svg";
import commentIcon from "@assets/icons/comment.svg";

export interface PostItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  userId: string;
  user: {
    user_id: string;
    name: string;
    profileImage: string;
  };
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
  return (
    <Card $delay={delay}>
      <AuthorRow>
        <Avatar />
        <AuthorMeta>
          <AuthorName>{post.user?.name ?? post.userId}</AuthorName>
          <TimeText>{timeAgo(post.createdAt)}</TimeText>
        </AuthorMeta>
      </AuthorRow>

      <Title>{post.title}</Title>
      <Body>{post.content}</Body>

      <Divider />

      <ActionsRow>
        <ActionBtn onClick={() => onToggleLike(post.id)}>
          <LikeIcon $active={!!post.isLiked} />
          <ActionCount $active={!!post.isLiked}>{post.likes}</ActionCount>
        </ActionBtn>
        <ActionBtn>
          <CommentIcon />
        </ActionBtn>
      </ActionsRow>

      <Divider style={{ marginTop: 10 }} />
      <CommentSection postId={post.id} />
    </Card>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const Card = styled.div<{ $delay: number }>`
  background: #ffffff;
  border: 1px solid #f4c9c2;
  border-radius: 16px;
  padding: 14px 16px 10px;
  box-shadow: 0 2px 8px rgba(232, 139, 139, 0.08);
  animation: ${fadeIn} 0.3s ease both;
  animation-delay: ${(p) => p.$delay}ms;
`;
const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
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
const Title = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #2c1b1b;
  margin: 0 0 4px;
`;
const Body = styled.p`
  font-size: 14px;
  color: #7c7070;
  line-height: 1.6;
  margin: 0 0 12px;
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
const ActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;
const ActionCount = styled.span<{ $active: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${(p) => (p.$active ? "#E88B8B" : "#7c7070")};
`;

const IconImage = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
`;

const LikeIcon = ({ $active }: { $active: boolean }) => (
  <IconImage src={$active ? likeFilledIcon : likeIcon} alt="좋아요" />
);

const CommentIcon = () => <IconImage src={commentIcon} alt="댓글" />;

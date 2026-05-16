import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { getJson, postJson } from "../../api/http";
import CommentSection from "./components/CommentSection";
import likeIcon from "@assets/icons/like.svg";
import likeFilledIcon from "@assets/icons/like_filled.svg";
import commentIcon from "@assets/icons/comment.svg";

interface CommunityUser {
  user_id: string;
  name: string;
  profileImage?: string | null;
}

interface PostDetail {
  id: number;
  userId: string;
  user: CommunityUser;
  title: string;
  content: string;
  category?: string;
  views?: number;
  likes: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface PostDetailResponse {
  post: PostDetail;
  comments?: unknown[];
}

const formatKoreanDateTime = (iso: string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
};

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [viewerProfileImage, setViewerProfileImage] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const postId = Number(id);

  const loadPost = useCallback(async () => {
    if (!postId || Number.isNaN(postId)) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const data = await getJson<PostDetailResponse>(
        `/community/posts/${postId}`,
      );

      setPost(data.post);
    } catch (e) {
      console.error("[CommunityDetail] 게시글 상세 조회 실패:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    getJson<{ profileImage?: string | null }>("/user/me")
      .then((data) => {
        setViewerProfileImage(data.profileImage ?? null);
      })
      .catch((e) => {
        console.error("[CommunityDetail] 내 프로필 이미지 조회 실패:", e);
      });
  }, []);

  const toggleLike = async () => {
    if (!post) return;

    const previous = post;

    setPost({
      ...post,
      isLiked: !post.isLiked,
      likes: post.isLiked ? post.likes - 1 : post.likes + 1,
    });

    try {
      const res = (await postJson(`/community/posts/${post.id}/like`, {})) as {
        liked: boolean;
        likes: number;
      };

      setPost((prev) =>
        prev ? { ...prev, isLiked: res.liked, likes: res.likes } : prev,
      );
    } catch (e) {
      console.error("[CommunityDetail] 좋아요 토글 실패:", e);
      setPost(previous);
    }
  };

  if (loading) {
    return (
      <Page>
        <Message>게시글을 불러오는 중...</Message>
      </Page>
    );
  }

  if (error || !post) {
    return (
      <Page>
        <Message>게시글을 불러오지 못했어요.</Message>
      </Page>
    );
  }

  const commentCount = post.commentsCount ?? 0;

  return (
    <Page>
      <BackButton onClick={() => navigate(-1)}>‹ 목록으로</BackButton>

      <Card>
        <AuthorRow>
          <Avatar>
            {post.user?.profileImage ? (
              <AvatarImage
                src={post.user.profileImage}
                alt={`${post.user?.name ?? "사용자"} 프로필 이미지`}
              />
            ) : null}
          </Avatar>

          <AuthorMeta>
            <AuthorName>{post.user?.name ?? post.userId}</AuthorName>
            <TimeText>{formatKoreanDateTime(post.createdAt)}</TimeText>
          </AuthorMeta>
        </AuthorRow>

        <Title>{post.title}</Title>
        <Content>{post.content}</Content>

        <Divider />

        <ActionsRow>
          <ActionButton onClick={toggleLike}>
            <IconImage
              src={post.isLiked ? likeFilledIcon : likeIcon}
              alt="좋아요"
            />
            <ActionCount $active={!!post.isLiked}>{post.likes}</ActionCount>
          </ActionButton>

          <ActionButton type="button">
            <IconImage src={commentIcon} alt="댓글" />
            <ActionCount $active={false}>{commentCount}</ActionCount>
          </ActionButton>
        </ActionsRow>

        <Divider />

        <CommentSection postId={post.id} profileImage={viewerProfileImage} />
      </Card>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100%;
  padding: 18px 16px 120px;
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: #8f6f6a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 14px;
  padding: 4px 0;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #f4c9c2;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 2px 8px rgba(232, 139, 139, 0.08);
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #d9d9d9;
  flex-shrink: 0;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AuthorName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #2c1b1b;
`;

const TimeText = styled.span`
  font-size: 12px;
  color: #a8a8a8;
`;

const Title = styled.h1`
  margin: 18px 0 10px;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 800;
  color: #2c1b1b;
`;

const Content = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #3d2d2d;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Divider = styled.div`
  height: 1px;
  background: #f4d8d3;
  margin: 16px 0;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button`
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  cursor: pointer;
`;

const IconImage = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
`;

const ActionCount = styled.span<{ $active: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "#E88B8B" : "#7c7070")};
`;

const Message = styled.p`
  text-align: center;
  padding: 60px 0;
  color: #8f6f6a;
  font-size: 15px;
`;

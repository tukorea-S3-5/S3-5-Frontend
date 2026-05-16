import styled from "styled-components";
import { useState, useEffect } from "react";
import { getJson, postJson } from "../../../api/http";

export interface CommentItem {
  id: number;
  postId: number;
  content: string;
  createdAt: string;
  userId: string;
  user?: {
    user_id: string;
    name: string;
    profileImage?: string | null;
  };
}

interface PostDetailResponse {
  post: unknown;
  comments: CommentItem[];
}

interface Props {
  postId: number;
  profileImage?: string | null;
}

export default function CommentSection({ postId, profileImage }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await getJson<PostDetailResponse>(
          `/community/posts/${postId}`,
        );
        setComments(data.comments ?? []);
      } catch (e) {
        console.error("[CommentSection] 댓글 로드 실패:", e);
      }
    };
    loadComments();
  }, [postId]);

  const send = async () => {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      const response = (await postJson(`/community/comments`, {
        postId,
        content: input.trim(),
      })) as CommentItem | { comment: CommentItem };

      const newComment = "comment" in response ? response.comment : response;

      setComments((prev) => [...prev, newComment]);
      setInput("");
      setErrorMessage(null);
    } catch (e) {
      console.error("[CommentSection] 전송 실패:", e);
      setErrorMessage("댓글 전송에 실패했습니다");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      {comments.map((c) => (
        <Bubble key={c.id}>
          <Av>
            {c.user?.profileImage ? (
              <AvImage
                src={c.user.profileImage}
                alt={`${c.user?.name ?? "사용자"} 프로필 이미지`}
              />
            ) : null}
          </Av>
          <BubbleBody>
            <Meta>
              <Author>{c.user?.name ?? c.userId}</Author>
            </Meta>
            <Text>{c.content}</Text>
          </BubbleBody>
        </Bubble>
      ))}

      <InputRow>
        <Av>
          {profileImage ? (
            <AvImage src={profileImage} alt="내 프로필 이미지" />
          ) : null}
        </Av>
        <TextBox
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          placeholder="댓글을 입력하세요..."
        />
        <SendBtn onClick={send} disabled={busy}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </SendBtn>
      </InputRow>
      {errorMessage && <ErrorMsg>{errorMessage}</ErrorMsg>}
    </Wrap>
  );
}

const Av = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #cfcfcf;
  flex-shrink: 0;
  overflow: hidden;
`;

const AvImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;
const Bubble = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fbe3dd;
  border-radius: 12px;
  padding: 10px 12px;
`;
const BubbleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;
const Meta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;
const Author = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #2c1b1b;
`;
const Text = styled.p`
  font-size: 13px;
  color: #2c1b1b;
  margin: 0;
`;
const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f6f6f6;
  border-radius: 999px;
  padding: 8px 14px 8px 8px;
`;
const TextBox = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #2c1b1b;
  &::placeholder {
    color: #bfbfbf;
  }
`;
const SendBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #e88b8b;
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
const ErrorMsg = styled.div`
  font-size: 12px;
  color: #d32f2f;
  padding: 4px 12px;
`;

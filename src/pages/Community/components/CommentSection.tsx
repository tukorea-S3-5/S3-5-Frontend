import styled from "styled-components";
import { getJson, postJson } from "../../../api/http";
import { useState } from "react";

export interface CommentItem {
  id: number;
  postId: number;
  content: string;
  createdAt: string;
  userId: string;
}

interface Props {
  postId: number;
}

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput]       = useState("");
  const [busy, setBusy]         = useState(false);

  const reload = async () => {
    const d = await getJson<{ comments: CommentItem[] }>(`/community/posts/${postId}`);
    setComments(d.comments);
  };

  const send = async () => {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      await postJson("/community/comments", { postId, content: input.trim() });
      await reload();
      setInput("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      {comments.map((c) => (
        <Bubble key={c.id}>
          <Av size={26} />
          <BubbleBody>
            <BubbleMeta>
              <BubbleAuthor>{c.userId}</BubbleAuthor>
              <BubbleTime>{timeAgo(c.createdAt)}</BubbleTime>
            </BubbleMeta>
            <BubbleText>{c.content}</BubbleText>
          </BubbleBody>
        </Bubble>
      ))}

      <InputRow>
        <Av size={26} />
        <TextBox
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="댓글을 입력하세요..."
        />
      </InputRow>
    </Wrap>
  );
}

// ── Styled ────────────────────────────────────────────────────
const Av = styled.div<{ size: number }>`
  width: ${(p) => p.size}px;
  height: ${(p) => p.size}px;
  border-radius: 50%;
  background: #cfcfcf;
  flex-shrink: 0;
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

const BubbleMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const BubbleAuthor = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #2c1b1b;
`;

const BubbleTime = styled.span`
  font-size: 11px;
  color: #a8a8a8;
`;

const BubbleText = styled.p`
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
  &::placeholder { color: #bfbfbf; }
`;

import styled from "styled-components";
import { useState, useEffect } from "react";
import { getJson, postJson } from "../../../api/http";

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

export default function CommentSection({ postId }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await getJson<CommentItem[]>(`/community/posts/${postId}/comments`);
        setComments(data);
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
      const newComment = await postJson("/community/comments", {
        postId: Number(postId),
        content: input.trim(),
      }) as CommentItem;
      setComments((prev) => [...prev, newComment]);
      setInput("");
    } catch (e) {
      console.error("[CommentSection] 전송 실패:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Wrap>
      {comments.map((c) => (
        <Bubble key={c.id}>
          <Av />
          <BubbleBody>
            <Meta>
              <Author>{c.userId}</Author>
            </Meta>
            <Text>{c.content}</Text>
          </BubbleBody>
        </Bubble>
      ))}

      <InputRow>
        <Av />
        <TextBox
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="댓글을 입력하세요..."
        />
        <SendBtn onClick={send} disabled={busy}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </SendBtn>
      </InputRow>
    </Wrap>
  );
}

const Av = styled.div`width: 26px; height: 26px; border-radius: 50%; background: #cfcfcf; flex-shrink: 0;`;
const Wrap = styled.div`display: flex; flex-direction: column; gap: 10px; margin-top: 10px;`;
const Bubble = styled.div`display: flex; align-items: flex-start; gap: 10px; background: #fbe3dd; border-radius: 12px; padding: 10px 12px;`;
const BubbleBody = styled.div`display: flex; flex-direction: column; gap: 2px; flex: 1;`;
const Meta = styled.div`display: flex; align-items: baseline; gap: 6px;`;
const Author = styled.span`font-weight: 700; font-size: 13px; color: #2c1b1b;`;
const Text = styled.p`font-size: 13px; color: #2c1b1b; margin: 0;`;
const InputRow = styled.div`display: flex; align-items: center; gap: 10px; background: #f6f6f6; border-radius: 999px; padding: 8px 14px 8px 8px;`;
const TextBox = styled.input`flex: 1; border: none; outline: none; background: transparent; font-size: 13px; color: #2c1b1b; &::placeholder { color: #bfbfbf; }`;
const SendBtn = styled.button`background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; color: #e88b8b; &:disabled { opacity: 0.4; cursor: not-allowed; }`;
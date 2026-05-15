import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ✅ Fix: 복제 구현 대신 실제 CommentSection을 직접 테스트
// (autofix PR #27로 중복 postJson 구문 오류가 수정됨)
import CommentSection, { CommentItem } from '../CommentSection';

vi.mock('../../../../api/http', () => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
}));

import { getJson, postJson } from '../../../../api/http';
const mockGetJson = getJson as ReturnType<typeof vi.fn>;
const mockPostJson = postJson as ReturnType<typeof vi.fn>;

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetJson.mockResolvedValue([]);
  });

  it('마운트 시 올바른 엔드포인트로 댓글을 불러온다', async () => {
    const comments: CommentItem[] = [
      { id: 1, postId: 5, content: '첫 댓글', createdAt: '2024-01-01T00:00:00Z', userId: 'user1' },
    ];
    mockGetJson.mockResolvedValueOnce(comments);

    render(<CommentSection postId={5} />);

    await waitFor(() => {
      expect(mockGetJson).toHaveBeenCalledWith('/community/posts/5/comments');
    });
  });

  it('불러온 댓글 목록을 렌더링한다', async () => {
    const comments: CommentItem[] = [
      { id: 1, postId: 5, content: '안녕하세요', createdAt: '2024-01-01T00:00:00Z', userId: 'user1' },
      { id: 2, postId: 5, content: '반갑습니다', createdAt: '2024-01-01T01:00:00Z', userId: 'user2' },
    ];
    mockGetJson.mockResolvedValueOnce(comments);

    render(<CommentSection postId={5} />);

    await waitFor(() => {
      expect(screen.getByText('안녕하세요')).toBeInTheDocument();
      expect(screen.getByText('반갑습니다')).toBeInTheDocument();
    });
  });

  it('전송 버튼 클릭 시 댓글을 전송한다', async () => {
    const newComment: CommentItem = {
      id: 10, postId: 5, content: '새 댓글', createdAt: '2024-01-02T00:00:00Z', userId: 'me',
    };
    mockPostJson.mockResolvedValueOnce(newComment);

    render(<CommentSection postId={5} />);

    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    fireEvent.change(input, { target: { value: '새 댓글' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockPostJson).toHaveBeenCalledWith('/community/comments', {
        postId: 5,
        content: '새 댓글',
      });
    });
  });

  it('전송 성공 후 입력창을 비운다', async () => {
    const newComment: CommentItem = {
      id: 10, postId: 5, content: '새 댓글', createdAt: '2024-01-02T00:00:00Z', userId: 'me',
    };
    mockPostJson.mockResolvedValueOnce(newComment);

    render(<CommentSection postId={5} />);

    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    fireEvent.change(input, { target: { value: '새 댓글' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('');
    });
  });

  it('전송 성공 후 새 댓글이 목록에 추가된다', async () => {
    const newComment: CommentItem = {
      id: 10, postId: 5, content: '추가된 댓글', createdAt: '2024-01-02T00:00:00Z', userId: 'me',
    };
    mockPostJson.mockResolvedValueOnce(newComment);

    render(<CommentSection postId={5} />);

    fireEvent.change(screen.getByPlaceholderText('댓글을 입력하세요...'), {
      target: { value: '추가된 댓글' },
    });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('추가된 댓글')).toBeInTheDocument();
    });
  });

  it('빈 댓글은 전송하지 않는다', () => {
    render(<CommentSection postId={5} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockPostJson).not.toHaveBeenCalled();
  });

  it('공백만 있는 댓글은 전송하지 않는다', () => {
    render(<CommentSection postId={5} />);
    fireEvent.change(screen.getByPlaceholderText('댓글을 입력하세요...'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button'));
    expect(mockPostJson).not.toHaveBeenCalled();
  });

  it('Enter 키 입력 시 댓글을 전송한다', async () => {
    const newComment: CommentItem = {
      id: 10, postId: 5, content: '엔터 댓글', createdAt: '2024-01-02T00:00:00Z', userId: 'me',
    };
    mockPostJson.mockResolvedValueOnce(newComment);

    render(<CommentSection postId={5} />);

    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    fireEvent.change(input, { target: { value: '엔터 댓글' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockPostJson).toHaveBeenCalledWith('/community/comments', {
        postId: 5,
        content: '엔터 댓글',
      });
    });
  });

  it('Enter 외 다른 키는 전송하지 않는다', () => {
    render(<CommentSection postId={5} />);
    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    fireEvent.change(input, { target: { value: '테스트' } });
    fireEvent.keyDown(input, { key: 'a' });
    expect(mockPostJson).not.toHaveBeenCalled();
  });

  it('댓글 로드 API 오류 시 크래시 없이 에러 로그를 남긴다', async () => {
    mockGetJson.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<CommentSection postId={5} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[CommentSection] 댓글 로드 실패:',
        expect.any(Error)
      );
    });
    consoleSpy.mockRestore();
  });

  it('댓글 전송 실패 시 에러 메시지를 표시한다', async () => {
    mockPostJson.mockRejectedValueOnce(new Error('Server error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<CommentSection postId={5} />);

    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    fireEvent.change(input, { target: { value: '실패 댓글' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('댓글 전송에 실패했습니다')).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it('전송 중 버튼이 비활성화된다', async () => {
    let resolvePost!: (value: unknown) => void;
    mockPostJson.mockImplementationOnce(
      () => new Promise((res) => { resolvePost = res; })
    );

    render(<CommentSection postId={5} />);

    const input = screen.getByPlaceholderText('댓글을 입력하세요...');
    const sendBtn = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '댓글' } });
    fireEvent.click(sendBtn);

    // 전송 중에는 버튼 비활성화
    expect(sendBtn).toBeDisabled();

    resolvePost({
      id: 10, postId: 5, content: '댓글', createdAt: '2024-01-02T00:00:00Z', userId: 'me',
    });

    await waitFor(() => {
      expect(sendBtn).not.toBeDisabled();
    });
  });

  it('postId가 다른 엔드포인트를 올바르게 호출한다', async () => {
    render(<CommentSection postId={99} />);

    await waitFor(() => {
      expect(mockGetJson).toHaveBeenCalledWith('/community/posts/99/comments');
    });
  });
});

// ── CommentItem 인터페이스 타입 검증 ──
describe('CommentItem interface', () => {
  it('필수 필드를 모두 포함한다: id, postId, content, createdAt, userId', () => {
    const comment: CommentItem = {
      id: 1,
      postId: 2,
      content: 'hello',
      createdAt: '2024-01-01T00:00:00Z',
      userId: 'u1',
    };
    expect(comment.id).toBe(1);
    expect(comment.postId).toBe(2);
    expect(comment.content).toBe('hello');
    expect(comment.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(comment.userId).toBe('u1');
  });
});
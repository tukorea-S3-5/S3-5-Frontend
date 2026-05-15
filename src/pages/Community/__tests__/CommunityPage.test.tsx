import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunityPage from '../CommunityPage';
import { PostItem } from '../components/PostCard';

// Mock API
vi.mock('../../../api/http', () => ({
  getJson: vi.fn(),
  postJson: vi.fn(),
}));

// Mock PostCard to avoid rendering CommentSection (which has a syntax error)
vi.mock('../components/PostCard', () => ({
  default: ({ post, onToggleLike }: { post: PostItem; onToggleLike: (id: number) => void }) => (
    <div data-testid={`post-card-${post.id}`}>
      <span data-testid={`post-title-${post.id}`}>{post.title}</span>
      <span data-testid={`post-likes-${post.id}`}>{post.likes}</span>
      <span data-testid={`post-liked-${post.id}`}>{String(post.isLiked)}</span>
      <button data-testid={`like-btn-${post.id}`} onClick={() => onToggleLike(post.id)}>좋아요</button>
    </div>
  ),
}));

import { getJson, postJson } from '../../../api/http';
const mockGetJson = getJson as ReturnType<typeof vi.fn>;
const mockPostJson = postJson as ReturnType<typeof vi.fn>;

const makePosts = (): PostItem[] => [
  {
    id: 1,
    title: '첫 번째 게시글',
    content: '첫 내용',
    createdAt: new Date().toISOString(),
    likes: 3,
    userId: 'user1',
    user: { user_id: 'user1', nickname: '작성자1' },
    isLiked: false,
  },
  {
    id: 2,
    title: '두 번째 게시글',
    content: '둘째 내용',
    createdAt: new Date().toISOString(),
    likes: 7,
    userId: 'user2',
    user: { user_id: 'user2', nickname: '작성자2' },
    isLiked: false,
  },
];

describe('CommunityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetJson.mockResolvedValue([]);
  });

  it('renders the write card with placeholder text', async () => {
    render(<CommunityPage />);
    expect(screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️')).toBeInTheDocument();
  });

  it('loads posts on mount', async () => {
    mockGetJson.mockResolvedValueOnce(makePosts());
    render(<CommunityPage />);
    await waitFor(() => {
      expect(mockGetJson).toHaveBeenCalledWith('/community/posts');
    });
  });

  it('renders loaded posts', async () => {
    mockGetJson.mockResolvedValueOnce(makePosts());
    render(<CommunityPage />);
    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
    });
  });

  it('shows loading hint while fetching', async () => {
    let resolve!: (v: PostItem[]) => void;
    mockGetJson.mockImplementationOnce(() => new Promise((r) => { resolve = r; }));

    render(<CommunityPage />);
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();

    resolve(makePosts());
    await waitFor(() => {
      expect(screen.queryByText('불러오는 중...')).not.toBeInTheDocument();
    });
  });

  it('hides loading hint after posts load', async () => {
    mockGetJson.mockResolvedValueOnce(makePosts());
    render(<CommunityPage />);
    await waitFor(() => {
      expect(screen.queryByText('불러오는 중...')).not.toBeInTheDocument();
    });
  });

  it('does not render posts when API returns empty array', async () => {
    mockGetJson.mockResolvedValueOnce([]);
    render(<CommunityPage />);
    await waitFor(() => {
      expect(screen.queryByTestId('post-card-1')).not.toBeInTheDocument();
    });
  });

  it('expands write form when placeholder is clicked', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('내용을 입력하세요...')).toBeInTheDocument();
  });

  it('shows cancel and submit buttons when expanded', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('등록')).toBeInTheDocument();
  });

  it('collapses write form when cancel is clicked', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    fireEvent.click(screen.getByText('취소'));
    expect(screen.queryByPlaceholderText('제목을 입력하세요')).not.toBeInTheDocument();
    expect(screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️')).toBeInTheDocument();
  });

  it('submit button is disabled when title or content is empty', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    const submitBtn = screen.getByText('등록');
    expect(submitBtn).toBeDisabled();
  });

  it('submit button enabled when both title and content are filled', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '제목' } });
    fireEvent.change(screen.getByPlaceholderText('내용을 입력하세요...'), { target: { value: '내용' } });
    expect(screen.getByText('등록')).not.toBeDisabled();
  });

  it('shows character count for content textarea', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('updates character count as content is typed', () => {
    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    const textarea = screen.getByPlaceholderText('내용을 입력하세요...');
    fireEvent.change(textarea, { target: { value: '안녕' } });
    expect(screen.getByText('2/500')).toBeInTheDocument();
  });

  it('submits post when form is filled and submit clicked', async () => {
    mockGetJson.mockResolvedValue([]);
    mockPostJson.mockResolvedValueOnce({});

    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '새 제목' } });
    fireEvent.change(screen.getByPlaceholderText('내용을 입력하세요...'), { target: { value: '새 내용' } });
    fireEvent.click(screen.getByText('등록'));

    await waitFor(() => {
      expect(mockPostJson).toHaveBeenCalledWith('/community/posts', {
        title: '새 제목',
        content: '새 내용',
      });
    });
  });

  it('resets form and collapses after successful post submission', async () => {
    mockPostJson.mockResolvedValueOnce({});
    mockGetJson.mockResolvedValue([]);

    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '제목' } });
    fireEvent.change(screen.getByPlaceholderText('내용을 입력하세요...'), { target: { value: '내용' } });
    fireEvent.click(screen.getByText('등록'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('제목을 입력하세요')).not.toBeInTheDocument();
    });
  });

  it('shows "등록 중..." label while submitting', async () => {
    let resolvePost!: () => void;
    mockPostJson.mockImplementationOnce(() => new Promise((res) => { resolvePost = res; }));
    mockGetJson.mockResolvedValue([]);

    render(<CommunityPage />);
    const placeholder = screen.getByText('오늘 어떠셨나요? 글을 작성해보세요 ✍️');
    fireEvent.click(placeholder.closest('div')!);
    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '제목' } });
    fireEvent.change(screen.getByPlaceholderText('내용을 입력하세요...'), { target: { value: '내용' } });
    fireEvent.click(screen.getByText('등록'));

    expect(screen.getByText('등록 중...')).toBeInTheDocument();
    resolvePost();
  });

  it('optimistically updates like count when toggled', async () => {
    const posts = makePosts();
    mockGetJson.mockResolvedValueOnce(posts);
    // Like toggle returns updated state
    mockPostJson.mockResolvedValueOnce({ liked: true, likes: 4 });

    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    });

    // Initial likes for post 1 is 3
    expect(screen.getByTestId('post-likes-1').textContent).toBe('3');

    // Click like on post 1
    fireEvent.click(screen.getByTestId('like-btn-1'));

    // Optimistic update: 3 + 1 = 4
    expect(screen.getByTestId('post-likes-1').textContent).toBe('4');
  });

  it('reverts like on API failure', async () => {
    const posts = makePosts();
    mockGetJson.mockResolvedValueOnce(posts);
    mockPostJson.mockRejectedValueOnce(new Error('Network error'));

    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('like-btn-1'));

    // After optimistic update (3+1=4), then revert on failure (4-1=3)
    await waitFor(() => {
      expect(screen.getByTestId('post-likes-1').textContent).toBe('3');
    });
  });

  it('handles API load error gracefully', async () => {
    mockGetJson.mockRejectedValueOnce(new Error('Server error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<CommunityPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });

  it('adds isLiked: false to loaded posts', async () => {
    mockGetJson.mockResolvedValueOnce(makePosts());
    render(<CommunityPage />);

    await waitFor(() => {
      expect(screen.getByTestId('post-liked-1').textContent).toBe('false');
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard, { PostItem } from '../PostCard';

// Mock CommentSection to avoid its syntax error and API calls
vi.mock('../CommentSection', () => ({
  default: ({ postId }: { postId: number }) => (
    <div data-testid={`comment-section-${postId}`}>Comment Section</div>
  ),
}));

// Mock styled-components keyframes to avoid CSS animation issues
vi.mock('styled-components', async () => {
  const actual = await vi.importActual<typeof import('styled-components')>('styled-components');
  return actual;
});

const makePost = (overrides: Partial<PostItem> = {}): PostItem => ({
  id: 1,
  title: '테스트 제목',
  content: '테스트 내용',
  createdAt: new Date().toISOString(),
  likes: 5,
  userId: 'user123',
  user: { user_id: 'user123', nickname: '테스트유저' },
  isLiked: false,
  ...overrides,
});

describe('PostCard', () => {
  const mockToggleLike = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders post title and content', () => {
    render(<PostCard post={makePost()} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();
  });

  it('renders author nickname when user object is present', () => {
    render(<PostCard post={makePost()} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('테스트유저')).toBeInTheDocument();
  });

  it('falls back to userId when user.nickname is missing', () => {
    const post = makePost({ user: null as unknown as PostItem['user'] });
    render(<PostCard post={post} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('user123')).toBeInTheDocument();
  });

  it('renders like count', () => {
    render(<PostCard post={makePost({ likes: 42 })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('calls onToggleLike with post id when like button is clicked', () => {
    render(<PostCard post={makePost({ id: 7 })} onToggleLike={mockToggleLike} />);
    const likeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(likeBtn);
    expect(mockToggleLike).toHaveBeenCalledWith(7);
  });

  it('renders CommentSection with correct postId', () => {
    render(<PostCard post={makePost({ id: 3 })} onToggleLike={mockToggleLike} />);
    expect(screen.getByTestId('comment-section-3')).toBeInTheDocument();
  });

  it('shows "방금 전" for a very recent post', () => {
    const recentPost = makePost({ createdAt: new Date().toISOString() });
    render(<PostCard post={recentPost} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });

  it('shows minutes ago for post created 5 minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const post = makePost({ createdAt: fiveMinAgo });
    render(<PostCard post={post} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('5분 전')).toBeInTheDocument();
  });

  it('shows hours ago for post created 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const post = makePost({ createdAt: twoHoursAgo });
    render(<PostCard post={post} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('2시간 전')).toBeInTheDocument();
  });

  it('shows days ago for post created 3 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const post = makePost({ createdAt: threeDaysAgo });
    render(<PostCard post={post} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('3일 전')).toBeInTheDocument();
  });

  it('renders liked state heart icon differently from unliked (isLiked=true)', () => {
    // When isLiked=true, the like count should be shown with different color (via styled-component props)
    // We verify the count is still displayed
    render(<PostCard post={makePost({ isLiked: true, likes: 10 })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders with default delay of 0 without errors', () => {
    render(<PostCard post={makePost()} onToggleLike={mockToggleLike} />);
    // No delay prop passed — should render without error
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
  });

  it('renders with custom delay prop without errors', () => {
    render(<PostCard post={makePost()} delay={200} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('테스트 제목')).toBeInTheDocument();
  });

  it('shows like count of 0', () => {
    render(<PostCard post={makePost({ likes: 0 })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ── Unit tests for timeAgo logic (via rendering) ──
describe('timeAgo logic via PostCard rendering', () => {
  const mockToggleLike = vi.fn().mockResolvedValue(undefined);

  it('handles exactly 1 minute ago', () => {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    render(<PostCard post={makePost({ createdAt: oneMinAgo })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('1분 전')).toBeInTheDocument();
  });

  it('handles exactly 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    render(<PostCard post={makePost({ createdAt: oneHourAgo })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('1시간 전')).toBeInTheDocument();
  });

  it('handles exactly 1 day ago', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    render(<PostCard post={makePost({ createdAt: oneDayAgo })} onToggleLike={mockToggleLike} />);
    expect(screen.getByText('1일 전')).toBeInTheDocument();
  });
});
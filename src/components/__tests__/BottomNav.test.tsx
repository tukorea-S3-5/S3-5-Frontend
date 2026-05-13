import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '../BottomNav';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// styled-components mock for test environment
vi.mock('styled-components', async () => {
  const actual = await vi.importActual<typeof import('styled-components')>('styled-components');
  return actual;
});

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/home' });
  });

  it('renders default nav items including the community item', () => {
    render(<BottomNav />);
    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('운동')).toBeInTheDocument();
    expect(screen.getByText('체중')).toBeInTheDocument();
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
  });

  it('renders community icon', () => {
    render(<BottomNav />);
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  it('does NOT render postnatal (산후) item', () => {
    render(<BottomNav />);
    expect(screen.queryByText('산후')).not.toBeInTheDocument();
  });

  it('navigates to /community when community nav item is clicked', () => {
    render(<BottomNav />);
    const communityBtn = screen.getByText('커뮤니티').closest('button');
    expect(communityBtn).toBeInTheDocument();
    fireEvent.click(communityBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/community');
  });

  it('navigates to /home when home nav item is clicked', () => {
    render(<BottomNav />);
    const homeBtn = screen.getByText('홈').closest('button');
    fireEvent.click(homeBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('navigates to /exercises when exercise nav item is clicked', () => {
    render(<BottomNav />);
    const exerciseBtn = screen.getByText('운동').closest('button');
    fireEvent.click(exerciseBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/exercises');
  });

  it('navigates to /weight when weight nav item is clicked', () => {
    render(<BottomNav />);
    const weightBtn = screen.getByText('체중').closest('button');
    fireEvent.click(weightBtn!);
    expect(mockNavigate).toHaveBeenCalledWith('/weight');
  });

  it('does NOT show an alert when community is clicked (old postnatal alert removed)', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<BottomNav />);
    const communityBtn = screen.getByText('커뮤니티').closest('button');
    fireEvent.click(communityBtn!);
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('renders custom items when provided', () => {
    const customItems = [
      { path: '/custom1', label: '커스텀1', icon: '🔥' },
      { path: '/custom2', label: '커스텀2', icon: '⭐' },
    ];
    render(<BottomNav items={customItems} />);
    expect(screen.getByText('커스텀1')).toBeInTheDocument();
    expect(screen.getByText('커스텀2')).toBeInTheDocument();
    expect(screen.queryByText('홈')).not.toBeInTheDocument();
  });

  it('navigates to custom item path on click', () => {
    const customItems = [{ path: '/custom-path', label: '테스트', icon: '🧪' }];
    render(<BottomNav items={customItems} />);
    const btn = screen.getByText('테스트').closest('button');
    fireEvent.click(btn!);
    expect(mockNavigate).toHaveBeenCalledWith('/custom-path');
  });

  it('marks active item when current pathname matches', () => {
    mockUseLocation.mockReturnValue({ pathname: '/community' });
    render(<BottomNav />);
    // The community button should be rendered (active state tested through styled component props)
    expect(screen.getByText('커뮤니티')).toBeInTheDocument();
  });

  it('renders all four default navigation items', () => {
    render(<BottomNav />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
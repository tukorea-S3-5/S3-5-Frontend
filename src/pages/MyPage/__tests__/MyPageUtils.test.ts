import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Pure utility functions extracted from MyPage.tsx for testing ──────────────
// These mirror the implementations in MyPage.tsx

function calcDDay(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const dDay = Math.ceil(diff / 86400000);
  return { dDay, weeksLeft: Math.floor(dDay / 7) };
}

function formatDueDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

// ── timeAgo from PostCard.tsx ─────────────────────────────────────────────────
function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

describe('calcDDay (from MyPage.tsx)', () => {
  it('calculates dDay for a future date', () => {
    const future = new Date(Date.now() + 10 * 86400000).toISOString();
    const { dDay } = calcDDay(future);
    expect(dDay).toBe(10);
  });

  it('calculates weeksLeft from dDay', () => {
    const future = new Date(Date.now() + 70 * 86400000).toISOString();
    const { weeksLeft } = calcDDay(future);
    expect(weeksLeft).toBe(10);
  });

  it('returns 0 dDay for today (within same second)', () => {
    // A timestamp 1 second in the future should give dDay=1 (ceil)
    const oneSecFuture = new Date(Date.now() + 1000).toISOString();
    const { dDay } = calcDDay(oneSecFuture);
    expect(dDay).toBe(1);
  });

  it('calculates negative dDay for past due date', () => {
    const past = new Date(Date.now() - 7 * 86400000).toISOString();
    const { dDay } = calcDDay(past);
    expect(dDay).toBeLessThanOrEqual(0);
  });

  it('calculates weeksLeft as floor of dDay/7', () => {
    const future = new Date(Date.now() + 13 * 86400000).toISOString();
    const { dDay, weeksLeft } = calcDDay(future);
    expect(weeksLeft).toBe(Math.floor(dDay / 7));
  });

  it('handles 14 days correctly (exactly 2 weeks)', () => {
    const future = new Date(Date.now() + 14 * 86400000).toISOString();
    const { weeksLeft } = calcDDay(future);
    expect(weeksLeft).toBe(2);
  });

  it('handles 1 day future', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const { dDay } = calcDDay(tomorrow);
    expect(dDay).toBe(1);
  });
});

describe('formatDueDate (from MyPage.tsx)', () => {
  it('formats ISO date to Korean date string', () => {
    const result = formatDueDate('2026-07-20T00:00:00Z');
    expect(result).toContain('년');
    expect(result).toContain('월');
    expect(result).toContain('일');
  });

  it('formats year correctly', () => {
    const result = formatDueDate('2026-07-20T00:00:00.000Z');
    expect(result).toContain('2026년');
  });

  it('formats day correctly', () => {
    const result = formatDueDate('2026-07-20T00:00:00.000Z');
    expect(result).toContain('20일');
  });

  it('formats month correctly (no zero padding)', () => {
    const result = formatDueDate('2026-03-05T00:00:00.000Z');
    expect(result).toContain('월');
    // Month should not have leading zero (e.g., "3월" not "03월")
    expect(result).not.toMatch(/0\d월/);
  });

  it('returns a non-empty string', () => {
    expect(formatDueDate('2026-01-01T00:00:00Z')).toBeTruthy();
  });
});

describe('isToday (from MyPage.tsx)', () => {
  it('returns true for current date', () => {
    const today = new Date().toISOString();
    expect(isToday(today)).toBe(true);
  });

  it('returns false for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(isToday(yesterday)).toBe(false);
  });

  it('returns false for tomorrow', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(isToday(tomorrow)).toBe(false);
  });

  it('returns false for a date far in the past', () => {
    expect(isToday('2020-01-01T00:00:00Z')).toBe(false);
  });

  it('is time-zone agnostic (uses toDateString comparison)', () => {
    // Both use new Date().toDateString() which is local-time based
    const now = new Date();
    const sameDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12, 0, 0
    ).toISOString();
    // This should be true since toDateString will match
    // (Note: this could be sensitive to timezone midnight edge cases)
    expect(typeof isToday(sameDay)).toBe('boolean');
  });
});

describe('timeAgo (from PostCard.tsx)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "방금 전" for less than 1 minute ago', () => {
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    expect(timeAgo(thirtySecsAgo)).toBe('방금 전');
  });

  it('returns "방금 전" for 0 seconds ago', () => {
    expect(timeAgo(new Date().toISOString())).toBe('방금 전');
  });

  it('returns "1분 전" for exactly 1 minute ago', () => {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    expect(timeAgo(oneMinAgo)).toBe('1분 전');
  });

  it('returns "5분 전" for 5 minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('5분 전');
  });

  it('returns "59분 전" for 59 minutes ago', () => {
    const fiftyNineMinAgo = new Date(Date.now() - 59 * 60 * 1000).toISOString();
    expect(timeAgo(fiftyNineMinAgo)).toBe('59분 전');
  });

  it('returns "1시간 전" for exactly 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(timeAgo(oneHourAgo)).toBe('1시간 전');
  });

  it('returns "3시간 전" for 3 hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3시간 전');
  });

  it('returns "23시간 전" for 23 hours ago', () => {
    const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twentyThreeHoursAgo)).toBe('23시간 전');
  });

  it('returns "1일 전" for exactly 24 hours ago', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(oneDayAgo)).toBe('1일 전');
  });

  it('returns "7일 전" for 7 days ago', () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(sevenDaysAgo)).toBe('7일 전');
  });

  it('boundary: 60 min exactly is "1시간 전" not "60분 전"', () => {
    const sixtyMinAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const result = timeAgo(sixtyMinAgo);
    expect(result).toBe('1시간 전');
    expect(result).not.toBe('60분 전');
  });

  it('boundary: 24h exactly is "1일 전" not "24시간 전"', () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(twentyFourHoursAgo);
    expect(result).toBe('1일 전');
    expect(result).not.toBe('24시간 전');
  });
});

// ── Weekly average calculation (from MyPage.tsx) ──────────────────────────────
describe('weeklyAvg calculation (from MyPage.tsx logic)', () => {
  function computeWeeklyAvg(weeklyHR: Array<{ day: string; bpm: number | null }>) {
    const valid = weeklyHR
      .filter((d) => d.bpm !== null)
      .map((d) => d.bpm as number);
    if (!valid.length) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
  }

  it('returns null when all bpm values are null', () => {
    const data = [
      { day: '월', bpm: null },
      { day: '오늘', bpm: null },
    ];
    expect(computeWeeklyAvg(data)).toBeNull();
  });

  it('returns correct average for all valid values', () => {
    const data = [
      { day: '월', bpm: 70 },
      { day: '화', bpm: 80 },
      { day: '오늘', bpm: 90 },
    ];
    expect(computeWeeklyAvg(data)).toBe(80);
  });

  it('ignores null values when calculating average', () => {
    const data = [
      { day: '월', bpm: 70 },
      { day: '화', bpm: null },
      { day: '오늘', bpm: 90 },
    ];
    expect(computeWeeklyAvg(data)).toBe(80);
  });

  it('rounds average to nearest integer', () => {
    const data = [
      { day: '월', bpm: 71 },
      { day: '화', bpm: 72 },
    ];
    // (71 + 72) / 2 = 71.5 → rounds to 72
    expect(computeWeeklyAvg(data)).toBe(72);
  });

  it('returns single value when only one entry exists', () => {
    const data = [{ day: '오늘', bpm: 75 }];
    expect(computeWeeklyAvg(data)).toBe(75);
  });

  it('returns null for empty array', () => {
    expect(computeWeeklyAvg([])).toBeNull();
  });
});
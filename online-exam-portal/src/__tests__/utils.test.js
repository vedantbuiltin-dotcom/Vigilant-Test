import { formatDuration } from '../utils/time';
import { clearAuth, getToken, getUser, setToken, setUser } from '../utils/storage';

describe('formatDuration', () => {
  it('handles zero and negative inputs', () => {
    expect(formatDuration(0)).toBe('00:00:00');
    expect(formatDuration(-10)).toBe('00:00:00');
    expect(formatDuration(undefined)).toBe('00:00:00');
  });

  it('formats hours, minutes, seconds with zero padding', () => {
    expect(formatDuration(5)).toBe('00:00:05');
    expect(formatDuration(75)).toBe('00:01:15');
    expect(formatDuration(3661)).toBe('01:01:01');
  });
});

describe('storage helpers', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips token and user', () => {
    setToken('abc');
    setUser({ id: '1', email: 'a@b.com' });
    expect(getToken()).toBe('abc');
    expect(getUser()).toEqual({ id: '1', email: 'a@b.com' });
  });

  it('clearAuth removes everything', () => {
    setToken('abc');
    setUser({ id: '1' });
    clearAuth();
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
  });

  it('handles malformed JSON gracefully', () => {
    localStorage.setItem('oep:user', '{not-json');
    expect(getUser()).toBeNull();
  });
});

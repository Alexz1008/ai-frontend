import { fireEvent, render, screen } from '@testing-library/react';
import ChatWindow from './ChatWindow';

vi.mock('../api/chat', () => ({
  createApiConversation: vi.fn(),
  deleteApiConversation: vi.fn(),
  isConversationsEnabled: vi.fn(() => false),
  streamChat: vi.fn(),
}));

vi.mock('../utils/conversationStorage', () => ({
  createConversation: vi.fn(),
  deleteConversation: vi.fn(),
  getConversation: vi.fn(),
  getConversations: vi.fn(() => []),
  saveConversation: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

it('uses saved dark theme from localStorage on load', () => {
  localStorage.setItem('THEME_MODE', 'dark');

  render(<ChatWindow />);

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(
    screen.getByRole('button', { name: 'Switch to day mode' }),
  ).toBeTruthy();
});

it('toggles night mode and persists the new preference', () => {
  render(<ChatWindow />);
  const toggle = screen.getByRole('button', { name: 'Switch to night mode' });

  fireEvent.click(toggle);

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem('THEME_MODE')).toBe('dark');
  expect(
    screen.getByRole('button', { name: 'Switch to day mode' }),
  ).toBeTruthy();
});

it('falls back to system preference when no saved theme exists', () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  render(<ChatWindow />);

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});

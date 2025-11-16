import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../src/providers/ThemeProvider';

// Wrapper component for testing
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');

    // Mock matchMedia for dark mode default
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders without crashing', () => {
    renderWithProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has correct aria-label for dark mode', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('has correct aria-label for light mode after toggle', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initially dark, so click to switch to light
    fireEvent.click(button);

    // Now it should show "Switch to dark mode" since we're in light mode
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('toggles theme when clicked', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');

    // Initially dark
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');

    // Click to toggle
    fireEvent.click(button);

    // Now light
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('applies custom className', () => {
    renderWithProvider(<ThemeToggle className="custom-class" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('has focus ring styles for accessibility', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });

  it('contains both sun and moon SVG icons', () => {
    const { container } = renderWithProvider(<ThemeToggle />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs).toHaveLength(2);
  });

  it('has title attribute for tooltip', () => {
    renderWithProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Switch to light mode');
  });
});

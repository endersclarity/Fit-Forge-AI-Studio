import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    title: 'No workouts yet',
    body: 'Start your fitness journey by creating your first workout.',
    ctaText: 'Create Workout',
    onCtaClick: vi.fn(),
  };

  it('renders without crashing', () => {
    render(<EmptyState {...defaultProps} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<EmptyState {...defaultProps} />);
    expect(screen.getByText('No workouts yet')).toBeInTheDocument();
  });

  it('displays the body text', () => {
    render(<EmptyState {...defaultProps} />);
    expect(
      screen.getByText('Start your fitness journey by creating your first workout.')
    ).toBeInTheDocument();
  });

  it('displays the CTA button with correct text', () => {
    render(<EmptyState {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Create Workout' });
    expect(button).toBeInTheDocument();
  });

  it('calls onCtaClick when button is clicked', () => {
    const mockClick = vi.fn();
    render(<EmptyState {...defaultProps} onCtaClick={mockClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('renders optional illustration when provided', () => {
    const illustration = <svg data-testid="custom-icon" />;
    render(<EmptyState {...defaultProps} illustration={illustration} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render illustration container when not provided', () => {
    const { container } = render(<EmptyState {...defaultProps} />);

    // Should not have the illustration wrapper
    const wrapper = container.querySelector('.mb-6');
    expect(wrapper).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState {...defaultProps} className="custom-class" />);
    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveClass('custom-class');
  });

  it('has accessible aria-label on the container', () => {
    render(<EmptyState {...defaultProps} />);
    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-label', 'No workouts yet');
  });

  it('CTA button has minimum touch target size', () => {
    render(<EmptyState {...defaultProps} />);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('min-h-[60px]');
    expect(button).toHaveClass('min-w-[60px]');
  });

  it('CTA button has focus styles for accessibility', () => {
    render(<EmptyState {...defaultProps} />);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('focus:outline-none');
    expect(button).toHaveClass('focus:ring-2');
  });

  it('applies dark mode classes', () => {
    render(<EmptyState {...defaultProps} />);
    const title = screen.getByText('No workouts yet');
    const body = screen.getByText(
      'Start your fitness journey by creating your first workout.'
    );

    expect(title).toHaveClass('dark:text-dark-text-primary');
    expect(body).toHaveClass('dark:text-dark-text-secondary');
  });
});

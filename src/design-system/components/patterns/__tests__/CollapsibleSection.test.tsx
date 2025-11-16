/**
 * CollapsibleSection Component Test Suite
 */

import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import CollapsibleSection from '../CollapsibleSection';

// Extend matchers
expect.extend(toHaveNoViolations);

// Mock Framer Motion to avoid animation complexity
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, animate, initial, exit, transition, variants, whileHover, whileTap, whileInView, layout, layoutId, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('CollapsibleSection Component', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render collapsed by default', () => {
      render(
        <CollapsibleSection title="Test Section">
          <p>Content here</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button', { name: /expand test section/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Content here')).not.toBeInTheDocument();
    });

    it('should render expanded when defaultOpen is true', () => {
      render(
        <CollapsibleSection title="Test Section" defaultOpen={true}>
          <p>Content here</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button', { name: /collapse test section/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });

    it('should render title correctly', () => {
      render(
        <CollapsibleSection title="Advanced Settings">
          <p>Content</p>
        </CollapsibleSection>
      );

      expect(screen.getByText('Advanced Settings')).toBeInTheDocument();
    });

    it('should render children when expanded', () => {
      render(
        <CollapsibleSection title="Section" defaultOpen={true}>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <span>Span text</span>
          </div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(screen.getByText('Span text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CollapsibleSection title="Section" className="custom-class">
          <p>Content</p>
        </CollapsibleSection>
      );

      const section = container.firstChild as HTMLElement;
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('User interactions', () => {
    it('should toggle expand/collapse on header click', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Section">
          <p>Content here</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');

      // Initially collapsed
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Content here')).not.toBeInTheDocument();

      // Click to expand
      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Content here')).toBeInTheDocument();
      });

      // Click to collapse
      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Content here')).not.toBeInTheDocument();
      });
    });

    it('should call onToggle callback with correct boolean', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Section" onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');

      // First click (expand)
      await user.click(button);
      expect(mockOnToggle).toHaveBeenCalledWith(true);

      // Second click (collapse)
      await user.click(button);
      expect(mockOnToggle).toHaveBeenCalledWith(false);

      expect(mockOnToggle).toHaveBeenCalledTimes(2);
    });

    it('should toggle on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Section" onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('should toggle on Space key', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Section" onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it('should not toggle on other keys', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Section" onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Escape}');
      await user.keyboard('{Tab}');
      await user.keyboard('a');

      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Controlled mode', () => {
    const ControlledComponent: React.FC = () => {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <div>
          <button onClick={() => setIsOpen(!isOpen)}>
            External Toggle
          </button>
          <CollapsibleSection title="Controlled" isOpen={isOpen} onToggle={setIsOpen}>
            <p>Controlled content</p>
          </CollapsibleSection>
        </div>
      );
    };

    it('should work in controlled mode with external state', async () => {
      const user = userEvent.setup();
      render(<ControlledComponent />);

      const externalButton = screen.getByText('External Toggle');
      const sectionButton = screen.getByRole('button', { name: /controlled/i });

      // Initially collapsed
      expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();

      // Expand via external button
      await user.click(externalButton);
      await waitFor(() => {
        expect(sectionButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Controlled content')).toBeInTheDocument();
      });

      // Collapse via section button
      await user.click(sectionButton);
      await waitFor(() => {
        expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
      });
    });

    it('should respect controlled isOpen prop', () => {
      const { rerender } = render(
        <CollapsibleSection title="Section" isOpen={false} onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      // Update controlled prop
      rerender(
        <CollapsibleSection title="Section" isOpen={true} onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations when collapsed', async () => {
      const { container } = render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when expanded', async () => {
      const { container } = render(
        <CollapsibleSection title="Section" defaultOpen={true}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <CollapsibleSection title="Test Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded');
      expect(button).toHaveAttribute('aria-label');
    });

    it('should update aria-label based on state', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Settings">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');

      // Collapsed state
      expect(button).toHaveAttribute('aria-label', 'Expand Settings');

      // Expand
      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-label', 'Collapse Settings');
      });
    });

    it('should have button role for header', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be keyboard focusable', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should meet touch target requirements (60x60px)', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      expect(styles.minHeight).toBe('60px');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty children gracefully', () => {
      render(
        <CollapsibleSection title="Empty Section" defaultOpen={true}>
          {null}
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <CollapsibleSection title={longTitle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <CollapsibleSection title="Nested" defaultOpen={true}>
          <div>
            <h3>Heading</h3>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <form>
              <input type="text" placeholder="Test input" />
              <button type="submit">Submit</button>
            </form>
          </div>
        </CollapsibleSection>
      );

      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should handle multiple sections on same page independently', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <CollapsibleSection title="Section 1">
            <p>Content 1</p>
          </CollapsibleSection>
          <CollapsibleSection title="Section 2">
            <p>Content 2</p>
          </CollapsibleSection>
          <CollapsibleSection title="Section 3">
            <p>Content 3</p>
          </CollapsibleSection>
        </div>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      // Expand first section
      await user.click(buttons[0]);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
        expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
      });

      // Expand second section (first stays expanded)
      await user.click(buttons[1]);
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
        expect(screen.getByText('Content 2')).toBeInTheDocument();
        expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
      });
    });

    it('should handle rapid toggling', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <CollapsibleSection title="Rapid Toggle" onToggle={mockOnToggle}>
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should have called onToggle 5 times
      expect(mockOnToggle).toHaveBeenCalledTimes(5);
    });

    it('should handle nested collapsible sections', async () => {
      const user = userEvent.setup();
      render(
        <CollapsibleSection title="Outer Section" defaultOpen={true}>
          <div>
            <p>Outer content</p>
            <CollapsibleSection title="Inner Section">
              <p>Inner content</p>
            </CollapsibleSection>
          </div>
        </CollapsibleSection>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);

      // Outer is expanded, inner is collapsed
      expect(screen.getByText('Outer content')).toBeInTheDocument();
      expect(screen.queryByText('Inner content')).not.toBeInTheDocument();

      // Expand inner section
      await user.click(buttons[1]); // Inner section button
      await waitFor(() => {
        expect(screen.getByText('Inner content')).toBeInTheDocument();
      });
    });
  });

  describe('Animation states', () => {
    it('should show chevron icon', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      const button = screen.getByRole('button');
      // Chevron icon should be present (lucide-react renders as SVG)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(
        <CollapsibleSection title="Section" defaultOpen={true}>
          <p>Content v1</p>
        </CollapsibleSection>
      );

      expect(screen.getByText('Content v1')).toBeInTheDocument();

      // Re-render with different content but same state
      rerender(
        <CollapsibleSection title="Section" defaultOpen={true}>
          <p>Content v2</p>
        </CollapsibleSection>
      );

      expect(screen.getByText('Content v2')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Ref forwarding', () => {
    it('should forward ref to container div', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <CollapsibleSection ref={ref} title="Section">
          <p>Content</p>
        </CollapsibleSection>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

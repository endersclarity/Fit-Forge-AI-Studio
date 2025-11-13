/**
 * Badge Component Tests
 *
 * Comprehensive test suite for Badge primitive component.
 * Tests rendering, variants, sizes, accessibility, and edge cases.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Badge from '../Badge';

expect.extend(toHaveNoViolations);

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Badge>Test Badge</Badge>);
      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
    });

    it('should render all 5 variants correctly', () => {
      const { rerender } = render(<Badge variant="success">Success</Badge>);
      expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800', 'border-green-200');

      rerender(<Badge variant="warning">Warning</Badge>);
      expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200');

      rerender(<Badge variant="error">Error</Badge>);
      expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200');

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info')).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200');

      rerender(<Badge variant="primary">Primary</Badge>);
      expect(screen.getByText('Primary')).toHaveClass('bg-badge-bg', 'text-badge-text', 'border-badge-border');
    });

    it('should render all 3 sizes correctly', () => {
      const { rerender } = render(<Badge size="sm">Small</Badge>);
      expect(screen.getByText('Small')).toHaveClass('text-xs', 'px-2', 'py-0.5');

      rerender(<Badge size="md">Medium</Badge>);
      expect(screen.getByText('Medium')).toHaveClass('text-sm', 'px-3', 'py-1');

      rerender(<Badge size="lg">Large</Badge>);
      expect(screen.getByText('Large')).toHaveClass('text-base', 'px-4', 'py-1.5');
    });

    it('should apply custom className', () => {
      render(<Badge className="custom-class">Custom</Badge>);
      expect(screen.getByText('Custom')).toHaveClass('custom-class');
    });

    it('should render with text content', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with number content', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with multiple children elements', () => {
      render(
        <Badge>
          <span>Icon</span>
          <span>Text</span>
        </Badge>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should use semantic HTML (span element)', () => {
      render(<Badge>Test</Badge>);
      const badge = screen.getByText('Test');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label for screen readers', () => {
      render(<Badge aria-label="Status: Active">✓</Badge>);
      const badge = screen.getByLabelText('Status: Active');
      expect(badge).toBeInTheDocument();
    });

    it('should have no accessibility violations (default)', async () => {
      const { container } = render(<Badge>Test</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (success variant)', async () => {
      const { container } = render(<Badge variant="success">Success</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (warning variant)', async () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (error variant)', async () => {
      const { container } = render(<Badge variant="error">Error</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations (info variant)', async () => {
      const { container } = render(<Badge variant="info">Info</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Props and Types', () => {
    it('should default to primary variant if not specified', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toHaveClass('bg-badge-bg', 'text-badge-text');
    });

    it('should default to md size if not specified', () => {
      render(<Badge>Default Size</Badge>);
      expect(screen.getByText('Default Size')).toHaveClass('text-sm', 'px-3', 'py-1');
    });

    it('should support ref forwarding', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Ref Test</Badge>);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.textContent).toBe('Ref Test');
    });

    it('should have correct displayName', () => {
      expect(Badge.displayName).toBe('Badge');
    });
  });

  describe('Variant Color Combinations', () => {
    it('should apply success variant colors (green)', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
      expect(badge).toHaveClass('border-green-200');
    });

    it('should apply warning variant colors (yellow)', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
      expect(badge).toHaveClass('border-yellow-200');
    });

    it('should apply error variant colors (red)', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
      expect(badge).toHaveClass('border-red-200');
    });

    it('should apply info variant colors (blue)', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-blue-100');
      expect(badge).toHaveClass('text-blue-800');
      expect(badge).toHaveClass('border-blue-200');
    });

    it('should apply primary variant with design token colors', () => {
      render(<Badge variant="primary">Primary</Badge>);
      const badge = screen.getByText('Primary');
      expect(badge).toHaveClass('bg-badge-bg');
      expect(badge).toHaveClass('text-badge-text');
      expect(badge).toHaveClass('border-badge-border');
    });
  });

  describe('Default Values', () => {
    it('should use default variant when not provided', () => {
      render(<Badge>No Variant</Badge>);
      expect(screen.getByText('No Variant')).toHaveClass('bg-badge-bg');
    });

    it('should use default size when not provided', () => {
      render(<Badge>No Size</Badge>);
      expect(screen.getByText('No Size')).toHaveClass('text-sm');
    });

    it('should work without className', () => {
      render(<Badge>No Class</Badge>);
      const badge = screen.getByText('No Class');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('inline-flex');
    });

    it('should work without aria-label', () => {
      render(<Badge>No ARIA</Badge>);
      const badge = screen.getByText('No ARIA');
      expect(badge).toBeInTheDocument();
      expect(badge).not.toHaveAttribute('aria-label');
    });
  });
});

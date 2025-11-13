/**
 * Design Token Demo Component
 *
 * Comprehensive demonstration of all design tokens.
 * Used for visual verification and documentation.
 */

import React from 'react';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';
import { shadows } from './tokens/shadows';

export const DesignTokenDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-12 bg-white">
      {/* Colors Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Color Tokens</h2>

        {/* Primary Colors */}
        <div className="space-y-2">
          <h3 className="text-display-md font-display text-primary-medium">Primary Palette</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="w-24 h-24 bg-primary rounded-xl shadow-md"></div>
              <p className="text-sm font-body">primary</p>
              <code className="text-xs text-gray-600">{colors.primary.DEFAULT}</code>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-24 bg-primary-dark rounded-xl shadow-md"></div>
              <p className="text-sm font-body">primary-dark</p>
              <code className="text-xs text-gray-600">{colors.primary.dark}</code>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-24 bg-primary-medium rounded-xl shadow-md"></div>
              <p className="text-sm font-body">primary-medium</p>
              <code className="text-xs text-gray-600">{colors.primary.medium}</code>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-24 bg-primary-light rounded-xl shadow-md"></div>
              <p className="text-sm font-body">primary-light</p>
              <code className="text-xs text-gray-600">{colors.primary.light}</code>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-24 bg-primary-pale rounded-xl shadow-md"></div>
              <p className="text-sm font-body">primary-pale</p>
              <code className="text-xs text-gray-600">{colors.primary.pale}</code>
            </div>
          </div>
        </div>

        {/* Badge Colors */}
        <div className="space-y-2">
          <h3 className="text-display-md font-display text-primary-medium">Badge Colors</h3>
          <div className="inline-flex gap-2 items-center px-4 py-2 bg-badge-bg border-2 border-badge-border rounded-xl">
            <span className="text-badge-text font-body font-medium">Sample Badge</span>
          </div>
          <div className="flex gap-4 mt-2">
            <code className="text-xs">bg: {colors.badge.bg}</code>
            <code className="text-xs">border: {colors.badge.border}</code>
            <code className="text-xs">text: {colors.badge.text}</code>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Typography Tokens</h2>

        {/* Display Scale */}
        <div className="space-y-4">
          <h3 className="text-display-md font-display text-primary-medium">Display Scale (Cinzel)</h3>
          <div className="space-y-2">
            <p className="text-display-xl font-display text-primary-dark">Display XL - 32px</p>
            <code className="text-xs block text-gray-600">
              fontSize: {typography.displayScale.xl.fontSize},
              lineHeight: {typography.displayScale.xl.lineHeight},
              letterSpacing: {typography.displayScale.xl.letterSpacing}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-display-lg font-display text-primary-dark">Display LG - 24px</p>
            <code className="text-xs block text-gray-600">
              fontSize: {typography.displayScale.lg.fontSize},
              lineHeight: {typography.displayScale.lg.lineHeight}
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-display-md font-display text-primary-dark">Display MD - 18px</p>
            <code className="text-xs block text-gray-600">
              fontSize: {typography.displayScale.md.fontSize},
              lineHeight: {typography.displayScale.md.lineHeight}
            </code>
          </div>
        </div>

        {/* Body Scale */}
        <div className="space-y-4">
          <h3 className="text-display-md font-display text-primary-medium">Body Scale (Lato)</h3>
          <div className="space-y-2">
            <p className="text-xl font-body text-primary-dark">Body XL - 20px (Lato)</p>
            <p className="text-lg font-body text-primary-dark">Body LG - 18px (Lato)</p>
            <p className="text-base font-body text-primary-dark">Body MD - 16px (Lato)</p>
            <p className="text-sm font-body text-primary-dark">Body SM - 14px (Lato)</p>
            <p className="text-xs font-body text-primary-dark">Body XS - 12px (Lato)</p>
          </div>
        </div>
      </section>

      {/* Spacing Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Spacing Tokens (8px Grid)</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-primary"></div>
            <span className="text-sm font-body">8px (1 unit) - {spacing[1]}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-8 bg-primary"></div>
            <span className="text-sm font-body">16px (2 units) - {spacing[2]}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-6 h-8 bg-primary"></div>
            <span className="text-sm font-body">24px (3 units) - {spacing[3]}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary"></div>
            <span className="text-sm font-body">32px (4 units) - {spacing[4]}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-primary"></div>
            <span className="text-sm font-body">48px (6 units) - {spacing[6]}</span>
          </div>
        </div>
      </section>

      {/* Shadows Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Shadow Tokens</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white rounded-xl shadow-button-primary">
            <p className="text-sm font-body font-medium">Button Primary Shadow</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows['button-primary']}</code>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-drawer">
            <p className="text-sm font-body font-medium">Drawer Shadow</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows.drawer}</code>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <p className="text-sm font-body font-medium">Shadow SM</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows.sm}</code>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <p className="text-sm font-body font-medium">Shadow MD</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows.md}</code>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <p className="text-sm font-body font-medium">Shadow LG</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows.lg}</code>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-xl">
            <p className="text-sm font-body font-medium">Shadow XL</p>
            <code className="text-xs text-gray-600 block mt-2">{shadows.xl}</code>
          </div>
        </div>
      </section>

      {/* Border Radius Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Border Radius Tokens</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-body">xl (24px)</span>
          </div>
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center">
            <span className="text-white text-xs font-body">2xl (32px)</span>
          </div>
        </div>
      </section>

      {/* Gradient Section */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Background Gradients</h2>
        <div className="p-12 bg-heavenly-gradient rounded-2xl">
          <p className="text-display-md font-display text-primary-dark text-center">
            Heavenly Gradient
          </p>
          <code className="text-xs text-gray-600 block mt-4 text-center">
            linear-gradient(180deg, rgba(235, 241, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)
          </code>
        </div>
      </section>

      {/* Complete Component Example */}
      <section className="space-y-4">
        <h2 className="text-display-lg font-display text-primary-dark">Complete Component Example</h2>
        <div className="p-6 bg-heavenly-gradient rounded-2xl shadow-lg space-y-4">
          <h3 className="text-display-md font-display text-primary-dark">Workout Builder</h3>
          <p className="text-base font-body text-primary-medium">
            This component demonstrates multiple design tokens working together.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-primary text-white font-body font-medium rounded-xl shadow-button-primary hover:bg-primary-light transition-colors">
              Primary Action
            </button>
            <div className="inline-flex items-center px-4 py-2 bg-badge-bg border-2 border-badge-border text-badge-text font-body font-medium rounded-xl">
              Status Badge
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignTokenDemo;

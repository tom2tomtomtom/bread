/**
 * Accessibility Validation and Enhancement Utilities
 *
 * Provides comprehensive accessibility features:
 * - WCAG AA compliance validation
 * - Color contrast checking
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Accessibility testing helpers
 */

// WCAG AA Standards
const WCAG_STANDARDS = {
  COLOR_CONTRAST: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    GRAPHICS: 3.0,
  },
  FONT_SIZE: {
    MINIMUM: 12,
    LARGE_TEXT_THRESHOLD: 18,
  },
  TIMING: {
    MINIMUM_FOCUS_TIME: 2000, // 2 seconds
    ANIMATION_DURATION_LIMIT: 5000, // 5 seconds
  },
};

/**
 * Color Contrast Calculation
 */
export const calculateColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate color contrast compliance
 */
export const validateColorContrast = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): { compliant: boolean; ratio: number; required: number } => {
  const ratio = calculateColorContrast(foreground, background);
  const required = isLargeText
    ? WCAG_STANDARDS.COLOR_CONTRAST.LARGE_TEXT
    : WCAG_STANDARDS.COLOR_CONTRAST.NORMAL_TEXT;

  return {
    compliant: ratio >= required,
    ratio,
    required,
  };
};

/**
 * Keyboard Navigation Support
 */
export class KeyboardNavigation {
  private static focusableElements = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  static getFocusableElements(container: Element = document.body): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableElements)) as HTMLElement[];
  }

  static trapFocus(container: Element): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === 'Tab') {
        if (keyboardEvent.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            keyboardEvent.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            keyboardEvent.preventDefault();
            firstElement?.focus();
          }
        }
      }

      // Escape key to close
      if (keyboardEvent.key === 'Escape') {
        const closeButton = container.querySelector('[data-close]') as HTMLElement;
        closeButton?.click();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

/**
 * ARIA Label Management
 */
export const generateAriaLabel = (element: HTMLElement, context?: string): string => {
  // Check existing labels
  const existingLabel =
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent?.trim();

  if (existingLabel) return existingLabel;

  // Generate based on element type and context
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  switch (tagName) {
    case 'button':
      return context ? `${context} button` : 'Button';
    case 'input':
      const type = element.getAttribute('type') || 'text';
      return context ? `${context} ${type} input` : `${type} input`;
    case 'select':
      return context ? `${context} dropdown` : 'Dropdown';
    case 'textarea':
      return context ? `${context} text area` : 'Text area';
    default:
      if (role) {
        return context ? `${context} ${role}` : role;
      }
      return context || 'Interactive element';
  }
};

/**
 * Accessibility Audit
 */
export interface AccessibilityIssue {
  element: HTMLElement;
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  suggestion: string;
}

export const auditAccessibility = (container: Element = document.body): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];

  // Check for missing alt text on images
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
      issues.push({
        element: img as HTMLElement,
        type: 'error',
        rule: 'WCAG 1.1.1',
        message: 'Image missing alt text',
        suggestion: 'Add descriptive alt text or aria-label',
      });
    }
  });

  // Check for missing form labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      container.querySelector(`label[for="${input.id}"]`);

    if (!hasLabel) {
      issues.push({
        element: input as HTMLElement,
        type: 'error',
        rule: 'WCAG 3.3.2',
        message: 'Form control missing label',
        suggestion: 'Add a label element or aria-label attribute',
      });
    }
  });

  // Check for insufficient color contrast
  const textElements = container.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, span, div, button, a'
  );
  textElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    if (
      color &&
      backgroundColor &&
      color !== 'rgba(0, 0, 0, 0)' &&
      backgroundColor !== 'rgba(0, 0, 0, 0)'
    ) {
      try {
        const fontSize = parseFloat(styles.fontSize);
        const isLargeText = fontSize >= WCAG_STANDARDS.FONT_SIZE.LARGE_TEXT_THRESHOLD;

        // Convert RGB to hex for contrast calculation
        const rgbToHex = (rgb: string): string => {
          const match = rgb.match(/\d+/g);
          if (!match) return '#000000';
          return `#${  match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
        };

        const fgHex = rgbToHex(color);
        const bgHex = rgbToHex(backgroundColor);

        const contrast = validateColorContrast(fgHex, bgHex, isLargeText);

        if (!contrast.compliant) {
          issues.push({
            element: element as HTMLElement,
            type: 'warning',
            rule: 'WCAG 1.4.3',
            message: `Insufficient color contrast: ${contrast.ratio.toFixed(2)}:1 (required: ${contrast.required}:1)`,
            suggestion: 'Increase color contrast between text and background',
          });
        }
      } catch (error) {
        // Skip elements where color parsing fails
      }
    }
  });

  // Check for missing heading hierarchy
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let lastLevel = 0;

  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));

    if (level > lastLevel + 1) {
      issues.push({
        element: heading as HTMLElement,
        type: 'warning',
        rule: 'WCAG 1.3.1',
        message: `Heading level skipped (h${lastLevel} to h${level})`,
        suggestion: 'Use heading levels in sequential order',
      });
    }

    lastLevel = level;
  });

  // Check for missing focus indicators
  const interactiveElements = container.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]'
  );
  interactiveElements.forEach(element => {
    const styles = window.getComputedStyle(element, ':focus');
    const outline = styles.outline;
    const boxShadow = styles.boxShadow;

    if (outline === 'none' && boxShadow === 'none') {
      issues.push({
        element: element as HTMLElement,
        type: 'warning',
        rule: 'WCAG 2.4.7',
        message: 'Interactive element missing focus indicator',
        suggestion: 'Add visible focus styles (outline or box-shadow)',
      });
    }
  });

  return issues;
};

/**
 * Accessibility Testing Helpers
 */
export const accessibilityHelpers = {
  // Simulate screen reader navigation
  simulateScreenReader: (container: Element = document.body): string[] => {
    const readableElements = container.querySelectorAll(
      [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'button',
        'a',
        'input',
        'select',
        'textarea',
        '[aria-label]',
        '[aria-labelledby]',
        '[role]',
      ].join(', ')
    );

    return Array.from(readableElements).map(element => {
      const ariaLabel = element.getAttribute('aria-label');
      const role = element.getAttribute('role');
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent?.trim() || '';

      if (ariaLabel) return `${role || tagName}: ${ariaLabel}`;
      if (textContent) return `${role || tagName}: ${textContent}`;
      return `${role || tagName}: (no accessible name)`;
    });
  },

  // Test keyboard navigation
  testKeyboardNavigation: (container: Element = document.body): boolean => {
    const focusableElements = KeyboardNavigation.getFocusableElements(container);

    // Check if all interactive elements are keyboard accessible
    return focusableElements.every(element => {
      const tabIndex = element.getAttribute('tabindex');
      return tabIndex !== '-1' && !element.hasAttribute('disabled');
    });
  },

  // Generate accessibility report
  generateReport: (
    container: Element = document.body
  ): {
    score: number;
    issues: AccessibilityIssue[];
    summary: {
      errors: number;
      warnings: number;
      info: number;
    };
  } => {
    const issues = auditAccessibility(container);
    const errors = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    const info = issues.filter(i => i.type === 'info').length;

    // Calculate score (100 - penalties)
    const score = Math.max(0, 100 - errors * 10 - warnings * 5 - info * 1);

    return {
      score,
      issues,
      summary: { errors, warnings, info },
    };
  },
};

/**
 * Initialize accessibility features
 */
export const initializeAccessibility = (): void => {
  // Add skip link if not present
  if (!document.querySelector('.skip-link')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className =
      'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Add main landmark if not present
  if (!document.querySelector('main, [role="main"]')) {
    const main = document.querySelector('#root, .app, .main-content');
    if (main) {
      main.setAttribute('role', 'main');
      main.id = 'main-content';
    }
  }

  // Enhance focus management
  document.addEventListener('keydown', event => {
    // Show focus indicators when using keyboard
    if (event.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    // Hide focus indicators when using mouse
    document.body.classList.remove('keyboard-navigation');
  });

  // Announce page changes to screen readers
  const announcePageChange = (title: string) => {
    KeyboardNavigation.announceToScreenReader(`Page changed to ${title}`, 'assertive');
  };

  // Monitor for route changes (if using client-side routing)
  let lastTitle = document.title;
  const titleObserver = new MutationObserver(() => {
    if (document.title !== lastTitle) {
      announcePageChange(document.title);
      lastTitle = document.title;
    }
  });

  titleObserver.observe(document.querySelector('title') || document.head, {
    childList: true,
    characterData: true,
  });
};

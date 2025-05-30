// __mocks__/lucide-react.js
import React from 'react';

// Helper to create a mock Lucide icon component
const createLucideIcon = (iconName) => {
  const MockIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} data-testid={`${iconName}-icon`}>
      {/* You can add a <title>{iconName}</title> here if needed for accessibility in tests */}
    </svg>
  ));
  MockIcon.displayName = `Lucide${iconName}`;
  return MockIcon;
};

// Export specific icons that are used in the tests or components
// From ImportDataDialog.test.tsx
export const Upload = createLucideIcon('Upload');
export const X = createLucideIcon('X');

// From PromptCard.test.tsx
export const Copy = createLucideIcon('Copy');
export const Edit3 = createLucideIcon('Edit3');
export const Trash2 = createLucideIcon('Trash2');
export const MoreVertical = createLucideIcon('MoreVertical');

// From PromptForm.test.tsx
export const PlusCircle = createLucideIcon('PlusCircle');

// Add any other icons that might be used by components under test
// For example, if other Radix-based components use icons like ChevronDown implicitly.
export const ChevronDown = createLucideIcon('ChevronDown');
export const Search = createLucideIcon('Search');
export const AlertTriangle = createLucideIcon('AlertTriangle');
export const CheckCircle = createLucideIcon('CheckCircle');

// Default export for any other icons (optional, but can prevent some errors)
export default new Proxy({}, {
  get: function(target, prop) {
    if (prop === '__esModule') return false;
    // Return a generic mock icon for any other requested icon
    return createLucideIcon(prop);
  }
});

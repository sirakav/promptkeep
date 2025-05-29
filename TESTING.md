# Unit Testing Guide

This guide provides instructions and conventions for writing unit tests in this project. We primarily use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing React components and utility functions.

## Setup

Most Next.js projects come with Jest and React Testing Library configured. If not, you might need to install them:

```bash
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Or using yarn:

```bash
yarn add --dev jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

You'll also need to configure Jest. Create a `jest.config.js` file in the root of your project (or modify it if it exists):

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you have a setup file
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    // Add other aliases here
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

And a `jest.setup.js` file for global test setups (like importing jest-dom matchers):

```javascript
// jest.setup.js
import '@testing-library/jest-dom'
```

Update your `package.json` with a test script:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## Writing Tests

### Utility Functions

For plain JavaScript/TypeScript functions, you can write standard Jest tests.

**Example:** Testing a utility function in `src/lib/utils.ts`

Let's assume you have a utility function:
```typescript
// src/lib/utils.ts
export const formatCategoryName = (name: string): string => {
  if (!name) return 'Uncategorized';
  return name.trim().toUpperCase();
};
```

Create a test file `src/lib/utils.test.ts`:
```typescript
// src/lib/utils.test.ts
import { formatCategoryName } from './utils';

describe('Utility Functions', () => {
  describe('formatCategoryName', () => {
    it('should return "Uncategorized" for empty or null input', () => {
      expect(formatCategoryName('')).toBe('UNCATEGORIZED'); // Consistent with trimming whitespace then checking
      expect(formatCategoryName(null as any)).toBe('UNCATEGORIZED');
    });

    it('should trim whitespace and convert to uppercase', () => {
      expect(formatCategoryName('  my category  ')).toBe('MY CATEGORY');
    });

    it('should handle already formatted names', () => {
      expect(formatCategoryName('CATEGORY')).toBe('CATEGORY');
    });
  });
});
```

### React Components

For React components, use React Testing Library to render components and interact with them.

**Example:** Testing the `Button` component (`src/components/ui/button.tsx`)

```typescript
// src/components/ui/button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button'; // Adjust path as necessary

describe('Button Component', () => {
  it('renders the button with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /Click Me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByRole('button', { name: /Click Me/i })).toBeDisabled();
  });

  // Example for testing a variant (assuming 'destructive' variant adds specific classes or styles)
  // This might require more specific class checking or snapshot testing if visual styles are key.
  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    // Example: Check for a class that destructive variant might add.
    // This is highly dependent on how variants are implemented (e.g., via cva).
    // For cva, you might not check specific classes directly but rather visual snapshots or functionality.
    expect(screen.getByRole('button', { name: /Delete/i })).toHaveClass('bg-destructive'); // This class is from the cva definition in button.tsx
  });
});

```

**Example:** Testing `PromptCard.tsx` (a more complex component)

Testing `PromptCard.tsx` would involve mocking its props (like `prompt` object, `onCopy`, `onEdit`, `onDelete` functions) and verifying that:
1.  It renders the prompt name and content.
2.  The copy functionality (clicking the card or the copy icon) calls `onCopy` with the correct content.
3.  The Edit and Delete buttons in the dropdown menu call `onEdit` and `onDelete` respectively.

```typescript
// src/components/custom/PromptCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptCard } from './PromptCard'; // Adjust path
import { Prompt } from '@/types'; // Adjust path

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'), // import and retain default behavior
  Copy: () => <svg data-testid="copy-icon" />,
  Edit3: () => <svg data-testid="edit-icon" />,
  Trash2: () => <svg data-testid="delete-icon" />,
  MoreVertical: () => <svg data-testid="more-icon" />,
}));


describe('PromptCard Component', () => {
  const mockPrompt: Prompt = {
    id: '1',
    name: 'Test Prompt',
    content: 'This is the prompt content.',
    categoryId: 'cat1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockCategory = { id: 'cat1', name: 'Test Category' };
  const mockOnCopy = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockOnCopy.mockClear();
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('renders prompt details', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onCopy={mockOnCopy}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument(); // Category description
    expect(screen.getByText('This is the prompt content.')).toBeInTheDocument();
  });

  it('calls onCopy when the card is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onCopy={mockOnCopy}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    // The whole card is a button now (structurally) or has an onClick
    // Assuming the Card itself is the main clickable element for copy
    fireEvent.click(screen.getByRole('article')); // shadcn Card role is often 'article' or check rendered output
    expect(mockOnCopy).toHaveBeenCalledWith('This is the prompt content.');
  });

  it('calls onCopy when the copy icon button is clicked and stops propagation', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onCopy={mockOnCopy}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const copyButton = screen.getByLabelText('Copy prompt'); // Assuming aria-label for icon button
    fireEvent.click(copyButton);
    expect(mockOnCopy).toHaveBeenCalledWith('This is the prompt content.');
    // If card click also calls onCopy, this test needs to ensure it's called once,
    // and that event propagation is stopped if copyButton is inside the main card click area.
    // The implementation makes card itself clickable, and button also clickable with stopPropagation.
    // So, mockOnCopy will be called.
  });

  it('calls onEdit when Edit is clicked from dropdown', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onCopy={mockOnCopy}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByTestId('more-icon')); // Open dropdown
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockPrompt);
  });

  it('calls onDelete when Delete is clicked from dropdown', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onCopy={mockOnCopy}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.click(screen.getByTestId('more-icon')); // Open dropdown
    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});

```

## Running Tests

```bash
npm test
```

Or to watch for changes:

```bash
npm test --watch
```

This provides a basic framework. You may need to adjust configurations based on your specific project setup and Next.js version.

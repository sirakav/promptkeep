import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PromptForm } from './PromptForm'; // Adjust path
import { Category, Prompt } from '../../types'; // Adjust path
// import * as localStorageUtils from '../../lib/localStorage'; // To mock localStorage functions - No longer needed

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'), // Import and retain default behavior for other icons
  PlusCircle: () => <svg data-testid="plus-circle-icon" />,
  ChevronsUpDown: () => <svg data-testid="chevrons-up-down-icon" />,
  Check: () => <svg data-testid="check-icon" />,
  Search: () => <svg data-testid="search-icon" />, // Added Search icon
}));

// Mock DialogClose to prevent asChild issues in JSDOM
jest.mock('@/components/ui/dialog', () => {
  const React = jest.requireActual('react');
  const originalModule = jest.requireActual('@/components/ui/dialog');
  return {
    ...originalModule,
    DialogClose: React.forwardRef(({ children, asChild, ...props }: any, ref: any) => {
      if (asChild && React.isValidElement(children)) {
        // Apply props to the child, similar to what Slot would do.
        // This helps if the child is our UI Button that can handle these props.
        return React.cloneElement(children, { ...props, ...children.props, ref });
      }
      return (
        <button {...props} ref={ref} data-testid="mocked-dialog-close">
          {children}
        </button>
      );
    }),
  };
});

// Minimal Popover mock - primarily to ensure content is available.
jest.mock('@radix-ui/react-popover', () => {
  const React = jest.requireActual('react');
  const originalModule = jest.requireActual('@radix-ui/react-popover');
  return {
    ...originalModule,
    Root: ({ children }) => <>{children}</>,
    Trigger: React.forwardRef(({ children, asChild, ...props }, ref) => {
      if (asChild && React.isValidElement(children)) {
        const childProps = children.props as any;
        return React.cloneElement(children, {
          ...props,
          ...childProps,
          ref,
          onClick: (e) => {
            if (props.onClick) props.onClick(e);
            if (childProps.onClick) childProps.onClick(e);
          },
          "data-testid": props['data-testid'] || childProps['data-testid'] || "mock-popover-trigger-child"
        });
      }
      return <button {...props} ref={ref} data-testid="mock-popover-trigger">{children}</button>;
    }),
    Content: React.forwardRef(({ children, sideOffset, align, ...props }, ref) => ( // Destructure and omit sideOffset, align
      <div {...props} ref={ref} data-testid="mock-popover-content">{children}</div>
    )),
    Portal: ({ children }) => <>{children}</>,
  };
});

// Mock ShadCN UI Command Components directly
jest.mock('@/components/ui/command', () => {
  const React = jest.requireActual('react');

  const Command = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props} data-testid="mock-command-root">{children}</div>);
  Command.displayName = 'Command';

  const CommandInput = React.forwardRef(({ value, onValueChange, ...props }: any, ref: any) => (
    <input
      ref={ref}
      {...props}
      value={value || ''} // Ensure value is controlled
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      data-testid="mock-command-input"
      placeholder={props.placeholder || "Search..."} // Carry over placeholder
    />
  ));
  CommandInput.displayName = 'CommandInput';

  const CommandList = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props} data-testid="mock-command-list">{children}</div>);
  CommandList.displayName = 'CommandList';

  const CommandEmpty = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props} data-testid="mock-command-empty">{children || 'No results'}</div>);
  CommandEmpty.displayName = 'CommandEmpty';

  const CommandGroup = React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props} data-testid="mock-command-group">{children}</div>);
  CommandGroup.displayName = 'CommandGroup';

  const CommandItem = React.forwardRef(({ children, onSelect, value, ...props }: any, ref: any) => (
    <div
      ref={ref}
      {...props}
      onClick={() => onSelect && onSelect(value)} // Simulate selection by calling onSelect with value
      role="option"
      data-value={value}
      data-testid="mock-command-item"
      tabIndex={0} // Make it focusable for userEvent
    >
      {children}
    </div>
  ));
  CommandItem.displayName = 'CommandItem';

  return {
    __esModule: true,
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
  };
});


// Mock the localStorage utility functions if needed for specific tests,
// but PromptForm itself doesn't directly call ls.addCategory for example.
// It calls onSubmit which then handles category creation logic in the parent (page.tsx).
// So, direct mocks of ls.addCategory might not be necessary here.
// jest.mock('../../lib/localStorage', () => ({
//   ...jest.requireActual('../../lib/localStorage'),
//   getCategories: jest.fn(),
//   addCategory: jest.fn(),
// }));

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Category 1' },
  { id: 'cat2', name: 'Category 2' },
  { id: 'cat3', name: 'Another Category' },
];

// New test suite for PromptForm with Combobox
describe('PromptForm Component with Combobox', () => {
  const onSubmitMock = jest.fn();
  const onCloseMock = jest.fn();

  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore(); // Restore original window.alert
  });

  const defaultProps = {
    isOpen: true,
    onClose: onCloseMock,
    onSubmit: onSubmitMock,
    initialData: null,
    categories: mockCategories,
  };

  // Helper to render with specific props
  const renderPromptForm = (props?: Partial<typeof defaultProps>) => {
    return render(<PromptForm {...defaultProps} {...props} />);
  };

  // Basic render test (optional, but good to have)
  it('renders the form with all fields', () => {
    renderPromptForm();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create prompt/i })).toBeInTheDocument();
    // With DialogClose mocked to handle asChild, this should now find only one.
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  // Helper to fill common form fields
  const fillFormFields = async (user, name, content) => {
    await user.type(screen.getByLabelText(/name/i), name);
    await user.type(screen.getByLabelText(/content/i), content);
  };

  describe('Category Combobox: Display and Initial Value', () => {
    it('shows placeholder when no initialData is provided', () => {
      renderPromptForm();
      // The trigger button for the combobox
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(/select or create category.../i);
    });

    it('shows category name when initialData has a valid categoryId', () => {
      const initialPrompt: Prompt = {
        id: 'p1',
        name: 'Test Prompt',
        content: 'Test Content',
        categoryId: 'cat1', // Exists in mockCategories
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      renderPromptForm({ initialData: initialPrompt });
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name); // "Category 1"
    });

    it('shows "Create <categoryName>" in trigger if initialData.categoryName is set but not in categories list', () => {
      // This scenario assumes that if initialData has a categoryId not in the list,
      // but somehow a category name was derived (e.g. if PromptForm's useEffect sets categoryName directly
      // from a non-existent category, or if categoryId was actually a name string).
      // Based on current PromptForm, if categoryId doesn't match, categoryName remains empty from initialData.
      // Let's refine this: if initialData.categoryId is not found, categoryName in PromptForm becomes '',
      // so it should show the placeholder.
      const initialPrompt: Prompt = {
        id: 'p2',
        name: 'Test Prompt 2',
        content: 'Test Content 2',
        categoryId: 'cat-unknown', // Does NOT exist in mockCategories
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      renderPromptForm({ initialData: initialPrompt });
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      // In PromptForm: `const currentCategory = categories.find(cat => cat.id === initialData.categoryId);`
      // `setCategoryName(currentCategory ? currentCategory.name : '');`
      // So, if not found, categoryName is '', leading to placeholder.
      expect(categoryComboboxTrigger).toHaveTextContent(/select or create category.../i);
    });

    it('shows initial categoryName in trigger if initialData has categoryId and name, even if ID is weird but name is found', () => {
        // Test case: initialData.categoryId is 'cat1', useEffect will find 'Category 1' and set it.
        const initialPrompt: Prompt = {
            id: 'p1',
            name: 'Test Prompt',
            content: 'Test Content',
            categoryId: 'cat1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        renderPromptForm({ initialData: initialPrompt });
        const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
        expect(categoryComboboxTrigger).toHaveTextContent('Category 1');
      });
  });

  describe('Category Combobox: Selecting an Existing Category', () => {
    it('allows selecting an existing category and submits with it', async () => {
      renderPromptForm();
      const user = userEvent.setup();

      await fillFormFields(user, 'Test Prompt Name', 'Test Prompt Content');

      // Click the mock popover trigger (which is now the actual Button from PromptForm due to asChild)
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      // Select "Category 2" from the list
      // CommandItems have role 'option' in Radix Command
      const categoryOption = await screen.findByRole('option', { name: mockCategories[1].name }); // "Category 2"
      await user.click(categoryOption);

      // Verify the trigger now shows "Category 2"
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[1].name);

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create prompt/i }));

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          {
            name: 'Test Prompt Name',
            content: 'Test Prompt Content',
            categoryId: '', // categoryId is set by the parent component based on categoryName
          },
          mockCategories[1].name // Submitted category name should be "Category 2"
        );
      });
    });
  });

  describe('Category Combobox: Creating a New Category', () => {
    it('allows creating a new category and submits with it', async () => {
      renderPromptForm();
      const user = userEvent.setup();
      const newCategoryName = 'My New Custom Category';

      await fillFormFields(user, 'Another Test Prompt', 'Some interesting content');

      // Click the mock popover trigger
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, newCategoryName);

      // Click the "Create new category" button that appears in CommandEmpty
      // This button appears in CommandEmpty, its text is "Create "{newCategoryName}""
      const createButton = await screen.findByRole('button', { name: `Create "${newCategoryName}"` });
      await user.click(createButton);

      // Verify the trigger now shows the new category name (or part of it, like "Create ...")
      // The current implementation of PromptForm shows `Create "Category Name"` if not found in `categories` prop,
      // OR the actual name if it matches what's typed. After creation click, it sets `categoryName` directly.
      // So the trigger should reflect the new name.
      // The Popover mock makes the trigger a simple button. We check its text if applicable,
      // but the main verification is that categoryName state is set correctly.
      // The actual trigger text from PromptForm might be complex to assert with this mock.
      // Let's focus on the onSubmit call.
      // The text content of the actual combobox trigger (which is also the mocked PopoverTrigger)
      // should update based on the categoryName state.
      expect(screen.getByRole('combobox', { name: /category/i })).toHaveTextContent(newCategoryName);

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create prompt/i }));

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          {
            name: 'Another Test Prompt',
            content: 'Some interesting content',
            categoryId: '', // categoryId is set by the parent
          },
          newCategoryName // Submitted category name should be the new one
        );
      });
    });

    it('filters suggestions when typing into search input', async () => {
      renderPromptForm();
      const user = userEvent.setup();

      // Click the mock popover trigger
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, 'Another'); // Should match "Another Category"

      expect(screen.getByRole('option', { name: 'Another Category' })).toBeVisible();
      expect(screen.queryByRole('option', { name: 'Category 1' })).not.toBeInTheDocument(); // Or .not.toBeVisible() if it's just hidden
      expect(screen.queryByRole('option', { name: 'Category 2' })).not.toBeInTheDocument();

      // Clear search and check again
      await user.clear(searchInput);
      expect(screen.getByRole('option', { name: 'Category 1' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Category 2' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Another Category' })).toBeVisible();
    });
  });

  describe('Category Combobox: Interaction with initialData', () => {
    const promptWithCategory1: Prompt = {
      id: 'prompt-initial-123',
      name: 'Initial Prompt Name',
      content: 'Initial prompt content here.',
      categoryId: 'cat1', // "Category 1"
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('allows changing an existing category when editing a prompt', async () => {
      renderPromptForm({ initialData: promptWithCategory1 });
      const user = userEvent.setup();

      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name); // "Category 1"

      // Fill out other form fields
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Prompt Name');
      const contentInput = screen.getByLabelText(/content/i);
      await user.clear(contentInput);
      await user.type(contentInput, 'Updated Prompt Content');

      // Open and change the category - categoryComboboxTrigger is already defined
      await user.click(categoryComboboxTrigger);
      const categoryOption2 = await screen.findByRole('option', { name: mockCategories[1].name }); // "Category 2"
      await user.click(categoryOption2);
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[1].name); // Check the actual trigger

      // Submit the form (button should say "Save Changes")
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          {
            name: 'Updated Prompt Name',
            content: 'Updated Prompt Content',
            categoryId: '', // Parent handles ID resolution
          },
          mockCategories[1].name // New category name "Category 2"
        );
      });
    });

    it('allows creating a new category when editing a prompt', async () => {
      renderPromptForm({ initialData: promptWithCategory1 });
      const user = userEvent.setup();
      const brandNewCategoryName = 'Super New Editing Category';

      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name); // "Category 1"

      // Update other fields
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Name For New Cat Edit');

      // Open, type, and create new category - categoryComboboxTrigger is already defined
      await user.click(categoryComboboxTrigger);
      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, brandNewCategoryName);
      const createButton = await screen.findByRole('button', { name: `Create "${brandNewCategoryName}"` });
      await user.click(createButton);
      expect(categoryComboboxTrigger).toHaveTextContent(brandNewCategoryName); // Check the actual trigger

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          {
            name: 'Name For New Cat Edit',
            content: promptWithCategory1.content, // Content was not changed in this test
            categoryId: '',
          },
          brandNewCategoryName
        );
      });
    });
  });
});

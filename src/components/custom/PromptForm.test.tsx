import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PromptForm } from './PromptForm'; // Adjust path
import { Category, Prompt } from '../../types'; // Adjust path

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  PlusCircle: () => <svg data-testid="plus-circle-icon" />,
  ChevronsUpDown: () => <svg data-testid="chevrons-up-down-icon" />,
  Check: () => <svg data-testid="check-icon" />,
  Search: () => <svg data-testid="search-icon" />,
}));

// Mock DialogClose to prevent asChild issues in JSDOM
jest.mock('@/components/ui/dialog', () => {
  const React = jest.requireActual('react');
  const originalModule = jest.requireActual('@/components/ui/dialog');

  interface MockDialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    asChild?: boolean;
  }

  const DialogCloseComponent = React.forwardRef<HTMLButtonElement, MockDialogCloseProps>(
    ({ children, asChild, ...props }, ref) => {
      if (asChild && React.isValidElement(children)) {
        const childProps = children.props as Record<string, unknown>;
        return React.cloneElement(children as React.ReactElement, { ...props, ...childProps, ref });
      }
      return (
        <button {...props} ref={ref} data-testid="mocked-dialog-close">
          {children}
        </button>
      );
    }
  );
  DialogCloseComponent.displayName = 'DialogClose';

  return {
    ...originalModule,
    DialogClose: DialogCloseComponent,
  };
});

// Minimal Popover mock
jest.mock('@radix-ui/react-popover', () => {
  const React = jest.requireActual('react');
  const originalModule = jest.requireActual('@radix-ui/react-popover');

  interface MockPopoverRootProps { children?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; }
  const PopoverRoot = ({ children }: MockPopoverRootProps) => <>{children}</>;
  PopoverRoot.displayName = 'PopoverRoot';

  interface MockPopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    asChild?: boolean;
  }
  const PopoverTrigger = React.forwardRef<HTMLButtonElement, MockPopoverTriggerProps>(
    ({ children, asChild, ...props }, ref) => {
      if (asChild && React.isValidElement(children)) {
        const childProps = children.props as Record<string, unknown>;
        return React.cloneElement(children as React.ReactElement, {
          ...props,
          ...childProps,
          ref,
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            if (props.onClick) props.onClick(e);
            if (typeof childProps.onClick === 'function') childProps.onClick(e);
          },
          "data-testid": props['data-testid'] || childProps['data-testid'] || "mock-popover-trigger-child"
        });
      }
      return <button {...props} ref={ref} data-testid="mock-popover-trigger">{children}</button>;
    }
  );
  PopoverTrigger.displayName = 'PopoverTrigger';

  interface MockPopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    sideOffset?: number;
    align?: string;
  }
  const PopoverContent = React.forwardRef<HTMLDivElement, MockPopoverContentProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ children, sideOffset, align, ...otherProps }, ref) => (
      <div {...otherProps} ref={ref} data-testid="mock-popover-content">{children}</div>
    )
  );
  PopoverContent.displayName = 'PopoverContent';

  interface MockPopoverPortalProps { children?: React.ReactNode; }
  const PopoverPortal = ({ children }: MockPopoverPortalProps) => <>{children}</>;
  PopoverPortal.displayName = 'PopoverPortal';

  return {
    ...originalModule,
    Root: PopoverRoot,
    Trigger: PopoverTrigger,
    Content: PopoverContent,
    Portal: PopoverPortal,
  };
});

// Mock ShadCN UI Command Components directly
jest.mock('@/components/ui/command', () => {
  const React = jest.requireActual('react');

  interface MockCommandProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; }
  const CommandComponent = React.forwardRef<HTMLDivElement, MockCommandProps>(
    ({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-command-root">{children}</div>
  );
  CommandComponent.displayName = 'Command';

  interface MockCommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    onValueChange?: (value: string) => void;
  }
  const CommandInputComponent = React.forwardRef<HTMLInputElement, MockCommandInputProps>(
    ({ value, onValueChange, ...props }, ref) => (
      <input
        ref={ref}
        {...props}
        value={value || ''}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        data-testid="mock-command-input"
        placeholder={props.placeholder || "Search..."}
      />
    )
  );
  CommandInputComponent.displayName = 'CommandInput';

  interface MockCommandListProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; }
  const CommandListComponent = React.forwardRef<HTMLDivElement, MockCommandListProps>(
    ({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-command-list">{children}</div>
  );
  CommandListComponent.displayName = 'CommandList';

  interface MockCommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; }
  const CommandEmptyComponent = React.forwardRef<HTMLDivElement, MockCommandEmptyProps>(
    ({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-command-empty">{children || 'No results'}</div>
  );
  CommandEmptyComponent.displayName = 'CommandEmpty';

  interface MockCommandGroupProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; }
  const CommandGroupComponent = React.forwardRef<HTMLDivElement, MockCommandGroupProps>(
    ({ children, ...props }, ref) => <div ref={ref} {...props} data-testid="mock-command-group">{children}</div>
  );
  CommandGroupComponent.displayName = 'CommandGroup';

  interface MockCommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    onSelect?: (value: string) => void;
    value?: string;
    'aria-selected'?: boolean;
  }
  const CommandItemComponent = React.forwardRef<HTMLDivElement, MockCommandItemProps>(
    ({ children, onSelect, value, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        onClick={() => onSelect && onSelect(value || '')}
        role="option"
        aria-selected={props['aria-selected'] || false}
        data-value={value}
        data-testid="mock-command-item"
        tabIndex={0}
      >
        {children}
      </div>
    )
  );
  CommandItemComponent.displayName = 'CommandItem';

  return {
    __esModule: true,
    Command: CommandComponent,
    CommandInput: CommandInputComponent,
    CommandList: CommandListComponent,
    CommandEmpty: CommandEmptyComponent,
    CommandGroup: CommandGroupComponent,
    CommandItem: CommandItemComponent,
  };
});

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Category 1' },
  { id: 'cat2', name: 'Category 2' },
  { id: 'cat3', name: 'Another Category' },
];

describe('PromptForm Component with Combobox', () => {
  const onSubmitMock = jest.fn();
  const onCloseMock = jest.fn();
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const defaultProps = {
    isOpen: true,
    onClose: onCloseMock,
    onSubmit: onSubmitMock,
    initialData: null,
    categories: mockCategories,
  };

  const renderPromptForm = (props?: Partial<typeof defaultProps>) => {
    return render(<PromptForm {...defaultProps} {...props} />);
  };

  it('renders the form with all fields', () => {
    renderPromptForm();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create prompt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  const fillFormFields = async (user: ReturnType<typeof userEvent.setup>, name: string, content: string) => {
    await user.type(screen.getByLabelText(/name/i), name);
    await user.type(screen.getByLabelText(/content/i), content);
  };

  describe('Category Combobox: Display and Initial Value', () => {
    it('shows placeholder when no initialData is provided', () => {
      renderPromptForm();
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(/select or create category.../i);
    });

    it('shows category name when initialData has a valid categoryId', () => {
      const initialPrompt: Prompt = {
        id: 'p1', name: 'Test Prompt', content: 'Test Content', categoryId: 'cat1',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      renderPromptForm({ initialData: initialPrompt });
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name);
    });

    it('shows placeholder if initialData categoryId is not found', () => {
      const initialPrompt: Prompt = {
        id: 'p2', name: 'Test Prompt 2', content: 'Test Content 2', categoryId: 'cat-unknown',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      renderPromptForm({ initialData: initialPrompt });
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(/select or create category.../i);
    });
  });

  describe('Category Combobox: Selecting an Existing Category', () => {
    it('allows selecting an existing category and submits with it', async () => {
      const user = userEvent.setup();
      renderPromptForm();
      await fillFormFields(user, 'Test Prompt Name', 'Test Prompt Content');

      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      const categoryOption = await screen.findByRole('option', { name: mockCategories[1].name });
      await user.click(categoryOption);
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[1].name);

      await user.click(screen.getByRole('button', { name: /create prompt/i }));
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          { name: 'Test Prompt Name', content: 'Test Prompt Content', categoryId: '' },
          mockCategories[1].name
        );
      });
    });
  });

  describe('Category Combobox: Creating a New Category', () => {
    it('allows creating a new category and submits with it', async () => {
      const user = userEvent.setup();
      renderPromptForm();
      const newCategoryName = 'My New Custom Category';
      await fillFormFields(user, 'Another Test Prompt', 'Some interesting content');

      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, newCategoryName);

      const createButton = await screen.findByRole('button', { name: `Create "${newCategoryName}"` });
      await user.click(createButton);
      expect(screen.getByRole('combobox', { name: /category/i })).toHaveTextContent(newCategoryName);

      await user.click(screen.getByRole('button', { name: /create prompt/i }));
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          { name: 'Another Test Prompt', content: 'Some interesting content', categoryId: '' },
          newCategoryName
        );
      });
    });

    it('filters suggestions when typing into search input', async () => {
      const user = userEvent.setup();
      renderPromptForm();
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      await user.click(categoryComboboxTrigger);

      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, 'Another');

      expect(screen.getByRole('option', { name: 'Another Category' })).toBeVisible();
      expect(screen.queryByRole('option', { name: 'Category 1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Category 2' })).not.toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByRole('option', { name: 'Category 1' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Category 2' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Another Category' })).toBeVisible();
    });
  });

  describe('Category Combobox: Interaction with initialData', () => {
    const promptWithCategory1: Prompt = {
      id: 'prompt-initial-123', name: 'Initial Prompt Name', content: 'Initial prompt content here.',
      categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    it('allows changing an existing category when editing a prompt', async () => {
      const user = userEvent.setup();
      renderPromptForm({ initialData: promptWithCategory1 });
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Prompt Name');
      const contentInput = screen.getByLabelText(/content/i);
      await user.clear(contentInput);
      await user.type(contentInput, 'Updated Prompt Content');

      await user.click(categoryComboboxTrigger);
      const categoryOption2 = await screen.findByRole('option', { name: mockCategories[1].name });
      await user.click(categoryOption2);
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[1].name);

      await user.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          { name: 'Updated Prompt Name', content: 'Updated Prompt Content', categoryId: '' },
          mockCategories[1].name
        );
      });
    });

    it('allows creating a new category when editing a prompt', async () => {
      const user = userEvent.setup();
      renderPromptForm({ initialData: promptWithCategory1 });
      const brandNewCategoryName = 'Super New Editing Category';
      const categoryComboboxTrigger = screen.getByRole('combobox', { name: /category/i });
      expect(categoryComboboxTrigger).toHaveTextContent(mockCategories[0].name);

      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Name For New Cat Edit');

      await user.click(categoryComboboxTrigger);
      const searchInput = screen.getByPlaceholderText(/search or create category.../i);
      await user.type(searchInput, brandNewCategoryName);
      const createButton = await screen.findByRole('button', { name: `Create "${brandNewCategoryName}"` });
      await user.click(createButton);
      expect(categoryComboboxTrigger).toHaveTextContent(brandNewCategoryName);

      await user.click(screen.getByRole('button', { name: /save changes/i }));
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          { name: 'Name For New Cat Edit', content: promptWithCategory1.content, categoryId: '' },
          brandNewCategoryName
        );
      });
    });
  });
});

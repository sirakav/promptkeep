import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './button'; // Adjust path as necessary

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    const buttonElement = screen.getByText('Click Me');
    expect(buttonElement).toBeDisabled();
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes correctly (e.g., destructive)', () => {
    render(<Button variant="destructive">Delete</Button>);
    // The example in TESTING.MD checks for 'bg-destructive'.
    // This assumes that the 'destructive' variant results in this class.
    // Actual class names might vary based on the cva implementation.
    expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
  });

  it('applies default variant if no variant is specified', () => {
    render(<Button>Default</Button>);
    // Assuming 'bg-primary' is part of the default variant's classes
    expect(screen.getByText('Default')).toHaveClass('bg-primary');
  });

   it('renders as a child component when asChild prop is true', () => {
    render(
      <Button asChild>
        <span>Link Button</span>
      </Button>
    );
    const spanElement = screen.getByText('Link Button');
    expect(spanElement.tagName).toBe('SPAN');
    // No href attribute to check for span
  });

  // Test for other variants if necessary, e.g., outline, secondary, ghost, link
  it('applies outline variant classes correctly', () => {
    render(<Button variant="outline">Outline</Button>);
    // Check for key classes that define the outline variant
    expect(screen.getByText('Outline')).toHaveClass('border');
    expect(screen.getByText('Outline')).toHaveClass('bg-background');
  });

  it('applies secondary variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');
  });

  it('applies ghost variant classes correctly', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toHaveClass('hover:bg-accent hover:text-accent-foreground');
  });

  it('applies link variant classes correctly', () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByText('Link')).toHaveClass('text-primary underline-offset-4 hover:underline');
  });


  // Test for different sizes
  it('applies default size class if no size is specified', () => {
    render(<Button>Default Size</Button>);
    expect(screen.getByText('Default Size')).toHaveClass('h-9'); // Adjusted from h-10
    expect(screen.getByText('Default Size')).toHaveClass('px-4');
    expect(screen.getByText('Default Size')).toHaveClass('py-2');
  });

  it('applies sm size class correctly', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('h-8'); // Adjusted from h-9
    expect(screen.getByText('Small')).toHaveClass('rounded-md');
    expect(screen.getByText('Small')).toHaveClass('px-3');
  });

  it('applies lg size class correctly', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('h-10'); // Adjusted from h-11
    expect(screen.getByText('Large')).toHaveClass('rounded-md');
    expect(screen.getByText('Large')).toHaveClass('px-6'); // Adjusted from px-8
  });

  it('applies icon size class correctly', () => {
    render(<Button size="icon">Icon</Button>);
    expect(screen.getByText('Icon')).toHaveClass('size-9'); // Adjusted from h-10 w-10
  });
});

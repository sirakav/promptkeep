import React, { useState, useEffect } from 'react';
import { Prompt, Category } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'; // Updated import path
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// For category selection, we might use a Select or Combobox later.
// For now, let's use an Input and assume the user types the category name.
// We'll also need a way to get existing categories for autocomplete/selection in a future iteration.

interface PromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, categoryName: string) => void;
  initialData?: Prompt | null; // For editing
  categories: Category[]; // To suggest existing categories or allow new ones
}

export const PromptForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}: PromptFormProps) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const [categorySearchText, setCategorySearchText] = useState('');
  // TODO: Add a datalist or custom combobox for categoryName based on `categories` prop

  useEffect(() => {
    if (isOpen) {
        setCategorySearchText(''); // Reset search text when dialog opens
    }
    if (initialData) {
      setName(initialData.name);
      setContent(initialData.content);
      const currentCategory = categories.find(cat => cat.id === initialData.categoryId);
      setCategoryName(currentCategory ? currentCategory.name : '');
    } else {
      setName('');
      setContent('');
      setCategoryName('');
    }
  }, [initialData, isOpen, categories]); // isOpen in dependency to reset form when reopened for new

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !categoryName.trim()) {
      // Basic validation - ideally show a toast or inline error
      alert('Please fill in all fields: Name, Content, and Category.');
      return;
    }
    onSubmit({ name, content, categoryId: '' /* Placeholder, actual ID resolved in parent */ }, categoryName);
    // onClose(); // Parent should call onClose after successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] p-6 max-h-[90vh] h-full overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of your prompt.' : 'Fill in the details for your new prompt.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="py-4 flex-grow flex flex-col gap-4">
            {/* Name Field */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className="text-sm">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Category Field */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="category-combobox" className="text-sm">
                Category
              </Label>
              <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryPopoverOpen}
                    aria-controls="category-combobox-list"
                    className={cn(
                      'w-full justify-between text-sm',
                      !categoryName && 'text-muted-foreground'
                    )}
                    id="category-combobox"
                  >
                    {categoryName
                      ? categories.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())?.name || `Create "${categoryName}"`
                      : 'Select or create category...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search or create category..."
                      value={categorySearchText}
                      onValueChange={setCategorySearchText}
                    />
                    <CommandList id="category-combobox-list">
                      <CommandEmpty>
                        {categorySearchText.trim() !== '' ? (
                          <Button
                            variant="ghost"
                            size="sm" // Consistent with CommandItem padding
                            className="w-full justify-start text-left px-2" // Align with CommandItem style
                            onClick={() => {
                              const newCategoryName = categorySearchText.trim();
                              setCategoryName(newCategoryName);
                              setIsCategoryPopoverOpen(false);
                              setCategorySearchText('');
                            }}
                          >
                            Create "{categorySearchText.trim()}"
                          </Button>
                        ) : (
                          <div className="p-2 text-sm text-center text-muted-foreground">
                             Type to search or create a new category.
                          </div>
                        )}
                      </CommandEmpty>
                      <CommandGroup heading="Suggestions">
                        {categories
                          .filter(cat => cat.name.toLowerCase().includes(categorySearchText.toLowerCase().trim()))
                          .map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.name}
                              onSelect={() => { // currentValue parameter removed
                                // cat.name is used directly from the outer scope
                                setCategoryName(cat.name);
                                setIsCategoryPopoverOpen(false);
                                setCategorySearchText('');
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  categoryName.toLowerCase() === cat.name.toLowerCase() ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {cat.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
                </div>

            {/* Content Field */}
            <div className="flex flex-col gap-1 flex-grow">
              <Label htmlFor="content" className="text-sm">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none flex-grow"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{initialData ? 'Save Changes' : 'Create Prompt'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

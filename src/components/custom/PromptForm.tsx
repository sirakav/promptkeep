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
  // TODO: Add a datalist or custom combobox for categoryName based on `categories` prop

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContent(initialData.content);
      // Find the category name from initialData.categoryId and categories list
      const currentCategory = categories.find(cat => cat.id === initialData.categoryId);
      setCategoryName(currentCategory ? currentCategory.name : '');
    } else {
      // Reset form for new prompt
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
    onSubmit(
      { 
        name, 
        content, 
        categoryId: '' /* Placeholder, actual ID resolved in parent */, 
        userId: 'temp-user-id', // Added temporary userId
        isPublic: false, // Default to false
      }, 
      categoryName
    );
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
              <Label htmlFor="category" className="text-sm">
                Category
              </Label>
              <Input
                id="category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter new or existing category"
                required
                // list="category-suggestions" // Future enhancement
              />
              {/* <datalist id="category-suggestions">
                {categories.map(cat => <option key={cat.id} value={cat.name} />)}
              </datalist> */}
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

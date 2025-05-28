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
  DialogClose, // For an explicit close button
} from '@/components/ui/dialog';
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
    onSubmit({ name, content, categoryId: '' /* Placeholder, actual ID resolved in parent */ }, categoryName);
    // onClose(); // Parent should call onClose after successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Prompt' : 'Create New Prompt'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of your prompt.' : 'Fill in the details for your new prompt.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              {/* Basic input for now, will be enhanced with datalist/combobox */}
              <Input
                id="category"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
                placeholder="Enter new or existing category"
                required
                // list="category-suggestions" // Future enhancement
              />
              {/* <datalist id="category-suggestions">
                {categories.map(cat => <option key={cat.id} value={cat.name} />)}
              </datalist> */}
            </div>
            <div className="grid grid-cols-4 items-start gap-4"> {/* items-start for textarea */}
              <Label htmlFor="content" className="text-right pt-1"> {/* Adjust alignment */}
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3"
                rows={6}
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

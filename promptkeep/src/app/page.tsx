"use client"; // This is a client component

import React, { useState, useEffect, useMemo } from 'react';
import { Prompt, Category } from '@/types';
import * as ls from '@/lib/localStorage'; // ls for localStorage
import { toast } from "sonner"; // Correct import for sonner
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/custom/PromptCard';
import { PromptForm } from '@/components/custom/PromptForm';
import { ConfirmationDialog } from '@/components/custom/ConfirmationDialog';
import { SearchBar } from '@/components/custom/SearchBar';
import { CategoryFilter } from '@/components/custom/CategoryFilter';
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  // State for prompts and categories
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // State for UI interactions
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [promptToDeleteId, setPromptToDeleteId] = useState<string | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    setPrompts(ls.getPrompts());
    setCategories(ls.getCategories());
  }, []);

  // --- CRUD Operations and Handlers ---

  const handleAddOrUpdatePrompt = (
    promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>,
    categoryName: string
  ) => {
    let category = ls.getCategoryByName(categoryName.trim());
    if (!category) {
      category = ls.addCategory({ name: categoryName.trim() });
      setCategories(ls.getCategories()); // Update categories state
    }

    if (editingPrompt) {
      // Update existing prompt
      const updatedPrompt: Prompt = {
        ...editingPrompt,
        ...promptData,
        categoryId: category.id,
        updatedAt: new Date().toISOString(),
      };
      ls.updatePrompt(updatedPrompt);
      toast.success("Prompt Updated", { description: `"${updatedPrompt.name}" has been updated.` });
    } else {
      // Add new prompt
      const newPrompt: Prompt = {
        ...promptData,
        id: crypto.randomUUID(),
        categoryId: category.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      ls.addPrompt(newPrompt);
      toast.success("Prompt Created", { description: `"${newPrompt.name}" has been added.` });
    }
    setPrompts(ls.getPrompts()); // Refresh prompts from localStorage
    setIsFormOpen(false);
    setEditingPrompt(null);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (promptId: string) => {
    const promptName = prompts.find(p=>p.id === promptId)?.name || "The prompt";
    ls.deletePrompt(promptId);
    setPrompts(ls.getPrompts());
    toast.success("Prompt Deleted", { description: `${promptName} has been deleted.` });
    setIsConfirmDeleteDialogOpen(false);
    setPromptToDeleteId(null);
  };

  const openConfirmDeleteDialog = (promptId: string) => {
    setPromptToDeleteId(promptId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleCopyPrompt = (content: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content)
        .then(() => toast.success("Copied to Clipboard!", { description: "Prompt content copied." }))
        .catch(err => toast.error("Error", { description: "Could not copy text: " + err }));
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Copied to Clipboard!", { description: "Prompt content copied (fallback)." });
      } catch (err) {
        toast.error("Error", { description: "Could not copy text (fallback): " + err });
      }
    }
  };

  // --- Filtering and Searching ---
  const filteredPrompts = useMemo(() => {
    return prompts
      .filter(prompt => {
        // Filter by selected category
        if (selectedCategoryId && prompt.categoryId !== selectedCategoryId) {
          return false;
        }
        // Filter by search term (name, content, or category name)
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const category = categories.find(c => c.id === prompt.categoryId);
          return (
            prompt.name.toLowerCase().includes(lowerSearchTerm) ||
            prompt.content.toLowerCase().includes(lowerSearchTerm) ||
            (category && category.name.toLowerCase().includes(lowerSearchTerm))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
  }, [prompts, categories, selectedCategoryId, searchTerm]);


  // --- Render Logic ---
  return (
    <div className="space-y-6">
      {/* Header section with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Prompts</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"> {/* Adjusted for better responsive stacking */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by name, content, category..."
          />
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
          />
          <Button onClick={() => { setEditingPrompt(null); setIsFormOpen(true); }} className="w-full sm:w-auto"> {/* Responsive width */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Prompt
          </Button>
        </div>
      </div>

      {/* Prompts Grid / List */}
      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap slightly */}
          {filteredPrompts.map(prompt => {
            const category = categories.find(c => c.id === prompt.categoryId);
            return (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                category={category}
                onCopy={handleCopyPrompt}
                onEdit={handleEditPrompt}
                onDelete={() => openConfirmDeleteDialog(prompt.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12"> {/* Increased padding */}
          <p className="text-xl text-muted-foreground mb-4"> {/* Added margin bottom */}
            {prompts.length === 0 ? "No prompts yet. Add your first one!" : "No prompts match your current filters."}
          </p>
          {prompts.length === 0 && ( // Only show button if no prompts exist at all
             <Button onClick={() => { setEditingPrompt(null); setIsFormOpen(true); }} size="lg"> {/* Larger button */}
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Prompt
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <PromptForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPrompt(null); }}
        onSubmit={handleAddOrUpdatePrompt}
        initialData={editingPrompt}
        categories={categories}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteDialogOpen}
        onClose={() => setIsConfirmDeleteDialogOpen(false)}
        onConfirm={() => {
          if (promptToDeleteId) {
            handleDeletePrompt(promptToDeleteId);
          }
        }}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently delete the prompt."
        confirmText="Delete"
        // cancelText="Keep Prompt" // Example of customizing text
      />
    </div>
  );
}

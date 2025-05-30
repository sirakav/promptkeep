import React, { useState, useCallback } from 'react';
import { PromptForm } from '@/components/custom/PromptForm'; // Adjust path
import { Prompt, Category } from '@/types'; // Adjust path
import { Button } from '@/components/ui/button'; // For a button to open the dialog

// Expose functions/variables to Playwright via window
declare global {
  interface Window {
    // Control functions
    openDialog: (initialData?: Prompt | null) => void;
    // Callback trackers
    onCloseCalled: boolean;
    onSubmitCalledWith: { promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>, categoryName: string } | null;
    // Utility to reset trackers
    resetTestState: () => void;
  }
}

const mockCategories: Category[] = [
  { id: 'cat1', name: 'General', userId: 'user1', createdAt: '', updatedAt: '' },
  { id: 'cat2', name: 'Coding', userId: 'user1', createdAt: '', updatedAt: '' },
  { id: 'cat3', name: 'Writing', userId: 'user1', createdAt: '', updatedAt: '' },
];

const PromptFormTestPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<Prompt | null | undefined>(undefined);

  const handleOpen = useCallback((data?: Prompt | null) => {
    window.resetTestState(); // Reset trackers when opening
    setInitialData(data);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    console.log('Test Page: onClose triggered');
    window.onCloseCalled = true;
    setIsOpen(false);
  }, []);

  const handleSubmit = useCallback((
    promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>,
    categoryName: string
  ) => {
    console.log('Test Page: onSubmit triggered with:', promptData, categoryName);
    window.onSubmitCalledWith = { promptData, categoryName };
    // In a real app, you might call handleClose() here after successful submit.
    // setIsOpen(false); // To test auto-close if desired
  }, []);

  // Expose control functions and reset state to Playwright
  if (typeof window !== 'undefined') {
    window.openDialog = handleOpen;
    window.resetTestState = () => {
      window.onCloseCalled = false;
      window.onSubmitCalledWith = null;
      console.log('Test Page: State reset');
    };
    // Initialize state on first load
    if (window.onCloseCalled === undefined) { // Check if already initialized
        window.resetTestState();
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>PromptForm Test Page</h1>
      <Button onClick={() => handleOpen()} data-testid="open-new-form-button">
        Open New Prompt Form
      </Button>
      <Button onClick={() => handleOpen({ 
          id: 'prompt-edit-1', 
          name: 'Edit Me', 
          content: 'Initial content', 
          categoryId: 'cat2', // Belongs to "Coding"
          userId: 'user1', 
          isPublic: false,
          createdAt: '', 
          updatedAt: '' 
        })} 
        data-testid="open-edit-form-button"
      >
        Open Edit Prompt Form
      </Button>
      
      <PromptForm
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={initialData}
        categories={mockCategories}
      />
      
      {/* Display status for easier debugging in Playwright browser */}
      <div id="status-isOpen" style={{ marginTop: '10px' }}>Dialog isOpen: {isOpen.toString()}</div>
      <div id="status-onCloseCalled">onClose called: {typeof window !== 'undefined' && window.onCloseCalled?.toString()}</div>
      <div id="status-onSubmitCalledWith">onSubmit called with: {typeof window !== 'undefined' && JSON.stringify(window.onSubmitCalledWith)}</div>
    </div>
  );
};

export default PromptFormTestPage;

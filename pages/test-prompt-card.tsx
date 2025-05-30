import React, { useCallback, useState } from 'react';
import { PromptCard } from '@/components/custom/PromptCard';
import { Prompt, Category } from '@/types'; // Adjust path as necessary

// Expose functions/variables to Playwright via window
declare global {
  interface Window {
    // Callback trackers
    onCopyCalledWith: string | null;
    onEditCalledWith: Prompt | null;
    onDeleteCalledWith: string | null;
    // Utility to reset trackers
    resetTestState: () => void;
    // Utility to set component props for the test
    setPromptCardProps: (props: TestPromptCardProps) => void;
  }
}

interface TestPromptCardProps {
  prompt: Prompt;
  category?: Category;
}

const initialPrompt: Prompt = {
  id: 'prompt1',
  name: 'Sample Prompt Title', // Using 'name' as per component
  content: 'This is the full content of the sample prompt. It might be long and could be truncated.',
  categoryId: 'cat1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'user1',
  isPublic: false,
};

const initialCategory: Category = {
  id: 'cat1',
  name: 'Sample Category',
  userId: 'user1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PromptCardTestPage = () => {
  const [props, setProps] = useState<TestPromptCardProps>({
    prompt: initialPrompt,
    category: initialCategory,
  });

  const handleCopy = useCallback((content: string) => {
    console.log('Test Page: onCopy called with:', content);
    window.onCopyCalledWith = content;
  }, []);

  const handleEdit = useCallback((prompt: Prompt) => {
    console.log('Test Page: onEdit called with:', prompt);
    window.onEditCalledWith = prompt;
  }, []);

  const handleDelete = useCallback((promptId: string) => {
    console.log('Test Page: onDelete called with:', promptId);
    window.onDeleteCalledWith = promptId;
  }, []);

  // Expose control functions and reset state to Playwright
  if (typeof window !== 'undefined') {
    window.resetTestState = () => {
      window.onCopyCalledWith = null;
      window.onEditCalledWith = null;
      window.onDeleteCalledWith = null;
      console.log('Test Page: State reset');
    };
    window.setPromptCardProps = (newProps: TestPromptCardProps) => {
      console.log('Test Page: Setting new props:', newProps);
      setProps(newProps);
      window.resetTestState(); // Reset trackers when props change
    };

    // Initialize state on first load
    if (window.onCopyCalledWith === undefined) { // Check if already initialized
        window.resetTestState();
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}> {/* Max width to help test truncation */}
      <h1>PromptCard Test Page</h1>
      <div id="prompt-card-container">
        <PromptCard
          prompt={props.prompt}
          category={props.category}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      {/* Display status for easier debugging in Playwright browser */}
      <div id="status-onCopy" style={{ marginTop: '10px' }}>onCopy: {typeof window !== 'undefined' && window.onCopyCalledWith}</div>
      <div id="status-onEdit">onEdit: {typeof window !== 'undefined' && JSON.stringify(window.onEditCalledWith)}</div>
      <div id="status-onDelete">onDelete: {typeof window !== 'undefined' && window.onDeleteCalledWith}</div>
    </div>
  );
};

export default PromptCardTestPage;

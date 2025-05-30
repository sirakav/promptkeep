import { CategoryFilter } from '@/components/custom/CategoryFilter';
import { Category } from '@/types';
import React, { useState, useCallback } from 'react';

// Define a global function that Playwright can call to set props
// or use query parameters. For simplicity, we'll start with fixed initial props
// and use page.exposeFunction for the callback.

declare global {
  interface Window {
    latestCategoryChange: string | null | undefined;
    renderComponent: (props: TestPageProps) => void;
  }
}

interface TestPageProps {
  categories: Category[];
  selectedCategoryId: string | null;
  allCategoriesLabel?: string;
}

const initialCategories: Category[] = [
  { id: 'cat1', name: 'Tech', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat2', name: 'Health', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat3', name: 'Travel', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const CategoryFilterTestPage = () => {
  const [props, setProps] = useState<TestPageProps>({
    categories: initialCategories,
    selectedCategoryId: null,
    allCategoriesLabel: "All Items",
  });

  const handleCategoryChange = useCallback((categoryId: string | null) => {
    console.log('onCategoryChange called with:', categoryId);
    window.latestCategoryChange = categoryId; // Expose for Playwright to check
    // Also update the component's state if needed for visual feedback,
    // though Playwright will primarily check window.latestCategoryChange
    setProps(prevProps => ({ ...prevProps, selectedCategoryId: categoryId }));
  }, []);

  // Expose a function to Playwright to re-render the component with new props
  // This is more advanced; starting simpler. If needed, can implement window.renderComponent.

  return (
    <div style={{ padding: '20px' }}>
      <h1>CategoryFilter Test Page</h1>
      <CategoryFilter
        categories={props.categories}
        selectedCategoryId={props.selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        allCategoriesLabel={props.allCategoriesLabel}
      />
      <div id="change-output" style={{ marginTop: '20px' }}>
        Callback value: {JSON.stringify(props.selectedCategoryId)}
      </div>
    </div>
  );
};

export default CategoryFilterTestPage;

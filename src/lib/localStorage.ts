import { Prompt, Category } from '../types';

const PROMPTS_KEY = 'promptkeep_prompts';
const CATEGORIES_KEY = 'promptkeep_categories';

// Helper function to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

// Prompt functions
export const getPrompts = (): Prompt[] => {
  const promptsJson = getLocalStorageItem(PROMPTS_KEY);
  return promptsJson ? JSON.parse(promptsJson) : [];
};

export const savePrompts = (prompts: Prompt[]): void => {
  setLocalStorageItem(PROMPTS_KEY, JSON.stringify(prompts));
};

export const addPrompt = (prompt: Prompt): void => {
  const prompts = getPrompts();
  // Ensure no duplicate ID, though UUIDs make this unlikely
  if (prompts.find(p => p.id === prompt.id)) {
    console.warn(`Prompt with ID ${prompt.id} already exists. Skipping add.`);
    return;
  }
  prompts.push(prompt);
  savePrompts(prompts);
};

export const updatePrompt = (updatedPrompt: Prompt): void => {
  const prompts = getPrompts();
  const index = prompts.findIndex(prompt => prompt.id === updatedPrompt.id);
  if (index === -1) {
    console.warn(`Prompt with ID ${updatedPrompt.id} not found. Cannot update.`);
    return;
  }
  prompts[index] = updatedPrompt;
  savePrompts(prompts);
};

export const deletePrompt = (promptId: string): void => {
  let prompts = getPrompts();
  prompts = prompts.filter(prompt => prompt.id !== promptId);
  savePrompts(prompts);
};

// Category functions
export const getCategories = (): Category[] => {
  const categoriesJson = getLocalStorageItem(CATEGORIES_KEY);
  return categoriesJson ? JSON.parse(categoriesJson) : [];
};

export const saveCategories = (categories: Category[]): void => {
  setLocalStorageItem(CATEGORIES_KEY, JSON.stringify(categories));
};

// Adds a new category only if one with the same name doesn't already exist (case-insensitive).
// Returns the new category or the existing one if found.
export const addCategory = (categoryData: { name: string }): Category => {
  const categories = getCategories();
  const existingCategory = categories.find(c => c.name.toLowerCase() === categoryData.name.toLowerCase());
  if (existingCategory) {
    return existingCategory;
  }
  const newCategory: Category = { id: crypto.randomUUID(), name: categoryData.name };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

export const getCategoryById = (id: string): Category | undefined => {
  return getCategories().find(c => c.id === id);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return getCategories().find(c => c.name.toLowerCase() === name.toLowerCase());
};

// Consider if category update/delete is needed. For now, focusing on add/get.
// For example, to delete a category, you'd also need to handle prompts associated with it.
// export const deleteCategory = (categoryId: string): void => {
//   let categories = getCategories();
//   categories = categories.filter(category => category.id !== categoryId);
//   saveCategories(categories);
//   // Also, update prompts that might have been using this categoryId
//   let prompts = getPrompts();
//   prompts = prompts.map(p => {
//     if (p.categoryId === categoryId) {
//       return { ...p, categoryId: '' }; // Or some default/uncategorized ID
//     }
//     return p;
//   });
//   savePrompts(prompts);
// };

import { Prompt, Category } from '../types';

const PROMPTS_KEY = 'prompts';
const CATEGORIES_KEY = 'categories';

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

export const addPrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Prompt => {
  const prompts = getPrompts();
  const newPrompt: Prompt = {
    ...promptData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // It's good practice to check for ID collisions, however unlikely with UUIDs.
  // A more robust solution might involve retrying with a new UUID if a collision is detected.
  let idToCheck = newPrompt.id;
  while (prompts.find(p => p.id === idToCheck)) {
    console.warn(`Prompt ID collision for ${idToCheck}. Regenerating ID.`);
    idToCheck = crypto.randomUUID();
  }
  newPrompt.id = idToCheck;

  prompts.push(newPrompt);
  savePrompts(prompts);
  return newPrompt;
};

export const updatePrompt = (updatedPrompt: Prompt): Prompt | null => {
  const prompts = getPrompts();
  const index = prompts.findIndex(prompt => prompt.id === updatedPrompt.id);
  if (index === -1) {
    console.warn(`Prompt with ID ${updatedPrompt.id} not found. Cannot update.`);
    return null;
  }
  // Preserve createdAt, update updatedAt
  const existingPrompt = prompts[index];
  prompts[index] = {
    ...existingPrompt,
    ...updatedPrompt,
    updatedAt: new Date().toISOString(),
  };
  savePrompts(prompts);
  return prompts[index];
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
export const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Category => {
  const categories = getCategories();
  // Check if a category with the same name already exists (case-insensitive)
  const existingCategory = categories.find(
    (cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase()
  );

  if (existingCategory) {
    return existingCategory; // Return the existing category if found
  }

  // If not found, create and add a new one
  let id = crypto.randomUUID();
  // Ensure unique ID (though collision is highly unlikely with UUIDs)
  // Add a console warning for ID collision during regeneration for categories as well.
  while (categories.find(cat => cat.id === id)) {
    console.warn(`Category ID collision for ${id}. Regenerating ID.`);
    id = crypto.randomUUID();
  }
  const newCategory: Category = {
    id,
    name: categoryData.name,
    userId: 'temp-user-id', // Placeholder for now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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

export const exportData = (): string => {
  const prompts = getPrompts();
  const categories = getCategories();
  const data = {
    prompts,
    categories,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): { success: boolean; message: string; error?: string } => {
  try {
    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
    } catch { // Removed unused _e
      return { success: false, message: "Invalid JSON format.", error: "parse_error" };
    }

    if (typeof parsedData !== 'object' || parsedData === null) {
      return { success: false, message: "Invalid data format: not an object.", error: "structure_error" };
    }

    if (!Array.isArray(parsedData.prompts)) {
      return { success: false, message: "Invalid data format: 'prompts' is not an array.", error: "structure_error" };
    }

    if (!Array.isArray(parsedData.categories)) {
      return { success: false, message: "Invalid data format: 'categories' is not an array.", error: "structure_error" };
    }

    // Optional: Basic structural validation for a few items
    if (parsedData.prompts.length > 0) {
      const firstPrompt = parsedData.prompts[0];
      // Changed firstPrompt.name to firstPrompt.title for correct validation
      if (typeof firstPrompt.id !== 'string' || typeof firstPrompt.title !== 'string' || typeof firstPrompt.content !== 'string') { 
        return { success: false, message: "Invalid prompt structure in 'prompts' array.", error: "structure_error" };
      }
    }

    if (parsedData.categories.length > 0) {
      const firstCategory = parsedData.categories[0];
      if (typeof firstCategory.id !== 'string' || typeof firstCategory.name !== 'string') {
        return { success: false, message: "Invalid category structure in 'categories' array.", error: "structure_error" };
      }
    }

    savePrompts(parsedData.prompts as Prompt[]);
    saveCategories(parsedData.categories as Category[]);

    return { success: true, message: "Data imported successfully!" };

  } catch (error) {
    console.error("Unexpected error during import:", error);
    return { success: false, message: "An unexpected error occurred during import.", error: "unexpected_error" };
  }
};

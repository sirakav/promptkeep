import {
  getPrompts,
  savePrompts,
  addPrompt,
  updatePrompt,
  deletePrompt,
  getCategories,
  saveCategories,
  addCategory,
  getCategoryById,
  getCategoryByName,
  exportData,
  importData,
} from './localStorage';
import { Prompt, Category } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock crypto.randomUUID
const mockUUID = 'mock-uuid-123';
global.crypto = {
  ...global.crypto,
  randomUUID: jest.fn(() => mockUUID),
};

// Mock console.warn
let consoleWarnSpy: jest.SpyInstance;

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Ensure global.crypto.randomUUID is reset to the default mock before each test
    global.crypto.randomUUID = jest.fn(() => mockUUID);
    jest.clearAllMocks(); // This clears call counts etc. for all mocks
    // If using jest.spyOn in some tests, consider jest.restoreAllMocks() as well,
    // but ensure it doesn't interfere with the global mock if it's not restored properly by individual tests.
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('Prompts', () => {
    const mockPrompt: Prompt = { id: '1', title: 'Test Prompt', content: 'Test Content', categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const mockPrompt2: Prompt = { id: '2', title: 'Test Prompt 2', content: 'Test Content 2', categoryId: 'cat2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    describe('getPrompts', () => {
      it('should return an empty array if no prompts are in localStorage', () => {
        expect(getPrompts()).toEqual([]);
      });

      it('should return prompts from localStorage', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt]));
        expect(getPrompts()).toEqual([mockPrompt]);
      });

      it('should return multiple prompts from localStorage', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt, mockPrompt2]));
        expect(getPrompts()).toEqual([mockPrompt, mockPrompt2]);
      });
    });

    describe('savePrompts', () => {
      it('should save prompts to localStorage', () => {
        savePrompts([mockPrompt]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('prompts', JSON.stringify([mockPrompt]));
      });
    });

    describe('addPrompt', () => {
      it('should add a new prompt', () => {
        const newPromptData = { title: 'New Prompt', content: 'New Content', categoryId: 'cat1' };
        const addedPrompt = addPrompt(newPromptData);
        expect(addedPrompt.id).toBe(mockUUID); // crypto.randomUUID is mocked
        expect(addedPrompt.title).toBe(newPromptData.title);
        expect(addedPrompt.content).toBe(newPromptData.content);
        expect(addedPrompt.categoryId).toBe(newPromptData.categoryId);
        expect(getPrompts()).toHaveLength(1);
        expect(getPrompts()[0]).toEqual(addedPrompt);
      });

      it('should not add a prompt if ID collision occurs (though unlikely with UUID)', () => {
        // Pre-seed a prompt with the mockUUID
        localStorageMock.setItem('prompts', JSON.stringify([{ ...mockPrompt, id: mockUUID }]));
        const newPromptData = { title: 'Another New Prompt', content: 'Content', categoryId: 'cat1' };
        // The global mock for crypto.randomUUID already returns mockUUID.
        // If a specific sequence is needed for this test, jest.spyOn below will handle it.
        
        // Attempt to add a new prompt, expecting it to handle the collision (e.g., by regenerating or erroring)
        // For this test, we'll assume the current implementation might overwrite or fail silently if not handled.
        // The goal is to test the ID check if it exists. If the function always generates a new ID until unique,
        // this test would need adjustment or is less relevant.
        // Based on typical addPrompt logic, it might just add it, or it might have a loop.
        // Let's assume it would try to generate a new ID if a collision is detected.
        // We'll spy on randomUUID to see if it's called again.
        const randomUUIDSpy = jest.spyOn(global.crypto, 'randomUUID');
        randomUUIDSpy.mockReturnValueOnce(mockUUID); // First attempt collision
        randomUUIDSpy.mockReturnValueOnce('new-unique-id'); // Second attempt unique

        const addedPrompt = addPrompt(newPromptData);
        expect(addedPrompt.id).toBe('new-unique-id');
        expect(getPrompts().find(p => p.id === mockUUID)).toBeTruthy(); // Original prompt still exists
        expect(getPrompts().find(p => p.id === 'new-unique-id')).toBeTruthy(); // New prompt added
        expect(getPrompts()).toHaveLength(2);
        randomUUIDSpy.mockRestore();
      });
    });

    describe('updatePrompt', () => {
      it('should update an existing prompt', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt]));
        const updatePayload = { ...mockPrompt, title: 'Updated Title' }; // This still carries old updatedAt
        const updatedPromptResult = updatePrompt(updatePayload);

        expect(updatedPromptResult).toBeDefined();
        expect(updatedPromptResult!.id).toBe(mockPrompt.id);
        expect(updatedPromptResult!.title).toBe(updatePayload.title);
        expect(updatedPromptResult!.content).toBe(mockPrompt.content); // Ensure other fields are preserved
        expect(updatedPromptResult!.categoryId).toBe(mockPrompt.categoryId);
        expect(new Date(updatedPromptResult!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(mockPrompt.updatedAt).getTime());
        // Also check that it's a recent timestamp (e.g., not older than the original updatedAt)
        // And that createdAt is preserved
        expect(updatedPromptResult!.createdAt).toBe(mockPrompt.createdAt);

        const promptsInStorage = getPrompts();
        expect(promptsInStorage[0].title).toBe('Updated Title');
        expect(new Date(promptsInStorage[0].updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(mockPrompt.updatedAt).getTime());
      });

      it('should return null if trying to update a non-existent prompt', () => {
        const nonExistentPrompt = { ...mockPrompt, id: 'non-existent-id' };
        expect(updatePrompt(nonExistentPrompt)).toBeNull();
        expect(getPrompts()).toEqual([]);
      });
    });

    describe('deletePrompt', () => {
      it('should delete an existing prompt', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt, mockPrompt2]));
        deletePrompt(mockPrompt.id);
        expect(getPrompts()).toEqual([mockPrompt2]);
        expect(getPrompts()).toHaveLength(1);
      });

      it('should not change prompts if trying to delete a non-existent prompt', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt]));
        deletePrompt('non-existent-id');
        expect(getPrompts()).toEqual([mockPrompt]);
      });
    });
  });

  describe('Categories', () => {
    const mockDate = new Date().toISOString();
    const mockCategory: Category = { id: 'cat1', name: 'Test Category 1', userId: 'temp-user-id', createdAt: mockDate, updatedAt: mockDate };
    const mockCategory2: Category = { id: 'cat2', name: 'Test Category 2', userId: 'temp-user-id', createdAt: mockDate, updatedAt: mockDate };

    describe('getCategories', () => {
      it('should return an empty array if no categories are in localStorage', () => {
        expect(getCategories()).toEqual([]);
      });

      it('should return categories from localStorage', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory]));
        expect(getCategories()).toEqual([mockCategory]);
      });
    });

    describe('saveCategories', () => {
      it('should save categories to localStorage', () => {
        saveCategories([mockCategory]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('categories', JSON.stringify([mockCategory]));
      });
    });

    describe('addCategory', () => {
      it('should add a new category', () => {
        const newCategoryName = 'New Category';
        const addedCategory = addCategory({ name: newCategoryName }); // Pass as object
        expect(addedCategory.id).toBe(mockUUID); // crypto.randomUUID is mocked
        expect(addedCategory.name).toBe(newCategoryName);
        expect(getCategories()).toHaveLength(1);
        expect(getCategories()[0]).toEqual(addedCategory);
      });

      it('should not add a category if a category with the same name already exists (case-insensitive)', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory]));
        // Pass an object as expected by the addCategory function
        const result = addCategory({ name: mockCategory.name.toUpperCase() });
        // The function is designed to return the *existing* category if found by name
        expect(result).toEqual(mockCategory);
        expect(getCategories()).toHaveLength(1); // Should still be 1
      });

       it('should not add a category if ID collision occurs (though unlikely with UUID)', () => {
        // Pre-seed a category with the mockUUID
        const collidingCategory: Category = {
          ...mockCategory,
          id: mockUUID,
          name: "Colliding Name Cat" // Ensure it's a different name so it doesn't get caught by name check
        };
        localStorageMock.setItem('categories', JSON.stringify([collidingCategory]));
        const newCategoryData = { name: 'Another New Category' }; // Pass as object
        // The global mock for crypto.randomUUID already returns mockUUID.
        // If a specific sequence is needed for this test, jest.spyOn below will handle it.

        const randomUUIDSpy = jest.spyOn(global.crypto, 'randomUUID')
            .mockImplementationOnce(() => mockUUID) // First attempt collision
            .mockImplementationOnce(() => 'new-unique-cat-id'); // Second attempt unique

        const addedCategory = addCategory(newCategoryData); // Use the object here
        expect(addedCategory.id).toBe('new-unique-cat-id');
        expect(getCategories().find(c => c.id === mockUUID)).toBeTruthy();
        expect(getCategories().find(c => c.id === 'new-unique-cat-id')).toBeTruthy();
        expect(getCategories()).toHaveLength(2);
        randomUUIDSpy.mockRestore();
      });
    });

    describe('getCategoryById', () => {
      it('should return a category by its ID', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory, mockCategory2]));
        expect(getCategoryById(mockCategory.id)).toEqual(mockCategory);
      });

      it('should return undefined if category with ID is not found', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory]));
        expect(getCategoryById('non-existent-id')).toBeUndefined();
      });
    });

    describe('getCategoryByName', () => {
      it('should return a category by its name (case-insensitive)', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory, mockCategory2]));
        expect(getCategoryByName(mockCategory.name.toUpperCase())).toEqual(mockCategory);
        expect(getCategoryByName(mockCategory2.name.toLowerCase())).toEqual(mockCategory2);
      });

      it('should return undefined if category with name is not found', () => {
        localStorageMock.setItem('categories', JSON.stringify([mockCategory]));
        expect(getCategoryByName('Non Existent Category')).toBeUndefined();
      });
    });
  });

  describe('Import/Export', () => {
    const mockPrompt: Prompt = { id: 'p1', title: 'Prompt 1', content: 'Content 1', categoryId: 'cat1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const mockCategory: Category = { id: 'cat1', name: 'Category 1' };

    describe('exportData', () => {
      it('should export prompts and categories correctly', () => {
        localStorageMock.setItem('prompts', JSON.stringify([mockPrompt]));
        localStorageMock.setItem('categories', JSON.stringify([mockCategory]));

        const exportedJson = exportData();
        const exported = JSON.parse(exportedJson);

        expect(exported.prompts).toEqual([mockPrompt]);
        expect(exported.categories).toEqual([mockCategory]);
        expect(exported.exportedAt).toBeDefined();
      });

      it('should export empty arrays if no data exists', () => {
        const exportedJson = exportData();
        const exported = JSON.parse(exportedJson);

        expect(exported.prompts).toEqual([]);
        expect(exported.categories).toEqual([]);
        expect(exported.exportedAt).toBeDefined();
      });
    });

    describe('importData', () => {
      it('should import data successfully and overwrite existing data', () => {
        localStorageMock.setItem('prompts', JSON.stringify([{ id: 'oldP', title: 'Old', content: 'Old', categoryId: 'oldC', createdAt: 'old', updatedAt: 'old' }]));
        localStorageMock.setItem('categories', JSON.stringify([{ id: 'oldC', name: 'Old Category' }]));

        const dataToImport = {
          prompts: [mockPrompt],
          categories: [mockCategory],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));

        expect(importResult.success).toBe(true);
        expect(getPrompts()).toEqual([mockPrompt]);
        expect(getCategories()).toEqual([mockCategory]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('prompts', JSON.stringify(dataToImport.prompts));
        expect(localStorageMock.setItem).toHaveBeenCalledWith('categories', JSON.stringify(dataToImport.categories));
      });

      it('should return error for invalid JSON input', () => {
        const importResult = importData('invalid json');
        expect(importResult.success).toBe(false);
        expect(importResult.error).toBe('parse_error'); // Updated expectation
      });

      it('should return error if prompts array is missing', () => {
        const dataToImport = {
          categories: [mockCategory],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(false);
        expect(importResult.error).toBe('structure_error'); // Updated expectation
      });

      it('should return error if categories array is missing', () => {
        const dataToImport = {
          prompts: [mockPrompt],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(false);
        expect(importResult.error).toBe('structure_error'); // Updated expectation
      });

      it('should return error for invalid prompt structure', () => {
        const invalidPrompt = { ...mockPrompt, title: undefined }; // title is required
        const dataToImport = {
          prompts: [invalidPrompt],
          categories: [mockCategory],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(false);
        expect(importResult.error).toBe('structure_error'); // Updated expectation
      });

      it('should return error for invalid category structure', () => {
        const invalidCategory = { ...mockCategory, name: undefined }; // name is required
        const dataToImport = {
          prompts: [mockPrompt],
          categories: [invalidCategory],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(false);
        expect(importResult.error).toBe('structure_error'); // Updated expectation
      });

      it('should import successfully even if exportedAt is missing (for backward compatibility or simpler imports)', () => {
        const dataToImport = {
          prompts: [mockPrompt],
          categories: [mockCategory],
        };
        // @ts-expect-error testing missing exportedAt
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(true);
        expect(getPrompts()).toEqual([mockPrompt]);
        expect(getCategories()).toEqual([mockCategory]);
      });

      it('should handle empty prompts and categories arrays in import data', () => {
        const dataToImport = {
          prompts: [],
          categories: [],
          exportedAt: new Date().toISOString(),
        };
        const importResult = importData(JSON.stringify(dataToImport));
        expect(importResult.success).toBe(true);
        expect(getPrompts()).toEqual([]);
        expect(getCategories()).toEqual([]);
      });
    });
  });
});

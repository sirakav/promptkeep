export interface Category {
  id: string;
  name: string;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  categoryId: string; // Store category by ID for easier linking
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

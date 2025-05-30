export interface Category {
  id: string;
  name: string;
  userId: string; // Added userId
  createdAt: string; // Added createdAt
  updatedAt: string; // Added updatedAt
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  categoryId: string; // Store category by ID for easier linking
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  userId: string; // Added userId
  isPublic: boolean; // Added isPublic
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    githubProfile?: string;
    linkedinProfile?: string;
  };
}

// Material Types
export interface Material {
  _id: string;
  userId: string;
  title: string;
  subject: string;
  content: string;
  tags: string[];
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialData {
  title: string;
  subject: string;
  content: string;
  tags?: string[];
}

export interface UpdateMaterialData {
  title?: string;
  subject?: string;
  content?: string;
  tags?: string[];
  aiSummary?: string;
}

// Flashcard Types
export interface Flashcard {
  _id: string;
  userId: string;
  materialId?: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isAIGenerated: boolean;
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlashcardData {
  question: string;
  answer: string;
  subject: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  materialId?: string;
}

export interface UpdateFlashcardData {
  question?: string;
  answer?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// AI Types
export interface AIGenerateRequest {
  materialId?: string;
  content: string;
  type: 'summary' | 'flashcards' | 'explain';
  prompt?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
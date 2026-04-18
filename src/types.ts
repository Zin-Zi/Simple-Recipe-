export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  image?: string;
  category: string;
  prepTime: string;
  createdAt: number;
  tags: string[];
}

export interface UserSettings {
  language: 'en' | 'mm';
  themeId: string;
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
}

export interface Theme {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  border: string;
  font: string;
}

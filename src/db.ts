import Dexie, { Table } from 'dexie';
import { Recipe, UserSettings } from './types';

export class AppDatabase extends Dexie {
  recipes!: Table<Recipe>;
  settings!: Table<{ id: string; value: any }>;

  constructor() {
    super('ChefScribeDB');
    this.version(2).stores({
      recipes: '++id, title, category, *tags',
      settings: 'id',
    });
  }
}

export const db = new AppDatabase();

// Default Settings Helper
export const getDefaultSettings = async (): Promise<UserSettings> => {
  const lang = await db.settings.get('language');
  const theme = await db.settings.get('themeId');
  const size = await db.settings.get('fontSize');
  const notify = await db.settings.get('notificationsEnabled');

  return {
    language: lang?.value || 'en',
    themeId: theme?.value || 'minimal',
    fontSize: size?.value || 'medium',
    notificationsEnabled: notify?.value ?? true,
  };
};

export const updateSetting = async (key: keyof UserSettings, value: any) => {
  await db.settings.put({ id: key, value });
};

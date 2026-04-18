import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings, Theme } from '../types';
import { THEMES, LANGUAGES } from '../constants';
import { getDefaultSettings, updateSetting as saveSettingToDb } from '../db';

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: (key: keyof UserSettings, value: any) => void;
  theme: Theme;
  t: typeof LANGUAGES['en'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    themeId: 'minimal',
    fontSize: 'medium',
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const dbSettings = await getDefaultSettings();
      setSettings(dbSettings);
      setLoading(false);
    };
    loadSettings();
  }, []);

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    saveSettingToDb(key, value);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    root.classList.add(`font-size-${settings.fontSize}`);
  }, [settings.fontSize]);

  const theme = THEMES[settings.themeId] || THEMES.minimal;
  const t = LANGUAGES[settings.language];

  if (loading) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, theme, t }}>
      <div className={`${theme.bg} ${theme.text} min-h-screen transition-colors duration-500 ${theme.font}`}>
        <div className="max-w-2xl mx-auto min-h-screen relative shadow-2xl">
          {children}
        </div>
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};

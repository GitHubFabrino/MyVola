// ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { parametreService } from '~/services/parametre.service';
import { useAuth } from '~/store/auth/hooks';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: async () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  const { user } = useAuth();

  // Fonction pour définir le thème
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark');
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = useCallback(async () => {
    if (!user?.id) {
      setTheme(!isDark ? 'dark' : 'light');
      return;
    }

    try {
      const newTheme = isDark ? 'light' : 'dark';
      await parametreService.setParametre(user.id, 'theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Erreur lors du changement de thème:', error);
    }
  }, [isDark, user?.id, setTheme]);

  // Initialisation du thème
  useEffect(() => {
    const initializeTheme = async () => {
      if (!user?.id) return;

      try {
        const theme = await parametreService.getValeurParametre(user.id, 'theme');
        if (theme === 'light' || theme === 'dark') {
          setTheme(theme);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du thème:', error);
      }
    };

    initializeTheme();
  }, [user?.id, setTheme]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};
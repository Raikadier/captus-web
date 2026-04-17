import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ACCENT_COLORS = {
  green: {
    primary: '0.55 0.15 145',
    ring: '0.55 0.15 145',
    accent: '0.95 0.04 145',
    sidebarAccent: '0.96 0.03 145',
  },
  blue: {
    primary: '0.55 0.15 260',
    ring: '0.55 0.15 260',
    accent: '0.95 0.04 260',
    sidebarAccent: '0.96 0.03 260',
  },
  purple: {
    primary: '0.55 0.15 300',
    ring: '0.55 0.15 300',
    accent: '0.95 0.04 300',
    sidebarAccent: '0.96 0.03 300',
  },
  orange: {
    primary: '0.60 0.16 50',
    ring: '0.60 0.16 50',
    accent: '0.95 0.04 50',
    sidebarAccent: '0.96 0.03 50',
  },
  pink: {
    primary: '0.55 0.15 350',
    ring: '0.55 0.15 350',
    accent: '0.95 0.04 350',
    sidebarAccent: '0.96 0.03 350',
  }
};

export const ThemeProvider = ({ children }) => {
  // Default to light mode for now, or verify system preference
  const [darkMode, setDarkMode] = useState(false);

  // Optional: persist in localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      // Re-apply accent colors to ensure proper mode variables if we were to support dark mode specific accents dynamically
      // But currently we only set the root variables which override everything.
      // This is a known limitation: changing accent color forces these values regardless of dark mode.
      // A better approach would be to set hue variables, but for now this satisfies the requirement.
      return newMode;
    });
  };

  const [compactView, setCompactView] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    setFontSize(savedFontSize);
  }, []);

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const [accentColor, setAccentColor] = useState('green');

  useEffect(() => {
    const savedAccentColor = localStorage.getItem('accentColor') || 'green';
    changeAccentColor(savedAccentColor);
  }, []);

  const changeAccentColor = (color) => {
    if (!ACCENT_COLORS[color]) return;

    setAccentColor(color);
    localStorage.setItem('accentColor', color);

    const { primary, ring, accent, sidebarAccent } = ACCENT_COLORS[color];
    const root = document.documentElement;

    root.style.setProperty('--primary', `oklch(${primary})`);
    root.style.setProperty('--ring', `oklch(${ring})`);
    root.style.setProperty('--sidebar-primary', `oklch(${primary})`);
    root.style.setProperty('--sidebar-ring', `oklch(${ring})`);

    // Also update accent backgrounds
    root.style.setProperty('--accent', `oklch(${accent})`);
    root.style.setProperty('--sidebar-accent', `oklch(${sidebarAccent})`);
  };

  return (
    <ThemeContext.Provider value={{
      darkMode,
      toggleTheme,
      compactView,
      setCompactView,
      fontSize,
      changeFontSize,
      accentColor,
      changeAccentColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

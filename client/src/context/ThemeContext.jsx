import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('gstyle-theme') || 'theme-original';
  });

  useEffect(() => {
    localStorage.setItem('gstyle-theme', theme);
    // Remove all previous theme classes
    document.body.classList.remove(
      'theme-original', 'theme-dark-chrome', 'theme-cyberpunk', 'theme-titanium',
      'theme-natal', 'theme-halloween', 'theme-ano-novo', 'theme-black-friday', 'theme-aniversario'
    );
    // Add current theme class
    document.body.classList.add(theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

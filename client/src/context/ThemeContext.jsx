import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEME_LIST = [
  'theme-original', 'theme-dark-chrome', 'theme-natal', 'theme-sakura',
  'theme-ano-novo', 'theme-halloween', 'theme-namorados', 'theme-pascoa', 'theme-aniversario'
];

export const ThemeProvider = ({ children }) => {
  const [baseTheme, setBaseTheme] = useState(() => localStorage.getItem('gstyle-base-theme') || 'theme-original');
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('gstyle-theme-mode') || 'fixed'); 
  const [randomInterval, setRandomInterval] = useState(() => Number(localStorage.getItem('gstyle-theme-interval')) || 60000); // ms

  const [activeTheme, setActiveTheme] = useState(baseTheme);

  const updateSettings = (mode, theme, interval) => {
    setThemeMode(mode);
    setBaseTheme(theme);
    setRandomInterval(interval);
    localStorage.setItem('gstyle-theme-mode', mode);
    localStorage.setItem('gstyle-base-theme', theme);
    localStorage.setItem('gstyle-theme-interval', interval.toString());
  };

  useEffect(() => {
    let applyTheme = baseTheme;
    let timerId = null;

    if (themeMode === 'fixed') {
      applyTheme = baseTheme;
    } else if (themeMode === 'random') {
      const cycleRandom = () => {
        const randomT = THEME_LIST[Math.floor(Math.random() * THEME_LIST.length)];
        setActiveTheme(randomT);
        document.body.className = randomT === 'theme-original' ? '' : randomT;
      };
      cycleRandom(); // first trigger
      timerId = setInterval(cycleRandom, randomInterval);
      return () => { if(timerId) clearInterval(timerId); };
    } else if (themeMode === 'seasonal') {
      const today = new Date();
      const m = today.getMonth() + 1;
      const d = today.getDate();
      
      // Datas comemorativas
      if (m === 12 && d >= 1 && d <= 26)      applyTheme = 'theme-natal';
      else if ((m === 12 && d >= 27) || (m === 1 && d <= 5)) applyTheme = 'theme-ano-novo';
      else if (m === 10 && d >= 15 && d <= 31) applyTheme = 'theme-halloween';
      else if (m === 6 && d >= 5 && d <= 15)  applyTheme = 'theme-namorados'; 
      else if (m === 4 && d <= 15)            applyTheme = 'theme-pascoa';
      else if (m === 9 && d >= 20 && d <= 30) applyTheme = 'theme-sakura'; // Spring Japan starts earlier, but just to have it
      else applyTheme = baseTheme; 
    }

    setActiveTheme(applyTheme);
    document.body.className = applyTheme === 'theme-original' ? '' : applyTheme;

    return () => { if(timerId) clearInterval(timerId); };
  }, [themeMode, baseTheme, randomInterval]);

  // Keep compatibility with old changeTheme if needed
  const changeTheme = (newTheme) => updateSettings('fixed', newTheme, randomInterval);

  return (
    <ThemeContext.Provider value={{
      theme: activeTheme,
      baseTheme,
      themeMode,
      randomInterval,
      updateSettings,
      changeTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <i className={currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
    </div>
  );
};

export default ThemeToggle;
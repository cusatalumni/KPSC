
import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { NAV_STRUCTURE } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import type { Page } from '../types';
import AiBadge from './AiBadge';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const navRef = useRef<HTMLElement>(null);

  const toggleLanguage = () => {
    setLanguage(language === 'ml' ? 'en' : 'ml');
  };
  
  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setOpenDropdown(null);
    setIsMenuOpen(false);
  }
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const adminButtonClasses = "flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-black transition duration-200 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800";

  const renderAuthControls = () => {
    if (!isLoaded) {
      return <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>;
    }
    if (isSignedIn) {
      return <UserButton afterSignOutUrl="/" />;
    }
    return (
      <SignInButton mode="modal">
        <button className="bg-indigo-600 text-white font-black px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition duration-300">
          {t('login')}
        </button>
      </SignInButton>
    );
  };

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-5 cursor-pointer group" onClick={() => handleNavClick('dashboard')}>
            <div className="relative">
              <LogoIcon className="h-14 w-14 md:h-16 md:w-16 transition-transform group-hover:scale-110 drop-shadow-md" variant={theme === 'dark' ? 'dark' : 'transparent'} />
              <div className="absolute -inset-1 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none drop-shadow-sm">{t('app.title')}</h1>
                <AiBadge />
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1.5">{t('app.subtitle')}</p>
            </div>
          </div>

          <nav ref={navRef} className="hidden lg:flex items-center space-x-7">
            {NAV_STRUCTURE.map(link => (
                <button key={link.nameKey} onClick={() => link.target && handleNavClick(link.target as Page)} className="text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-black text-sm uppercase tracking-wider transition duration-200">
                    {t(link.nameKey)}
                </button>
            ))}
            {isAdmin && (
                <button onClick={() => handleNavClick('admin_panel')} className={adminButtonClasses}>
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Admin</span>
                </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-inner"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <button onClick={toggleLanguage} className="hidden md:block text-slate-600 dark:text-slate-400 font-black px-4 py-2.5 rounded-xl text-[10px] border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm">
              {language === 'ml' ? 'ENGLISH' : 'മലയാളം'}
            </button>
            {renderAuthControls()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

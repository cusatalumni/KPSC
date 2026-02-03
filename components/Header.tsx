
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
import { Bars3Icon } from './icons/Bars3Icon';
import { XMarkIcon } from './icons/XMarkIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

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
  
  const handleDropdownToggle = (nameKey: string) => {
    setOpenDropdown(openDropdown === nameKey ? null : nameKey);
  };
  
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
      return (
        <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse flex items-center justify-center text-[10px] text-slate-300 dark:text-slate-600 font-bold">
            {t('loading').toUpperCase()}
        </div>
      );
    }
    if (isSignedIn) {
      return (
        <div className="flex items-center space-x-4">
          <div className="text-right flex flex-col items-end">
            <span className="hidden lg:inline text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">
              {isAdmin ? `🛡️ ${t('auth.admin')}` : `🎓 ${t('auth.student')}`}
            </span>
            <span className="hidden lg:inline text-sm font-bold text-slate-700 dark:text-slate-100">
              {user?.firstName || t('auth.profile')}
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      );
    }
    return (
      <SignInButton mode="modal">
        <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-black px-6 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transform transition duration-300 ease-in-out">
          {t('login')}
        </button>
      </SignInButton>
    );
  };

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <LogoIcon className="h-12 w-12" variant={theme === 'dark' ? 'dark' : 'transparent'} />
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white" style={{fontFamily: "'Manjari', sans-serif"}}>{t('app.title')}</h1>
                <AiBadge />
              </div>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium -mt-1">{t('app.subtitle')}</p>
            </div>
          </div>

          <nav ref={navRef} className="hidden md:flex items-center space-x-1 lg:space-x-2 relative">
            {NAV_STRUCTURE.map(link => (
                link.children ? (
                    <div key={link.nameKey} className="relative">
                        <button onClick={() => handleDropdownToggle(link.nameKey)} className="flex items-center space-x-1 text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition duration-200 px-3 py-2 rounded-md">
                            <span>{t(link.nameKey)}</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${openDropdown === link.nameKey ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === link.nameKey && (
                            <div className="absolute top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-fade-in-up-fast">
                                {link.children.map(child => (
                                    <button key={child.nameKey} onClick={() => handleNavClick(child.target as Page)} className="w-full text-left px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-150 font-medium">
                                        {t(child.nameKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <button key={link.nameKey} onClick={() => handleNavClick(link.target as Page)} className="text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition duration-200 px-3 py-2 rounded-md">
                        {t(link.nameKey)}
                    </button>
                )
            ))}
            {isAdmin && (
                <button onClick={() => handleNavClick('admin_panel')} className={adminButtonClasses}>
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>{t('nav.adminPanel')}</span>
                </button>
            )}
          </nav>

          <div className="flex items-center space-x-3 lg:space-x-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-inner"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <button onClick={toggleLanguage} className="hidden md:block text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 font-black px-3 py-2 rounded-xl transition-colors text-xs border border-transparent hover:border-slate-200 dark:border-slate-800">
              {language === 'ml' ? 'ENG' : 'മലയാളം'}
            </button>
            
            <div className="hidden md:block">
              {renderAuthControls()}
            </div>
            
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900">
                    {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-4 absolute w-full shadow-xl animate-fade-in-up-fast">
            <nav className="flex flex-col space-y-1">
                 {NAV_STRUCTURE.map((link) => (
                    <div key={link.nameKey}>
                        {link.children ? (
                            <>
                                <button onClick={() => handleDropdownToggle(link.nameKey)} className="w-full flex justify-between items-center text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 text-left font-black p-3 rounded-xl transition duration-200">
                                    <span>{t(link.nameKey)}</span>
                                    <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === link.nameKey ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === link.nameKey && (
                                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-3 mb-2">
                                        {link.children.map(child => (
                                            <button key={child.nameKey} onClick={() => handleNavClick(child.target as Page)} className="w-full text-left text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold p-3 rounded-xl transition duration-200">
                                                {t(child.nameKey)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                             <button 
                                onClick={() => handleNavClick(link.target as Page)}
                                className="w-full text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 text-left font-black p-3 rounded-xl transition duration-200"
                            >
                                {t(link.nameKey)}
                            </button>
                        )}
                    </div>
                ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <button onClick={toggleLanguage} className="w-full text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black px-3 py-4 rounded-2xl transition-colors">
                    {language === 'ml' ? 'Switch to English' : 'മലയാളത്തിലേക്ക് മാറാം'}
                </button>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;

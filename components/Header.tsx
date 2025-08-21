import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { NAV_LINKS } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import type { Page } from '../App';
import AiBadge from './AiBadge';
import { useTranslation } from '../contexts/LanguageContext';
import { Bars3Icon } from './icons/Bars3Icon';
import { XMarkIcon } from './icons/XMarkIcon';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ml' ? 'en' : 'ml');
  };
  
  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <LogoIcon className="h-12 w-12" />
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: "'Manjari', sans-serif"}}>{t('app.title')}</h1>
                <AiBadge />
              </div>
              <p className="text-sm text-indigo-700 font-medium -mt-1">{t('app.subtitle')}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {NAV_LINKS.slice(0, 5).map((link) => (
              <button 
                key={link.nameKey} 
                onClick={() => handleNavClick(link.target as Page)}
                className="text-slate-600 hover:text-indigo-600 font-medium transition duration-200 px-3 py-2 rounded-md"
              >
                {t(link.nameKey)}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
             {/* Language Switcher */}
            <button onClick={toggleLanguage} className="hidden md:block text-slate-500 hover:bg-slate-100 font-semibold px-3 py-2 rounded-md transition-colors">
              {language === 'ml' ? 'English' : 'മലയാളം'}
            </button>
            
            <div className="hidden md:block">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out">
                    {t('login')}
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
            
             {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                    {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 absolute w-full shadow-lg">
            <nav className="flex flex-col space-y-2">
                 {NAV_LINKS.map((link) => (
                    <button 
                        key={link.nameKey} 
                        onClick={() => handleNavClick(link.target as Page)}
                        className="text-slate-700 hover:bg-slate-100 text-left font-semibold p-3 rounded-md transition duration-200"
                    >
                        {t(link.nameKey)}
                    </button>
                ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200">
                <button onClick={toggleLanguage} className="w-full text-slate-600 hover:bg-slate-100 font-semibold px-3 py-3 rounded-md transition-colors mb-4">
                    Switch to {language === 'ml' ? 'English' : 'മലയാളം'}
                </button>
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-5 py-3 rounded-lg shadow-lg">
                            {t('login')}
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
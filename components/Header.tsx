
import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { NAV_STRUCTURE } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import type { Page } from '../types';
import AiBadge from './AiBadge';
import { useTranslation } from '../contexts/LanguageContext';
import { Bars3Icon } from './icons/Bars3Icon';
import { XMarkIcon } from './icons/XMarkIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { t, language, setLanguage } = useTranslation();
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

  const adminButtonClasses = "flex items-center space-x-2 text-slate-600 bg-yellow-100 hover:bg-yellow-200 font-bold transition duration-200 px-3 py-2 rounded-md";
  const mobileAdminButtonClasses = "flex items-center space-x-2 text-slate-700 bg-yellow-100 hover:bg-yellow-200 text-left font-bold p-3 rounded-md transition duration-200";

  const renderAuthControls = () => {
    if (!isLoaded) {
      return (
        <div className="h-10 w-24 bg-slate-100 rounded-full animate-pulse flex items-center justify-center text-[10px] text-slate-300 font-bold">
            LOADING...
        </div>
      );
    }
    if (isSignedIn) {
      return (
        <div className="flex items-center space-x-3">
          <span className="hidden lg:inline text-sm font-medium text-slate-700">
            {user?.firstName ? `${t('welcome')}, ${user.firstName}!` : t('myAccount')}
          </span>
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

  const renderMobileAuthControls = () => {
    if (!isLoaded) return null;
    if (isSignedIn) {
      return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
          <span className="font-bold text-slate-700">
            {user?.firstName ? `${t('welcome')}, ${user.firstName}!` : t('myAccount')}
          </span>
          <UserButton afterSignOutUrl="/" />
        </div>
      );
    }
    return (
      <SignInButton mode="modal">
        <button className="w-full bg-indigo-600 text-white font-black px-5 py-4 rounded-2xl shadow-lg">
          {t('login')}
        </button>
      </SignInButton>
    );
  };

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

          <nav ref={navRef} className="hidden md:flex items-center space-x-1 lg:space-x-2 relative">
            {NAV_STRUCTURE.map(link => (
                link.children ? (
                    <div key={link.nameKey} className="relative">
                        <button onClick={() => handleDropdownToggle(link.nameKey)} className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium transition duration-200 px-3 py-2 rounded-md">
                            <span>{t(link.nameKey)}</span>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${openDropdown === link.nameKey ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === link.nameKey && (
                            <div className="absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-up-fast">
                                {link.children.map(child => (
                                    <button key={child.nameKey} onClick={() => handleNavClick(child.target as Page)} className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition duration-150">
                                        {t(child.nameKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <button key={link.nameKey} onClick={() => handleNavClick(link.target as Page)} className="text-slate-600 hover:text-indigo-600 font-medium transition duration-200 px-3 py-2 rounded-md">
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

          <div className="flex items-center space-x-4">
            <button onClick={toggleLanguage} className="hidden md:block text-slate-500 hover:bg-slate-100 font-bold px-3 py-2 rounded-md transition-colors">
              {language === 'ml' ? 'English' : 'മലയാളം'}
            </button>
            
            <div className="hidden md:block">
              {renderAuthControls()}
            </div>
            
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-600 hover:bg-slate-100">
                    {isMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 absolute w-full shadow-lg">
            <nav className="flex flex-col space-y-1">
                 {NAV_STRUCTURE.map((link) => (
                    <div key={link.nameKey}>
                        {link.children ? (
                            <>
                                <button onClick={() => handleDropdownToggle(link.nameKey)} className="w-full flex justify-between items-center text-slate-700 hover:bg-slate-100 text-left font-semibold p-3 rounded-md transition duration-200">
                                    <span>{t(link.nameKey)}</span>
                                    <ChevronDownIcon className={`h-5 w-5 transition-transform duration-200 ${openDropdown === link.nameKey ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === link.nameKey && (
                                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 ml-3">
                                        {link.children.map(child => (
                                            <button key={child.nameKey} onClick={() => handleNavClick(child.target as Page)} className="w-full text-left text-slate-600 hover:bg-slate-100 font-medium p-3 rounded-md transition duration-200">
                                                {t(child.nameKey)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                             <button 
                                onClick={() => handleNavClick(link.target as Page)}
                                className="w-full text-slate-700 hover:bg-slate-100 text-left font-semibold p-3 rounded-md transition duration-200"
                            >
                                {t(link.nameKey)}
                            </button>
                        )}
                    </div>
                ))}
                {isAdmin && (
                    <button onClick={() => handleNavClick('admin_panel')} className={mobileAdminButtonClasses}>
                         <ShieldCheckIcon className="h-5 w-5" />
                         <span>{t('nav.adminPanel')}</span>
                    </button>
                )}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                <button onClick={toggleLanguage} className="w-full text-slate-600 hover:bg-slate-100 font-bold px-3 py-3 rounded-md transition-colors">
                    Switch to {language === 'ml' ? 'English' : 'മലയാളം'}
                </button>
                {renderMobileAuthControls()}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;

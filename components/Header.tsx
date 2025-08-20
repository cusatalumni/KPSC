
import React, { useState } from 'react';
import { NAV_LINKS } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import type { Page } from '../App';
import type { User } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { StarIcon } from './icons/StarIcon';

interface HeaderProps {
    user: User | null;
    onNavigate: (page: Page) => void;
    onLogin: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <LogoIcon className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: "'Manjari', sans-serif"}}>കേരള പി.എസ്.സി ഗുരു</h1>
              <p className="text-sm text-sky-700 font-medium -mt-1">PSC Guidance Kerala</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <button 
                key={link.name} 
                onClick={() => onNavigate(link.target as Page)}
                className="text-slate-600 hover:text-sky-600 font-medium transition duration-200"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            {user ? (
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                  <UserCircleIcon className="h-9 w-9 text-slate-500" />
                   <span className="font-semibold text-slate-700">{user.name}</span>
                   <svg className={`w-4 h-4 text-slate-500 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-slate-700 border-b">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="px-4 py-3 border-b">
                      <div className={`flex items-center space-x-2 text-sm font-semibold p-2 rounded-md ${user.subscription === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                          <StarIcon className={`h-5 w-5 ${user.subscription === 'pro' ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>{user.subscription === 'pro' ? 'PRO അംഗം' : 'Free Plan'}</span>
                      </div>
                    </div>
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">ലോഗ് ഔട്ട്</button>
                  </div>
                )}
              </div>
            ) : (
               <button onClick={onLogin} className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 font-semibold px-4 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out">
                 ലോഗിൻ
               </button>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

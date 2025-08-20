
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { NAV_LINKS } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import type { Page } from '../App';

interface HeaderProps {
    onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <LogoIcon className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{fontFamily: "'Manjari', sans-serif"}}>കേരള പി.എസ്.സി ഗുരു</h1>
              <p className="text-sm text-indigo-700 font-medium -mt-1">PSC Guidance Kerala</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <button 
                key={link.name} 
                onClick={() => onNavigate(link.target as Page)}
                className="text-slate-600 hover:text-indigo-600 font-medium transition duration-200"
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out">
                  ലോഗിൻ
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

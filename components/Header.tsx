
import React from 'react';
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
              <h1 className="text-2xl font-bold text-gray-800" style={{fontFamily: "'Manjari', sans-serif"}}>കേരള പി.എസ്.സി ഗുരു</h1>
              <p className="text-sm text-blue-700 font-medium -mt-1">PSC Guidance Kerala</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {NAV_LINKS.map((link) => (
              <button 
                key={link.name} 
                onClick={() => onNavigate(link.target as Page)}
                className="text-gray-600 hover:text-blue-600 font-medium transition duration-200"
              >
                {link.name}
              </button>
            ))}
          </nav>
          <button className="hidden md:block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg hover:scale-105 transform transition duration-300 ease-in-out">
            ലോഗിൻ / രജിസ്റ്റർ
          </button>
          <button className="md:hidden text-gray-600">
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

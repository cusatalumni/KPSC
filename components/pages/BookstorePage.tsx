
import React from 'react';
import { BOOKSTORE_DATA } from '../../constants';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const BookstorePage: React.FC<PageProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">പുസ്തകശാല</h1>
        <p className="text-lg text-gray-600 mt-2">പി.എസ്.സി പഠനത്തിനായുള്ള മികച്ച പുസ്തകങ്ങൾ ഇവിടെനിന്നും തിരഞ്ഞെടുക്കാം.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {BOOKSTORE_DATA.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-all duration-300">
            <div className="h-64 overflow-hidden">
              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{book.author}</p>
              <a 
                href={book.amazonLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-auto w-full text-center bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200"
              >
                Amazon-ൽ വാങ്ങുക
              </a>
            </div>
          </div>
        ))}
      </div>
       <p className="text-center text-sm text-gray-500 mt-12 italic">
          ഒരു അഫിലിയേറ്റ് എന്ന നിലയിൽ, യോഗ്യതയുള്ള വാങ്ങലുകളിൽ നിന്ന് ഞങ്ങൾ വരുമാനം നേടുന്നു.
        </p>
    </div>
  );
};

export default BookstorePage;

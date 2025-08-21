import React, { useState, useEffect } from 'react';
import { getBooks } from '../../services/pscDataService';
import type { Book } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';

const BookCard: React.FC<{ book: Book }> = ({ book }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-all duration-300">
    <div className="h-64 overflow-hidden">
      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-slate-800">{book.title}</h3>
      <p className="text-sm text-slate-500 mb-4">{book.author}</p>
      <a 
        href={book.amazonLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto w-full text-center bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
      >
        Buy on Amazon
      </a>
    </div>
  </div>
);

const BookCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="h-64 bg-slate-200 animate-pulse"></div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="h-6 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="mt-auto h-10 bg-slate-300 rounded-lg animate-pulse"></div>
        </div>
    </div>
);

const BookstorePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        setError(t('error.fetchData'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [t]);

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>{t('backToDashboard')}</span>
      </button>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-800">
          {t('bookstore.title')}
          <span className="block text-2xl text-slate-500 mt-1 font-normal">Bookstore</span>
        </h1>
        <p className="text-lg text-slate-600 mt-2">{t('bookstore.subtitle')}</p>
      </header>
      
      {error && <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading 
          ? Array.from({ length: 8 }).map((_, index) => <BookCardSkeleton key={index} />)
          : books.map((book) => <BookCard key={book.id} book={book} />)
        }
      </div>

       <p className="text-center text-sm text-slate-500 mt-12 italic">
          {t('bookstore.disclosure')}
        </p>
    </div>
  );
};

export default BookstorePage;

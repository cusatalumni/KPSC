
import React, { useState, useEffect, useMemo } from 'react';
import { getBooks, generateBookCover } from '../../services/pscDataService';
import type { Book } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { StarIcon } from '../icons/StarIcon';

const BookCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-slate-100">
        <div className="h-72 bg-slate-200 animate-pulse"></div>
        <div className="p-5 flex flex-col flex-grow">
            <div className="h-6 bg-slate-200 rounded w-full mb-3 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="mt-auto h-12 bg-slate-300 rounded-xl animate-pulse"></div>
        </div>
    </div>
);

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    const [currentImageUrl, setCurrentImageUrl] = useState(book.imageUrl);
    const [isLoadingImage, setIsLoadingImage] = useState(!book.imageUrl);

    useEffect(() => {
        if (!book.imageUrl) {
            setIsLoadingImage(true);
            generateBookCover(book.title, book.author)
                .then(data => {
                    if (data.imageBase64) {
                        setCurrentImageUrl(`data:image/jpeg;base64,${data.imageBase64}`);
                    } else {
                        setCurrentImageUrl('https://via.placeholder.com/300x400.png?text=Cover+Not+Found');
                    }
                })
                .catch(err => {
                    console.error(`Failed to generate cover for ${book.title}`, err);
                    setCurrentImageUrl('https://via.placeholder.com/300x400.png?text=Cover+Error');
                })
                .finally(() => {
                    setIsLoadingImage(false);
                });
        }
    }, [book.imageUrl, book.title, book.author]);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col group transform hover:-translate-y-2 transition-all duration-500">
            <div className="relative h-72 overflow-hidden bg-slate-50 flex items-center justify-center">
                {isLoadingImage ? (
                    <div className="w-full h-full bg-slate-200 animate-pulse"></div>
                ) : (
                    <img 
                        src={currentImageUrl} 
                        alt={book.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                    />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 min-h-[3rem]">{book.title}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">{book.author}</p>
                
                <div className="mt-4 flex items-center space-x-1">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} className="h-3 w-3 text-orange-400 fill-current" />)}
                    <span className="text-[10px] text-slate-400 ml-1">(4.5/5)</span>
                </div>

                <a 
                    href={book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-6 w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                    <span>Buy on Amazon</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

const BookstorePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');

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

  const categories = ['All', 'LDC', 'LGS', 'Preliminary', 'Main', 'GK'];

  const filteredBooks = useMemo(() => {
    if (activeTab === 'All') return books;
    return books.filter(b => 
        b.title.toLowerCase().includes(activeTab.toLowerCase()) || 
        (activeTab === 'GK' && (b.title.includes('വിജ്ഞാനം') || b.title.toLowerCase().includes('gk')))
    );
  }, [books, activeTab]);

  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-bold hover:underline mb-8 transition-all hover:-translate-x-1">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>{t('backToDashboard')}</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
            <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                <BookOpenIcon className="h-6 w-6" />
                <span className="font-black tracking-widest uppercase text-xs">Premium Collection</span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">
                {t('bookstore.title')}
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl">{t('bookstore.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                        activeTab === cat 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>
      
      {error && <div className="text-center text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading 
          ? Array.from({ length: 8 }).map((_, index) => <BookCardSkeleton key={index} />)
          : filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
        }
      </div>

      {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <BookOpenIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-xl">No books found in this category.</p>
          </div>
      )}

      <div className="mt-16 bg-indigo-50 p-8 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
                <StarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
                <h4 className="text-2xl font-black text-slate-800">Affiliate Notice</h4>
                <p className="text-slate-600 font-medium">{t('bookstore.disclosure')}</p>
            </div>
        </div>
        <button onClick={onBack} className="bg-white text-indigo-600 font-black px-8 py-3 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all">
            Back to Home
        </button>
      </div>
    </div>
  );
};

export default BookstorePage;

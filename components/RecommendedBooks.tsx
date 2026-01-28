
import React, { useState, useEffect } from 'react';
import { getBooks } from '../services/pscDataService';
import type { Book } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

const BookItem: React.FC<{ book: Book }> = ({ book }) => {
    const { t } = useTranslation();
    const fallbackImage = 'https://via.placeholder.com/80x96.png?text=PSC+Guide';
    const currentImageUrl = book.imageUrl || fallbackImage;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
            <img src={currentImageUrl} alt={book.title} className="w-20 h-24 object-cover rounded-md flex-shrink-0 shadow-sm" referrerPolicy="no-referrer" />
            <div className="flex-1">
                <h3 className="font-bold text-slate-800 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-slate-500">{book.author}</p>
                <a 
                    href={book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-sm text-center bg-indigo-600 text-white font-bold px-3 py-1 rounded-md hover:bg-indigo-700 transition duration-200"
                >
                    {t('bookstore.buyOnAmazon')}
                </a>
            </div>
        </div>
    );
};


const RecommendedBooks: React.FC = () => {
  const { t } = useTranslation();
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const allBooks = await getBooks();
        setRecommended(allBooks.slice(0, 2)); // Take the first 2 books
      } catch (error) {
        console.error("Failed to fetch recommended books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (loading) {
    return (
        <section>
             <div className="h-8 w-1/2 rounded-md bg-slate-200 mb-4 animate-pulse"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
                        <div className="w-20 h-24 bg-slate-200 rounded-md animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                    </div>
                ))}
             </div>
        </section>
    );
  }
  
  if (recommended.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
        <BookOpenIcon className="h-7 w-7 text-indigo-500 mr-3" />
        {t('examPage.recommendedBooks')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommended.map(book => (
          <BookItem key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedBooks;

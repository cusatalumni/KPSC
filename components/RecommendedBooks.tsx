import React, { useState, useEffect } from 'react';
import { getBooks } from '../services/pscDataService';
import type { Book } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

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
    // Optional: add a loading skeleton here if desired
    return null;
  }
  
  if (recommended.length === 0) {
    return null; // Don't render the section if no books are found
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold text-slate-700 mb-4 flex items-center">
        <BookOpenIcon className="h-7 w-7 text-indigo-500 mr-3" />
        {t('examPage.recommendedBooks')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommended.map(book => (
          <div key={book.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
            <img src={book.imageUrl} alt={book.title} className="w-20 h-24 object-cover rounded-md" referrerPolicy="no-referrer" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{book.title}</h3>
              <p className="text-sm text-slate-500">{book.author}</p>
              <a 
                href={book.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-center bg-indigo-600 text-white font-bold px-3 py-1 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                {t('bookstore.buyOnAmazon')}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedBooks;

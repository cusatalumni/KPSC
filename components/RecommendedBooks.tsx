import React from 'react';
import { BOOKSTORE_DATA } from '../constants';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

const RecommendedBooks: React.FC = () => {
  const { t } = useTranslation();
  // Show a selection of books, e.g., the first two
  const recommended = BOOKSTORE_DATA.slice(0, 2);

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
import React, { useState, useEffect } from 'react';
import { getBooks, generateBookCover } from '../services/pscDataService';
import type { Book } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

const BookItem: React.FC<{ book: Book }> = ({ book }) => {
    const { t } = useTranslation();
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
                        setCurrentImageUrl('https://via.placeholder.com/80x96.png?text=No+Cover');
                    }
                })
                .catch(err => {
                    console.error(`Failed to generate cover for ${book.title}`, err);
                    setCurrentImageUrl('https://via.placeholder.com/80x96.png?text=Error');
                })
                .finally(() => {
                    setIsLoadingImage(false);
                });
        }
    }, [book.imageUrl, book.title, book.author]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
            {isLoadingImage ? (
                <div className="w-20 h-24 bg-slate-200 rounded-md animate-pulse flex-shrink-0"></div>
            ) : (
                <img src={currentImageUrl} alt={book.title} className="w-20 h-24 object-cover rounded-md flex-shrink-0 shadow-sm" referrerPolicy="no-referrer" />
            )}
            <div className="flex-1">
                <h3 className="font-bold text-slate-800">{book.title}</h3>
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
             <div className="h-8 w-3/4 rounded-md bg-slate-200 mb-4 animate-pulse"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="w-20 h-24 bg-slate-200 rounded-md animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse mt-2"></div>
                    </div>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
                    <div className="w-20 h-24 bg-slate-200 rounded-md animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse mt-2"></div>
                    </div>
                </div>
             </div>
        </section>
    );
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
          <BookItem key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedBooks;
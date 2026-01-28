
import React, { useState, useEffect } from 'react';
import { getBooks } from '../services/pscDataService';
import type { Book } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { useTranslation } from '../contexts/LanguageContext';

const BookOfTheDayWidget: React.FC = () => {
    const { t } = useTranslation();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const allBooks = await getBooks();
                if (allBooks.length > 0) {
                    setBook(allBooks[0]);
                }
            } catch (error) {
                console.error("Failed to fetch book of the day:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="flex space-x-4">
                    <div className="w-24 h-32 bg-slate-200 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-7 w-7 text-indigo-500" />
                <h4 className="text-xl font-bold text-slate-800">{t('bookOfTheDay.title')}</h4>
            </div>
            <div className="flex space-x-4 items-center">
                <img src={book.imageUrl || 'https://via.placeholder.com/96x128'} alt={book.title} className="w-24 h-32 object-cover rounded-md shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1">
                    <h5 className="font-bold text-slate-800 leading-tight line-clamp-2">{book.title}</h5>
                    <p className="text-sm text-slate-500 mb-3">{book.author}</p>
                    <a 
                      href={book.amazonLink} 
                      target="_blank" 
                      rel="noopener noreferrer sponsored" 
                      className="inline-block text-sm text-center bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition duration-200"
                    >
                        {t('bookstore.buyOnAmazon')}
                    </a>
                </div>
            </div>
        </div>
    );
};
export default BookOfTheDayWidget;

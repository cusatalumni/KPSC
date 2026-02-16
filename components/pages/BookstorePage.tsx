
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Book } from '../../types';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { useTranslation } from '../../contexts/LanguageContext';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { StarIcon } from '../icons/StarIcon';
import BookCover from '../BookCover';

const BookCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-slate-100 animate-pulse">
        <div className="h-72 bg-slate-200"></div>
        <div className="p-5 flex flex-col flex-grow">
            <div className="h-6 bg-slate-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="mt-auto h-12 bg-slate-300 rounded-xl"></div>
        </div>
    </div>
);

const BookCard: React.FC<{ book: Book }> = ({ book }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
            <div className="relative h-72 overflow-hidden bg-slate-50">
                <BookCover title={book.title} author={book.author} imageUrl={book.imageUrl} className="h-full w-full" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm z-20">
                    <StarIcon className="h-4 w-4 text-orange-400" />
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                    <h3 className="text-lg font-black text-slate-800 leading-tight line-clamp-2 min-h-[3rem]">{book.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{book.author}</p>
                </div>
                <div className="mt-2 flex items-center space-x-1">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} className="h-3 w-3 text-yellow-500 fill-current" />)}
                    <span className="text-[10px] text-slate-400 font-bold ml-1">(4.8/5)</span>
                </div>
                <a href={book.amazonLink} target="_blank" rel="noopener noreferrer sponsored" className="mt-6 w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-black py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">
                    <span>{t('bookstore.buyOnAmazon')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                </a>
            </div>
        </div>
    );
};

const BookstorePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
      if (loading || loadingMore || activeTab !== 'All') return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
              setOffset(prev => prev + 20);
          }
      });
      if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, activeTab]);

  const fetchBooks = useCallback(async (currentOffset: number) => {
    if (currentOffset === 0) setLoading(true);
    else setLoadingMore(true);
    
    try {
        const res = await fetch(`/api/data?type=books&offset=${currentOffset}&limit=20`);
        const data = await res.json();
        if (Array.isArray(data)) {
            if (data.length < 20) setHasMore(false);
            setBooks(prev => currentOffset === 0 ? data : [...prev, ...data]);
        }
    } catch (err) {
        setError(t('error.fetchData'));
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  }, [t]);

  useEffect(() => { fetchBooks(offset); }, [offset, fetchBooks]);

  const categories = ['All', 'LDC', 'Degree Level', 'LGS', 'GK', 'History', 'Maths', 'English', 'Malayalam'];

  const filteredBooks = useMemo(() => {
    if (activeTab === 'All') return books;
    return books.filter(b => {
        const title = b.title.toLowerCase();
        const tab = activeTab.toLowerCase();
        if (tab === 'ldc') return title.includes('ldc') || title.includes('lower division clerk');
        if (tab === 'degree level') return title.includes('degree') || title.includes('university assistant') || title.includes('secretariat');
        if (tab === 'lgs') return title.includes('lgs') || title.includes('last grade');
        if (tab === 'gk') return title.includes('gk') || title.includes('വിജ്ഞാനം') || title.includes('renaissance');
        if (tab === 'history') return title.includes('history') || title.includes('ചരിത്രം');
        if (tab === 'maths') return title.includes('maths') || title.includes('quantitative') || title.includes('reasoning') || title.includes('ഗണിതം');
        if (tab === 'english') return title.includes('english') || title.includes('grammar') || title.includes('oxford');
        if (tab === 'malayalam') return title.includes('malayalam') || title.includes('മലയാളം') || title.includes('sahithyam');
        return title.includes(tab);
    });
  }, [books, activeTab]);

  return (
    <div className="animate-fade-in pb-20">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-10 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>{t('backToDashboard')}</span>
      </button>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div className="space-y-3">
            <div className="flex items-center space-x-3 text-indigo-600">
                <BookOpenIcon className="h-6 w-6" />
                <span className="font-black tracking-widest uppercase text-xs">Official Bookstore</span>
            </div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight leading-none">{t('bookstore.title')}</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">{t('bookstore.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
                <button key={cat} onClick={() => setActiveTab(cat)} className={`px-6 py-2.5 rounded-full font-black text-sm transition-all ${activeTab === cat ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>{cat}</button>
            ))}
        </div>
      </div>
      
      {error && <div className="text-center text-red-500 bg-red-50 p-10 rounded-3xl border border-red-100 shadow-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {books.length === 0 && loading 
          ? Array.from({ length: 8 }).map((_, idx) => <BookCardSkeleton key={idx} />)
          : filteredBooks.map((book, idx) => <BookCard key={book.id || idx} book={book} />)
        }
      </div>

      {loadingMore && (
          <div className="py-16 text-center flex justify-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      )}
      
      <div ref={lastElementRef} className="h-20"></div>

      {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <BookOpenIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-black text-2xl">No books found in this category.</p>
          </div>
      )}
    </div>
  );
};

export default BookstorePage;

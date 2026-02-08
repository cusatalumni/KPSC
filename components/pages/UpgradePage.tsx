
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { StarIcon } from '../icons/StarIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { subscriptionService } from '../../services/subscriptionService';

interface PageProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const PremiumFeature: React.FC<{ icon: any, title: string, desc: string, color: string }> = ({ icon: Icon, title, desc, color }) => (
    <div className="flex items-start space-x-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
        <div className={`p-3 rounded-2xl ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <h4 className="text-white font-black text-sm tracking-tight group-hover:text-amber-400 transition-colors">{title}</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const UpgradePage: React.FC<PageProps> = ({ onBack, onUpgrade }) => {
  const { user, isSignedIn } = useUser();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isSignedIn && user?.id) {
        setIsPro(subscriptionService.getSubscriptionStatus(user.id) === 'pro');
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    if (isSignedIn && !isPro && (window as any).paypal && paypalRef.current && !paymentSuccess) {
      (window as any).paypal.Buttons({
        style: { shape: 'pill', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { currency_code: 'INR', value: '499.00' },
              description: 'Kerala PSC Guru - Annual Pro Membership'
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsProcessing(true);
          await actions.order.capture();
          if (user?.id) {
            subscriptionService.upgradeToPro(user.id);
            setPaymentSuccess(true);
            setTimeout(() => { setIsPro(true); setPaymentSuccess(false); }, 3000);
          }
          setIsProcessing(false);
        }
      }).render(paypalRef.current);
    }
  }, [isSignedIn, isPro, paymentSuccess, user?.id]);

  // post-upgrade success screen
  if (paymentSuccess) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <CheckCircleIcon className="h-12 w-12" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white">അഭിനന്ദനങ്ങൾ!</h1>
              <p className="text-slate-500 font-bold">നിങ്ങൾ ഇപ്പോൾ ഒരു PSC GURU PRO അംഗമാണ്.</p>
              <p className="text-indigo-600 font-black animate-pulse">Setting up your dashboard...</p>
          </div>
      );
  }

  // View 1: Member Dashboard (For Pro Users)
  if (isPro) {
      return (
          <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
              <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black mb-8"><ChevronLeftIcon className="h-5 w-5" /><span>Back to Dashboard</span></button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-8">
                      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border-b-8 border-amber-500 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10"><StarIcon className="h-32 w-32" /></div>
                          <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="w-24 h-24 rounded-full border-4 border-amber-400 p-1 mb-4">
                                  <img src={user?.imageUrl} className="w-full h-full rounded-full object-cover" />
                              </div>
                              <h2 className="text-2xl font-black">{user?.firstName || 'Elite Member'}</h2>
                              <div className="bg-amber-400 text-slate-900 text-[10px] font-black px-4 py-1 rounded-full mt-2 uppercase tracking-widest">PRO MEMBER</div>
                              <div className="mt-8 pt-8 border-t border-white/10 w-full text-left space-y-4">
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Member ID</p>
                                      <p className="font-mono text-sm">{user?.id.slice(-8).toUpperCase()}</p>
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                                      <p className="text-emerald-400 font-bold">Active till Jan 2026</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Your Pro Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900 shadow-xl flex items-center space-x-4">
                              <div className="bg-indigo-100 p-4 rounded-2xl"><AcademicCapIcon className="h-6 w-6 text-indigo-600" /></div>
                              <div><h4 className="font-black text-sm">Priority Support</h4><p className="text-[10px] text-slate-400">Direct access to experts</p></div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-amber-100 dark:border-amber-900 shadow-xl flex items-center space-x-4">
                              <div className="bg-amber-100 p-4 rounded-2xl"><ShieldCheckIcon className="h-6 w-6 text-amber-600" /></div>
                              <div><h4 className="font-black text-sm">Rank Predictor</h4><p className="text-[10px] text-slate-400">See your live standing</p></div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-900 shadow-xl flex items-center space-x-4">
                              <div className="bg-emerald-100 p-4 rounded-2xl"><BookOpenIcon className="h-6 w-6 text-emerald-600" /></div>
                              <div><h4 className="font-black text-sm">PDF Library</h4><p className="text-[10px] text-slate-400">Offline study materials</p></div>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900 shadow-xl flex items-center space-x-4">
                              <div className="bg-rose-100 p-4 rounded-2xl"><SparklesIcon className="h-6 w-6 text-rose-600" /></div>
                              <div><h4 className="font-black text-sm">AI Analytics</h4><p className="text-[10px] text-slate-400">Personalized weak point analysis</p></div>
                          </div>
                      </div>
                      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl">
                          <div>
                              <h4 className="text-xl font-black">All Mock Tests Unlocked!</h4>
                              <p className="text-xs opacity-70 mt-1">Start practicing with PSC-level questions now.</p>
                          </div>
                          <button onClick={() => window.location.hash = '#mock_test_home'} className="bg-white text-indigo-600 font-black px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all">Go to Exams</button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // View 2: Sales/Upgrade Landing Page (For Free Users)
  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
       <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black mb-8 group"><ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" /><span>Back to Home</span></button>
      
      <div className="premium-gradient rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-10 md:p-16 space-y-10 relative z-10">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full mb-6">
                        <StarIcon className="h-4 w-4 text-amber-400" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Premium Membership</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">പഠനം ഇനി <span className="gold-text">നെക്സ്റ്റ് ലെവൽ!</span></h1>
                    <p className="text-slate-400 text-lg mt-6 font-medium leading-relaxed">നിങ്ങളുടെ സർക്കാർ ജോലി എന്ന ലക്ഷ്യത്തിലേക്ക് ഒരു പടി കൂടി അടുക്കാൻ പ്രോ പ്ലാൻ സഹായിക്കുന്നു.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PremiumFeature icon={AcademicCapIcon} title="500+ Mock Tests" desc="Advanced level syllabus based testing." color="bg-indigo-600" />
                    <PremiumFeature icon={SparklesIcon} title="Unlimited AI Notes" desc="Instant generation without daily limits." color="bg-amber-600" />
                    <PremiumFeature icon={BookOpenIcon} title="PDF Downloads" desc="Export any material for offline study." color="bg-emerald-600" />
                    <PremiumFeature icon={ShieldCheckIcon} title="Ad-Free Portal" desc="Distraction free learning experience." color="bg-rose-600" />
                </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl p-10 md:p-16 flex flex-col items-center justify-center text-center border-l border-white/10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="bg-indigo-600/20 border border-indigo-400/30 p-8 rounded-[2.5rem] shadow-2xl">
                        <p className="text-indigo-300 font-black text-xs uppercase tracking-widest mb-2">Annual Pass</p>
                        <h2 className="text-6xl font-black text-white my-2">₹499</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Valid for 1 Year • All Features</p>
                        <div className="h-0.5 w-12 bg-indigo-500 mx-auto my-6"></div>
                        <ul className="text-left space-y-3 mb-8">
                            {["Priority Support", "Rank Predictor", "Early Access Updates"].map((it, idx) => (
                                <li key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-300"><CheckCircleIcon className="h-4 w-4 text-emerald-400" /><span>{it}</span></li>
                            ))}
                        </ul>
                    </div>

                    {!isSignedIn ? (
                        <div className="space-y-4">
                            <p className="text-amber-400 font-black text-sm">ലോഗിൻ ചെയ്ത ശേഷം മാത്രം സബ്‌സ്‌ക്രിപ്‌ഷൻ എടുക്കുക.</p>
                            <button onClick={() => window.location.hash = '#dashboard'} className="w-full bg-white text-indigo-900 font-black py-4 rounded-2xl shadow-xl">Login to Continue</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Checkout with PayPal</p>
                            <div id="paypal-button-container" ref={paypalRef} className="w-full"></div>
                            {isProcessing && <div className="flex items-center justify-center space-x-3 text-white font-black animate-pulse"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Processing...</span></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;

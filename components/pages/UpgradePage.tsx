
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { StarIcon } from '../icons/StarIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { subscriptionService } from '../../services/subscriptionService';

interface PageProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const PremiumFeature: React.FC<{ icon: any, title: string, desc: string, color: string }> = ({ icon: Icon, title, desc, color }) => (
    <div className="flex items-start space-x-4 p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-indigo-500/50 transition-all group shadow-xl">
        <div className={`p-3.5 rounded-2xl ${color} shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
            <h4 className="text-white font-black text-sm tracking-tight group-hover:text-amber-300 transition-colors">{title}</h4>
            <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed font-medium">{desc}</p>
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

  if (paymentSuccess) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in px-6">
              <div className="w-28 h-28 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-bounce">
                  <CheckCircleIcon className="h-14 w-14" />
              </div>
              <div className="space-y-3">
                  <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">അഭിനന്ദനങ്ങൾ!</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-sm mx-auto">നിങ്ങൾ ഇപ്പോൾ ഒരു PSC GURU PRO അംഗമാണ്. എല്ലാ പ്രീമിയം ഫീച്ചറുകളും അൺലോക്ക് ചെയ്തിരിക്കുന്നു.</p>
              </div>
              <div className="flex items-center space-x-3 text-indigo-600 font-black animate-pulse uppercase tracking-[0.2em] text-xs bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-full">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span>Setting up your pro dashboard</span>
              </div>
          </div>
      );
  }

  if (isPro) {
      return (
          <div className="max-w-6xl mx-auto pb-20 animate-fade-in px-4">
              <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black mb-10 hover:underline"><ChevronLeftIcon className="h-5 w-5" /><span>Back to Dashboard</span></button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1">
                      <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl border-b-[12px] border-amber-500 relative overflow-hidden ring-1 ring-white/10">
                          <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><StarIcon className="h-48 w-48" /></div>
                          <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="w-28 h-28 rounded-full border-4 border-amber-400 p-1 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                  <img src={user?.imageUrl} className="w-full h-full rounded-full object-cover bg-slate-800" />
                              </div>
                              <h2 className="text-3xl font-black tracking-tight">{user?.firstName || 'Elite Member'}</h2>
                              <div className="bg-amber-400 text-slate-950 text-[11px] font-black px-6 py-2 rounded-full mt-4 uppercase tracking-[0.2em] shadow-lg">PRO MEMBER</div>
                              <div className="mt-10 pt-10 border-t border-white/10 w-full text-left space-y-6">
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Membership ID</p>
                                      <p className="font-mono text-sm text-slate-200 bg-white/5 p-3 rounded-xl border border-white/5">{user?.id.slice(-12).toUpperCase()}</p>
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Current Status</p>
                                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                          <p className="text-emerald-400 font-black flex items-center space-x-2 text-sm">
                                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                              <span>Active • Lifetime Access</span>
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-2 space-y-10">
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Your Exclusive Pro Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                              { icon: AcademicCapIcon, title: "Priority Support", desc: "Expert help within 2 hours", color: "bg-indigo-600" },
                              { icon: ShieldCheckIcon, title: "Rank Predictor", desc: "Live exam ranking analysis", color: "bg-amber-500" },
                              { icon: BookOpenIcon, title: "PDF Export", desc: "Download papers for offline", color: "bg-emerald-600" },
                              { icon: SparklesIcon, title: "AI Weakpoint Fix", desc: "Custom study plan generation", color: "bg-rose-600" }
                          ].map((item, i) => (
                              <div key={i} className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-xl flex items-center space-x-5 group hover:border-indigo-500 transition-all">
                                  <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>{React.createElement(item.icon, { className: "h-6 w-6" })}</div>
                                  <div><h4 className="font-black text-base dark:text-white">{item.title}</h4><p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-wider">{item.desc}</p></div>
                              </div>
                          ))}
                      </div>
                      <div className="bg-indigo-600 p-10 md:p-14 rounded-[3.5rem] text-white flex flex-col md:row items-center justify-between shadow-2xl relative overflow-hidden ring-4 ring-indigo-500/20">
                          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                          <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 space-y-2">
                              <h4 className="text-3xl font-black tracking-tight">All Mock Tests Unlocked!</h4>
                              <p className="text-base opacity-80 font-bold">You have unlimited access to our entire premium question bank.</p>
                          </div>
                          <button onClick={() => window.location.hash = '#mock_test_home'} className="relative z-10 bg-white text-indigo-600 font-black px-12 py-5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]">Go to Exams</button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in px-4">
       <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black mb-10 group"><ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" /><span>Back to Home</span></button>
      
      <div className="bg-slate-950 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden border-2 border-white/5 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
            <div className="p-12 md:p-20 space-y-12">
                <div className="space-y-8">
                    <div className="inline-flex items-center space-x-3 bg-amber-400/10 border-2 border-amber-400/20 px-5 py-2.5 rounded-full">
                        <StarIcon className="h-5 w-5 text-amber-400 shadow-sm" /><span className="text-[11px] font-black text-amber-400 uppercase tracking-[0.2em]">Premium Membership</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">പഠനം ഇനി <br/><span className="gold-text">നെക്സ്റ്റ് ലെവൽ!</span></h1>
                    <p className="text-slate-400 text-xl font-bold leading-relaxed max-w-md">നിങ്ങളുടെ സർക്കാർ ജോലി എന്ന ലക്ഷ്യത്തിലേക്ക് ഒരു പടി കൂടി അടുക്കാൻ പ്രോ പ്ലാൻ സഹായിക്കുന്നു.</p>
                </div>
                <div className="grid grid-cols-1 gap-5">
                    <PremiumFeature icon={AcademicCapIcon} title="500+ Premium Mock Tests" desc="Advanced level syllabus based testing with negative marking." color="bg-indigo-600" />
                    <PremiumFeature icon={SparklesIcon} title="Unlimited AI Study Notes" desc="Instantly generate notes for any PSC topic without limits." color="bg-amber-600" />
                    <PremiumFeature icon={BookOpenIcon} title="PDF Downloads & Offline" desc="Export any material or result as PDF for offline revision." color="bg-emerald-600" />
                    <PremiumFeature icon={ShieldCheckIcon} title="Zero Ads Experience" desc="100% focused learning environment with no distractions." color="bg-rose-600" />
                </div>
            </div>
            
            <div className="bg-white/5 p-12 md:p-20 flex flex-col items-center justify-center text-center border-l border-white/5">
                <div className="w-full max-w-sm space-y-10">
                    <div className="bg-slate-900 border-2 border-indigo-500/30 p-12 rounded-[3.5rem] shadow-2xl relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl">Best Value</div>
                        <p className="text-indigo-300 font-black text-xs uppercase tracking-[0.3em] mb-4">Annual Pass</p>
                        <h2 className="text-7xl font-black text-white my-4 tracking-tighter">₹499</h2>
                        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">1 Full Year Access</p>
                        <div className="h-1 w-16 bg-amber-400 mx-auto my-10 rounded-full"></div>
                        <ul className="text-left space-y-5 mb-4">
                            {["Priority Expert Support", "AI Rank Predictor", "Early Access to Updates"].map((it, idx) => (
                                <li key={idx} className="flex items-center space-x-4 text-xs font-black text-slate-200">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                                    <span>{it}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!isSignedIn ? (
                        <div className="space-y-6">
                            <div className="bg-amber-400/10 py-5 px-6 rounded-3xl border-2 border-amber-400/20">
                                <p className="text-amber-400 font-black text-sm">ലോഗിൻ ചെയ്ത ശേഷം പ്ലാൻ തിരഞ്ഞെടുക്കുക.</p>
                            </div>
                            <button onClick={() => window.location.hash = '#dashboard'} className="w-full bg-white text-slate-950 font-black py-6 rounded-3xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-xs">Login to Continue</button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em]">Secure Checkout via PayPal</p>
                            <div id="paypal-button-container" ref={paypalRef} className="w-full drop-shadow-2xl"></div>
                            {isProcessing && (
                                <div className="flex items-center justify-center space-x-4 text-white font-black animate-pulse bg-white/5 py-5 rounded-3xl border border-white/5">
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs uppercase tracking-widest">Processing Secure Payment...</span>
                                </div>
                            )}
                            <div className="flex items-center justify-center space-x-4 opacity-40">
                                <ShieldCheckIcon className="h-12 w-12 text-slate-400" />
                                <div className="text-left">
                                    <p className="text-[10px] text-white font-black uppercase tracking-widest">SSL Encrypted</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Industry Standard Security</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-12 opacity-50">Kerala PSC Guru Premium Experience • 2025</p>
    </div>
  );
};

export default UpgradePage;

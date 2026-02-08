
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { StarIcon } from '../icons/StarIcon';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isSignedIn && (window as any).paypal && paypalRef.current && !paymentSuccess) {
      (window as any).paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
        },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'INR',
                value: '499.00'
              },
              description: 'Kerala PSC Guru - Annual Pro Membership'
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsProcessing(true);
          const order = await actions.order.capture();
          console.log("Payment Successful:", order);
          
          if (user?.id) {
            subscriptionService.upgradeToPro(user.id);
            setPaymentSuccess(true);
            setTimeout(() => {
                window.location.hash = '#dashboard';
                window.location.reload();
            }, 3000);
          }
          setIsProcessing(false);
        },
        onError: (err: any) => {
          console.error("PayPal Error:", err);
          alert("Payment failed. Please try again.");
        }
      }).render(paypalRef.current);
    }
  }, [isSignedIn, paymentSuccess, user?.id]);

  if (paymentSuccess) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <CheckCircleIcon className="h-12 w-12" />
              </div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white">നിങ്ങൾ ഇപ്പോൾ ഒരു PRO അംഗമാണ്!</h1>
              <p className="text-slate-500 font-bold">പേയ്‌മെന്റ് വിജയകരമായി പൂർത്തിയായി. എല്ലാ പ്രീമിയം ഫീച്ചറുകളും ഇപ്പോൾ ലഭ്യമാണ്.</p>
              <p className="text-indigo-600 font-black animate-pulse">Redirecting to Dashboard...</p>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
       <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-black hover:underline mb-8 group">
        <ChevronLeftIcon className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </button>
      
      <div className="premium-gradient rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 relative">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Content: Features */}
            <div className="p-10 md:p-16 space-y-10 relative z-10">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-full mb-6">
                        <StarIcon className="h-4 w-4 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Premium Membership</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                        പഠനം ഇനി <span className="gold-text">നെക്സ്റ്റ് ലെവൽ!</span>
                    </h1>
                    <p className="text-slate-400 text-lg mt-6 font-medium leading-relaxed">
                        നിങ്ങളുടെ സർക്കാർ ജോലി എന്ന ലക്ഷ്യത്തിലേക്ക് ഒരു പടി കൂടി അടുക്കാൻ പ്രോ പ്ലാൻ സഹായിക്കുന്നു.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PremiumFeature 
                        icon={AcademicCapIcon} 
                        title="500+ Mock Tests" 
                        desc="Advanced level syllabus based testing."
                        color="bg-indigo-600"
                    />
                    <PremiumFeature 
                        icon={SparklesIcon} 
                        title="Unlimited AI Notes" 
                        desc="Instant generation without daily limits."
                        color="bg-amber-600"
                    />
                    <PremiumFeature 
                        icon={BookOpenIcon} 
                        title="PDF Downloads" 
                        desc="Export any material for offline study."
                        color="bg-emerald-600"
                    />
                    <PremiumFeature 
                        icon={ShieldCheckIcon} 
                        title="Ad-Free Portal" 
                        desc="Distraction free learning experience."
                        color="bg-rose-600"
                    />
                </div>
            </div>
            
            {/* Right Content: Payment Card */}
            <div className="bg-white/5 backdrop-blur-xl p-10 md:p-16 flex flex-col items-center justify-center text-center border-l border-white/10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="bg-indigo-600/20 border border-indigo-400/30 p-8 rounded-[2.5rem] shadow-2xl">
                        <p className="text-indigo-300 font-black text-xs uppercase tracking-widest mb-2">Annual Pass</p>
                        <h2 className="text-6xl font-black text-white my-2">₹499</h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Valid for 1 Year • All Features</p>
                        
                        <div className="h-0.5 w-12 bg-indigo-500 mx-auto my-6"></div>
                        
                        <ul className="text-left space-y-3 mb-8">
                            {["Priority Support", "Rank Predictor", "Early Access Updates"].map((it, idx) => (
                                <li key={idx} className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                                    <span>{it}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!isSignedIn ? (
                        <div className="space-y-4">
                            <p className="text-amber-400 font-black text-sm">ലോഗിൻ ചെയ്ത ശേഷം മാത്രം സബ്‌സ്‌ക്രിപ്‌ഷൻ എടുക്കുക.</p>
                            <button onClick={() => window.location.hash = '#dashboard'} className="w-full bg-white text-indigo-900 font-black py-4 rounded-2xl shadow-xl">Go to Dashboard to Login</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col space-y-4">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Checkout with PayPal</p>
                                <div id="paypal-button-container" ref={paypalRef} className="w-full"></div>
                                {isProcessing && (
                                    <div className="flex items-center justify-center space-x-3 text-white font-black animate-pulse">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing Payment...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-center space-x-4 opacity-50">
                                <ShieldCheckIcon className="h-10 w-10 text-slate-400" />
                                <div className="text-left">
                                    <p className="text-[10px] text-white font-black uppercase">Secure Payment</p>
                                    <p className="text-[9px] text-slate-400 font-medium">SSL Encrypted Transaction</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="mt-12 text-center text-slate-400 text-xs font-medium max-w-2xl mx-auto px-6">
          <p>By upgrading, you agree to our <a href="#terms" className="text-indigo-600 hover:underline">Terms of Service</a>. Membership starts immediately upon successful payment. For support, contact info@kpscguru.com</p>
      </div>
    </div>
  );
};

export default UpgradePage;

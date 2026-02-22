
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const AboutUsPage: React.FC<PageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <div className="space-y-6 text-lg leading-relaxed text-slate-700">
        <h1 className="text-4xl font-bold text-slate-800 border-b pb-4">
          ഞങ്ങളെക്കുറിച്ച്
          <span className="block text-2xl text-slate-500 mt-1 font-normal">About Us</span>
        </h1>
        <p>
          'കേരള പി.എസ്.സി ഗുരു'-വിലേക്ക് സ്വാഗതം! കേരള പബ്ലിക് സർവീസ് കമ്മീഷൻ (PSC) പരീക്ഷകൾക്ക് തയ്യാറെടുക്കുന്ന ഉദ്യോഗാർത്ഥികൾക്കായി ഒരു സമ്പൂർണ്ണ ഡിജിറ്റൽ പഠനസഹായി ഒരുക്കുക എന്ന ലക്ഷ്യത്തോടെയാണ് ഞങ്ങൾ ഈ പ്ലാറ്റ്ഫോം ആരംഭിച്ചത്. സർക്കാർ ജോലി എന്ന നിങ്ങളുടെ സ്വപ്നം സാക്ഷാത്കരിക്കാൻ ആവശ്യമായ ഏറ്റവും മികച്ച പരിശീലനവും വിഭവങ്ങളും നൽകാൻ ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">ഞങ്ങളുടെ ലക്ഷ്യം</h2>
        <p>
          കേരളത്തിലെ ആയിരക്കണക്കിന് ഉദ്യോഗാർത്ഥികൾക്ക് ഉയർന്ന നിലവാരമുള്ള പഠന സാമഗ്രികൾ, കൃത്യമായ പരിശീലന പരീക്ഷകൾ, ഏറ്റവും പുതിയ വിവരങ്ങൾ എന്നിവ എളുപ്പത്തിൽ ലഭ്യമാക്കുക എന്നതാണ് ഞങ്ങളുടെ പ്രധാന ലക്ഷ്യം. സാങ്കേതികവിദ്യയുടെ സഹായത്തോടെ പഠനം കൂടുതൽ കാര്യക്ഷമവും രസകരവുമാക്കാൻ ഞങ്ങൾ ശ്രമിക്കുന്നു.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">എന്തുകൊണ്ട് ഞങ്ങൾ?</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><span className="font-semibold">വിദഗ്ദ്ധർ തയ്യാറാക്കിയ ഉള്ളടക്കം:</span> ഓരോ വിഷയത്തിലെയും വിദഗ്ദ്ധരായ അധ്യാപകരാണ് ഞങ്ങളുടെ പഠന സാമഗ്രികളും ചോദ്യങ്ങളും തയ്യാറാക്കുന്നത്.</li>
          <li><span className="font-semibold">സമഗ്രമായ കവറേജ്:</span> എൽഡിസി, എൽജിഎസ്, പോലീസ് കോൺസ്റ്റബിൾ തുടങ്ങി എല്ലാ പ്രധാനപ്പെട്ട PSC പരീക്ഷകൾക്കും ഞങ്ങൾ പരിശീലനം നൽകുന്നു.</li>
          <li><span className="font-semibold">പുതിയ പരീക്ഷാ രീതി:</span> മാറുന്ന പരീക്ഷാ രീതികൾക്കനുസരിച്ച് ഞങ്ങളുടെ ഉള്ളടക്കം നിരന്തരം നവീകരിക്കുന്നു.</li>
          <li><span className="font-semibold">എളുപ്പത്തിൽ ഉപയോഗിക്കാം:</span> ആർക്കും എളുപ്പത്തിൽ ഉപയോഗിക്കാൻ കഴിയുന്ന ലളിതമായ ഡിസൈനാണ് ഞങ്ങളുടെ വെബ്സൈറ്റിന്.</li>
        </ul>
        <p>
          നിങ്ങളുടെ വിജയമാണ് ഞങ്ങളുടെ പ്രചോദനം. ഞങ്ങളോടൊപ്പം ചേരൂ, നിങ്ങളുടെ സർക്കാർ ജോലി എന്ന ലക്ഷ്യത്തിലേക്ക് ഒരുമിച്ച് മുന്നേറാം.
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;
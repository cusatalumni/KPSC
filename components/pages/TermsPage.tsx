
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const TermsPage: React.FC<PageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <div className="space-y-6 text-base leading-relaxed text-slate-700">
        <h1 className="text-4xl font-bold text-slate-800 border-b pb-4">
          നിബന്ധനകളും വ്യവസ്ഥകളും
          <span className="block text-2xl text-slate-500 mt-1 font-normal">Terms & Conditions</span>
        </h1>
        <p>
          'കേരള പി.എസ്.സി ഗുരു' വെബ്സൈറ്റ് ഉപയോഗിക്കുന്നതിന് മുമ്പ് ദയവായി ഈ നിബന്ധനകളും വ്യവസ്ഥകളും ശ്രദ്ധാപൂർവ്വം വായിക്കുക. ഈ വെബ്സൈറ്റ് ഉപയോഗിക്കുന്നതിലൂടെ, ഈ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുന്നു.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">1. ഉപയോഗത്തിനുള്ള അനുമതി</h2>
        <p>
          ഈ വെബ്സൈറ്റിലെ വിവരങ്ങൾ വ്യക്തിഗതവും വാണിജ്യേതരവുമായ ഉപയോഗത്തിന് മാത്രമുള്ളതാണ്. ഉള്ളടക്കം പകർത്താനോ, പരിഷ്കരിക്കാനോ, വിതരണം ചെയ്യാനോ അനുവാദമില്ല.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">2. ഉള്ളടക്കത്തിന്റെ കൃത്യത</h2>
        <p>
          ഞങ്ങൾ നൽകുന്ന വിവരങ്ങൾ ഏറ്റവും കൃത്യതയുള്ളതാക്കാൻ ശ്രമിക്കുന്നുണ്ടെങ്കിലും, അതിൽ പിഴവുകളോ കാലഹരണപ്പെട്ട വിവരങ്ങളോ ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. അതിനാൽ, ഔദ്യോഗിക അറിയിപ്പുകൾക്കായി കേരള PSC-യുടെ വെബ്സൈറ്റ് സന്ദർശിക്കാൻ ശുപാർശ ചെയ്യുന്നു.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">3. ബാഹ്യ ലിങ്കുകൾ</h2>
        <p>
          ഞങ്ങളുടെ വെബ്സൈറ്റിൽ മറ്റ് വെബ്സൈറ്റുകളിലേക്കുള്ള ലിങ്കുകൾ അടങ്ങിയിരിക്കാം. ആ വെബ്സൈറ്റുകളുടെ ഉള്ളടക്കത്തിനോ സ്വകാര്യതാ നയങ്ങൾക്കോ ഞങ്ങൾ ഉത്തരവാദികളല്ല.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">4. ബാധ്യതയുടെ പരിമിതി</h2>
        <p>
          ഈ വെബ്സൈറ്റ് ഉപയോഗിക്കുന്നതിലൂടെ ഉണ്ടാകുന്ന ഏതെങ്കിലും തരത്തിലുള്ള നഷ്ടങ്ങൾക്ക് 'കേരള പി.എസ്.സി ഗുരു' ഉത്തരവാദിയായിരിക്കില്ല.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">5. മാറ്റങ്ങൾ</h2>
        <p>
          ഈ നിബന്ധനകളിലും വ്യവസ്ഥകളിലും എപ്പോൾ വേണമെങ്കിലും മാറ്റം വരുത്താനുള്ള അവകാശം ഞങ്ങളിൽ നിക്ഷിപ്തമാണ്. മാറ്റങ്ങൾ ഈ പേജിൽ പ്രസിദ്ധീകരിക്കും.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
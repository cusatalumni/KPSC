
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const DisclosurePage: React.FC<PageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <div className="space-y-6 text-lg leading-relaxed text-slate-700">
        <h1 className="text-4xl font-bold text-slate-800 border-b pb-4">അഫിലിയേറ്റ് വെളിപ്പെടുത്തൽ</h1>
        <p>
          ഈ വെബ്സൈറ്റിലെ ചില ലിങ്കുകൾ അഫിലിയേറ്റ് ലിങ്കുകളാണ്. ഇതിനർത്ഥം, നിങ്ങൾ ആ ലിങ്കിൽ ക്ലിക്ക് ചെയ്ത് ഒരു ഉൽപ്പന്നം വാങ്ങുകയാണെങ്കിൽ, നിങ്ങൾക്ക് അധികച്ചെലവില്ലാതെ ഞങ്ങൾക്ക് ഒരു ചെറിയ കമ്മീഷൻ ലഭിച്ചേക്കാം.
        </p>
        <p>
          ഞങ്ങളുടെ വെബ്സൈറ്റായ 'കേരള പി.എസ്.സി ഗുരു', Amazon Services LLC Associates Program-ൽ പങ്കാളിയാണ്. ഇതൊരു അഫിലിയേറ്റ് പരസ്യ പരിപാടിയാണ്, വെബ്സൈറ്റുകൾക്ക് പരസ്യം നൽകുന്നതിലൂടെയും Amazon.in-ലേക്ക് ലിങ്ക് ചെയ്യുന്നതിലൂടെയും പരസ്യ ഫീസ് നേടാനുള്ള ഒരു മാർഗ്ഗം നൽകുന്നതിനായി രൂപകൽപ്പന ചെയ്തിട്ടുള്ളതാണ്.
        </p>
        <p>
          ഞങ്ങൾ ശുപാർശ ചെയ്യുന്ന ഉൽപ്പന്നങ്ങളും സേവനങ്ങളും ഞങ്ങൾ വിശ്വസിക്കുന്നതും ഞങ്ങളുടെ ഉപയോക്താക്കൾക്ക് മൂല്യവത്തായതാണെന്ന് കരുതുന്നവയുമാണ്. ഈ കമ്മീഷനുകൾ ഞങ്ങളുടെ വെബ്സൈറ്റ് പ്രവർത്തിപ്പിക്കുന്നതിനും നിങ്ങൾക്ക് ഉയർന്ന നിലവാരമുള്ള ഉള്ളടക്കം നൽകുന്നതിനും ഞങ്ങളെ സഹായിക്കുന്നു.
        </p>
        <p>
          നിങ്ങളുടെ പിന്തുണയെ ഞങ്ങൾ വളരെയധികം വിലമതിക്കുന്നു.
        </p>
      </div>
    </div>
  );
};

export default DisclosurePage;

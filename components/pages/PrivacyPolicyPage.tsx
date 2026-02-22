
import React from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';

interface PageProps {
  onBack: () => void;
}

const PrivacyPolicyPage: React.FC<PageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 font-semibold hover:underline mb-6">
        <ChevronLeftIcon className="h-5 w-5" />
        <span>ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക</span>
      </button>
      <div className="space-y-6 text-base leading-relaxed text-slate-700">
        <h1 className="text-4xl font-bold text-slate-800 border-b pb-4">
          പ്രൈവസി പോളിസി
          <span className="block text-2xl text-slate-500 mt-1 font-normal">Privacy Policy</span>
        </h1>
        <p>
          ഈ പ്രൈവസി പോളിസി, 'കേരള പി.എസ്.സി ഗുരു' വെബ്സൈറ്റ് ഉപയോഗിക്കുമ്പോൾ നിങ്ങളുടെ വിവരങ്ങൾ എങ്ങനെ ശേഖരിക്കുകയും ഉപയോഗിക്കുകയും സംരക്ഷിക്കുകയും ചെയ്യുന്നുവെന്ന് വ്യക്തമാക്കുന്നു. നിങ്ങളുടെ സ്വകാര്യത ഉറപ്പാക്കാൻ ഞങ്ങൾ പ്രതിജ്ഞാബദ്ധരാണ്.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">ഞങ്ങൾ ശേഖരിക്കുന്ന വിവരങ്ങൾ</h2>
        <p>
          നിങ്ങൾ ഞങ്ങളുടെ വെബ്സൈറ്റിൽ രജിസ്റ്റർ ചെയ്യുമ്പോഴോ, ഫോം പൂരിപ്പിക്കുമ്പോഴോ, അല്ലെങ്കിൽ മറ്റ് സേവനങ്ങൾ ഉപയോഗിക്കുമ്പോഴോ ഞങ്ങൾ നിങ്ങളിൽ നിന്ന് വിവരങ്ങൾ ശേഖരിച്ചേക്കാം. പേര്, ഇമെയിൽ വിലാസം തുടങ്ങിയ വിവരങ്ങൾ ഇതിൽ ഉൾപ്പെടാം.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">വിവരങ്ങളുടെ ഉപയോഗം</h2>
        <p>
          ഞങ്ങൾ ശേഖരിക്കുന്ന വിവരങ്ങൾ താഴെ പറയുന്ന ആവശ്യങ്ങൾക്കായി ഉപയോഗിക്കുന്നു:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>നിങ്ങളുടെ അനുഭവം വ്യക്തിഗതമാക്കാൻ.</li>
          <li>ഞങ്ങളുടെ വെബ്സൈറ്റ് മെച്ചപ്പെടുത്താൻ.</li>
          <li>ഉപഭോക്തൃ സേവനം മെച്ചപ്പെടുത്താൻ.</li>
          <li>ഇടപാടുകൾ പ്രോസസ്സ് ചെയ്യാൻ.</li>
          <li>നിങ്ങൾക്ക് ആവശ്യമായ വിവരങ്ങൾ അയയ്ക്കാൻ.</li>
        </ul>
        <h2 className="text-2xl font-bold text-slate-800">വിവരങ്ങളുടെ സംരക്ഷണം</h2>
        <p>
          നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളുടെ സുരക്ഷ നിലനിർത്തുന്നതിനായി ഞങ്ങൾ വിവിധ സുരക്ഷാ നടപടികൾ സ്വീകരിക്കുന്നു.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">കുക്കികളുടെ ഉപയോഗം</h2>
        <p>
          അനുഭവം മെച്ചപ്പെടുത്തുന്നതിനായി ഞങ്ങൾ കുക്കികൾ ഉപയോഗിച്ചേക്കാം. കുക്കികൾ നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ ചെറിയ ഫയലുകളായി സൂക്ഷിക്കുകയും നിങ്ങളുടെ മുൻഗണനകൾ ഓർമ്മിക്കാൻ ഞങ്ങളെ സഹായിക്കുകയും ചെയ്യുന്നു.
        </p>
        <h2 className="text-2xl font-bold text-slate-800">മാറ്റങ്ങൾ</h2>
        <p>
          ഈ പ്രൈവസി പോളിസിയിൽ മാറ്റങ്ങൾ വരുത്താൻ ഞങ്ങൾക്ക് അധികാരമുണ്ട്. മാറ്റങ്ങൾ ഈ പേജിൽ പ്രസിദ്ധീകരിക്കുന്നതാണ്.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
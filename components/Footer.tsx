import React from 'react';
import type { Page } from '../App';
import { FacebookIcon } from './icons/FacebookIcon';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const footerLinks: { name: string, target: Page }[] = [
    { name: 'ഞങ്ങളെക്കുറിച്ച്', target: 'about' },
    { name: 'പ്രൈവസി പോളിസി', target: 'privacy' },
    { name: 'നിബന്ധനകളും വ്യവസ്ഥകളും', target: 'terms' },
    { name: 'അഫിലിയേറ്റ് വെളിപ്പെടുത്തൽ', target: 'disclosure' },
  ];
  
  const annapoornaUrl = 'https://annapoornainfo.com/';
  const facebookUrl = 'https://www.facebook.com/people/Kerala-PSC-Daily-Quiz-Guidance/61577831024012/';

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-bold text-lg mb-2">കേരള പി.എസ്.സി ഗുരു</h3>
            <p className="text-slate-400 text-sm">നിങ്ങളുടെ സർക്കാർ ജോലി സ്വപ്നത്തിലേക്കുള്ള AI-പവേർഡ് വഴികാട്ടി.</p>
             <div className="mt-4">
                <p className="font-semibold text-sm">Powered by Annapoorna Exam App</p>
                <a 
                  href={`/go?url=${encodeURIComponent(annapoornaUrl)}`}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  An Annapoorna infotech venture
                </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">പ്രധാന ലിങ്കുകൾ</h3>
            <ul className="space-y-2">
              {footerLinks.map(link => (
                <li key={link.name}>
                  <button onClick={() => onNavigate(link.target)} className="text-slate-300 hover:text-white text-sm transition">
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">സോഷ്യൽ മീഡിയ</h3>
            <a 
              href={`/go?url=${encodeURIComponent(facebookUrl)}`}
              className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition"
            >
              <FacebookIcon className="h-5 w-5" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-700 pt-6 text-center">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} കേരള പി.എസ്.സി ഗുരു | Powered by Annapoorna Examination App. All Rights Reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
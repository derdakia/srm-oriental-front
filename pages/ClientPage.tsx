import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { dbService } from '../services/mockDb';
import { User } from '../types';
import { showToast } from '../utils/toast';

const ClientPage: React.FC = () => {
  const [contractId, setContractId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const contractParam = params.get('contract');
    if (contractParam) {
        setContractId(contractParam);
        searchContract(contractParam);
    }
  }, [location]);

  const searchContract = async (id: string) => {
    setLoading(true);
    setError('');
    setUser(null);
    setIsVerifying(false);

    const res = await dbService.getUserByContract(id);
    if (res.success && res.data) {
      setUser(res.data);
      setPhone(res.data.phone || '');
    } else {
      setError(res.message || 'Contrat introuvable');
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) return;
    searchContract(contractId);
  };

  const isValidPhone = (p: string) => /^\d{10}$/.test(p);

  const handleSendCode = async () => {
    if (!user) return;
    if (!isValidPhone(phone)) {
        showToast('Format de numéro invalide (10 chiffres).', 'error');
        return;
    }
    setLoading(true);
    const res = await dbService.sendVerificationCode(user.contract, phone, 'client');
    setLoading(false);

    if (res.success) {
      setIsVerifying(true);
      showToast(`SMS ENVOYÉ : Votre code est ${res.data}`, 'success'); 
    } else {
      showToast(res.message || 'Erreur d\'envoi', 'error');
    }
  };

  const handleVerify = async () => {
    if (!user) return;
    setLoading(true);
    const res = await dbService.verifyCode(user.contract, otpCode, phone, 'client');
    setLoading(false);

    if (res.success && res.data) {
      setUser(res.data);
      setIsVerifying(false);
      setOtpCode('');
      showToast('Téléphone vérifié avec succès !', 'success');
    } else {
      showToast(res.message || 'Échec de la vérification', 'error');
    }
  };

  const maskCIN = (val: string = "") => val.length > 2 ? "*".repeat(val.length - 2) + val.slice(-2) : val;

  const canUpdatePhone = user && (!user.phone || (user.phoneUpdateCount || 0) < 1);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Section Écran */}
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-[#0054A6] to-[#003366] p-10 text-white text-center relative">
          <div className="relative z-10 w-24 h-24 bg-white rounded-2xl p-2 mx-auto mb-4 shadow-lg flex items-center justify-center">
             <img src="/img/logo SRM.jpeg" alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Portail Client</h1>
          <p className="text-blue-100 mt-2 font-medium">Gestion de Contrat & Vérification</p>
        </div>

        <div className="p-8 md:p-10">
          {!user ? (
            <form onSubmit={handleSearch} className="space-y-8 py-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-[#0054A6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Identifiez-vous</h2>
                <p className="text-slate-500 text-sm">Entrez votre numéro de contrat pour accéder à votre espace.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest pl-1">Identifiant Contrat</label>
                <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-[#0054A6] outline-none transition-all text-lg font-mono text-slate-800"
                    placeholder="Ex: CTR-2026-XXX"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !contractId}
                className="w-full bg-[#0054A6] text-white font-bold py-4 rounded-2xl hover:brightness-110 shadow-lg transition-all disabled:opacity-50"
              >
                Accéder au Contrat
              </button>
              {error && <div className="text-red-600 p-4 bg-red-50 rounded-xl text-center font-medium">{error}</div>}
            </form>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <button onClick={() => { setUser(null); setContractId(''); window.history.pushState({}, '', '/#/client'); }} className="text-sm text-slate-500 hover:text-[#0054A6] font-medium flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 Retour à la recherche
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 uppercase font-bold block mb-1">N° Contrat</span>
                  <div className="font-bold text-[#0054A6] text-xl font-mono">{user.contract}</div>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Statut Dossier</span>
                  <div className="flex justify-center items-center">
                    {user.phoneVerified ? (
                      <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Dossier Vérifié
                      </span>
                    ) : (
                      <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Action Requise
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-[#0054A6] rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Nom du Client</label>
                    <div className="font-semibold text-lg text-slate-800 uppercase">{user.nom}</div>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-[#0054A6] rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .667.333 1 1 1v1m2-2c0 .667-.333 1-1 1v1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 uppercase font-semibold">Identité CIN</label>
                    <div className="font-semibold text-lg text-slate-800 font-mono tracking-wider">
                       {maskCIN(user.cin)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Section */}
              <div className="mt-8">
                 <div className="relative bg-white p-6 rounded-3xl border border-blue-100 shadow-lg">
                    <h3 className="text-[#0054A6] font-bold text-lg mb-6 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${user.phoneVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0054A6]'}`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        {user.phoneVerified ? 'Dossier Sécurisé ✅' : 'Vérification de sécurité'}
                    </h3>

                    {!canUpdatePhone ? (
                        <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl text-center">
                            <h4 className="font-bold text-amber-900 text-sm">Mise à jour restreinte</h4>
                            <p className="text-amber-700 text-xs mt-1">Vos informations sont déjà validées. Contactez votre agence SRM pour tout changement.</p>
                        </div>
                    ) : (
                    <>
                        {!isVerifying ? (
                        <div className="space-y-4">
                            <input 
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl outline-none focus:border-[#0054A6] transition font-mono text-lg text-center"
                                placeholder="06XXXXXXXX"
                            />
                            <button
                                onClick={handleSendCode}
                                disabled={loading || !isValidPhone(phone)}
                                className="w-full bg-[#0054A6] text-white font-bold py-4 rounded-2xl hover:brightness-110 shadow-lg transition-all"
                            >
                                {user.phone ? 'Modifier & Vérifier' : 'Vérifier mon numéro'}
                            </button>
                        </div>
                        ) : (
                        <div className="space-y-6">
                            <p className="text-center text-sm text-gray-500">Code envoyé au <b>{phone}</b></p>
                            <input 
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl text-center text-3xl tracking-[0.5em] font-mono outline-none focus:border-[#8DC63F]"
                                placeholder="000000"
                                maxLength={6}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setIsVerifying(false)} className="flex-1 border py-4 rounded-xl font-medium text-gray-500">Annuler</button>
                                <button onClick={handleVerify} className="flex-1 bg-[#8DC63F] text-white py-4 rounded-xl font-bold shadow-md shadow-green-200">Confirmer</button>
                            </div>
                        </div>
                        )}
                    </>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center mt-8 text-slate-400 text-xs font-medium">
        &copy; {new Date().getFullYear()} SRM L'ORIENTAL SA &bull; DIRECTION SYSTÈME D'INFORMATION
      </div>
    </div>
  );
};

export default ClientPage;
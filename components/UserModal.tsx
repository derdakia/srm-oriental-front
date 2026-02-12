import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/mockDb';
import { apiContracts } from '../services/apiContracts';
import { showToast } from '../utils/toast';

interface UserModalProps {
  user: User | Partial<User>;
  mode: 'view' | 'edit' | 'create';
  isOpen: boolean;
  onClose: () => void;
  onSave?: (user: User) => void;
  currentUserRole?: string;
  currentUserName?: string;
}

const UserModal: React.FC<UserModalProps> = ({ user: initialUser, mode, isOpen, onClose, onSave, currentUserRole, currentUserName }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'qr'>('details');
  const [formData, setFormData] = useState<Partial<User>>(initialUser);
  const [loading, setLoading] = useState(false);
  const [printLocation, setPrintLocation] = useState('Oujda');

  const [showVerifyInput, setShowVerifyInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setFormData(initialUser);
    setActiveTab('details');
    setPrintLocation('Oujda');
    setShowVerifyInput(false);
    setVerificationCode('');
  }, [initialUser, isOpen]);

  if (!isOpen) return null;

  const maskID = (val: string = "") => val.length > 2 ? "*".repeat(val.length - 2) + val.slice(-2) : val;
  const maskPhone = (val: string = "") => val.length > 4 ? "*".repeat(val.length - 4) + val.slice(-4) : val;

  const handleSendOTP = async () => {
    if (!formData.contract?.trim()) {
      showToast("Saisissez le numéro de contrat", "error");
      return;
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      showToast("Numéro invalide", "error");
      return;
    }
    setIsSending(true);
    try {
      const n_contrat = formData.contract.trim();
      const phone = formData.phone.replace(/\s/g, '');
      if (mode === 'create') {
        const addRes = await apiContracts.addContract({
          agence: 'BE-OUED NACHEF',
          n_client: n_contrat,
          n_contrat,
          nom: (formData.nom || '').trim() || 'Client',
          prenom: '-',
          cin: (formData.cin || '').trim() || '-',
          n_tlf1: phone,
          n_tlf2: (formData.phone2 || '').trim() || phone,
        });
        if (!addRes.success) {
          const exists = await apiContracts.getContractByNumber(n_contrat);
          if (!exists.success) {
            showToast(addRes.message || "Erreur création contrat", "error");
            setIsSending(false);
            return;
          }
        }
      } else {
        const exists = await apiContracts.getContractByNumber(n_contrat);
        if (!exists.success) {
          const addRes = await apiContracts.addContract({
            agence: 'BE-OUED NACHEF',
            n_client: n_contrat,
            n_contrat,
            nom: (formData.nom || '').trim() || 'Client',
            prenom: '-',
            cin: (formData.cin || '').trim() || '-',
            n_tlf1: phone,
            n_tlf2: (formData.phone2 || '').trim() || phone,
          });
          if (!addRes.success) {
            showToast(addRes.message || "Erreur", "error");
            setIsSending(false);
            return;
          }
        }
      }
      const res = await apiContracts.sendVerificationCode(n_contrat, phone);
      if (res.success) {
        setShowVerifyInput(true);
        showToast("Code envoyé par SMS et WhatsApp", "success");
      } else {
        showToast(res.message || "Erreur envoi code", "error");
      }
    } catch (e) {
      showToast("Erreur de connexion au serveur", "error");
    }
    setIsSending(false);
  };

  const handleVerifyCode = async () => {
    if (!formData.contract?.trim() || !verificationCode.trim()) {
      showToast("Saisissez le code reçu", "error");
      return;
    }
    setLoading(true);
    const res = await apiContracts.verifyCode(formData.contract.trim(), verificationCode.trim());
    setLoading(false);
    if (res.success) {
      setFormData((prev) => ({ ...prev, phoneVerified: true }));
      setShowVerifyInput(false);
      setVerificationCode('');
      showToast("Vérifié avec succès !", "success");
      if (onSave && formData.id) onSave({ ...formData, phoneVerified: true } as User);
    } else {
      showToast(res.message || "Code erroné", "error");
    }
  };

  const handlePrintAction = (printType: 'full' | 'qr') => {
    const appUrl = `${window.location.protocol}//${window.location.host}/#/client?contract=${formData.contract}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250&data=${encodeURIComponent(appUrl)}`;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const htmlContent = printType === 'full' ? `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.4; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0054A6; padding-bottom: 10px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="/img/logo SRM.jpeg" style="height: 65px;">
                <div>
                    <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #0054A6;">SRM L'ORIENTAL SA</h2>
                    <p style="margin: 0; font-size: 9px; color: #64748b; text-transform: uppercase;">Société Régionale Multiservices</p>
                </div>
            </div>
            <div style="text-align: right;">
                <h1 style="margin: 0; color: #0054A6; font-size: 16px; text-transform: uppercase; font-weight: 900;">Attestation de Contrat</h1>
                <p style="margin: 2px 0 0; font-size: 11px;">Fait à <b>${printLocation}</b>, le ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
        <div style="margin-bottom: 15px; font-size: 12px;">
            <div><b>Agence :</b> BE-OUED NACHEF</div>
            <div><b>Unité de référence :</b> J3CA130</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold; width: 35%;">N° Client / Contrat</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #0054A6;">${formData.id || '---'} / ${formData.contract}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Nom Complet</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-transform: uppercase;">${formData.nom}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Identité (CIN)</td><td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace;">${maskID(formData.cin)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Téléphone Principal</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${maskPhone(formData.phone)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-weight: bold;">Téléphone Secondaire</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${formData.phone2 ? maskPhone(formData.phone2) : '---'}</td></tr>
        </table>
        <div style="direction: rtl; text-align: right; background: #fcfcfc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px; font-size: 14px;">
          <p>في ظلّ التطور التكنولوجي الرقمي الذي يشهده العالم، تهدف الشركة الجهوية المتعددة الخدمات لجهة الشرق إلى تقريب خدماتها من المواطنات والمواطنين...</p>
          <p style="font-weight: bold;">وشكرًا لتعاونكم</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px;">
          <div style="text-align: center;"><img id="qrToPrint" src="${qrImgUrl}" style="width: 110px; height: 110px;" /></div>
          <div style="text-align: right; width: 220px;"><p style="margin-bottom: 50px; font-weight: bold;">Signature et Cachet</p><div style="border-top: 1px solid #000;"></div></div>
        </div>
      </div>
    ` : `
      <div style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>ACCÈS DIGITAL CLIENT</h1>
        <img id="qrToPrint" src="${qrImgUrl}" style="width: 250px; height: 250px; margin: 20px 0;" />
        <h2>${formData.nom}</h2>
      </div>
    `;

    doc.write(`<html><head><meta charset="UTF-8"></head><body>${htmlContent}<script>
      const img = document.getElementById('qrToPrint');
      const doPrint = () => { window.print(); setTimeout(() => { parent.document.body.removeChild(window.frameElement); }, 500); };
      if (img.complete) { doPrint(); } else { img.onload = doPrint; img.onerror = doPrint; }
    </script></body></html>`);
    doc.close();
  };

  const handleSave = async () => {
    if (!formData.contract || !formData.nom) { showToast("Champs requis", "error"); return; }
    setLoading(true);
    const res = await dbService.updateUser(formData as User, `${currentUserRole}:${currentUserName}`);
    setLoading(false);
    if (res.success) { showToast("Enregistré"); onSave?.(res.data!); if (mode === 'create') onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border-t-8 border-[#0054A6]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <img src="/img/logo SRM.jpeg" alt="Logo" className="h-10 w-auto" />
             <h3 className="text-lg font-bold text-slate-800">Gestion Dossier Client</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 p-1 m-4 rounded-lg border">
          <button className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'details' ? 'bg-white shadow text-[#0054A6]' : 'text-slate-500'}`} onClick={() => setActiveTab('details')}>Informations</button>
          <button className={`flex-1 py-2 rounded-md text-sm font-bold transition ${activeTab === 'qr' ? 'bg-white shadow text-[#0054A6]' : 'text-slate-500'}`} onClick={() => setActiveTab('qr')}>Partage QR</button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto max-h-[75vh]">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1"><label className="text-[10px] font-bold text-slate-400 uppercase">N° Contrat</label><input value={formData.contract || ''} onChange={e => setFormData({...formData, contract: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#0054A6]" /></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nom complet</label><input value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#0054A6]" /></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-slate-400 uppercase">CIN</label><input value={formData.cin || ''} onChange={e => setFormData({...formData, cin: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#0054A6]" /></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tél 1</label><input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#0054A6]" /></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Tél 2</label><input value={formData.phone2 || ''} onChange={e => setFormData({...formData, phone2: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#0054A6]" /></div>
                <div className="col-span-1"><label className="text-[10px] font-bold text-blue-600 uppercase">Lieu d'édition</label><input value={printLocation} onChange={e => setPrintLocation(e.target.value)} className="w-full border border-blue-100 p-2.5 rounded-lg bg-blue-50 outline-none" /></div>
              </div>

              {/* Sécurité */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Sécurité Mobile</h4>
                {!formData.phoneVerified ? (
                  !showVerifyInput ? (
                    <button onClick={handleSendOTP} disabled={isSending} className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Vérifier le numéro</button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600">Entrez le code de vérification reçu par SMS sur le numéro du client.</p>
                      <div className="flex gap-2">
                        <input placeholder="Code à 4 chiffres" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="flex-1 border p-2 rounded-lg text-center font-bold" maxLength={4} />
                        <button onClick={handleVerifyCode} disabled={loading || verificationCode.length < 4} className="px-4 bg-green-600 text-white rounded-lg font-bold text-xs disabled:opacity-50">Confirmer</button>
                      </div>
                    </div>
                  )
                ) : <p className="text-center text-xs text-green-600 font-bold">Dossier authentifié ✅</p>}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {/* --- BOUTON IMPRESSION : RÉSERVÉ À L'ADMIN --- */}
                {currentUserRole === 'admin' ? (
                    <button 
                        onClick={() => handlePrintAction('full')} 
                        className="flex items-center gap-2 text-slate-600 hover:text-[#0054A6] font-bold text-sm bg-slate-100 px-4 py-2 rounded-lg transition"
                    >
                      🖨️ Imprimer Contrat
                    </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition">Annuler</button>
                  <button onClick={handleSave} disabled={loading} className="bg-[#0054A6] text-white px-6 py-2 rounded-lg font-bold">Enregistrer</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="p-4 border-2 border-slate-100 rounded-2xl bg-white mb-6">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200&data=${encodeURIComponent(window.location.protocol + '//' + window.location.host + '/#/client?contract=' + formData.contract)}`} alt="QR" className="w-48 h-48" />
              </div>

              {/* --- BOUTON IMPRESSION QR : RÉSERVÉ À L'ADMIN --- */}
              {currentUserRole === 'admin' && (
                  <button 
                    onClick={() => handlePrintAction('qr')} 
                    className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
                  >
                    🖨️ Imprimer la fiche QR Code
                  </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
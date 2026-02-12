/**
 * Backend API for contracts: add, get, send verification (SMS/WhatsApp), verify code.
 * Uses same base URL as auth (e.g. http://localhost:8080).
 */
const API_BASE = 'http://localhost:8080';

export interface AddContractPayload {
  agence: string;
  n_client: string;
  n_contrat: string;
  nom: string;
  prenom: string;
  cin: string;
  n_tlf1: string;
  n_tlf2: string;
}

export const apiContracts = {
  getContractByNumber: async (n_contrat: string) => {
    const res = await fetch(`${API_BASE}/api/contracts/getContractByNumber.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_contrat }),
    });
    const data = await res.json();
    if (data.status === 'success') return { success: true, contract: data.contract };
    return { success: false, message: data.message || 'Contrat introuvable' };
  },

  addContract: async (payload: AddContractPayload) => {
    const res = await fetch(`${API_BASE}/api/contracts/addContract.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.status === 'success') return { success: true, message: data.message };
    return { success: false, message: data.message || 'Erreur ajout contrat' };
  },

  sendVerificationCode: async (n_contrat: string, n_tlf: string) => {
    const res = await fetch(`${API_BASE}/api/contracts/sendVerification.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_contrat, n_tlf }),
    });
    const data = await res.json();
    if (data.status === 'success') return { success: true, message: data.message };
    return { success: false, message: data.message || 'Erreur envoi code' };
  },

  verifyCode: async (n_contrat: string, code: string) => {
    const res = await fetch(`${API_BASE}/api/contracts/verifiCode.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_contrat, code }),
    });
    const data = await res.json();
    if (data.status === 'success') return { success: true, message: data.message };
    return { success: false, message: data.message || 'Code incorrect' };
  },
};

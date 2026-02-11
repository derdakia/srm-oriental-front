// src/services/apiService.ts
const API_BASE = 'http://localhost:8080'; // يمكن تغييره حسب السيرفر الفعلي
// أو لو استعملتي env:
// const API_BASE = process.env.REACT_APP_API_BASE;

export const apiService = {
  getUserByContract: async (contractId: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${contractId}`);
      if (!res.ok) throw new Error('Utilisateur non trouvé');
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  sendVerificationCode: async (contractId: string, phone: string, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${contractId}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role })
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  verifyCode: async (contractId: string, code: string, phone: string, role: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${contractId}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, phone, role })
      });
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  getAllUsers: async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
};

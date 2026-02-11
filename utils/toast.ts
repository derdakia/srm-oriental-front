export const showToast = (msg: string, type: 'success'|'error' = 'success') => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { msg, type } }));
};
// Simple encryption utility to obfuscate local storage data
// NOTE: For military-grade security, key management should be server-side.
const SECRET_KEY = "TRADEORE_SECURE_KEY_X99";

export const secureStorage = {
  setItem: (key: string, value: any) => {
    try {
      const stringValue = JSON.stringify(value);
      // Simple XOR obfuscation + Base64 to prevent plain text reading in F12
      let result = '';
      for (let i = 0; i < stringValue.length; i++) {
        result += String.fromCharCode(stringValue.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
      }
      const encrypted = btoa(result);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error("Storage encryption failed", e);
    }
  },
  getItem: (key: string) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decryptedString = atob(encrypted);
      let result = '';
      for (let i = 0; i < decryptedString.length; i++) {
        result += String.fromCharCode(decryptedString.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
      }
      return JSON.parse(result);
    } catch (e) {
      // Fallback for legacy plain text data if migration occurs
      const plain = localStorage.getItem(key);
      return plain ? JSON.parse(plain) : null;
    }
  }
};

export const exportSessionToJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
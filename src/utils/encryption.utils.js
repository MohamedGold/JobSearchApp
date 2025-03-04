import CryptoJS from 'crypto-js';

export const Encryption = ({ value, secretKey }) => {
  if (!secretKey) throw new Error("Encryption key missing");
  return CryptoJS.AES.encrypt(value, secretKey).toString();
};

export const Decryption = ({ cipher, secretKey }) => {
  if (!secretKey) throw new Error("Encryption key missing");
  const bytes = CryptoJS.AES.decrypt(cipher, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};



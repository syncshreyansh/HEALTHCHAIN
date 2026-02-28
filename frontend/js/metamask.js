'use strict';

const MetaMask = {
  async connect() {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install it from metamask.io');
    }

    // 1. Request accounts
    const accounts      = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];

    // 2. Get challenge nonce from backend
    const { message } = await API.auth.challenge(walletAddress);

    // 3. Sign the message
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    });

    // 4. Verify on backend — receive JWT
    const { token, user } = await API.auth.verify(walletAddress, signature);

    // 5. Persist
    Auth.set(user, token);
    return user;
  },

  async getAddress() {
    if (!window.ethereum) return null;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  },
};
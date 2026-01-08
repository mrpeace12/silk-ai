
import { TokenBalance, Transaction } from '../types.ts';

const ALCHEMY_API_KEY = 'Muy7U2HGk-kvIue-M1HF9';

export const fetchWalletBalances = async (address: string): Promise<TokenBalance[]> => {
  // Simulating cross-chain data from Alchemy indexed storage with the requested API Context
  return [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.45', price: 2650, change24h: 1.2, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', network: 'ETH' },
    { symbol: 'INBB', name: 'INBB Core', balance: '15000', price: 0.12, change24h: 15.4, logo: 'https://raw.githubusercontent.com/Naveen-Kumar-Murugan/CryptoWallet-MetaMask-Clone/main/public/logo192.png', network: 'BASE' },
    { symbol: 'USDC', name: 'USD Coin', balance: '5240', price: 1.00, change24h: 0.01, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', network: 'BASE' },
    { symbol: 'SOL', name: 'Solana', balance: '124', price: 145.2, change24h: -2.3, logo: 'https://cryptologos.cc/logos/solana-sol-logo.png', network: 'SOL' }
  ];
};

export const fetchMarketPrices = async () => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=true');
    if (!res.ok) throw new Error("API Limit");
    return await res.json();
  } catch (e) { 
    console.error("Market load fallback initiated", e);
    return []; 
  }
};

export const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  return [
    { hash: '0x3a...1b2c', from: address, to: '0x8b...9122', value: '1.2', asset: 'ETH', category: 'send', status: 'confirmed', timestamp: new Date().toISOString(), explorerUrl: '#' },
    { hash: '0x7e...d982', from: '0x12...5678', to: address, value: '500', asset: 'USDC', category: 'receive', status: 'confirmed', timestamp: new Date(Date.now() - 3600000).toISOString(), explorerUrl: '#' }
  ];
};

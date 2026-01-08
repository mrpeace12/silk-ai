
import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  MessageSquareText, 
  User, 
  Settings,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const ALCHEMY_API_KEY = 'Muy7U2HGk-kvIue-M1HF9';
export const ALCHEMY_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export const DEMO_WALLET = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // Vitalik's address for demo

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
  { id: 'ai_chat', label: 'AI Advisor', icon: <MessageSquareText size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export const FEATURES = [
  { title: 'Real-time Analytics', icon: <TrendingUp className="text-cyan-400" />, desc: 'Live market data powered by Alchemy.' },
  { title: 'AI Assistant', icon: <Zap className="text-purple-400" />, desc: 'Deep financial insights via Gemini AI.' },
  { title: 'Secure Vault', icon: <ShieldCheck className="text-emerald-400" />, desc: 'Advanced 2FA and Supabase security.' },
];

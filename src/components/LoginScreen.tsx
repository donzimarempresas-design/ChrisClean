/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Sparkles, CheckCircle2, AlertCircle, Sun, Moon, ArrowLeft, ShieldCheck } from 'lucide-react';
import chrisCleanLogo from '../assets/images/chris_clean_logo_1783033986271.jpg';

interface LoginScreenProps {
  onLoginSuccess: (adminName: string) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function LoginScreen({ onLoginSuccess, darkMode: propDarkMode, toggleDarkMode: propToggleDarkMode }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(false);

  // Sync internal theme state if props not passed
  const isDark = propDarkMode !== undefined ? propDarkMode : localDarkMode;
  const toggleTheme = () => {
    if (propToggleDarkMode) {
      propToggleDarkMode();
    } else {
      const nextDark = !localDarkMode;
      setLocalDarkMode(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('chris_dark_mode', 'enabled');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('chris_dark_mode', 'disabled');
      }
    }
  };

  useEffect(() => {
    if (propDarkMode === undefined) {
      const darkPreference = localStorage.getItem('chris_dark_mode');
      if (darkPreference === 'enabled') {
        setLocalDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, [propDarkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password;

      if (!trimmedEmail || !trimmedPassword) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        setIsLoading(false);
        return;
      }

      let matchedUser = '';
      if (trimmedEmail === 'cristinacanguila@outlook.com' && trimmedPassword === 'Canguila202002!') {
        matchedUser = 'Cristina Donzolo';
      } else if (trimmedEmail === 'guelsonm@gmail.com' && trimmedPassword === 'Maria202002!') {
        matchedUser = 'Marcos Donzolo';
      }

      if (matchedUser) {
        // Successful login
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_name', matchedUser);
        onLoginSuccess(matchedUser);
      } else {
        setError('E-mail ou palavra-passe incorretos. Acesso restrito a administradores.');
      }
      setIsLoading(false);
    }, 600);
  };

  const handleBackToScheduling = () => {
    // Navigate away from admin route back to customer side
    window.location.hash = '';
    window.location.pathname = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#090D16] transition-colors duration-500 font-sans">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none z-0" />
      
      {/* Absolute Header with Theme Toggle & Return button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={handleBackToScheduling}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#00B050] hover:dark:text-[#00B050] border border-slate-100 dark:border-white/[0.04] transition-all duration-200 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Agendamento</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-[#00B050] hover:dark:text-[#00B050] border border-slate-100 dark:border-white/[0.04] transition-colors shadow-sm"
          title="Alternar Tema"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-900" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-[#0F1322] rounded-[32px] border border-slate-100 dark:border-white/[0.04] shadow-2xl p-8 md:p-10 transition-all duration-300 relative">
          
          {/* Top Decorative glowing orb */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#00B050]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Brand area */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-100 dark:border-white/10 flex items-center justify-center mb-4 select-none shadow-md">
              <img 
                src={chrisCleanLogo} 
                alt="Chris Clean Logo" 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/0A1F5C/white?text=CC';
                }}
              />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-[#0A1F5C] dark:text-white tracking-tight">
              CHRIS <span className="text-[#00C561]">CLEAN</span>
            </h1>
            <p className="text-[9px] font-bold tracking-[2px] text-slate-400 dark:text-slate-500 uppercase mt-0.5">
              Portal Administrativo Executivo
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#0A1F5C]/5 to-[#00B050]/5 dark:from-[#0A1F5C]/10 dark:to-[#00B050]/10 border border-[#00B050]/20 rounded-2xl p-4 mb-6 flex gap-3 items-start">
            <Sparkles className="w-4.5 h-4.5 text-[#00B050] shrink-0 mt-0.5" />
            <div className="text-xs text-[#008F41] dark:text-[#4ade80] leading-relaxed w-full">
              <span className="font-bold block mb-0.5">Acesso Restrito</span>
              <p className="text-slate-500 dark:text-slate-400">Insira as credenciais de gestão para gerir pedidos, preços, equipa e finanças.</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/15 rounded-2xl p-4 mb-6 text-xs font-semibold text-red-600 dark:text-red-400 flex gap-2 items-center"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none ml-1">
                E-mail do Administrador
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@outlook.com"
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl py-3.5 pl-11 pr-4 font-sans text-sm font-medium text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-white/[0.02] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none ml-1">
                Palavra-passe
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl py-3.5 pl-11 pr-4 font-sans text-sm font-medium text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-white/[0.02] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#00B050] to-[#00e676] text-white py-3.5 rounded-2xl font-sans font-extrabold text-xs tracking-widest uppercase hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 shadow-md mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Autenticar Painel
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-[10px] select-none">
            <ShieldCheck className="w-4 h-4 text-[#00B050]" />
            <span>Encriptação SSL Segura de Administrador</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

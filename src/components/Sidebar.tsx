/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ConciergeBell, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  Moon, 
  Sun, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import chrisCleanLogo from '../assets/images/chris_clean_logo_1783033986271.jpg';
import crisProfile from '../assets/images/cris_profile_1783034000370.jpg';
import marcosProfile from '../assets/images/marcos_profile_1783035332709.jpg';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  adminName: string;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  onLogout,
  adminName,
}: SidebarProps) {
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
    { id: 'servicos', label: 'Serviços', icon: ConciergeBell },
    { id: 'financas', label: 'Finanças', icon: Wallet },
    { id: 'fluxocaixa', label: 'Fluxo de Caixa', icon: ArrowLeftRight },
    { id: 'relatorios', label: 'Relatórios', icon: PieChart },
  ];

  const profileImageUrl = adminName === 'Marcos Donzolo' ? marcosProfile : crisProfile;

  const handleTabClick = (id: string) => {
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-100 dark:border-white/10 select-none shadow-sm">
              <img 
                src={chrisCleanLogo} 
                alt="Chris Clean Logo" 
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white leading-none">
                CHRIS <span className="text-[#10B981]">CLEAN</span>
              </h1>
              <span className="text-[9px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase leading-none mt-1 block">
                Executive Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1.5 h-full">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 select-none cursor-pointer ${
                    isActive 
                      ? 'text-sky-600 dark:text-sky-400' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTopTabBg"
                      className="absolute inset-0 bg-sky-500/5 dark:bg-sky-500/10 rounded-xl border border-sky-500/10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  
                  <IconComponent className={`w-4 h-4 relative z-10 ${
                    isActive ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'
                  }`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Theme Switcher */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.05] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200/40 dark:border-white/5 transition-all cursor-pointer"
              title="Alternar Tema (Alt + D)"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Vertical Splitter */}
            <span className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer border border-transparent hover:border-slate-200/40 dark:hover:border-white/5"
              >
                <img 
                  src={profileImageUrl} 
                  alt={adminName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border-2 border-sky-500/60 shadow-sm"
                />
                <div className="text-left hidden md:block">
                  <span className="block text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {adminName === 'Marcos Donzolo' ? 'M. Donzolo' : 'C. Donzolo'}
                  </span>
                  <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold leading-tight">
                    Executive Admin
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown List */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#111827] border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-xl p-2 z-20"
                    >
                      <div className="px-3.5 py-3 border-b border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider select-none">Sessão Ativa</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{adminName}</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair do Sistema</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-white/5 transition-all cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-200/40 dark:border-white/5 bg-white dark:bg-[#090D16] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/10' 
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

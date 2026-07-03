/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Menu, LogOut, Sun, Moon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import local components
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import PedidosTab from './components/PedidosTab';
import ServicosTab from './components/ServicosTab';
import FinancasTab from './components/FinancasTab';
import FluxoCaixaTab from './components/FluxoCaixaTab';
import RelatoriosTab from './components/RelatoriosTab';
import ClientScheduling from './components/ClientScheduling';

// Import Types and API handlers
import { Agendamento, Gasto, Servico } from './types';
import { 
  fetchAgendamentos, 
  fetchGastos, 
  fetchServicos, 
  fetchTaxaDeslocacao,
  updateAgendamentoStatus,
  createGasto,
  saveServico,
  saveServicoPrincipal,
  updateTaxaDeslocacao
} from './lib/api';

export default function App() {
  // Router check state
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.endsWith('/admin') || 
           window.location.pathname.includes('/admin') || 
           window.location.hash === '#/admin' ||
           window.location.hash.includes('admin');
  });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('Cristina Donzolo');

  // App Layout States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Business Data States
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [taxaDeslocacao, setTaxaDeslocacao] = useState(2000);
  const [isLoading, setIsLoading] = useState(true);

  // Sync URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(
        window.location.pathname.endsWith('/admin') || 
        window.location.pathname.includes('/admin') || 
        window.location.hash === '#/admin' ||
        window.location.hash.includes('admin')
      );
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Check initial authentication and preference states
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated');
    const name = sessionStorage.getItem('admin_name');
    if (auth === 'true') {
      setIsAuthenticated(true);
      if (name) setAdminName(name);
    }

    // Load Dark Mode preferences
    const darkPreference = localStorage.getItem('chris_dark_mode');
    if (darkPreference === 'enabled') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Bind Alt + D quick toggler for dark mode accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'd') {
        toggleDarkMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch all business records once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [aData, gData, sData, tData] = await Promise.all([
          fetchAgendamentos(),
          fetchGastos(),
          fetchServicos(),
          fetchTaxaDeslocacao()
        ]);
        setAgendamentos(aData);
        setGastos(gData);
        setServicos(sData);
        setTaxaDeslocacao(tData);
      } catch (err) {
        console.error('Failed to load application telemetry data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      if (newVal) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('chris_dark_mode', 'enabled');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('chris_dark_mode', 'disabled');
      }
      return newVal;
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_name');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (name: string) => {
    setAdminName(name);
    setIsAuthenticated(true);
  };

  // 1. Update Booking Order Status
  const handleUpdateStatus = async (id: string, status: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
    await updateAgendamentoStatus(id, status);
  };

  // 2. Add New Expense Gasto
  const handleAddGasto = async (newGasto: Gasto) => {
    // Add locally immediately for lightning response
    const completeGasto: Gasto = { ...newGasto, id: `g-${Date.now()}` };
    setGastos(prev => [completeGasto, ...prev]);
    await createGasto(newGasto);
  };

  // 3. Save Displacement fee
  const handleSaveTaxa = async (valor: number) => {
    setTaxaDeslocacao(valor);
    await updateTaxaDeslocacao(valor);
  };

  // 4. Update pricing within service categories
  const handleUpdatePreco = async (servicoId: string, categoria: string, preco: number) => {
    setServicos(prev => prev.map(s => {
      if (s.id === servicoId) {
        const updatedPrecos = { ...s.precos, [categoria]: preco };
        // Sync behind the scenes
        saveServico(servicoId, updatedPrecos);
        return { ...s, precos: updatedPrecos };
      }
      return s;
    }));
  };

  // 5. Add custom sub-category to a service
  const handleAddCategoria = async (servicoId: string, categoria: string, preco: number) => {
    setServicos(prev => prev.map(s => {
      if (s.id === servicoId) {
        const updatedPrecos = { ...s.precos, [categoria]: preco };
        saveServico(servicoId, updatedPrecos);
        return { ...s, precos: updatedPrecos };
      }
      return s;
    }));
  };

  // 6. Delete sub-category from service
  const handleDeleteCategoria = async (servicoId: string, categoria: string) => {
    setServicos(prev => prev.map(s => {
      if (s.id === servicoId) {
        const updatedPrecos = { ...s.precos };
        delete updatedPrecos[categoria];
        saveServico(servicoId, updatedPrecos);
        return { ...s, precos: updatedPrecos };
      }
      return s;
    }));
  };

  // 7. Register a new primary service
  const handleCreateServicoPrincipal = async (nome: string) => {
    const id = nome.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const newService: Servico = { id, nome, precos: {} };
    setServicos(prev => [...prev, newService]);
    await saveServicoPrincipal(id, nome);
  };

  // Pull active service list for dropdown filters
  const servicosNomes = servicos.map(s => s.nome);

  // Router behavior
  if (!isAdminRoute) {
    return <ClientScheduling darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  // If not authenticated on admin route, force login view
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  // Active view router
  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="h-[75vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-[#00C561] animate-spin" />
          <span className="text-xs font-bold text-[#5a6a9a] dark:text-[#7a8abf] tracking-widest uppercase">
            Sincronizando Base Supabase...
          </span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab agendamentos={agendamentos} gastos={gastos} adminName={adminName} />;
      case 'pedidos':
        return (
          <PedidosTab 
            agendamentos={agendamentos} 
            onUpdateStatus={handleUpdateStatus}
            servicosDisponiveis={servicosNomes}
          />
        );
      case 'servicos':
        return (
          <ServicosTab 
            servicos={servicos} 
            taxaDeslocacao={taxaDeslocacao}
            onSaveTaxa={handleSaveTaxa}
            onUpdatePreco={handleUpdatePreco}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onCreateServicoPrincipal={handleCreateServicoPrincipal}
          />
        );
      case 'financas':
        return <FinancasTab gastos={gastos} onAddGasto={handleAddGasto} />;
      case 'fluxocaixa':
        return <FluxoCaixaTab agendamentos={agendamentos} gastos={gastos} />;
      case 'relatorios':
        return <RelatoriosTab agendamentos={agendamentos} gastos={gastos} />;
      default:
        return <DashboardTab agendamentos={agendamentos} gastos={gastos} adminName={adminName} />;
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#080B11] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Visual glowing mesh background overlay */}
      <div className="bg-mesh opacity-40" />

      {/* Top Navbar Component */}
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        adminName={adminName}
      />

      {/* Main Workspace Frame (Full width) */}
      <div className="transition-all duration-300">
        
        {/* Content Pad */}
        <div className="p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

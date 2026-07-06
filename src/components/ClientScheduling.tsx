/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Car,
  Sofa,
  Layers,
  Sparkles,
  Plus,
  Minus,
  Sun,
  Moon,
  Shield,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import chrisCleanLogo from '../assets/images/chris_clean_logo_1783033986271.jpg';
import crisProfile from '../assets/images/cris_profile_1783034000370.jpg';
import marcosProfile from '../assets/images/marcos_profile_1783035332709.jpg';

// ============================================================
// CONFIGURAÇÃO SUPABASE
// ============================================================
const SUPABASE_URL = 'https://cfhmflxowbxaqnrczoof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tR5qCN28XMSmMxStuJFzug_WlKYD6oP';
const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// ============================================================
// TIPOS
// ============================================================
interface Servico {
  id: string;
  nome: string;
  precos: Record<string, number>;
}

interface Agendamento {
  id?: string | number;
  nome: string;
  telefone: string;
  servico: string;
  categoria: string;
  quantidade: number;
  total: number;
  data: string;
  horario: string;
  endereco: string;
  obs?: string | null;
  status: 'pendente' | 'Em curso' | 'Concluido' | 'Cancelado';
  taxa_cobrada: number;
  incluir_taxa: boolean;
  modelo_viatura?: string | null;
  created_at?: string;
}

interface ClientSchedulingProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function ClientScheduling({ darkMode: propDarkMode, toggleDarkMode: propToggleDarkMode }: ClientSchedulingProps) {
  // Tema
  const [localDarkMode, setLocalDarkMode] = useState(false);
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

  // Estados do formulário
  const [services, setServices] = useState<Servico[]>([]);
  const [taxaDeslocacao, setTaxaDeslocacao] = useState(2000);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modeloViatura, setModeloViatura] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [incluirTaxa, setIncluirTaxa] = useState(true);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('08:00');
  const [endereco, setEndereco] = useState('');
  const [obs, setObs] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Agendamento | null>(null);

  // ============================================================
  // FUNÇÕES DE API (CORRIGIDAS)
  // ============================================================
  const fetchServicos = async (): Promise<Servico[]> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/servicos?select=*`, { headers: HEADERS });
    if (!response.ok) throw new Error(`Erro ao buscar serviços: ${response.status}`);
    const data = await response.json();
    return data.map((s: any) => ({ ...s, precos: s.precos || {} }));
  };

  const fetchTaxaDeslocacao = async (): Promise<number> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/configuracoes?id=eq.taxa_deslocacao`, { headers: HEADERS });
    if (!response.ok) throw new Error(`Erro ao buscar taxa: ${response.status}`);
    const data = await response.json();
    return data && data.length > 0 ? data[0].valor : 2000;
  };

  const createAgendamento = async (payload: any): Promise<Agendamento> => {
    const body = {
      nome: payload.nome,
      telefone: payload.telefone,
      servico: payload.servico,
      categoria: payload.categoria,
      quantidade: payload.quantidade,
      total: payload.total,
      data: payload.data,
      horario: payload.horario,
      endereco: payload.endereco,
      obs: payload.obs || null,
      status: payload.status || 'pendente',
      taxa_cobrada: payload.taxa_cobrada,
      incluir_taxa: payload.incluir_taxa,
      modelo_viatura: payload.modelo_viatura || null,
    };

    console.log('Payload a enviar:', body);

    const headers = {
      ...HEADERS,
      'Prefer': 'return=representation'
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log('Status da resposta:', response.status);
    const responseText = await response.text();
    console.log('Resposta do servidor (texto):', responseText);

    if (!response.ok) {
      throw new Error(`Erro ao criar agendamento (${response.status}): ${responseText}`);
    }

    if (!responseText || responseText.trim() === '') {
      console.warn('Resposta vazia do servidor, usando fallback.');
      return { ...body, id: 'temp_' + Date.now() } as Agendamento;
    }

    try {
      const result = JSON.parse(responseText);
      const booking = Array.isArray(result) ? result[0] : result;
      return booking as Agendamento;
    } catch (e) {
      console.error('Erro ao parsear JSON da resposta:', e);
      return { ...body, id: 'temp_' + Date.now() } as Agendamento;
    }
  };

  // ============================================================
  // CARREGAMENTO INICIAL
  // ============================================================
  useEffect(() => {
    async function loadData() {
      try {
        const [sList, tValue] = await Promise.all([
          fetchServicos(),
          fetchTaxaDeslocacao()
        ]);
        setServices(sList);
        setTaxaDeslocacao(tValue);
        if (sList.length > 0) {
          setSelectedServiceId(sList[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setErrorMsg('Não foi possível carregar os serviços. Verifique a sua ligação à internet.');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================================
  // UTILITÁRIOS
  // ============================================================
  const formatKwanza = (val: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0
    }).format(val).replace('AOA', 'AKZ');
  };

  const selectedService = services.find(s => s.id === selectedServiceId);
  const isViaturaService = selectedService?.nome.toLowerCase().includes('viatura') ||
                            selectedService?.id.toLowerCase().includes('viatura') ||
                            selectedService?.nome.toLowerCase().includes('automóvel') ||
                            selectedService?.nome.toLowerCase().includes('carro');

  const unitPrice = selectedService && selectedCategory ? (selectedService.precos[selectedCategory] || 0) : 0;
  const currentTaxa = incluirTaxa ? taxaDeslocacao : 0;
  const totalEstimado = (unitPrice * quantidade) + currentTaxa;

  const getServiceIcon = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('viatura') || n.includes('automóvel') || n.includes('carro') || n.includes('auto')) return Car;
    if (n.includes('sofá') || n.includes('poltrona') || n.includes('cadeira') || n.includes('estofos')) return Sofa;
    if (n.includes('tapete') || n.includes('alcatifa') || n.includes('colchão')) return Layers;
    return Sparkles;
  };

  const getServiceImage = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('viatura') || n.includes('automóvel') || n.includes('carro') || n.includes('auto')) {
      return 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800';
    }
    if (n.includes('sofá') || n.includes('poltrona') || n.includes('cadeira') || n.includes('estofos')) {
      return 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800';
    }
    if (n.includes('tapete') || n.includes('alcatifa') || n.includes('colchão')) {
      return 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800';
  };

  const getWhatsAppLink = (booking: Agendamento) => {
    const whatsappNumber = '244923725236';
    const formattedTotal = formatKwanza(booking.total || 0);
    const formattedTaxa = formatKwanza(booking.taxa_cobrada || 0);
    const msgText = `📅 *NOVO AGENDAMENTO - CHRIS CLEAN*

👤 Cliente: ${booking.nome}
📞 WhatsApp: ${booking.telefone}
🔧 Serviço: ${booking.servico}
📌 Categoria: ${booking.categoria}
📦 Quantidade: ${booking.quantidade}
🚗 Modelo da Viatura: ${booking.modelo_viatura || '—'}
💰 Total Estimado: ${formattedTotal}
📆 Data: ${booking.data}
⏰ Horário: ${booking.horario}
📍 Endereço: ${booking.endereco}
🚗 Taxa Deslocação: ${formattedTaxa}

✅ *Status:* Aguardando confirmação da CHRIS CLEAN

🧼✨ *Mais do que uma limpeza, entregamos saúde para a sua família e valorização para o seu património.*`;
    return `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(msgText)}`;
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedCategory('');
    setModeloViatura('');
  };

  // ============================================================
  // SUBMISSÃO
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nome.trim() || !telefone.trim() || !selectedServiceId || !selectedCategory || !data || !horario || !endereco.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios (Nome, WhatsApp, Serviço, Subcategoria, Data, Horário e Endereço).');
      return;
    }

    const [hours, minutes] = (horario || '').split(':').map(Number);
    const timeVal = hours + (minutes || 0) / 60;
    if (timeVal < 8 || timeVal > 12) {
      setErrorMsg('⚠️ Horário indisponível! Nossos serviços começam às 08:00 e terminam às 12:00. Por favor, escolha um horário nesse intervalo ou agende para o dia seguinte.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        servico: selectedService?.nome || '',
        categoria: selectedCategory,
        quantidade: quantidade,
        total: totalEstimado,
        data: data,
        horario: horario,
        endereco: endereco.trim(),
        obs: obs.trim() || null,
        status: 'pendente' as const,
        taxa_cobrada: currentTaxa,
        incluir_taxa: incluirTaxa,
        modelo_viatura: isViaturaService ? modeloViatura.trim() : null,
      };

      const result = await createAgendamento(payload);
      setConfirmedBooking(result);
      setSubmitSuccess(true);

      const whatsappUrl = getWhatsAppLink(result);
      try {
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        console.warn('Redirect to WhatsApp blocked by browser, using fallback button', err);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erro ao submeter agendamento:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao submeter o seu agendamento. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setNome('');
    setTelefone('');
    if (services.length > 0) setSelectedServiceId(services[0].id);
    else setSelectedServiceId('');
    setSelectedCategory('');
    setModeloViatura('');
    setQuantidade(1);
    setIncluirTaxa(true);
    setData('');
    setHorario('08:00');
    setEndereco('');
    setObs('');
    setSubmitSuccess(false);
    setConfirmedBooking(null);
    setErrorMsg('');
  };

  // ============================================================
  // RENDER (com correção do slice)
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-[#F1F5F9] relative transition-colors duration-500 overflow-x-hidden font-sans pb-16">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none z-0" />

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#090D16]/70 border-b border-slate-100 dark:border-white/[0.04] transition-colors duration-500 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-100 dark:border-white/10 flex items-center justify-center shadow-sm">
              <img
                src={chrisCleanLogo}
                alt="Chris Clean Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/0A1F5C/white?text=CC';
                }}
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-[#0A1F5C] dark:text-white tracking-tight block">
                CHRIS <span className="text-[#00C561]">CLEAN</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[#00B050] uppercase block -mt-1">
                Agendamento Exclusive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-[#00B050] hover:dark:text-[#00B050] transition-colors"
              title="Alternar Tema"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-900" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna esquerda - resumo e perfis */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="rounded-[24px] overflow-hidden relative h-[220px] md:h-[260px] shadow-xl group border border-slate-100 dark:border-white/[0.04]">
            <img
              src={selectedService ? getServiceImage(selectedService.nome) : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800'}
              alt="Service Visual"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="px-2.5 py-1 text-[9px] font-extrabold tracking-widest uppercase bg-[#00B050] rounded-full inline-block mb-2">
                Qualidade Premium
              </span>
              <h3 className="font-display font-extrabold text-xl md:text-2xl leading-tight">
                {selectedService ? selectedService.nome : 'Higienização Profissional'}
              </h3>
              <p className="text-xs opacity-90 font-medium mt-1">
                Equipa qualificada, produtos certificados e resultados que superam expectativas.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F1322] border border-slate-100 dark:border-white/[0.04] rounded-3xl p-6 shadow-md transition-all duration-300">
            <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Resumo do Orçamento</span>
              <span className="font-mono text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Tempo Real</span>
            </h4>
            <div className="space-y-3 font-medium text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="opacity-70">Serviço Selecionado:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedService ? selectedService.nome : 'Nenhum'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="opacity-70">Subcategoria:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {selectedCategory ? selectedCategory : '—'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="opacity-70">Preço Unitário:</span>
                <span className="font-bold text-[#00B050]">
                  {selectedCategory ? formatKwanza(unitPrice) : '0 AKZ'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="opacity-70">Quantidade total:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {quantidade}x
                </span>
              </div>
              {incluirTaxa && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="opacity-70">Taxa Deslocação:</span>
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    {formatKwanza(taxaDeslocacao)}
                  </span>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-white/[0.05] pt-4 mt-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Total Estimado</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 italic block -mt-1">Pague apenas após o serviço</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold font-display text-sky-600 dark:text-[#38bdf8]">
                    {formatKwanza(totalEstimado)}
                  </span>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Coluna direita - formulário */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {submitSuccess && confirmedBooking ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-[#0F1322] border border-slate-100 dark:border-white/[0.04] rounded-3xl p-8 shadow-xl text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold font-display text-[#0A1F5C] dark:text-white mb-2 tracking-tight">
                  Agendamento Registado!
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                  Olá, <strong className="font-bold text-slate-800 dark:text-white">{confirmedBooking.nome}</strong>. O seu pedido de agendamento foi adicionado com sucesso no nosso sistema de atendimento e já foi notificado à nossa equipa.
                </p>

                <div className="bg-slate-50 dark:bg-[#161B2E] border border-slate-100 dark:border-white/[0.05] rounded-2xl p-6 text-left mb-8 max-w-md mx-auto space-y-3.5 font-medium text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-white/[0.05] pb-3">
                    <span className="text-slate-400">Ref. Pedido:</span>
                    <span className="font-bold font-mono text-[#00B050]">
                      #{String(confirmedBooking.id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliente:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telemóvel:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.telefone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serviço:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.servico}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subcategoria:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.categoria}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantidade:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.quantidade}</span>
                  </div>
                  {confirmedBooking.modelo_viatura && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Modelo Viatura:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{confirmedBooking.modelo_viatura}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data e Hora:</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {confirmedBooking.data} às {confirmedBooking.horario}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endereço:</span>
                    <span className="font-bold text-slate-800 dark:text-white text-right max-w-[220px] truncate">{confirmedBooking.endereco}</span>
                  </div>
                  {confirmedBooking.obs && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Observações:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-right max-w-[200px] truncate">{confirmedBooking.obs}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 dark:border-white/[0.05] pt-4 text-sm">
                    <span className="text-slate-400 font-bold">Total Estimado:</span>
                    <span className="font-extrabold text-[#00B050] text-lg">{formatKwanza(confirmedBooking.total || 0)}</span>
                  </div>
                </div>

                <div className="bg-[#00B050]/10 border border-[#00B050]/20 rounded-2xl p-4 text-left flex gap-3 items-center max-w-md mx-auto mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00B050] animate-ping shrink-0" />
                  <p className="text-xs text-[#008F41] dark:text-[#4ade80] leading-relaxed font-semibold">
                    ✅ Respondemos em até <strong>10 minutos</strong> via WhatsApp para validar o horário.
                  </p>
                </div>



                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full max-w-md py-4 bg-[#0A1F5C] hover:bg-[#153488] text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all duration-300"
                >
                  Submeter Novo Agendamento
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-[#0F1322] border border-slate-100 dark:border-white/[0.04] rounded-3xl p-6 md:p-8 shadow-xl relative transition-colors duration-300"
              >
                <div className="mb-6">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#00B050] uppercase">Passo único</span>
                  <h2 className="text-xl md:text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight mt-1">
                    Preencher Dados do Serviço
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Insira as suas preferências abaixo. É simples, rápido e seguro.
                  </p>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/15 rounded-2xl p-4 mb-6 flex gap-2.5 items-center text-red-500 text-xs font-semibold">
                    <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 1. Identificação */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                      1. Identificação de Contacto
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Nome completo"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="WhatsApp ou telemóvel"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Serviço */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                        2. Escolher o Serviço Principal
                      </h3>
                      {selectedService && !isServiceMenuOpen && (
                        <button
                          type="button"
                          onClick={() => setIsServiceMenuOpen(true)}
                          className="text-xs font-extrabold text-[#00B050] hover:underline cursor-pointer"
                        >
                          Selecionar Serviço
                        </button>
                      )}
                    </div>

                    {isLoadingData ? (
                      <div className="py-8 flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#00B050] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <AnimatePresence mode="wait">
                        {!isServiceMenuOpen && selectedService ? (
                          <motion.div
                            key="collapsed"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            onClick={() => setIsServiceMenuOpen(true)}
                            className="p-4 rounded-2xl border border-[#00B050]/20 bg-gradient-to-br from-[#0A1F5C]/5 to-[#00B050]/5 dark:from-[#0A1F5C]/10 dark:to-[#00B050]/10 flex items-center justify-between cursor-pointer group hover:border-[#00B050] transition-all duration-300"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="p-3 rounded-xl bg-[#00B050]/15 text-[#00B050] group-hover:scale-105 transition-transform">
                                {React.createElement(getServiceIcon(selectedService.nome), { className: "w-5 h-5" })}
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide block">Serviço Selecionado</span>
                                <span className="text-sm font-extrabold text-slate-900 dark:text-white block group-hover:text-[#00B050] transition-colors">
                                  {selectedService.nome}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-[#00B050] uppercase tracking-wider hidden sm:inline-block">Toque para Alterar</span>
                              <ChevronRight className="w-4 h-4 text-[#00B050] group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {services.map(s => {
                                const IconComp = getServiceIcon(s.nome);
                                const isSelected = s.id === selectedServiceId;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                      handleServiceChange(s.id);
                                      setIsServiceMenuOpen(false);
                                    }}
                                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative group cursor-pointer ${
                                      isSelected
                                        ? 'bg-gradient-to-br from-[#0A1F5C]/5 to-[#00B050]/5 dark:from-[#0A1F5C]/15 dark:to-[#00B050]/15 border-[#00B050] ring-2 ring-[#00B050]/10 shadow-md'
                                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/[0.04] hover:bg-slate-100/50 dark:hover:bg-white/[0.04] hover:border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between w-full mb-4">
                                      <div className={`p-2.5 rounded-xl transition-colors ${
                                        isSelected ? 'bg-[#00B050]/20 text-[#00B050]' : 'bg-slate-200/50 dark:bg-white/5 text-slate-500'
                                      }`}>
                                        <IconComp className="w-5 h-5" />
                                      </div>
                                      {isSelected && (
                                        <div className="w-5 h-5 bg-[#00B050] rounded-full flex items-center justify-center text-white scale-100">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-display font-bold text-xs text-slate-900 dark:text-white block group-hover:text-[#00B050] transition-colors leading-tight">
                                        {s.nome}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {selectedService && (
                              <div className="text-right">
                                <button
                                  type="button"
                                  onClick={() => setIsServiceMenuOpen(false)}
                                  className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-[#F1F5F9] uppercase tracking-widest cursor-pointer"
                                >
                                  Fechar Menu ▲
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* 3. Subcategoria */}
                  {selectedService && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                        3. Escolher Opção Específica / Subcategoria
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(selectedService.precos).map(catName => {
                          const isSelected = catName === selectedCategory;
                          const price = selectedService.precos[catName];
                          return (
                            <button
                              key={catName}
                              type="button"
                              onClick={() => setSelectedCategory(catName)}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-[#00B050] text-white border-[#00B050] shadow-sm shadow-[#00B050]/20'
                                  : 'bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 border-slate-100 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                              }`}
                            >
                              <span>{catName}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                              }`}>
                                {formatKwanza(price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* 4. Modelo Viatura */}
                  <AnimatePresence>
                    {isViaturaService && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-2 pt-2"
                      >
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                          Modelo da Viatura
                        </h3>
                        <input
                          type="text"
                          required={isViaturaService}
                          placeholder="Ex: Hyundai i10, Kia Picanto, etc."
                          value={modeloViatura}
                          onChange={(e) => setModeloViatura(e.target.value)}
                          className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 5. Quantidade e taxa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                        4. Quantidade de Unidades
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setQuantidade(prev => Math.max(1, prev - 1))}
                          className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-[#00B050]/10 text-slate-600 dark:text-slate-300 hover:text-[#00B050] flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-base font-extrabold font-display text-slate-900 dark:text-white">
                          {quantidade}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantidade(prev => prev + 1)}
                          className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-white/[0.03] hover:bg-[#00B050]/10 text-slate-600 dark:text-slate-300 hover:text-[#00B050] flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                        5. Taxa de Deslocação
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIncluirTaxa(!incluirTaxa)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition-all duration-300 select-none cursor-pointer ${
                          incluirTaxa
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-[#008F41] dark:text-[#4ade80]'
                            : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.04] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          incluirTaxa ? 'bg-[#00B050] border-[#00B050] text-white' : 'border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900'
                        }`}>
                          {incluirTaxa && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-semibold">
                          Taxa de Deslocação ({formatKwanza(taxaDeslocacao)})
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 6. Data e Hora */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                      6. Agendar Dia e Horário Preferido
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 pointer-events-none">
                          <Calendar className="w-4 h-4" />
                        </span>
                        <input
                          type="date"
                          required
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                          style={{ colorScheme: isDark ? 'dark' : 'normal' }}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300 pointer-events-none">
                          <Clock className="w-4 h-4" />
                        </span>
                        <input
                          type="time"
                          required
                          min="08:00"
                          max="12:00"
                          value={horario}
                          onChange={(e) => setHorario(e.target.value)}
                          style={{ colorScheme: isDark ? 'dark' : 'normal' }}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </div>
                    </div>
                    {(() => {
                      if (!horario) return null;
                      const [hours, minutes] = horario.split(':').map(Number);
                      const timeVal = hours + (minutes || 0) / 60;
                      if (timeVal < 8 || timeVal > 12) {
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl text-xs space-y-2 leading-relaxed"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="text-sm shrink-0">⚠️</span>
                              <div>
                                <strong className="block font-bold mb-0.5">Horário Indisponível (08:00 às 12:00)</strong>
                                <p>Nossos serviços são realizados apenas entre as <strong>08:00</strong> e as <strong>12:00</strong>. Devido ao tempo necessário para realizar um excellent serviço, se agendar fora deste período (por exemplo, após as 12:00), sugerimos agendar para o <strong>dia seguinte</strong> para que possamos atendê-lo com toda a qualidade.</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* 7. Endereço */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                      7. Detalhes de Endereço
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="📍 Introduza o seu endereço ou localização"
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-slate-400">
                          <MessageSquare className="w-4 h-4" />
                        </span>
                        <textarea
                          placeholder="Observações importantes, detalhes da morada ou pontos de referência..."
                          rows={2}
                          value={obs}
                          onChange={(e) => setObs(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-[#00B050] focus:bg-white dark:focus:bg-[#0F1322] focus:ring-4 focus:ring-[#00B050]/5 transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#00B050] to-[#00e676] hover:from-[#0A1F5C] hover:to-[#1a3a8a] text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-sky-500/15 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'A Processar Pedido...' : 'Confirmar Reserva de Agendamento'}
                    {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-center gap-5 text-slate-400 text-[10px]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Shield className="w-3.5 h-3.5 text-[#00B050]" />
                      <span>Garantia Chris Clean</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5 text-[#00B050]" />
                      <span>Suporte Rápido</span>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

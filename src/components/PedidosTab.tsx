/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Filter, 
  Search, 
  MapPin, 
  Phone, 
  Car, 
  Calendar, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Lock,
  Compass,
  Briefcase
} from 'lucide-react';
import { Agendamento } from '../types';

interface PedidosTabProps {
  agendamentos: Agendamento[];
  onUpdateStatus: (id: string, status: string) => void;
  servicosDisponiveis: string[];
}

export default function PedidosTab({ agendamentos, onUpdateStatus, servicosDisponiveis }: PedidosTabProps) {
  // Filter States
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroServico, setFiltroServico] = useState('Todos');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const filteredPedidos = useMemo(() => {
    let result = [...agendamentos];

    if (dataInicio) {
      result = result.filter(p => p.data && p.data >= dataInicio);
    }
    if (dataFim) {
      result = result.filter(p => p.data && p.data <= dataFim);
    }
    if (filtroServico !== 'Todos') {
      result = result.filter(p => p.servico === filtroServico);
    }
    if (filtroStatus !== 'Todos') {
      result = result.filter(p => p.status === filtroStatus);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        (p.nome && p.nome.toLowerCase().includes(term)) ||
        (p.cliente && p.cliente.toLowerCase().includes(term)) ||
        (p.telefone && p.telefone.includes(term)) ||
        (p.morada && p.morada.toLowerCase().includes(term))
      );
    }

    return result;
  }, [agendamentos, dataInicio, dataFim, filtroServico, filtroStatus, searchTerm]);

  // Calculations for filtered items
  const totalFilteredValue = useMemo(() => {
    return filteredPedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  }, [filteredPedidos]);

  // Reset Filters
  const handleResetFilters = () => {
    setDataInicio('');
    setDataFim('');
    setFiltroServico('Todos');
    setFiltroStatus('Todos');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalItems = filteredPedidos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Ensure page is valid on filter updates
  const validPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedPedidos = filteredPedidos.slice(startIndex, startIndex + itemsPerPage);

  const statusChips: Record<string, React.ReactNode> = {
    pendente: (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15">
        ⏳ Pendente
      </span>
    ),
    'Em curso': (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15 animate-pulse">
        🔄 Em curso
      </span>
    ),
    Concluido: (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-green-500/10 text-green-600 dark:text-[#4ade80] border border-green-500/15">
        ✅ Concluído
      </span>
    ),
    Cancelado: (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/15">
        ❌ Cancelado
      </span>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          Gestão de Pedidos
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Consulte detalhes, filtre por data/status e atualize a situação de cada serviço.
        </p>
      </div>

      {/* Filtered Total Card */}
      <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#0F172A] shadow-sm border border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-[-30%] right-[-10%] w-[120px] h-[120px] rounded-full bg-[#00C561]/5 dark:bg-white/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
            Total dos Pedidos Filtrados
          </p>
          <h3 className="font-display font-black text-3xl tracking-tight text-[#00C561]">
            {totalFilteredValue.toLocaleString('pt-AO')} AKZ
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            Baseado em <strong className="text-[#00C561]">{totalItems}</strong> registros de agendamento selecionados.
          </p>
        </div>
        <div className="relative z-10 w-11 h-11 rounded-xl bg-[#00C561]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
          <Filter className="w-5 h-5 text-[#00C561]" />
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Search Term */}
          <div className="lg:col-span-2">
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Pesquisar Cliente / Telemóvel
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Ex: Guelson ou 923..."
                className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 pl-10 pr-4 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
              />
            </div>
          </div>

          {/* Date start */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Date end */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Action reset */}
          <div>
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-100 dark:border-white/[0.04] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpar Filtros
            </button>
          </div>

          {/* Service filter */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Filtrar por Serviço
            </label>
            <select
              value={filtroServico}
              onChange={(e) => { setFiltroServico(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            >
              <option value="Todos">Todos os Serviços</option>
              {servicosDisponiveis.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Filtrar por Estado
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            >
              <option value="Todos">Todos os Estados</option>
              <option value="pendente">⏳ Pendente</option>
              <option value="Em curso">🔄 Em curso</option>
              <option value="Concluido">✅ Concluído</option>
              <option value="Cancelado">❌ Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-4">
        {paginatedPedidos.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-10 text-center">
            <Search className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-35 mx-auto mb-3" />
            <h4 className="font-semibold text-base text-slate-800 dark:text-white">
              Nenhum agendamento corresponde aos filtros atuais
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Experimente alterar os limites de datas, remover o termo de pesquisa ou selecionar "Todos os Serviços".
            </p>
          </div>
        ) : (
          paginatedPedidos.map((p, idx) => {
            const isConcluido = p.status === 'Concluido';
            const isCancelado = p.status === 'Cancelado';

            return (
              <div 
                key={p.id || `ag-${idx}`}
                className={`bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-white/[0.04] p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  isConcluido ? 'border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.01]' : ''
                } ${
                  isCancelado ? 'border-red-500/20 dark:border-red-500/10 bg-red-500/[0.01]' : ''
                }`}
              >
                {/* Top Info section */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
                        {p.nome || p.cliente || 'Sem nome'}
                      </h4>
                      {isConcluido && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A352] bg-green-500/10 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                      {isCancelado && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                      )}
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      Ref: #{p.id ? String(p.id).slice(-6).toUpperCase() : 'N/A'}
                    </span>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="font-display font-black text-lg text-[#00C561]">
                      {(p.total || 0).toLocaleString('pt-AO')} AKZ
                    </div>
                    {p.taxa_deslocacao ? (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        + {p.taxa_deslocacao.toLocaleString('pt-AO')} AKZ taxa de deslocação
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Grid detailing addresses, phone, vehicle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 py-4">
                  {/* Service, Categoria */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <Briefcase className="w-4 h-4 text-[#00C561] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider select-none">Serviço Solicitado</span>
                      <strong className="text-slate-800 dark:text-white font-medium">{p.servico}</strong>
                      <span className="block text-slate-400 dark:text-slate-500">{p.categoria || 'Normal'}</span>
                    </div>
                  </div>

                  {/* Scheduled Date */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <Calendar className="w-4 h-4 text-[#00C561] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider select-none">Agendamento</span>
                      <strong className="text-slate-800 dark:text-white font-medium">{p.data}</strong>
                      <span className="block text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.hora || p.horario || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Phone */}
                  {(p.telefone || p.telemovel || p.phone) && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Phone className="w-4 h-4 text-[#00C561] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider select-none">Contacto Telefónico</span>
                        <strong className="text-slate-800 dark:text-white font-semibold">{p.telefone || p.telemovel || p.phone}</strong>
                      </div>
                    </div>
                  )}

                  {/* Viatura / Car model */}
                  {p.modelo_viatura && p.modelo_viatura !== '—' && (
                    <div className="flex items-start gap-2.5 text-xs">
                      <Car className="w-4 h-4 text-[#00C561] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider select-none">Modelo da Viatura</span>
                        <strong className="text-slate-800 dark:text-white font-medium">{p.modelo_viatura}</strong>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {(p.morada || p.endereco || p.address) && (
                    <div className="flex items-start gap-2.5 text-xs sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#00C561] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold tracking-wider select-none">Morada de Execução</span>
                        <strong className="text-slate-800 dark:text-white font-medium">{p.morada || p.endereco || p.address}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.04] pt-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 select-none">Estado Atual</span>
                    <div className="mt-1">{statusChips[p.status] || <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/15">⏳ {p.status || 'Pendente'}</span>}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConcluido ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/15">
                        <CheckCircle className="w-4 h-4" /> Concluído e Sincronizado
                      </div>
                    ) : isCancelado ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/15">
                        <XCircle className="w-4 h-4" /> Cancelado e Bloqueado
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline select-none">
                          Alterar estado:
                        </span>
                        <select
                          value={p.status}
                          onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                          className="px-3.5 py-1.5 border border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl outline-none focus:border-[#00C561] cursor-pointer"
                        >
                          <option value="pendente">⏳ Pendente</option>
                          <option value="Em curso">🔄 Em curso</option>
                          <option value="Concluido">✅ Concluído</option>
                          <option value="Cancelado">❌ Cancelado</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + 1, totalItems)}</span>–<span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="font-bold text-slate-700 dark:text-slate-300">{totalItems}</span> registros correspondentes
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={validPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Página {validPage} de {totalPages}
              </span>
              <button
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  XCircle,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { Gasto } from '../types';

interface FinancasTabProps {
  gastos: Gasto[];
  onAddGasto: (gasto: Gasto) => void;
}

export default function FinancasTab({ gastos, onAddGasto }: FinancasTabProps) {
  // New Expense form state
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('Consumível');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Filters State
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // List of standard categories and matching emojis
  const categoriesMap: Record<string, string> = {
    Consumível: '🧴 Consumíveis',
    Marketing: '📢 Marketing',
    Equipamento: '🛠️ Equipamento',
    Transporte: '🚕 Transporte',
    Combustível: '⛽ Combustível',
    Produtos: '🧼 Produtos de Higienização',
    Salários: '👥 Salários',
    Outros: '📌 Outros'
  };

  // Filter Logic
  const filteredGastos = useMemo(() => {
    let result = [...gastos];

    if (filtroInicio) {
      result = result.filter(g => g.data >= filtroInicio);
    }
    if (filtroFim) {
      result = result.filter(g => g.data <= filtroFim);
    }
    if (filtroCategoria !== 'Todos') {
      result = result.filter(g => g.categoria === filtroCategoria);
    }

    return result;
  }, [gastos, filtroInicio, filtroFim, filtroCategoria]);

  // Aggregate total expenses
  const totalFilteredGastosValue = useMemo(() => {
    return filteredGastos.reduce((sum, g) => sum + (g.valor || 0), 0);
  }, [filteredGastos]);

  // Pagination Logic
  const totalItems = filteredGastos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validPage = currentPage > totalPages ? Math.max(1, totalPages) : currentPage;
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedGastos = filteredGastos.slice(startIndex, startIndex + itemsPerPage);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!data || !categoria || !valor || !descricao.trim()) {
      setFormError('Preencha todos os campos obrigatórios do formulário.');
      return;
    }

    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setFormError('Insira um valor numérico válido.');
      return;
    }

    onAddGasto({
      data,
      categoria,
      valor: valorNum,
      descricao: descricao.trim()
    });

    // Success feedback and form reset
    setFormSuccess(true);
    setDescricao('');
    setValor('');
    // keep date and category for fast repeating entries
    setTimeout(() => setFormSuccess(false), 2000);
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
          Controlo de Saídas (Despesas)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Registe despesas operacionais com consumíveis, salários, publicidade e combustíveis.
        </p>
      </div>

      {/* KPI Card */}
      <div className="relative overflow-hidden rounded-[20px] p-6 text-white bg-slate-900 dark:bg-slate-800 shadow-sm border border-slate-800 dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-[-30%] right-[-10%] w-[120px] h-[120px] rounded-full bg-white/5 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-wider uppercase opacity-85 mb-1 select-none">
            Gasto Total no Período / Filtro
          </p>
          <h3 className="font-display font-black text-3xl tracking-tight text-red-500">
            {totalFilteredGastosValue.toLocaleString('pt-AO')} AKZ
          </h3>
          <p className="text-[10px] opacity-75 mt-2">
            Baseado em <strong className="text-white underline">{totalItems}</strong> itens de despesa filtrados atualmente.
          </p>
        </div>
        <div className="relative z-10 w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <TrendingDown className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {/* Register New Expense Form Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.04] select-none">
          <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-sm shrink-0">
            <Plus className="w-4 h-4" />
          </span>
          <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">
            Registar Nova Despesa
          </h4>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Date */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data da Despesa
            </label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all cursor-pointer"
            >
              {Object.entries(categoriesMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Value AKZ */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Valor (AKZ)
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Breve Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Compra de luvas e detergentes..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Submit btn */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
            <div>
              {formError && (
                <span className="text-xs text-red-500 font-semibold">{formError}</span>
              )}
            </div>
            <button
              type="submit"
              className={`w-full sm:w-auto px-8 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                formSuccess 
                  ? 'bg-[#00C561] text-white hover:bg-[#00A352]' 
                  : 'bg-red-500/10 text-red-600 hover:bg-red-500/15 border border-red-500/10'
              }`}
            >
              {formSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Registrado com Sucesso!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Registar Despesa
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Filters Card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 select-none">
          Filtros de Pesquisa de Despesas
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Filter Start Date */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Início
            </label>
            <input
              type="date"
              value={filtroInicio}
              onChange={(e) => { setFiltroInicio(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Filter End Date */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Fim
            </label>
            <input
              type="date"
              value={filtroFim}
              onChange={(e) => { setFiltroFim(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Filter Category */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Filtrar Categoria
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => { setFiltroCategoria(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all cursor-pointer"
            >
              <option value="Todos">Todas as Categorias</option>
              {Object.entries(categoriesMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div>
            <button
              onClick={() => { setFiltroInicio(''); setFiltroFim(''); setFiltroCategoria('Todos'); setCurrentPage(1); }}
              className="w-full py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              Redefinir Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List Panel */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 select-none">
          Histórico de Despesas Registradas
        </span>

        {paginatedGastos.length === 0 ? (
          <div className="text-center py-10">
            <XCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-35 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Nenhuma despesa corresponde aos critérios de filtragem ativos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {paginatedGastos.map((g, idx) => (
              <div 
                key={g.id || idx}
                className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] px-2 rounded-xl transition-colors duration-150"
              >
                <div>
                  <h5 className="font-semibold text-sm text-slate-800 dark:text-white">
                    {g.descricao}
                  </h5>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#00C561]" /> {g.data}</span>
                    <span className="text-slate-100 dark:text-slate-800">•</span>
                    <span className="font-bold text-[#00A352] bg-[#00C561]/5 px-2 py-0.5 rounded-full text-[10px] uppercase select-none">
                      {categoriesMap[g.categoria] || g.categoria}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="font-display font-black text-red-500 text-sm md:text-base">
                    − {g.valor.toLocaleString('pt-AO')} AKZ
                  </span>
                </div>
              </div>
            ))}

            {/* Pagination Panel */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Mostrando <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + 1, totalItems)}</span>–<span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="font-bold text-slate-700 dark:text-slate-300">{totalItems}</span> registros de despesa
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
        )}
      </div>
    </motion.div>
  );
}

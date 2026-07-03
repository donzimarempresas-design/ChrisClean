/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeftRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Info, 
  Filter, 
  RotateCcw, 
  Calendar, 
  HelpCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Briefcase
} from 'lucide-react';
import { Agendamento, Gasto } from '../types';

interface FluxoCaixaTabProps {
  agendamentos: Agendamento[];
  gastos: Gasto[];
}

interface Movimento {
  data: string;
  tipo: 'Entrada' | 'Saída';
  descricao: string;
  valor: number;
  categoria: string;
}

export default function FluxoCaixaTab({ agendamentos, gastos }: FluxoCaixaTabProps) {
  const DATA_CORTE_GASTOS = '2026-04-17';

  // Filters state
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipo, setTipo] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos');
  const [exportError, setExportError] = useState('');

  // Master lists aggregates
  const totalEntradas = useMemo(() => {
    return agendamentos
      .filter(a => a.status === 'Concluido')
      .reduce((sum, item) => sum + (item.total || 0), 0);
  }, [agendamentos]);

  const totalSaidas = useMemo(() => {
    return gastos
      .filter(g => g.data >= DATA_CORTE_GASTOS)
      .reduce((sum, item) => sum + (item.valor || 0), 0);
  }, [gastos]);

  const saldoEmCaixa = totalEntradas - totalSaidas;

  // Compile all movements (Entradas & Saídas)
  const movimentosAll = useMemo(() => {
    const list: Movimento[] = [];

    // Agendamentos Concluidos are Entradas
    agendamentos.forEach(a => {
      if (a.status === 'Concluido') {
        list.push({
          data: a.data || '',
          tipo: 'Entrada',
          descricao: `${a.servico || 'Higienização'} — ${a.nome || a.cliente || 'Cliente'}`,
          valor: a.total || 0,
          categoria: 'Pedido'
        });
      }
    });

    // Gastos after cut-off date are Saídas
    gastos.forEach(g => {
      if (g.data >= DATA_CORTE_GASTOS) {
        list.push({
          data: g.data,
          tipo: 'Saída',
          descricao: g.descricao,
          valor: g.valor,
          categoria: g.categoria
        });
      }
    });

    // Sort by date descending
    return list.sort((a, b) => b.data.localeCompare(a.data));
  }, [agendamentos, gastos]);

  // Apply active filters
  const filteredMovimentos = useMemo(() => {
    let result = [...movimentosAll];

    if (dataInicio) {
      result = result.filter(m => m.data >= dataInicio);
    }
    if (dataFim) {
      result = result.filter(m => m.data <= dataFim);
    }
    if (tipo !== 'Todos') {
      result = result.filter(m => m.tipo === tipo);
    }

    return result;
  }, [movimentosAll, dataInicio, dataFim, tipo]);

  const handleResetFilters = () => {
    setDataInicio('');
    setDataFim('');
    setTipo('Todos');
    setExportError('');
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    setExportError('');
    if (filteredMovimentos.length === 0) {
      setExportError('Nenhum movimento disponível para exportação.');
      setTimeout(() => setExportError(''), 4000);
      return;
    }

    const rows = filteredMovimentos.map(m => ({
      Data: m.data || '-',
      Tipo: m.tipo,
      Descrição: m.descricao.replace(/,/g, ';'),
      Categoria: m.categoria,
      Valor: m.tipo === 'Entrada' 
        ? `+${m.valor.toLocaleString('pt-AO')} AKZ` 
        : `-${m.valor.toLocaleString('pt-AO')} AKZ`
    }));

    // Calculate totals for CSV
    const totalEntradasFiltro = filteredMovimentos
      .filter(m => m.tipo === 'Entrada')
      .reduce((sum, m) => sum + m.valor, 0);

    const totalSaidasFiltro = filteredMovimentos
      .filter(m => m.tipo === 'Saída')
      .reduce((sum, m) => sum + m.valor, 0);

    const extraRows = [
      {},
      { Descrição: 'TOTAL ENTRADAS FILTRADAS', Valor: `${totalEntradasFiltro.toLocaleString('pt-AO')} AKZ` },
      { Descrição: 'TOTAL SAÍDAS FILTRADAS', Valor: `${totalSaidasFiltro.toLocaleString('pt-AO')} AKZ` },
      { Descrição: 'SALDO DO PERÍODO', Valor: `${(totalEntradasFiltro - totalSaidasFiltro).toLocaleString('pt-AO')} AKZ` }
    ];

    const allData = [...rows, ...extraRows];
    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'];
    
    const csvContent = [
      headers.join(','),
      ...allData.map(r => headers.map(h => {
        const val = (r as any)[h] || '';
        return `"${val}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fluxo_caixa_chris_clean_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Fluxo de Caixa Real
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Acompanhe entradas e saídas consolidadas de caixa para controle financeiro preciso.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Entradas */}
        <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] shadow-sm">
          <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00C561] flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
            Entradas Totais
          </p>
          <h3 className="font-display font-black text-2xl tracking-tight text-emerald-500">
            {totalEntradas.toLocaleString('pt-AO')} AKZ
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
            Soma de todos os pedidos concluídos
          </p>
        </div>

        {/* Saídas */}
        <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] shadow-sm">
          <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
            Saídas Totais
          </p>
          <h3 className="font-display font-black text-2xl tracking-tight text-red-500">
            {totalSaidas.toLocaleString('pt-AO')} AKZ
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
            Despesas após corte: {DATA_CORTE_GASTOS}
          </p>
        </div>

        {/* Saldo de Caixa */}
        <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] shadow-sm">
          <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
            Saldo em Caixa Real
          </p>
          <h3 className="font-display font-black text-2xl tracking-tight text-amber-500">
            {saldoEmCaixa.toLocaleString('pt-AO')} AKZ
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
            Diferença: Entradas − Saídas elegíveis
          </p>
        </div>
      </div>

      {/* Info Warning banner */}
      <div className="flex gap-3 items-center bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs font-semibold text-emerald-700 dark:text-[#4ade80] select-none">
        <Info className="w-5 h-5 text-[#00C561] shrink-0" />
        <span>
          Apenas despesas registadas a partir de <strong className="underline">{DATA_CORTE_GASTOS}</strong> são consideradas no Saldo em Caixa Real.
        </span>
      </div>

      {/* Cash Flow Advanced Filters Card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-white/[0.04] rounded-[20px] p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Start date */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* End date */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Data de Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
            />
          </div>

          {/* Type dropdown */}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 select-none">
              Tipo de Fluxo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2.5 px-3.5 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all cursor-pointer"
            >
              <option value="Todos">Todos os Movimentos</option>
              <option value="Entrada">📥 Entradas</option>
              <option value="Saída">📤 Saídas</option>
            </select>
          </div>

          {/* Buttons: Export & Reset */}
          <div className="flex flex-col gap-2">
            {exportError && (
              <span className="text-[10px] text-red-500 font-semibold mb-1 block">{exportError}</span>
            )}
            <div className="flex gap-2 w-full">
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-xl transition-all flex justify-center items-center gap-1.5 cursor-pointer uppercase select-none"
                title="Exportar para arquivo CSV"
              >
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
              <button
                onClick={handleResetFilters}
                className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center select-none"
                title="Limpar Filtros"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table/List */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <span className="block text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 select-none">
          Movimentos Financeiros Detalhados ({filteredMovimentos.length})
        </span>

        {filteredMovimentos.length === 0 ? (
          <div className="text-center py-10">
            <XCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-35 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Nenhum movimento registrado nos parâmetros selecionados.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMovimentos.map((m, idx) => {
              const isEntrada = m.tipo === 'Entrada';
              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 ${
                    isEntrada 
                      ? 'bg-emerald-500/[0.02] border-emerald-500/10' 
                      : 'bg-red-500/[0.02] border-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isEntrada 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-[#00C561]' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isEntrada ? <ArrowDownLeft className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                    </div>
                    <div>
                      <h5 className={`font-semibold text-xs sm:text-sm ${isEntrada ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                        {m.descricao}
                      </h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 select-none">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#00C561]" /> {m.data}</span>
                        <span>•</span>
                        <span className="uppercase text-[9.5px] font-bold tracking-wider">{m.categoria}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`font-display font-black text-sm md:text-base ${isEntrada ? 'text-[#00C561]' : 'text-red-500'}`}>
                      {isEntrada ? '+' : '−'} {m.valor.toLocaleString('pt-AO')} AKZ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Calendar,
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';
import { Agendamento, Gasto } from '../types';

interface RelatoriosTabProps {
  agendamentos: Agendamento[];
  gastos: Gasto[];
}

export default function RelatoriosTab({ agendamentos, gastos }: RelatoriosTabProps) {
  const [activeFaturamentoTooltip, setActiveFaturamentoTooltip] = useState<number | null>(null);

  // 1. Faturação Recente Data (Last 7 active days of concluded orders)
  const faturacaoData = useMemo(() => {
    const daily: Record<string, number> = {};
    agendamentos
      .filter(a => a.status === 'Concluido' && a.data)
      .forEach(a => {
        const d = a.data!;
        daily[d] = (daily[d] || 0) + (a.total || 0);
      });
    
    // Sort keys and take the last 7
    const sortedDays = Object.keys(daily).sort().slice(-7);
    return sortedDays.map(day => ({
      day,
      total: daily[day],
      // format to short date like 25/06
      label: day.split('-').slice(1, 3).reverse().join('/')
    }));
  }, [agendamentos]);

  // Max value for scaling
  const maxFaturacaoVal = useMemo(() => {
    const max = Math.max(...faturacaoData.map(d => d.total), 0);
    return max > 0 ? max * 1.15 : 10000; // adding padding
  }, [faturacaoData]);

  // 2. Serviços Populares Data (Service count)
  const servicosPopularesData = useMemo(() => {
    const counts: Record<string, number> = {};
    agendamentos.forEach(a => {
      if (a.servico) {
        counts[a.servico] = (counts[a.servico] || 0) + 1;
      }
    });

    const total = Object.values(counts).reduce((s, c) => s + c, 0);

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [agendamentos]);

  // 3. Gastos por Categoria Data
  const gastosPorCategoriaData = useMemo(() => {
    const categories: Record<string, number> = {};
    gastos.forEach(g => {
      if (g.categoria) {
        categories[g.categoria] = (categories[g.categoria] || 0) + g.valor;
      }
    });

    const total = Object.values(categories).reduce((s, c) => s + c, 0);

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [gastos]);

  // Custom Color Palettes
  const palette = ['#00C561', '#475569', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
          Análise de Dados & Relatórios
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Demonstrativos visuais de faturamento recente, categorias de despesas e popularidade de serviços.
        </p>
      </div>

      {/* Grid containing visual chart cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Faturação Recente (Bar chart) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#00C561]/10 text-[#00C561] flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5" />
              </span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider select-none">
                Faturação Recente (Últimos Dias)
              </h4>
            </div>
            <div className="text-[10px] font-bold text-[#00C561] bg-[#00C561]/10 px-2 py-0.5 rounded-full uppercase border border-[#00C561]/15 select-none">
              AKZ Concluído
            </div>
          </div>

          {faturacaoData.length === 0 ? (
            <div className="h-[240px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Calendar className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-xs font-semibold">Sem dados de agendamentos concluídos.</p>
            </div>
          ) : (
            <div className="relative pt-4">
              {/* Bars SVG Workspace */}
              <div className="h-[220px] w-full flex items-end justify-between gap-2.5 px-2">
                {faturacaoData.map((d, idx) => {
                  const heightPercent = maxFaturacaoVal > 0 ? (d.total / maxFaturacaoVal) * 100 : 0;
                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setActiveFaturamentoTooltip(idx)}
                      onMouseLeave={() => setActiveFaturamentoTooltip(null)}
                    >
                      {/* Interactive Tooltip popup */}
                      <AnimatePresence>
                        {activeFaturamentoTooltip === idx && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: -6, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full mb-2 bg-slate-900 text-white rounded-xl py-2 px-3 text-center shadow-lg border border-white/5 z-20 min-w-[110px]"
                          >
                            <span className="block text-[9px] text-white/50 font-bold uppercase">{d.day}</span>
                            <span className="block font-display font-black text-xs text-[#00C561]">
                              {d.total.toLocaleString('pt-AO')} AKZ
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
 
                      {/* Bar Fill */}
                      <div className="w-full bg-slate-500/5 dark:bg-slate-500/10 rounded-xl h-[180px] flex items-end overflow-hidden border border-black/[0.02] dark:border-white/[0.02]">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full rounded-b-lg rounded-t-xl bg-[#00C561]/80 shadow-lg shadow-[#00C561]/5 group-hover:bg-[#00C561] transition-all"
                        />
                      </div>
 
                      {/* X label */}
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chart 2: Serviços Populares (Proportion details) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <PieIcon className="w-4.5 h-4.5" />
              </span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider select-none">
                Serviços Populares (Procura)
              </h4>
            </div>
            <div className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase border border-indigo-500/15 select-none">
              Pedidos Totais
            </div>
          </div>

          {servicosPopularesData.length === 0 ? (
            <div className="h-[220px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <PieIcon className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-xs font-semibold">Sem registros de agendamentos solicitados.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[220px]">
              
              {/* Donut graphic representation */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG circular grid */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    className="stroke-slate-50 dark:stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* For simplicity and clean reliable layouts, we draw a multi-colored split circle using SVG dashboard segments */}
                  {servicosPopularesData.slice(0, 3).map((item, idx) => {
                    // split circle dashes
                    const circumference = 2 * Math.PI * 56;
                    const strokeDash = (item.percent / 100) * circumference;
                    const offset = servicosPopularesData
                      .slice(0, idx)
                      .reduce((sum, current) => sum + (current.percent / 100) * circumference, 0);

                    return (
                      <circle
                        key={idx}
                        cx="72"
                        cy="72"
                        r="56"
                        stroke={palette[idx % palette.length]}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 hover:scale-102 origin-center"
                      />
                    );
                  })}
                </svg>
                {/* Central percentage stats */}
                <div className="absolute flex flex-col items-center text-center">
                  <span className="font-display font-extrabold text-xl text-slate-800 dark:text-white leading-none">
                    {servicosPopularesData[0]?.percent || 0}%
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wide mt-1.5 select-none">
                    Líder
                  </span>
                </div>
              </div>

              {/* Legends detailed lists */}
              <div className="space-y-2 w-full max-w-[200px]">
                {servicosPopularesData.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: palette[idx % palette.length] }} 
                      />
                      <span className="text-slate-700 dark:text-slate-200 truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 shrink-0 font-bold">
                      {item.count} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chart 3: Despesas por Categoria (Horizontal bars list) */}
        <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5" />
              </span>
              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider select-none">
                Gastos por Categoria (Proporção)
              </h4>
            </div>
            <div className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full uppercase border border-red-500/15 select-none">
              Valor Despesa
            </div>
          </div>

          {gastosPorCategoriaData.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Wallet className="w-10 h-10 opacity-30 mb-2" />
              <p className="text-xs font-semibold">Sem despesas cadastradas para análise.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gastosPorCategoriaData.map((item, idx) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-red-500 font-bold">
                      {item.value.toLocaleString('pt-AO')} AKZ ({item.percent}%)
                    </span>
                  </div>
                  {/* Slider Progress Indicator */}
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}

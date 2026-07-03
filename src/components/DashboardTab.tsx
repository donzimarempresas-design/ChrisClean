/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Info,
  Trophy,
  Award
} from 'lucide-react';
import { Agendamento, Gasto } from '../types';

interface DashboardTabProps {
  agendamentos: Agendamento[];
  gastos: Gasto[];
  adminName: string;
}

export default function DashboardTab({ agendamentos, gastos, adminName }: DashboardTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const DATA_CORTE_GASTOS = '2026-04-17';

  // Dynamic 6-month ranking by billing of completed washes
  const monthNamesPT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const getDynamicSixMonths = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      let mIdx = currentMonthIndex - i;
      let y = currentYear;
      if (mIdx < 0) {
        mIdx += 12;
        y -= 1;
      }
      const monthKey = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      last6.push({
        key: monthKey,
        name: monthNamesPT[mIdx],
        year: y,
        total: 0
      });
    }
    return last6;
  };

  const dynamicMonths = getDynamicSixMonths();

  // Sum completed orders totals for each of the 6 months
  agendamentos.forEach(a => {
    if (a.status === 'Concluido' && a.data) {
      const orderMonthKey = a.data.slice(0, 7); // "YYYY-MM"
      const mObj = dynamicMonths.find(m => m.key === orderMonthKey);
      if (mObj) {
        mObj.total += (a.total || 0);
      }
    }
  });

  // Sort them descending to create the ranking
  const rankedMonths = [...dynamicMonths].sort((a, b) => b.total - a.total);
  const bestMonthTotal = Math.max(...dynamicMonths.map(m => m.total), 1);

  // Calculate high-level financial stats (Lifetime general)
  const totalEntradas = agendamentos
    .filter(a => a.status === 'Concluido')
    .reduce((sum, item) => sum + (item.total || 0), 0);

  const totalDespesas = gastos
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const balancoLiquido = totalEntradas - totalDespesas;

  // Calculate specific Fluxo de Caixa Real stats (with cut-off date)
  const totalSaidasReal = gastos
    .filter(g => g.data >= DATA_CORTE_GASTOS)
    .reduce((sum, item) => sum + (item.valor || 0), 0);

  const saldoEmCaixaReal = totalEntradas - totalSaidasReal;

  // Calculate status counts
  const statusCounts = {
    pendente: agendamentos.filter(a => a.status === 'pendente').length,
    'Em curso': agendamentos.filter(a => a.status === 'Em curso').length,
    Concluido: agendamentos.filter(a => a.status === 'Concluido').length,
    Cancelado: agendamentos.filter(a => a.status === 'Cancelado').length,
  };

  // Recent orders list with pagination
  const totalItems = agendamentos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = agendamentos.slice(startIndex, startIndex + itemsPerPage);

  const statusChips: Record<string, React.ReactNode> = {
    pendente: (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" /> ⏳ Pendente
      </span>
    ),
    'Em curso': (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5" /> 🔄 Em curso
      </span>
    ),
    Concluido: (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold bg-green-500/10 text-green-600 dark:text-[#4ade80] border border-green-500/20">
        <CheckCircle className="w-3.5 h-3.5" /> ✅ Concluído
      </span>
    ),
    Cancelado: (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
        <XCircle className="w-3.5 h-3.5" /> ❌ Cancelado
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
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            Resumo Executivo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visão geral em tempo real das operações e faturamento da Chris Clean.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Online & Sincronizado
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Olá, <strong className="text-slate-800 dark:text-white font-bold">{adminName}</strong> 👋
          </div>
        </div>
      </div>

      {/* Section 1: Fluxo de Caixa Real (Principal) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-white uppercase tracking-wider">
            📊 Fluxo de Caixa Real (Consolidado)
          </h3>
          <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
            Efetivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Entradas Totais */}
          <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
              Entradas Reais (Concluídos)
            </p>
            <h4 className="font-display font-black text-2xl tracking-tight text-emerald-500">
              {totalEntradas.toLocaleString('pt-AO')} AKZ
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
              Soma de todos os pedidos concluídos
            </p>
          </div>

          {/* Saídas Totais */}
          <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
              Saídas Reais (Elegíveis)
            </p>
            <h4 className="font-display font-black text-2xl tracking-tight text-red-500">
              {totalSaidasReal.toLocaleString('pt-AO')} AKZ
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
              Despesas reais registadas após {DATA_CORTE_GASTOS}
            </p>
          </div>

          {/* Saldo de Caixa Real */}
          <div className="relative overflow-hidden rounded-[20px] p-6 text-slate-800 dark:text-white bg-white dark:bg-[#111827] border border-slate-200/50 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2 select-none">
              Saldo Líquido em Caixa
            </p>
            <h4 className="font-display font-black text-2xl tracking-tight text-amber-500">
              {saldoEmCaixaReal.toLocaleString('pt-AO')} AKZ
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium select-none">
              Disponibilidade real em caixa
            </p>
          </div>
        </div>

        {/* Warning info note banner */}
        <div className="flex gap-3 items-center bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 text-xs font-semibold text-sky-700 dark:text-sky-400 select-none">
          <Info className="w-4.5 h-4.5 text-sky-500 shrink-0" />
          <span>
            Dica de Gestão: O Saldo em Caixa Real considera apenas saídas efetuadas a partir de <strong className="underline">{DATA_CORTE_GASTOS}</strong>.
          </span>
        </div>
      </div>

      {/* Section 2: Contabilidade e Balanço Geral (Lifetime) */}
      <div className="space-y-4 pt-2">
        <h3 className="font-display font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          📊 Histórico Contábil Geral
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Entradas */}
          <div className="relative overflow-hidden rounded-[20px] p-5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5">
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              Entradas Confirmadas
            </p>
            <h5 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">
              {totalEntradas.toLocaleString('pt-AO')} AKZ
            </h5>
          </div>

          {/* Despesas */}
          <div className="relative overflow-hidden rounded-[20px] p-5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5">
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              Total de Despesas
            </p>
            <h5 className="font-display font-bold text-lg text-slate-700 dark:text-slate-300">
              {totalDespesas.toLocaleString('pt-AO')} AKZ
            </h5>
          </div>

          {/* Balanço */}
          <div className="relative overflow-hidden rounded-[20px] p-5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5">
            <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-1">
              Balanço Geral Histórico
            </p>
            <h5 className={`font-display font-bold text-lg ${balancoLiquido >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {balancoLiquido.toLocaleString('pt-AO')} AKZ
            </h5>
          </div>
        </div>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pendentes */}
        <div className="rounded-[20px] p-5 text-center bg-amber-500/[0.04] dark:bg-amber-500/[0.02] border border-amber-500/15 text-amber-700 dark:text-amber-400">
          <Clock className="w-6 h-6 mx-auto opacity-60 mb-2" />
          <div className="font-display font-black text-3xl leading-none">{statusCounts.pendente}</div>
          <div className="text-[9.5px] font-bold tracking-wider uppercase opacity-75 mt-2">Pendentes</div>
        </div>

        {/* Em Curso */}
        <div className="rounded-[20px] p-5 text-center bg-blue-500/[0.04] dark:bg-blue-500/[0.02] border border-blue-500/15 text-blue-700 dark:text-blue-400">
          <RefreshCw className="w-6 h-6 mx-auto opacity-60 mb-2 animate-spin-slow" />
          <div className="font-display font-black text-3xl leading-none">{statusCounts['Em curso']}</div>
          <div className="text-[9.5px] font-bold tracking-wider uppercase opacity-75 mt-2">Em Curso</div>
        </div>

        {/* Concluidos */}
        <div className="rounded-[20px] p-5 text-center bg-green-500/[0.04] dark:bg-green-500/[0.02] border border-green-500/15 text-green-700 dark:text-[#00C561]">
          <CheckCircle className="w-6 h-6 mx-auto opacity-60 mb-2" />
          <div className="font-display font-black text-3xl leading-none">{statusCounts.Concluido}</div>
          <div className="text-[9.5px] font-bold tracking-wider uppercase opacity-75 mt-2">Concluídos</div>
        </div>

        {/* Cancelados */}
        <div className="rounded-[20px] p-5 text-center bg-red-500/[0.04] dark:bg-red-500/[0.02] border border-red-500/15 text-red-700 dark:text-red-400">
          <XCircle className="w-6 h-6 mx-auto opacity-60 mb-2" />
          <div className="font-display font-black text-3xl leading-none">{statusCounts.Cancelado}</div>
          <div className="text-[9.5px] font-bold tracking-wider uppercase opacity-75 mt-2">Cancelados</div>
        </div>
      </div>

      {/* Section 3: Ranking de Desempenho dos Últimos 6 Meses */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Ranking de Desempenho Mensal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visão dinâmica dos últimos 6 meses com melhor performance de faturamento (soma de lavagens concluídas).
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#00C561]/10 text-[#00A352] dark:text-[#4ade80] border border-[#00C561]/10 uppercase select-none">
            Visão Rolante (6 Meses)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Highlight Card for the #1 Month */}
          <div className="lg:col-span-1 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
                <Trophy className="w-6 h-6 animate-bounce" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Melhor Mês em Faturação
              </span>
              <h3 className="font-display font-black text-3xl text-slate-900 dark:text-white mt-1">
                {rankedMonths[0]?.name || '—'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ano de {rankedMonths[0]?.year}
              </p>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Faturado
              </p>
              <p className="font-display font-black text-2xl text-[#00C561] tracking-tight mt-0.5">
                {(rankedMonths[0]?.total || 0).toLocaleString('pt-AO')} AKZ
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Award className="w-4 h-4" />
                Desempenho Extraordinário 🚀
              </div>
            </div>
          </div>

          {/* Ranked List for all 6 months */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-center">
            {rankedMonths.map((item, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;
              const percentage = Math.round((item.total / bestMonthTotal) * 100) || 0;
              
              let medalClass = "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400";
              let medalIcon = `${index + 1}º`;
              
              if (isFirst) {
                medalClass = "bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/35 ring-4 ring-amber-500/10";
                medalIcon = "🥇";
              } else if (isSecond) {
                medalClass = "bg-slate-300/40 text-slate-700 dark:bg-white/10 dark:text-slate-300 border border-slate-300/50";
                medalIcon = "🥈";
              } else if (isThird) {
                medalClass = "bg-amber-700/20 text-amber-800 dark:bg-amber-700/10 dark:text-amber-500 border border-amber-700/30";
                medalIcon = "🥉";
              }

              return (
                <div key={item.key} className="flex items-center gap-4 group animate-fade-in">
                  {/* Rank Badge */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${medalClass}`}>
                    {medalIcon}
                  </div>

                  {/* Details & Progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block truncate">
                        {item.name} <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">({item.year})</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {item.total.toLocaleString('pt-AO')} AKZ
                      </span>
                    </div>

                    {/* Progress Bar container */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isFirst 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                            : 'bg-gradient-to-r from-sky-500 to-[#00C561]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Percentage badge */}
                  <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 w-8 text-right select-none">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders List Panel */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <h4 className="font-display font-bold text-lg text-slate-800 dark:text-white">
              Pedidos Recentes
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lista ordenada de todos os agendamentos registrados no sistema.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#00C561]/10 text-[#00A352] dark:text-[#4ade80] border border-[#00C561]/10 uppercase">
            Histórico Geral
          </div>
        </div>

        {paginatedOrders.length === 0 ? (
          <div className="text-center py-10">
            <XCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-35 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-600">
              Nenhum agendamento encontrado no sistema.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {paginatedOrders.map((p) => (
              <div 
                key={p.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] px-2 rounded-2xl transition-colors duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C561]/10 text-[#00A352] dark:text-[#4ade80] flex items-center justify-center shrink-0 font-bold">
                    {p.nome ? p.nome.charAt(0) : 'C'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                      {p.nome || p.cliente || 'Sem nome'}
                      {p.morada && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00C561]" /> {p.morada.split(',')[0]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{p.servico}</span>
                      <span className="text-slate-200 dark:text-slate-800">•</span>
                      <span>{p.categoria || 'Normal'}</span>
                      <span className="text-slate-200 dark:text-slate-800">•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.data}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-white/[0.04]">
                  <div className="text-left sm:text-right">
                    <div className="font-display font-black text-[#00C561] text-base">
                      {(p.total || 0).toLocaleString('pt-AO')} AKZ
                    </div>
                    {p.taxa_deslocacao ? (
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        + {p.taxa_deslocacao.toLocaleString('pt-AO')} deslocação
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-[110px] text-right">
                    {statusChips[p.status] || <span className="text-xs font-semibold">{p.status}</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-4 border-t border-slate-100 dark:border-white/[0.04]">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando <span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + 1, totalItems)}</span>–<span className="font-bold text-slate-700 dark:text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="font-bold text-slate-700 dark:text-slate-300">{totalItems}</span> registros
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Página {currentPage} de {totalPages || 1}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

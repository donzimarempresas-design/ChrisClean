/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Plus, 
  Save, 
  DollarSign, 
  Settings, 
  Wrench, 
  PlusCircle, 
  Layers, 
  Truck,
  CheckCircle2
} from 'lucide-react';
import { Servico } from '../types';

interface ServicosTabProps {
  servicos: Servico[];
  taxaDeslocacao: number;
  onSaveTaxa: (valor: number) => void;
  onUpdatePreco: (servicoId: string, categoria: string, preco: number) => void;
  onAddCategoria: (servicoId: string, categoria: string, preco: number) => void;
  onDeleteCategoria: (servicoId: string, categoria: string) => void;
  onCreateServicoPrincipal: (nome: string) => void;
}

export default function ServicosTab({
  servicos,
  taxaDeslocacao,
  onSaveTaxa,
  onUpdatePreco,
  onAddCategoria,
  onDeleteCategoria,
  onCreateServicoPrincipal
}: ServicosTabProps) {
  // Displacement rate local state
  const [localTaxa, setLocalTaxa] = useState(taxaDeslocacao);
  const [saveTaxaSuccess, setSaveTaxaSuccess] = useState(false);

  // Expanded Accordion State
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // New Service Category state for each accordion
  const [newCatNames, setNewCatNames] = useState<Record<string, string>>({});
  const [newCatPrices, setNewCatPrices] = useState<Record<string, string>>({});
  const [newCatErrors, setNewCatErrors] = useState<Record<string, string>>({});

  // New Primary Service state
  const [novoServicoName, setNovoServicoName] = useState('');
  const [primaryServiceError, setPrimaryServiceError] = useState('');

  const handleTaxaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTaxa(localTaxa);
    setSaveTaxaSuccess(true);
    setTimeout(() => setSaveTaxaSuccess(false), 2000);
  };

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleAddCatSubmit = (servicoId: string) => {
    setNewCatErrors(prev => ({ ...prev, [servicoId]: '' }));
    const name = newCatNames[servicoId]?.trim();
    const priceRaw = newCatPrices[servicoId];
    
    if (!name || !priceRaw) {
      setNewCatErrors(prev => ({ ...prev, [servicoId]: 'Preencha o nome e o preço da categoria.' }));
      return;
    }
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
      setNewCatErrors(prev => ({ ...prev, [servicoId]: 'Indique um preço numérico válido.' }));
      return;
    }

    onAddCategoria(servicoId, name, price);
    
    // Clear inputs for this service
    setNewCatNames(prev => ({ ...prev, [servicoId]: '' }));
    setNewCatPrices(prev => ({ ...prev, [servicoId]: '' }));
  };

  const handleCreatePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPrimaryServiceError('');
    if (!novoServicoName.trim()) {
      setPrimaryServiceError('Digite o nome do novo serviço principal.');
      return;
    }
    onCreateServicoPrincipal(novoServicoName);
    setNovoServicoName('');
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
          Configuração de Serviços
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Defina serviços, configure sub-categorias, edite taxas de deslocação e atualize preços operacionais.
        </p>
      </div>

      {/* Displacement Rate Settings Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C561]/10 text-[#00C561] flex items-center justify-center shrink-0 mt-0.5">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-slate-800 dark:text-white">
                Taxa de Deslocação do Cliente
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Valor fixo adicionado aos agendamentos para cobrir despesas de deslocação.
              </p>
            </div>
          </div>

          <form onSubmit={handleTaxaSubmit} className="flex gap-2 shrink-0 items-center">
            <div className="relative max-w-[150px]">
              <input
                type="number"
                value={localTaxa}
                onChange={(e) => setLocalTaxa(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2 px-3 pr-12 font-sans text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#00C561] transition-all"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none">
                AKZ
              </span>
            </div>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                saveTaxaSuccess 
                  ? 'bg-[#00C561] text-white hover:bg-[#00A352]' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'
              }`}
            >
              {saveTaxaSuccess ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Save className="w-3.5 h-3.5" /> Guardar
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Accordion List for Services */}
      <div className="space-y-3">
        <span className="block text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1 select-none">
          Serviços Ativos & Categorias de Preço
        </span>

        {servicos.length === 0 ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] p-10 text-center">
            <Wrench className="w-12 h-12 text-slate-400 dark:text-slate-600 opacity-35 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Nenhum serviço principal configurado. Adicione um abaixo.
            </p>
          </div>
        ) : (
          servicos.map((servico, index) => {
            const isExpanded = expandedIndex === index;
            const categories = Object.entries(servico.precos || {});
            
            return (
              <div 
                key={servico.id}
                className="bg-white dark:bg-[#0F172A] rounded-[20px] border border-slate-100 dark:border-white/[0.04] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Accordion Toggle Header */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-left bg-transparent border-none outline-none cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-slate-800 dark:text-white flex items-center justify-center">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800 dark:text-white">
                        {servico.nome}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider select-none">
                        {categories.length} Categorias de Preço
                      </span>
                    </div>
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/[0.04] space-y-4">
                        {/* Sub-categories grid lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {categories.length === 0 ? (
                            <div className="md:col-span-2 text-center py-6 text-xs text-slate-400 dark:text-slate-500 font-semibold bg-slate-500/5 rounded-2xl border border-dashed border-slate-100 dark:border-white/[0.04]">
                              Nenhuma categoria de preço definida para este serviço. Adicione uma no painel abaixo.
                            </div>
                          ) : (
                            categories.map(([cat, preco]) => (
                              <div 
                                key={cat}
                                className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.04]"
                              >
                                <div className="flex-1">
                                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 select-none">
                                    {cat}
                                  </span>
                                  <div className="relative max-w-[180px]">
                                    <input
                                      type="number"
                                      value={preco}
                                      onChange={(e) => onUpdatePreco(servico.id, cat, parseFloat(e.target.value) || 0)}
                                      className="w-full bg-white dark:bg-black/10 border border-slate-100 dark:border-white/[0.04] rounded-xl py-1.5 px-3 pr-12 text-xs font-bold text-[#00C561] outline-none focus:border-[#00C561]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none">
                                      AKZ
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => onDeleteCategoria(servico.id, cat)}
                                  className="p-2.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/10 cursor-pointer shrink-0 mt-3.5"
                                  title="Apagar categoria"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Category Creation Form */}
                        <div className="bg-slate-50 dark:bg-white/[0.01] border border-dashed border-slate-100 dark:border-white/[0.04] rounded-2xl p-4 flex flex-col sm:flex-row items-end gap-3">
                          <div className="flex-1 w-full">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 select-none">
                              Nova Categoria
                            </label>
                            <input
                              type="text"
                              value={newCatNames[servico.id] || ''}
                              onChange={(e) => setNewCatNames(prev => ({ ...prev, [servico.id]: e.target.value }))}
                              placeholder="Ex: Sofá T2, Solteiro, Jipe..."
                              className="w-full bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2 px-3 font-sans text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-[#00C561]"
                            />
                          </div>

                          <div className="w-full sm:w-[150px]">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 select-none">
                              Valor AKZ
                            </label>
                            <input
                              type="number"
                              value={newCatPrices[servico.id] || ''}
                              onChange={(e) => setNewCatPrices(prev => ({ ...prev, [servico.id]: e.target.value }))}
                              placeholder="0.00"
                              className="w-full bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-xl py-2 px-3 font-sans text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#00C561]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddCatSubmit(servico.id)}
                            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-xl transition-all w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 inline mr-1" /> Adicionar
                          </button>
                        </div>
                        
                        {newCatErrors[servico.id] && (
                          <p className="text-xs text-red-500 font-semibold px-1 mt-1">
                            {newCatErrors[servico.id]}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Primary Service Creator Panel */}
      <div className="bg-slate-900 dark:bg-[#0F172A] rounded-[20px] p-6 relative overflow-hidden shadow-sm border border-slate-800 dark:border-white/[0.04]">
        <div className="absolute top-[-40px] right-[-40px] w-[150px] h-[150px] rounded-full bg-[#00C561]/5 pointer-events-none" />
        <span className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1 select-none">
          Novo Cadastro
        </span>
        <h4 className="font-display font-bold text-lg text-white mb-4 select-none">
          Adicionar Serviço Principal
        </h4>
        <form onSubmit={handleCreatePrimarySubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={novoServicoName}
            onChange={(e) => setNovoServicoName(e.target.value)}
            placeholder="Ex: Higienização de Tapetes, Limpeza Pós-Obra..."
            className="flex-1 bg-white/5 font-medium text-white placeholder-white/30 border border-white/10 rounded-xl py-3 px-4 font-sans text-sm outline-none focus:border-[#00C561] focus:bg-white/10 transition-all"
          />
          <button type="submit" className="px-5 py-3 text-sm font-bold text-white bg-[#00C561] hover:bg-[#00A352] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0">
            <PlusCircle className="w-4 h-4" /> Criar e Guardar
          </button>
        </form>
        {primaryServiceError && (
          <p className="text-xs text-red-400 font-semibold mt-2 px-1">
            {primaryServiceError}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agendamento, Gasto, Servico } from '../types';

const SUPABASE_URL = 'https://cfhmflxowbxaqnrczoof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_tR5qCN28XMSmMxStuJFzug_WlKYD6oP';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

// Seed initial data to use as fallback or default
const defaultServicos: Servico[] = [
  {
    id: 'higienizacao_estofados',
    nome: 'Higienização de Estofados',
    precos: {
      'Sofá T1': 15000,
      'Sofá T2': 25000,
      'Sofá T3': 35000,
      'Sofá T4': 45000,
      'Cadeira/Poltrona': 5000
    }
  },
  {
    id: 'limpeza_viaturas',
    nome: 'Limpeza Profunda de Viaturas',
    precos: {
      'Ligeiro': 12000,
      'SUV': 18000,
      'Jipe': 22000,
      'Carrinha': 25000
    }
  },
  {
    id: 'higienizacao_tapetes',
    nome: 'Higienização de Tapetes e Carpetes',
    precos: {
      'Pequeno (< 2m²)': 5000,
      'Médio (2m² - 5m²)': 10000,
      'Grande (> 5m²)': 18000
    }
  },
  {
    id: 'higienizacao_colchoes',
    nome: 'Higienização de Colchões',
    precos: {
      'Solteiro': 8000,
      'Casal': 14000,
      'Queen': 18000,
      'King': 22000
    }
  }
];

const defaultAgendamentos: Agendamento[] = [
  {
    id: 'ag-1',
    nome: 'Guelson Mateus',
    servico: 'Higienização de Estofados',
    categoria: 'Sofá T3',
    data: '2026-06-25',
    hora: '09:00',
    modelo_viatura: '—',
    telefone: '923 456 789',
    morada: 'Lar do Patriota, Luanda',
    status: 'Concluido',
    total: 35000,
    taxa_deslocacao: 2000
  },
  {
    id: 'ag-2',
    nome: 'Cristina Donzolo',
    servico: 'Limpeza Profunda de Viaturas',
    categoria: 'SUV',
    data: '2026-07-02',
    hora: '14:30',
    modelo_viatura: 'Hyundai Santa Fe',
    telefone: '934 888 777',
    morada: 'Talatona, Luanda',
    status: 'Em curso',
    total: 18000,
    taxa_deslocacao: 2000
  },
  {
    id: 'ag-3',
    nome: 'António Silva',
    servico: 'Limpeza Profunda de Viaturas',
    categoria: 'Jipe',
    data: '2026-07-03',
    hora: '10:00',
    modelo_viatura: 'Toyota Prado',
    telefone: '912 345 678',
    morada: 'Alvalade, Luanda',
    status: 'pendente',
    total: 22000,
    taxa_deslocacao: 2500
  },
  {
    id: 'ag-4',
    nome: 'Fátima Santos',
    servico: 'Higienização de Colchões',
    categoria: 'Casal',
    data: '2026-06-28',
    hora: '08:30',
    modelo_viatura: '—',
    telefone: '945 111 222',
    morada: 'Viana, Luanda',
    status: 'Concluido',
    total: 14000,
    taxa_deslocacao: 3000
  },
  {
    id: 'ag-5',
    nome: 'Carlos Manuel',
    servico: 'Higienização de Tapetes',
    categoria: 'Grande (> 5m²)',
    data: '2026-06-20',
    hora: '11:00',
    modelo_viatura: '—',
    telefone: '921 777 666',
    morada: 'Nova Vida, Luanda',
    status: 'Cancelado',
    total: 18000,
    taxa_deslocacao: 1500
  },
  {
    id: 'ag-6',
    nome: 'Kátia Morais',
    servico: 'Higienização de Colchões',
    categoria: 'Solteiro',
    data: '2026-06-30',
    hora: '16:00',
    modelo_viatura: '—',
    telefone: '929 333 444',
    morada: 'Maianga, Luanda',
    status: 'Concluido',
    total: 8000,
    taxa_deslocacao: 2000
  },
  {
    id: 'ag-7',
    nome: 'João Ferreira',
    servico: 'Limpeza Profunda de Viaturas',
    categoria: 'Ligeiro',
    data: '2026-07-04',
    hora: '15:00',
    modelo_viatura: 'Kia Picanto',
    telefone: '911 555 222',
    morada: 'Centralidade do Kilamba, Bloco B',
    status: 'pendente',
    total: 12000,
    taxa_deslocacao: 2000
  },
  {
    id: 'ag-8',
    nome: 'Beatriz Neto',
    servico: 'Higienização de Estofados',
    categoria: 'Sofá T2',
    data: '2026-06-15',
    hora: '10:30',
    modelo_viatura: '—',
    telefone: '932 999 000',
    morada: 'Zango 0, Luanda',
    status: 'Concluido',
    total: 25000,
    taxa_deslocacao: 3500
  }
];

const defaultGastos: Gasto[] = [
  {
    id: 'g-1',
    data: '2026-06-28',
    categoria: 'Consumível',
    valor: 12000,
    descricao: 'Compra de Detergentes e Desinfetantes'
  },
  {
    id: 'g-2',
    data: '2026-06-25',
    categoria: 'Combustível',
    valor: 5000,
    descricao: 'Abastecimento Carrinha de Serviço'
  },
  {
    id: 'g-3',
    data: '2026-06-20',
    categoria: 'Transporte',
    valor: 8000,
    descricao: 'Táxi para equipa auxiliar'
  },
  {
    id: 'g-4',
    data: '2026-06-15',
    categoria: 'Equipamento',
    valor: 15000,
    descricao: 'Bico extrator de frestas novo'
  },
  {
    id: 'g-5',
    data: '2026-06-30',
    categoria: 'Salários',
    valor: 45000,
    descricao: 'Pagamento Diária Ajudantes'
  }
];

// LocalStorage helpers
const getStored = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

const setStored = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export async function fetchAgendamentos(): Promise<Agendamento[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos?select=*&order=created_at.desc`, { headers });
    if (!res.ok) throw new Error('Supabase request failed');
    const data = await res.json();
    if (data && Array.isArray(data)) {
      setStored('agendamentos', data);
      return data;
    }
  } catch (error) {
    console.warn('Falling back to local storage for agendamentos:', error);
  }
  return getStored('agendamentos', defaultAgendamentos);
}

export async function fetchGastos(): Promise<Gasto[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gastos?select=*&order=data.desc`, { headers });
    if (!res.ok) throw new Error('Supabase request failed');
    const data = await res.json();
    if (data && Array.isArray(data)) {
      setStored('gastos', data);
      return data;
    }
  } catch (error) {
    console.warn('Falling back to local storage for gastos:', error);
  }
  return getStored('gastos', defaultGastos);
}

export async function fetchServicos(): Promise<Servico[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/servicos?select=*`, { headers });
    if (!res.ok) throw new Error('Supabase request failed');
    const data = await res.json();
    if (data && Array.isArray(data)) {
      // Map correctly to expected precos object
      const formatted = data.map((s: any) => ({
        id: s.id,
        nome: s.nome,
        precos: s.precos || {}
      }));
      setStored('servicos', formatted);
      return formatted;
    }
  } catch (error) {
    console.warn('Falling back to local storage for servicos:', error);
  }
  return getStored('servicos', defaultServicos);
}

export async function fetchTaxaDeslocacao(): Promise<number> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/configuracoes?id=eq.taxa_deslocacao`, { headers });
    if (!res.ok) throw new Error('Supabase request failed');
    const data = await res.json();
    if (data && data[0]) {
      const val = parseFloat(data[0].valor);
      setStored('taxa_deslocacao', val);
      return val;
    }
  } catch (error) {
    console.warn('Falling back to local storage for taxa_deslocacao:', error);
  }
  return getStored('taxa_deslocacao', 2000);
}

export async function updateAgendamentoStatus(id: string, status: string): Promise<boolean> {
  // Update locally first
  const current = getStored<Agendamento[]>('agendamentos', defaultAgendamentos);
  const updated = current.map(a => a.id === id ? { ...a, status: status as any } : a);
  setStored('agendamentos', updated);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch (error) {
    console.error('Error saving to Supabase, saved locally:', error);
    return true; // Return true because it succeeded locally
  }
}

export async function createGasto(gasto: Gasto): Promise<boolean> {
  // Save locally first
  const current = getStored<Gasto[]>('gastos', defaultGastos);
  const newGasto = { ...gasto, id: `g-${Date.now()}` };
  setStored('gastos', [newGasto, ...current]);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gastos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(gasto)
    });
    return res.ok;
  } catch (error) {
    console.error('Error saving to Supabase, saved locally:', error);
    return true;
  }
}

export async function createAgendamento(agendamento: Omit<Agendamento, 'id'>): Promise<Agendamento> {
  const id = `ag-${Date.now()}`;
  const completeAgendamento: Agendamento = { ...agendamento, id, status: 'pendente' };
  
  // Save locally first
  const current = getStored<Agendamento[]>('agendamentos', defaultAgendamentos);
  setStored('agendamentos', [completeAgendamento, ...current]);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/agendamentos`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(completeAgendamento)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        // Update local with database response if available
        const updatedList = [data[0], ...current];
        setStored('agendamentos', updatedList);
        return data[0];
      }
    }
  } catch (error) {
    console.error('Error saving agendamento to Supabase, saved locally:', error);
  }
  
  return completeAgendamento;
}

export async function saveServico(id: string, precos: Record<string, number>): Promise<boolean> {
  // Update locally first
  const current = getStored<Servico[]>('servicos', defaultServicos);
  const updated = current.map(s => s.id === id ? { ...s, precos } : s);
  setStored('servicos', updated);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/servicos?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ precos })
    });
    return res.ok;
  } catch (error) {
    console.error('Error saving to Supabase, saved locally:', error);
    return true;
  }
}

export async function saveServicoPrincipal(id: string, nome: string): Promise<boolean> {
  // Update locally first
  const current = getStored<Servico[]>('servicos', defaultServicos);
  const newServico: Servico = { id, nome, precos: {} };
  setStored('servicos', [...current, newServico]);

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/servicos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, nome, precos: {} })
    });
    return res.ok;
  } catch (error) {
    console.error('Error saving to Supabase, saved locally:', error);
    return true;
  }
}

export async function updateTaxaDeslocacao(valor: number): Promise<boolean> {
  setStored('taxa_deslocacao', valor);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/configuracoes?id=eq.taxa_deslocacao`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ valor })
    });
    return res.ok;
  } catch (error) {
    console.error('Error saving to Supabase, saved locally:', error);
    return true;
  }
}

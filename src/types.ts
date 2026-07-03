/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Agendamento {
  id: string;
  created_at?: string;
  nome?: string;
  cliente?: string;
  servico?: string;
  categoria?: string;
  data?: string;
  hora?: string;
  horario?: string;
  modelo_viatura?: string;
  telefone?: string;
  telemovel?: string;
  phone?: string;
  morada?: string;
  endereco?: string;
  address?: string;
  status: 'pendente' | 'Em curso' | 'Concluido' | 'Cancelado';
  total?: number;
  taxa_deslocacao?: number;
}

export interface Gasto {
  id?: string;
  data: string;
  categoria: string;
  valor: number;
  descricao: string;
}

export interface Servico {
  id: string;
  nome: string;
  precos: Record<string, number>;
}

export interface Configuracao {
  id: string;
  valor: number;
}

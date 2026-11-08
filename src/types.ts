export interface Client {
  id: string;
  userId: string;
  name: string;
  timesPerWeek: number;
  birthDate: string; // YYYY-MM-DD
  pricePerClass: number;
  whatsapp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassRecord {
  id: string;
  userId: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  createdAt?: string;
}

export interface MonthlyPayment {
  id: string;
  userId: string;
  clientId: string;
  monthKey: string; // YYYY-MM
  status: 'pendente' | 'pago';
  updatedAt?: string;
}

export type TabType = 'clientes' | 'aulas' | 'financeiro';

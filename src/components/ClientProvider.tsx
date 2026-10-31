import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  initials: string;
  accent: string;
  keywordsTracked: number;
  avgPosition: number;
  visibility: number;
  top3: number;
  alerts: number;
}

const clients: Client[] = [
  { id: 'c1', name: 'Shaheen Print Hub', industry: 'Printing Services', location: 'Faisalabad, PK', initials: 'SP', accent: '#14b88f', keywordsTracked: 48, avgPosition: 12.4, visibility: 72, top3: 9, alerts: 3 },
  { id: 'c2', name: 'Blendz Marketing', industry: 'Digital Agency', location: 'Lahore, PK', initials: 'BM', accent: '#3b82f6', keywordsTracked: 126, avgPosition: 8.7, visibility: 84, top3: 22, alerts: 5 },
  { id: 'c3', name: 'Faisalabad Electronics', industry: 'Consumer Electronics', location: 'Faisalabad, PK', initials: 'FE', accent: '#ec8b1c', keywordsTracked: 210, avgPosition: 15.2, visibility: 61, top3: 14, alerts: 8 },
];

interface ClientContextValue {
  clients: Client[];
  activeClient: Client;
  setActiveClient: (id: string) => void;
}

const Ctx = createContext<ClientContextValue | null>(null);

export function useClient(): ClientContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useClient must be used within ClientProvider');
  return ctx;
}

export function ClientProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState(clients[0].id);
  const activeClient = clients.find(c => c.id === activeId) ?? clients[0];

  const setActiveClient = (id: string) => setActiveId(id);

  return <Ctx.Provider value={{ clients, activeClient, setActiveClient }}>{children}</Ctx.Provider>;
}

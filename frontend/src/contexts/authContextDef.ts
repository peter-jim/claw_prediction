import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  balance: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (balance: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

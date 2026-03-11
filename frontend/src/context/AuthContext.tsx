import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
    email: string;
    name: string;
    balance: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const newUser: User = {
            email,
            name: email.split('@')[0],
            balance: 1250.00,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const register = async (email: string, _password: string, name: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const newUser: User = {
            email,
            name: name || email.split('@')[0],
            balance: 100.00,
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

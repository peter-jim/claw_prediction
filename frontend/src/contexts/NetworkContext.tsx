import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface NetworkContextType {
    isMockMode: boolean;
    toggleMockMode: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
    // Check local storage for persistence
    const [isMockMode, setIsMockMode] = useState(() => {
        const saved = localStorage.getItem('isMockMode');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('isMockMode', JSON.stringify(isMockMode));
    }, [isMockMode]);

    const toggleMockMode = () => {
        setIsMockMode((prev: boolean) => !prev);
    };

    return (
        <NetworkContext.Provider value={{ isMockMode, toggleMockMode }}>
            {children}
        </NetworkContext.Provider>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface NetworkContextType {
    isMockMode: boolean;
    currentNetwork: string;
    setNetwork: (networkId: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
    const [currentNetwork, setCurrentNetwork] = useState(() => {
        const saved = localStorage.getItem('currentNetwork');
        return saved || 'hardhat';
    });

    useEffect(() => {
        localStorage.setItem('currentNetwork', currentNetwork);
    }, [currentNetwork]);

    // Both hardhat and sepolia are testnet / mock mode
    const isMockMode = currentNetwork === 'hardhat' || currentNetwork === 'sepolia';

    const setNetwork = (networkId: string) => {
        setCurrentNetwork(networkId);
    };

    return (
        <NetworkContext.Provider value={{ isMockMode, currentNetwork, setNetwork }}>
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

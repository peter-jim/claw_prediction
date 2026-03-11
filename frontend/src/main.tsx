import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { NetworkProvider } from './contexts/NetworkContext'

import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App.tsx'

const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http(),
  },
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#10b981',
          accentColorForeground: 'white',
          borderRadius: 'medium',
          fontStack: 'system',
          overlayBlur: 'small',
        })}>
          <NetworkProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </NetworkProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);

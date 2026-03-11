import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Polymarket',
  projectId: 'polymarket-local-dev', // WalletConnect project ID (placeholder for local dev)
  chains: [hardhat],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});

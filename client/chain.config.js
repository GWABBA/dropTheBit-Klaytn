import web3 from 'web3'
const chainConfig = {
  polygon: {
    chainId: 137,
    chainName: 'Polygon',
    params: {
      chainId: web3.utils.toHex(137),
      chainName: 'Polygon - Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC',
      },
      rpcUrls: ['https://polygon-rpc.com'],
    },
  },
  mumbai: {
    chainId: 80001,
    chainName: 'Mumbai',
    params: {
      chainId: web3.utils.toHex(80001),
      chainName: 'Mumbai - Testnet',
      nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC',
      },
      rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
    },
  },
  bsc_testnet: {
    chainId: 97,
    chainName: 'BSC Testnet',
    params: {
      chainId: web3.utils.toHex(97),
      chainName: 'BSC - Testnet',
      nativeCurrency: {
        name: 'BSC',
        decimals: 18,
        symbol: 'BSC',
      },
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
  },
  evmos: {
    chainId: 9001,
    chainName: 'Evmos Mainnet',
    params: {
      chainId: web3.utils.toHex(9001),
      chainName: 'Evmos Mainnet',
      nativeCurrency: {
        name: 'EVMOS',
        symbol: 'EVMOS',
        decimals: 18,
      },
      rpcUrls: ['https://eth.bd.evmos.org:8545'],
    },
  },
  klaytn_baobab: {
    chainId: 1001,
    chainName: 'Klaytn Baobab',
    params: {
      chainId: web3.utils.toHex(1001),
      chainName: 'Klaytn Baobab',
      nativeCurrency: {
        name: 'Klaytn',
        symbol: 'KLAY',
        decimals: 18,
      },
      rpcUrls: ['https://api.baobab.klaytn.net:8651'],
    },
  },
}
export { chainConfig }

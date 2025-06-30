import AuthUserAbi from '@/contracts/abis/AuthUser.json';
import AutomationLoanAbi from '@/contracts/abis/AutomationLoan.json';
import ViewFacetAbi from '@/contracts/abis/ViewFacet.json';
import CrossChainFacetAbi from '@/contracts/abis/CrossChainFacet.json';
import DiamondLoupeFacetAbi from '@/contracts/abis/DiamondLoupeFacet.json';
import { Star, Award, Crown } from 'lucide-react';

// Blockchain Configuration for Real Data Integration
export interface NetworkConfig {
    chainId: number;
    name: string;
    symbol: string;
    rpcUrl: string;
    blockExplorer: string;
    isTestnet: boolean;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    contracts?: {
        diamond?: string;
        authUser?: string;
        loanManager?: string;
        priceOracle?: string;
    };
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
   
    arbitrum: {
        chainId: 421614,
        name: "Arbitrum Sepolia",
        symbol: "ARB",
        rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
            "https://endpoints.omniatech.io/v1/arbitrum/sepolia/public",
        blockExplorer: "https://sepolia.arbiscan.io/",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
    optimism: {
        chainId: 11155420,
        name: "Optimism Sepolia",
        symbol: "OP",
        rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL ||
            "https://endpoints.omniatech.io/v1/op/sepolia/public",
        blockExplorer: "https://sepolia-optimism.etherscan.io/",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
    sepolia: {
        chainId: 11155111,
        name: "Ethereum Sepolia",
        symbol: "SepoliaETH",
        rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
            "https://eth-sepolia.g.alchemy.com/v2/demo",
        blockExplorer: "https://sepolia.etherscan.io",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
        contracts: {
            diamond: process.env.NEXT_PUBLIC_SEPOLIA_DIAMOND_ADDRESS,
            // authUser: process.env.NEXT_PUBLIC_SEPOLIA_AUTH_USER_ADDRESS ||
            //     "0xF21BaC0864E865B34d94F6D117B81f5Ff00a522B",
        },
    },
    avalanche: {
        chainId: 43113,
        name: "Avalanche Fuji",
        symbol: "AVAX",
        rpcUrl: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL ||
            "https://avalanche-fuji-c-chain-rpc.publicnode.com",
        blockExplorer: "https://testnet.snowtrace.io/",
        isTestnet: true,
        nativeCurrency: {
            name: "Avalanche",
            symbol: "AVAX",
            decimals: 18,
        },
        contracts: {
            diamond: process.env.NEXT_PUBLIC_AVALANCHE_DIAMOND_ADDRESS,
            // authUser: process.env.NEXT_PUBLIC_SEPOLIA_AUTH_USER_ADDRESS ||
            //     "0xF21BaC0864E865B34d94F6D117B81f5Ff00a522B",
        },
       
    },
    base: {
        chainId: 84532,
        name: "Base Sepolia",
        symbol: "BASE",
        rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL ||
            "https://base-sepolia.drpc.org",
        blockExplorer: "https://sepolia.basescan.org/",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
    unichain: {
        chainId: 1301,
        name: "Unichain Sepolia",
        symbol: "UNI",
        rpcUrl: process.env.NEXT_PUBLIC_UNICHAIN_RPC_URL ||
            "https://unichain-sepolia-rpc.publicnode.com",
        blockExplorer: "https://unichain-sepolia.blockscout.com/",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
};

// export const DEFAULT_NETWORK = "ethereum";
export const TESTNET_NETWORKS = ["sepolia"];

// Contract ABIs (will be populated from deployed contracts)
export const CONTRACT_ABIS = {
    ViewFacet: ViewFacetAbi,
    AuthUser: AuthUserAbi,
    AutomationLoan: AutomationLoanAbi,
    CrossChainFacet: CrossChainFacetAbi,
    DiamondLoupeFacet: DiamondLoupeFacetAbi,
    ERC20: [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
    ],
};

// Popular ERC20 tokens for each network
export const POPULAR_TOKENS: Record<
    string,
    Array<{
        address: string;
        symbol: string;
        name: string;
        decimals: number;
        logoUri?: string;
    }>
> = {
    
    sepolia: [
        {
            address: "0xf661043d9Bc1ef2169Ef90ad3b2285Cf8Bfc0AE2",
            symbol: "USDC",
            name: "Test USD Coin",
            decimals: 18,
        },
        {
            address: "0xf2aafef1e47da2b259ca1b8ba9f1fceedfba3f40",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        },
        {
            address: "0x64e5603850e87adc708620b13b5a4375a65bbf0e",
            symbol: "DAI",
            name: "Test Dai Stablecoin",
            decimals: 18,
        },
    ],
    avalanche: [
        {
            address: "0x7bA2e5c37C4151d654Fcc4b41ffF3Fe693c23852",
            symbol: "USDC",
            name: "Test USD Coin",
            decimals: 18,
        },
        {
            address: "0x8dd59e32c10720fb7920dbac0d227aada70a2ed2",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        },
        {
            address: "0xa7c3231e634cb55ca899667c0d21df1ba48df313",
            symbol: "DAI",
            name: "Test Dai Stablecoin",
            decimals: 18,
        },
    ],
    arbitrum: [
        {
            address: "0x5Df6eD08EEC2fD5e41914d291c0cf48Cd3564421",
            symbol: "USDC",
            name: "Test USD Coin",
            decimals: 6,
        },
        {
            address: "0xfcb2e48fadada921c91767d3f2befd8f08e34557",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        },
        {
            address: "0xfbfa26cb332e2a7dc7c5c203f93698e75b4f4a12",
            symbol: "DAI",
            name: "Test Dai Stablecoin",
            decimals: 18,
        },
    ],
    base: [
        {
            address: "0xcBA01C75D035ca98FfC7710DAe710435CA53c03C",
            symbol: "USDC",
            name: "Test USD Coin",
            decimals: 6,
        },
        {
            address: "0x20d644b679d123f42b8325c6b1d73ef7845a72cf",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        }
        
    ],
    optimism: [
        {
            address: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
            symbol: "USDC",
            name: "Test USD Coin",
            decimals: 6,
        },
        {
            address: "0x7ea8f579efded7033bb4afe2032d1e70f251e4d2",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        }
        
    ],
    unichain: [
       
        {
            address: "0x65ea2d9e8e4e982ba00085d0d51a48390df294ee",
            symbol: "USDT",
            name: "Test Tether USD",
            decimals: 18,
        },
        {
            address: "0xd991d7c91013c9d9db01f8197682cb660ca1c23d",
            symbol: "DAI",
            name: "Test Dai Stablecoin",
            decimals: 18,
        },
    ],
};

// Gas limits for different operations
export const GAS_LIMITS = {
    erc20Transfer: 21000,
    erc20Approve: 50000,
    nftMint: 200000,
    loanCreate: 300000,
    crossChainBridge: 500000,
};

// Loan tiers configuration
export const LOAN_TIERS = [
    {
        id: "standard",
        name: "Standard Tier",
        icon: Star,
        maxLTV: 60,
        interestRate: 8.5,
        color: "blue",
        description: "Basic lending tier for verified assets",
        minAssetValue: 10000,
        maxLoanAmount: 500000,
        gasEstimate: GAS_LIMITS.loanCreate,
    },
    {
        id: "premium", 
        name: "Premium Tier",
        icon: Award,
        maxLTV: 75,
        interestRate: 6.5,
        color: "purple",
        description: "Enhanced terms for high-value assets",
        minAssetValue: 50000,
        maxLoanAmount: 2000000,
        gasEstimate: GAS_LIMITS.loanCreate + 50000,
    },
    {
        id: "elite",
        name: "Elite Tier", 
        icon: Crown,
        maxLTV: 85,
        interestRate: 4.5,
        color: "gold",
        description: "Exclusive tier for premium real estate",
        minAssetValue: 250000,
        maxLoanAmount: 10000000,
        gasEstimate: GAS_LIMITS.loanCreate + 100000,
    },
];

// Fallback RPC URLs for better reliability
export const FALLBACK_RPC_URLS: Record<string, string[]> = {
    sepolia: [
        "https://eth-sepolia.g.alchemy.com/v2/demo",
        "https://rpc.sepolia.dev",
        "https://1rpc.io/sepolia"
    ]
};

// Utility functions
export function getNetworkConfig(
    chainId: number | string,
): NetworkConfig | null {
    const numericChainId = typeof chainId === "string"
        ? parseInt(chainId)
        : chainId;
    return Object.values(SUPPORTED_NETWORKS).find(
        (network) => network.chainId === numericChainId,
    ) || null;
}

export function getNetworkByName(networkName: string): NetworkConfig | null {
    return SUPPORTED_NETWORKS[networkName] || null;
}

export function isTestnet(chainId: number): boolean {
    const network = getNetworkConfig(chainId);
    return network?.isTestnet || false;
}

export function formatChainId(chainId: number): string {
    return `0x${chainId.toString(16)}`;
}

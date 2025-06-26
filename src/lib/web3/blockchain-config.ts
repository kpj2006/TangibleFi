import AuthUserAbi from '@/contracts/abis/AuthUser.json';
import AutomationLoanAbi from '@/contracts/abis/AutomationLoan.json';
import ViewFacetAbi from '@/contracts/abis/ViewFacet.json';
import CrossChainFacetAbi from '@/contracts/abis/CrossChainFacet.json';
import DiamondLoupeFacetAbi from '@/contracts/abis/DiamondLoupeFacet.json';

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
    ethereum: {
        chainId: 1,
        name: "Ethereum Mainnet",
        symbol: "ETH",
        rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
            "https://cloudflare-eth.com",
        blockExplorer: "https://etherscan.io",
        isTestnet: false,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
        contracts: {
            diamond: process.env.NEXT_PUBLIC_ETHEREUM_DIAMOND_ADDRESS,
            authUser: process.env.NEXT_PUBLIC_ETHEREUM_AUTH_USER_ADDRESS,
            loanManager: process.env.NEXT_PUBLIC_ETHEREUM_LOAN_MANAGER_ADDRESS,
            priceOracle: process.env.NEXT_PUBLIC_ETHEREUM_PRICE_ORACLE_ADDRESS,
        },
    },
    polygon: {
        chainId: 137,
        name: "Polygon",
        symbol: "MATIC",
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
            "https://polygon-rpc.com",
        blockExplorer: "https://polygonscan.com",
        isTestnet: false,
        nativeCurrency: {
            name: "Polygon",
            symbol: "MATIC",
            decimals: 18,
        },
        contracts: {
            diamond: process.env.NEXT_PUBLIC_POLYGON_DIAMOND_ADDRESS,
            authUser: process.env.NEXT_PUBLIC_POLYGON_AUTH_USER_ADDRESS,
        },
    },
    arbitrum: {
        chainId: 42161,
        name: "Arbitrum One",
        symbol: "ARB",
        rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
            "https://arb1.arbitrum.io/rpc",
        blockExplorer: "https://arbiscan.io",
        isTestnet: false,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
    optimism: {
        chainId: 10,
        name: "Optimism",
        symbol: "OP",
        rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL ||
            "https://mainnet.optimism.io",
        blockExplorer: "https://optimistic.etherscan.io",
        isTestnet: false,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
    },
    bsc: {
        chainId: 56,
        name: "BNB Smart Chain",
        symbol: "BNB",
        rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL ||
            "https://bsc-dataseed1.binance.org",
        blockExplorer: "https://bscscan.com",
        isTestnet: false,
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18,
        },
    },
    // Testnets
    sepolia: {
        chainId: 11155111,
        name: "Ethereum Sepolia",
        symbol: "SepoliaETH",
        rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
            "https://rpc.sepolia.org",
        blockExplorer: "https://sepolia.etherscan.io",
        isTestnet: true,
        nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
        },
        contracts: {
            diamond: process.env.NEXT_PUBLIC_SEPOLIA_DIAMOND_ADDRESS
            // authUser: process.env.NEXT_PUBLIC_SEPOLIA_AUTH_USER_ADDRESS ||
            //     "0xF21BaC0864E865B34d94F6D117B81f5Ff00a522B",
        },
    },
};

export const DEFAULT_NETWORK = "ethereum";
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
    ethereum: [
        {
            address: "0xA0b86a33E6441e8e421c7c7c4b8c8c8c8c8c8c8c",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
        },
        {
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
        },
        {
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            symbol: "DAI",
            name: "Dai Stablecoin",
            decimals: 18,
        },
    ],
    polygon: [
        {
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
        },
        {
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            symbol: "USDT",
            name: "Tether USD",
            decimals: 6,
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

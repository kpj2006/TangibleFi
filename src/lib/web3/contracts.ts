// Web3 Smart Contract Integration for TangibleFi
import { ethers } from "ethers";

// Contract ABIs (simplified for key functions)
export const DIAMOND_ABI = [
  "function mintAuthNFT(address to, string memory tokenURI, uint256 valuation) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function transferOwnership(address newOwner) public",
];

// Enhanced AutomationLoan ABI with cross-chain support
export const AUTOMATION_LOAN_ABI = [
  "function createLoan(uint256 tokenId, uint256 accountTokenId, uint256 duration, uint256 amount, address tokenAddress, uint64 sourceChainSelector, address sourceAddress) external",
  "function makeMonthlyPayment(uint256 loanId) external",
  "function repayLoanFull(uint256 loanId) external",
  "function getUserLoans(address user) external view returns (uint256[])",
  "function calculateLoanTerms(uint256 amount, uint256 duration) external pure returns (uint256 totalDebt, uint256 bufferAmount)",
  "function calculateInterestRate(uint256 duration) public pure returns (uint256)",
  "function getLoanByAccountId(uint256 accountTokenId) external view returns (tuple(uint256 loanId, uint256 loanAmount, uint256 startTime, uint256 duration, uint256 interestRate, uint256 totalDebt, bool isActive, address borrower, uint256 userAccountTokenId, uint256 bufferAmount, uint256 remainingBuffer, uint256 lastPaymentTime, bool[] monthlyPayments, address tokenAddress, uint64 sourceChainSelector, address sourceAddress))",
  "event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 indexed tokenId, uint256 accountTokenId, uint256 amount, address tokenAddress)",
  "event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 bufferAmount, uint64 sourceChainSelector)",
  "event LoanActivated(uint256 indexed loanId)",
  "event EMIPaid(uint256 indexed loanId, uint256 amount)",
  "event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount)",
  "event LoanLiquidated(uint256 indexed loanId, address indexed borrower)",
];

// ViewFacet ABI for loan calculations and queries
export const VIEW_FACET_ABI = [
  "function calculateLoanTerms(uint256 amount, uint256 duration) external pure returns (uint256 totalDebt, uint256 bufferAmount)",
  "function calculateInterestRate(uint256 duration) public pure returns (uint256)",
  "function getUserLoans(address user) external view returns (uint256[])",
  "function getLoanByAccountId(uint256 accountTokenId) external view returns (tuple(uint256 loanId, uint256 loanAmount, uint256 startTime, uint256 duration, uint256 interestRate, uint256 totalDebt, bool isActive, address borrower, uint256 userAccountTokenId, uint256 bufferAmount, uint256 remainingBuffer, uint256 lastPaymentTime, bool[] monthlyPayments, address tokenAddress, uint64 sourceChainSelector, address sourceAddress))",
  "function calculateTotalCurrentDebt(uint256 generatedLoanId) public view returns (uint256)",
  "function validateLoanCreationView(uint256 tokenId, uint256 duration) external view",
];

export const DIAMOND_CUT_ABI = [
  "function diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors)[] memory _diamondCut, address _init, bytes memory _calldata) external",
];

export interface ContractAddresses {
  diamond: string;
  diamondCutFacet: string;
  authUserFacet: string;
  automationLoan: string;
  viewFacet: string;
  crossChainFacet: string;
}

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  ethereum: {
    diamond:
      process.env.NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    diamondCutFacet:
      process.env.NEXT_PUBLIC_DIAMOND_CUT_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    authUserFacet:
      process.env.NEXT_PUBLIC_AUTH_USER_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    automationLoan:
      process.env.NEXT_PUBLIC_AUTOMATION_LOAN_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    viewFacet:
      process.env.NEXT_PUBLIC_VIEW_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    crossChainFacet:
      process.env.NEXT_PUBLIC_CROSS_CHAIN_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },
  polygon: {
    diamond:
      process.env.NEXT_PUBLIC_POLYGON_DIAMOND_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    diamondCutFacet:
      process.env.NEXT_PUBLIC_POLYGON_DIAMOND_CUT_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    authUserFacet:
      process.env.NEXT_PUBLIC_POLYGON_AUTH_USER_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    automationLoan:
      process.env.NEXT_PUBLIC_POLYGON_AUTOMATION_LOAN_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    viewFacet:
      process.env.NEXT_PUBLIC_POLYGON_VIEW_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    crossChainFacet:
      process.env.NEXT_PUBLIC_POLYGON_CROSS_CHAIN_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },
  arbitrum: {
    diamond:
      process.env.NEXT_PUBLIC_ARBITRUM_DIAMOND_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    diamondCutFacet:
      process.env.NEXT_PUBLIC_ARBITRUM_DIAMOND_CUT_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    authUserFacet:
      process.env.NEXT_PUBLIC_ARBITRUM_AUTH_USER_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    automationLoan:
      process.env.NEXT_PUBLIC_ARBITRUM_AUTOMATION_LOAN_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    viewFacet:
      process.env.NEXT_PUBLIC_ARBITRUM_VIEW_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
    crossChainFacet:
      process.env.NEXT_PUBLIC_ARBITRUM_CROSS_CHAIN_FACET_ADDRESS ||
      "0x0000000000000000000000000000000000000000",
  },
};

// Network configurations
export const NETWORK_CONFIG = {
  ethereum: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    rpcUrls: [
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
        "https://mainnet.infura.io/v3/",
    ],
    blockExplorerUrls: ["https://etherscan.io"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
  polygon: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    rpcUrls: [
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon-rpc.com",
    ],
    blockExplorerUrls: ["https://polygonscan.com"],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  arbitrum: {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    rpcUrls: [
      process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
        "https://arb1.arbitrum.io/rpc",
    ],
    blockExplorerUrls: ["https://arbiscan.io"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  },
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private currentNetwork: string = "ethereum";

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      console.log("MetaMask not detected, using development mode");
      // Return a mock address for development (40 hex characters = 20 bytes)
      const mockAddress =
        "0x" +
        Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
      return mockAddress;
    }

    const accounts = await this.provider.send("eth_requestAccounts", []);
    this.signer = await this.provider.getSigner();
    return accounts[0];
  }

  async switchNetwork(network: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected");
    }

    const networkConfig =
      NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkConfig.chainId }],
      });
      this.currentNetwork = network;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [networkConfig],
        });
        this.currentNetwork = network;
      } else {
        throw switchError;
      }
    }
  }

  async mintAssetNFT(
    to: string,
    tokenURI: string,
    valuation: string,
    network: string = this.currentNetwork
  ): Promise<{ txHash: string; tokenId: number }> {
    const addresses = CONTRACT_ADDRESSES[network];

    // Check if we're in development mode with no contracts deployed
    if (
      !addresses.diamond ||
      addresses.diamond === "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Development mode: Simulating NFT minting");
      // Return mock data for development
      const mockTxHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      return {
        txHash: mockTxHash,
        tokenId: Math.floor(Math.random() * 10000) + 1,
      };
    }

    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      addresses.diamond,
      DIAMOND_ABI,
      this.signer
    );

    try {
      const valuationWei = ethers.parseEther(valuation);
      const tx = await contract.mintAuthNFT(to, tokenURI, valuationWei);
      const receipt = await tx.wait();

      // Extract token ID from logs
      const mintEvent = receipt.logs.find(
        (log: any) =>
          log.topics[0] === ethers.id("Transfer(address,address,uint256)")
      );

      const tokenId = mintEvent ? parseInt(mintEvent.topics[3], 16) : 0;

      return {
        txHash: receipt.hash,
        tokenId,
      };
    } catch (error) {
      console.error("Minting error:", error);
      throw new Error(`Failed to mint NFT: ${error}`);
    }
  }

  async getAssetDetails(
    tokenId: number,
    network: string = this.currentNetwork
  ): Promise<{
    owner: string;
    tokenURI: string;
    metadata?: any;
  }> {
    if (!this.provider) {
      throw new Error("Provider not available");
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.diamond) {
      throw new Error(`Contract not deployed on ${network}`);
    }

    const contract = new ethers.Contract(
      addresses.diamond,
      DIAMOND_ABI,
      this.provider
    );

    try {
      const [owner, tokenURI] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.tokenURI(tokenId),
      ]);

      return { owner, tokenURI };
    } catch (error) {
      console.error("Error fetching asset details:", error);
      throw new Error(`Failed to fetch asset details: ${error}`);
    }
  }

  async getUserAssets(
    userAddress: string,
    network: string = this.currentNetwork
  ): Promise<number[]> {
    if (!this.provider) {
      throw new Error("Provider not available");
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.diamond) {
      throw new Error(`Contract not deployed on ${network}`);
    }

    const contract = new ethers.Contract(
      addresses.diamond,
      DIAMOND_ABI,
      this.provider
    );

    try {
      const balance = await contract.balanceOf(userAddress);
      const tokenIds: number[] = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
        tokenIds.push(Number(tokenId));
      }

      return tokenIds;
    } catch (error) {
      console.error("Error fetching user assets:", error);
      return [];
    }
  }

  async isContractOwner(
    userAddress: string,
    network: string = this.currentNetwork
  ): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.diamond) {
      return false;
    }

    try {
      const contract = new ethers.Contract(
        addresses.diamond,
        DIAMOND_ABI,
        this.provider
      );
      const owner = await contract.owner();
      return owner.toLowerCase() === userAddress.toLowerCase();
    } catch (error) {
      console.error("Error checking contract ownership:", error);
      return false;
    }
  }

  getCurrentNetwork(): string {
    return this.currentNetwork;
  }

  getContractAddress(network: string = this.currentNetwork): string {
    return CONTRACT_ADDRESSES[network]?.diamond || "";
  }

  getBlockExplorerUrl(
    txHash: string,
    network: string = this.currentNetwork
  ): string {
    const config = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
    return config ? `${config.blockExplorerUrls[0]}/tx/${txHash}` : "";
  }

  // ===== LOAN FUNCTIONALITY =====

  async createLoan(
    tokenId: number,
    accountTokenId: number,
    duration: number, // in seconds
    amount: string, // in ETH/token units
    tokenAddress: string,
    sourceChainSelector: number = 0, // 0 for same-chain
    sourceAddress: string = "0x0000000000000000000000000000000000000000",
    network: string = this.currentNetwork
  ): Promise<{ txHash: string; loanId?: number }> {
    const addresses = CONTRACT_ADDRESSES[network];

    // Development mode simulation
    if (
      !addresses.automationLoan ||
      addresses.automationLoan === "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Development mode: Simulating loan creation");
      const mockTxHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      return {
        txHash: mockTxHash,
        loanId: Math.floor(Math.random() * 10000) + 1,
      };
    }

    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      addresses.automationLoan,
      AUTOMATION_LOAN_ABI,
      this.signer
    );

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.createLoan(
        tokenId,
        accountTokenId,
        duration,
        amountWei,
        tokenAddress,
        sourceChainSelector,
        sourceAddress
      );
      const receipt = await tx.wait();

      // Extract loan ID from events
      const loanEvent = receipt.logs.find(
        (log: any) =>
          log.topics[0] ===
            ethers.id(
              "LoanCreated(uint256,address,uint256,uint256,uint256,address)"
            ) ||
          log.topics[0] ===
            ethers.id("LoanRequested(uint256,address,uint256,uint64)")
      );

      const loanId = loanEvent ? parseInt(loanEvent.topics[1], 16) : undefined;

      return {
        txHash: receipt.hash,
        loanId,
      };
    } catch (error) {
      console.error("Loan creation error:", error);
      throw new Error(`Failed to create loan: ${error}`);
    }
  }

  async calculateLoanTerms(
    amount: string,
    duration: number,
    network: string = this.currentNetwork
  ): Promise<{
    totalDebt: string;
    bufferAmount: string;
    interestRate: string;
  }> {
    if (!this.provider) {
      throw new Error("Provider not available");
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.viewFacet) {
      // Return mock data for development
      const amountNum = parseFloat(amount);
      const interestRate = 5 + (duration / (30 * 24 * 3600)) * 0.5; // 5% base + 0.5% per month
      const totalDebt =
        amountNum * (1 + (interestRate / 100) * (duration / (365 * 24 * 3600)));
      const bufferAmount = totalDebt - amountNum;

      return {
        totalDebt: totalDebt.toFixed(6),
        bufferAmount: bufferAmount.toFixed(6),
        interestRate: interestRate.toFixed(2),
      };
    }

    const contract = new ethers.Contract(
      addresses.viewFacet,
      VIEW_FACET_ABI,
      this.provider
    );

    try {
      const amountWei = ethers.parseEther(amount);
      const [totalDebt, bufferAmount] = await contract.calculateLoanTerms(
        amountWei,
        duration
      );
      const interestRate = await contract.calculateInterestRate(duration);

      return {
        totalDebt: ethers.formatEther(totalDebt),
        bufferAmount: ethers.formatEther(bufferAmount),
        interestRate: (Number(interestRate) / 100).toFixed(2), // Convert from basis points
      };
    } catch (error) {
      console.error("Error calculating loan terms:", error);
      throw new Error(`Failed to calculate loan terms: ${error}`);
    }
  }

  async getUserLoans(
    userAddress: string,
    network: string = this.currentNetwork
  ): Promise<number[]> {
    if (!this.provider) {
      throw new Error("Provider not available");
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.viewFacet) {
      // Return mock data for development
      return [1, 2, 3];
    }

    const contract = new ethers.Contract(
      addresses.viewFacet,
      VIEW_FACET_ABI,
      this.provider
    );

    try {
      const loanIds = await contract.getUserLoans(userAddress);
      return loanIds.map((id: any) => Number(id));
    } catch (error) {
      console.error("Error fetching user loans:", error);
      return [];
    }
  }

  async makeMonthlyPayment(
    loanId: number,
    network: string = this.currentNetwork
  ): Promise<{ txHash: string }> {
    const addresses = CONTRACT_ADDRESSES[network];

    // Development mode simulation
    if (
      !addresses.automationLoan ||
      addresses.automationLoan === "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Development mode: Simulating monthly payment");
      const mockTxHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      return { txHash: mockTxHash };
    }

    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      addresses.automationLoan,
      AUTOMATION_LOAN_ABI,
      this.signer
    );

    try {
      const tx = await contract.makeMonthlyPayment(loanId);
      const receipt = await tx.wait();

      return { txHash: receipt.hash };
    } catch (error) {
      console.error("Monthly payment error:", error);
      throw new Error(`Failed to make monthly payment: ${error}`);
    }
  }

  async repayLoanFull(
    loanId: number,
    network: string = this.currentNetwork
  ): Promise<{ txHash: string }> {
    const addresses = CONTRACT_ADDRESSES[network];

    // Development mode simulation
    if (
      !addresses.automationLoan ||
      addresses.automationLoan === "0x0000000000000000000000000000000000000000"
    ) {
      console.log("Development mode: Simulating full loan repayment");
      const mockTxHash =
        "0x" +
        Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");

      return { txHash: mockTxHash };
    }

    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    const contract = new ethers.Contract(
      addresses.automationLoan,
      AUTOMATION_LOAN_ABI,
      this.signer
    );

    try {
      const tx = await contract.repayLoanFull(loanId);
      const receipt = await tx.wait();

      return { txHash: receipt.hash };
    } catch (error) {
      console.error("Full repayment error:", error);
      throw new Error(`Failed to repay loan: ${error}`);
    }
  }

  // Cross-chain specific methods
  async createCrossChainLoan(
    tokenId: number,
    accountTokenId: number,
    duration: number,
    amount: string,
    tokenAddress: string,
    sourceChainSelector: number,
    sourceAddress: string,
    network: string = this.currentNetwork
  ): Promise<{ txHash: string; loanId?: number }> {
    return this.createLoan(
      tokenId,
      accountTokenId,
      duration,
      amount,
      tokenAddress,
      sourceChainSelector,
      sourceAddress,
      network
    );
  }

  // Helper method to get supported networks for cross-chain
  getSupportedNetworks(): string[] {
    return Object.keys(CONTRACT_ADDRESSES);
  }

  // Helper method to get chain selector for CCIP
  getChainSelector(network: string): number {
    const chainSelectors: Record<string, number> = {
      ethereum: 5009297550715157269,
      polygon: 4051577828743386545,
      arbitrum: 4949039107694359620,
    };
    return chainSelectors[network] || 0;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();

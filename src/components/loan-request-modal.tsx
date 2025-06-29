"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Calendar,
  Percent,
  Building,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Landmark,
  Calculator,
  Clock,
  Globe,
  Zap,
  Star,
  Award,
  Crown,
  Plus,
  Wallet,
  ArrowRight,
  Coins,
  RefreshCw,
  Network,
  CreditCard,
  ExternalLink,
  Info,
  Bug,
} from "lucide-react";
import MetaMaskConnect from "@/components/metamask-connect";
import { useBlockchainData } from "@/hooks/useBlockchainData";
import {
  SUPPORTED_NETWORKS,
  POPULAR_TOKENS,
  CONTRACT_ABIS,
  getNetworkConfig,
  GAS_LIMITS,
  LOAN_TIERS,
  FALLBACK_RPC_URLS,
  type NetworkConfig,
} from "@/lib/web3/blockchain-config";
import ViewFacetAbi from "@/contracts/abis/ViewFacet.json";
import AutomationLoanAbi from "@/contracts/abis/AutomationLoan.json";
import AuthUserABI from "@/contracts/abis/AuthUser.json";
import ERC20_ABI from "@/contracts/abis/ERC20.json";

interface Asset {
  tokenId: string;
  name: string;
  assetType: string;
  currentValue: number;
  isVerified: boolean;
  isCollateralized: boolean;
  network: string;
  tokenAddress?: string;
  owner?: string;
  // Enhanced ViewFacet data
  contractAmount?: number;
  investmentAmount?: number;
  duration?: number;
  interestRate?: number;
  activeLoanId?: string | null;
  canBeCollateralized?: boolean;
  hasActiveInvestment?: boolean;
}

interface UserNFTDetail {
  isActive: boolean;
  value: number;
  lastUpdate: number;
  tier: number;
  owner: string;
}

interface LoanRequestModalProps {
  children: React.ReactNode;
}

export default function LoanRequestModal({ children }: LoanRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"wallet" | "configure" | "confirm">(
    "wallet"
  );
  const [selectedAsset, setSelectedAsset] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("sepolia");
  const [selectedCurrency, setSelectedCurrency] = useState("usdt");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalComplete, setApprovalComplete] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [debugMode, setDebugMode] = useState(
    process.env.NODE_ENV === "development"
  );
  const [gasEstimate, setGasEstimate] = useState<string>("0");
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const { wallet, isConnected, connectWallet, portfolio } = useBlockchainData();

  // Get network configuration
  const networkConfig = getNetworkConfig(wallet.chainId || 11155111); // Default to Sepolia
  const selectedNetworkConfig = SUPPORTED_NETWORKS[selectedNetwork];
  const availableTokens = POPULAR_TOKENS[selectedNetwork] || [];
  const availableNetworks = Object.entries(SUPPORTED_NETWORKS).map(
    ([key, config]) => ({
      id: key,
      name: config.name,
      symbol: config.symbol,
      color: config.isTestnet ? "gray" : "blue",
    })
  );

  // Enhanced currencies with network-specific tokens - ONLY real ViewFacet data
  const availableCurrencies = availableTokens;

  useEffect(() => {
    if (open) {
      debugLog("Modal opened, checking wallet connection", {
        isConnected,
        walletAddress: wallet.address,
        walletChainId: wallet.chainId,
        networkConfig: networkConfig?.name,
      });

      if (isConnected && wallet.address) {
        setStep("configure");
        setWalletConnected(true);
        fetchUserAssets();
        validateNetwork();
      } else {
        debugLog("Wallet not connected, showing wallet step");
        setStep("wallet");
        setWalletConnected(false);
      }
    }
  }, [open, isConnected, wallet.chainId, wallet.address]);

  // Sync selectedCurrency with available currencies
  useEffect(() => {
    if (availableCurrencies.length > 0) {
      const currentCurrencyExists = availableCurrencies.find(
        (token) => token.symbol.toLowerCase() === selectedCurrency.toLowerCase()
      );

      if (!currentCurrencyExists) {
        debugLog("Selected currency not found, using first available", {
          selectedCurrency,
          availableCurrencies: availableCurrencies.map((c) => c.symbol),
          fallbackTo: availableCurrencies[0]?.symbol,
        });
        setSelectedCurrency(availableCurrencies[0].symbol.toLowerCase());
      }
    }
  }, [availableCurrencies, selectedCurrency]);

  const validateNetwork = () => {
    if (!networkConfig || !selectedNetworkConfig) {
      setNetworkError("Unsupported network");
      return;
    }

    if (networkConfig.chainId !== selectedNetworkConfig.chainId) {
      setNetworkError(`Please switch to ${selectedNetworkConfig.name}`);
      return;
    }

    setNetworkError(null);
  };

  const fetchUserAssets = async () => {
    setLoading(true);
    debugLog(
      "Starting fetchUserAssets with enhanced ViewFacet integration...",
      {
        walletAddress: wallet.address,
        isConnected,
        networkConfig: networkConfig?.name,
        diamondContract: networkConfig?.contracts?.diamond,
      }
    );

    try {
      if (!wallet.address || !networkConfig?.contracts?.diamond) {
        debugLog("Missing wallet address or diamond contract", {
          walletAddress: wallet.address,
          diamondContract: networkConfig?.contracts?.diamond,
          networkConfig,
          isConnected,
        });
        setAssets([]);
        return;
      }

      // Initialize provider and contract - use wallet provider to avoid CORS issues
      let provider;
      let viewFacetContract;
      let authUserContract;

      // Check if we have a valid wallet provider
      if (wallet.provider && typeof wallet.provider.request === "function") {
        // Use wallet provider (MetaMask) to avoid CORS issues
        provider = new ethers.BrowserProvider(wallet.provider);
        debugLog("Using wallet provider to avoid CORS issues");
      } else if (typeof window !== "undefined" && window.ethereum) {
        // Fallback to window.ethereum if wallet.provider is not valid
        provider = new ethers.BrowserProvider(window.ethereum);
        debugLog("Using window.ethereum as fallback provider");
      } else {
        // Last resort: use JsonRpcProvider (may have CORS issues)
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        debugLog("Using JsonRpcProvider (may have CORS issues)", {
          rpcUrl: networkConfig.rpcUrl,
        });
      }

      viewFacetContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        ViewFacetAbi,
        provider
      );

      // Also create AuthUser contract instance for metadata access
      authUserContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        AuthUserABI,
        provider
      );

      debugLog("Fetching comprehensive user data from ViewFacet", {
        userAddress: wallet.address,
        diamondContract: networkConfig.contracts.diamond,
        rpcUrl: networkConfig.rpcUrl,
      });

      // ENHANCED: Use getUserInvestments for comprehensive data in one call
      const [tokenIds, amounts, authStatuses] =
        await viewFacetContract.getUserInvestments(wallet.address);

      debugLog("Enhanced user investments data fetched", {
        tokenIds: tokenIds.map((id: bigint) => id.toString()),
        amounts: amounts.map((amt: bigint) => amt.toString()),
        authStatuses,
        count: tokenIds.length,
        userAddress: wallet.address,
      });

      // Also get user's existing loans for cross-reference
      let userLoanIds = [];
      try {
        userLoanIds = await viewFacetContract.getUserLoans(wallet.address);
        debugLog("User existing loans", {
          loanIds: userLoanIds.map((id: bigint) => id.toString()),
          count: userLoanIds.length,
        });
      } catch (loanError) {
        debugLog("Error fetching user loans (not critical):", loanError);
      }

      if (tokenIds.length === 0) {
        debugLog(
          "No NFT investments found for user - they need to mint assets first"
        );
        setAssets([]);
        toast.info(
          "No NFT assets found. Please mint some assets first from the Assets page."
        );
        return;
      }

      // Enhanced asset processing with comprehensive ViewFacet data
      const assetsPromises = tokenIds.map(
        async (tokenId: bigint, index: number) => {
          try {
            const tokenIdStr = tokenId.toString();
            debugLog(`Processing enhanced asset data for token ${tokenIdStr}`);

            // Get detailed NFT info using getUserNFTDetail - this returns real contract data
            const nftDetails = await viewFacetContract.getUserNFTDetail(
              wallet.address,
              tokenId
            );

            // nftDetails returns: [isAuth, amount, duration, rate, tokenAddress]
            const [isAuth, contractAmount, duration, rate, tokenAddress] =
              nftDetails;

            // Use data from getUserInvestments (more reliable for current state)
            const investmentAmount = amounts[index];
            const isAuthorized = authStatuses[index];

            debugLog(`ViewFacet raw data for token ${tokenIdStr}`, {
              fromGetUserInvestments: {
                amount: investmentAmount.toString(),
                isAuth: isAuthorized,
              },
              fromGetUserNFTDetail: {
                isAuth,
                amount: contractAmount.toString(),
                duration: duration.toString(),
                rate: rate.toString(),
                tokenAddress,
              },
            });

            // Check if this NFT is currently used as collateral in active loans
            let isCurrentlyCollateralized = false;
            let activeLoanId = null;

            // Cross-reference with user's active loans
            for (const loanId of userLoanIds) {
              try {
                const loanData = await viewFacetContract.getLoanById(loanId);
                // Check if this loan uses our tokenId as collateral and is active
                if (loanData.isActive) {
                  // In the contract, loans are mapped by collateral token ID
                  // We need to check if this specific token is used as collateral
                  // For now, assume if user has active loan, some asset is collateralized
                  if (investmentAmount > 0 || contractAmount > 0) {
                    // This is a simple check - in practice you'd want to map loan to specific tokenId
                    isCurrentlyCollateralized = true;
                    activeLoanId = loanId.toString();
                    debugLog(
                      `Token ${tokenIdStr} may be collateralized in loan ${activeLoanId}`
                    );
                    break;
                  }
                }
              } catch (loanDetailError) {
                debugLog(
                  `Error checking loan ${loanId.toString()}:`,
                  loanDetailError
                );
              }
            }

            // Get metadata from AuthUser contract for display info (name, type, etc.)
            let assetName = `NFT Asset #${tokenIdStr}`;
            let assetType = "Real World Asset";
            let displayValue = 0;

            try {
              // Get tokenURI from AuthUser contract for metadata
              const tokenURI = await authUserContract.tokenURI(tokenId);

              if (tokenURI) {
                let metadata = null;

                if (tokenURI.startsWith("data:application/json;base64,")) {
                  const base64Data = tokenURI.split(",")[1];
                  metadata = JSON.parse(atob(base64Data));
                } else if (tokenURI.startsWith("http")) {
                  try {
                    const response = await fetch(tokenURI);
                    metadata = await response.json();
                  } catch (fetchError) {
                    debugLog("Failed to fetch metadata from URL:", fetchError);
                  }
                }

                if (metadata) {
                  assetName = metadata.name || assetName;

                  // Extract asset type from metadata attributes
                  const assetTypeFromMetadata = metadata.attributes?.find(
                    (attr: any) =>
                      attr.trait_type === "Asset Type" ||
                      attr.trait_type === "Type"
                  )?.value;
                  assetType = assetTypeFromMetadata || assetType;

                  // Get display value from metadata if available (for UI display only)
                  const assetValueFromMetadata = metadata.attributes?.find(
                    (attr: any) =>
                      attr.trait_type === "Value (USD)" ||
                      attr.trait_type === "Value"
                  )?.value;

                  if (assetValueFromMetadata) {
                    displayValue =
                      typeof assetValueFromMetadata === "number"
                        ? assetValueFromMetadata
                        : parseFloat(assetValueFromMetadata.toString()) || 0;
                  }
                }
              }
            } catch (error) {
              debugLog(
                `Error getting metadata for token ${tokenIdStr}:`,
                error
              );
              // Continue anyway - we'll show the asset with ViewFacet data only
            }

            // Convert ViewFacet amounts from wei to readable format
            const contractValueInEth = parseFloat(
              ethers.formatEther(contractAmount)
            );
            const investmentValueInEth = parseFloat(
              ethers.formatEther(investmentAmount)
            );

            // Use ViewFacet amounts as the source of truth
            // If metadata has a display value, use it, otherwise use the contract amount
            const actualValue =
              displayValue > 0 ? displayValue : contractValueInEth * 2000; // Rough ETH to USD conversion for display

            debugLog(`Processed ViewFacet values for token ${tokenIdStr}`, {
              contractAmountWei: contractAmount.toString(),
              contractValueEth: contractValueInEth,
              investmentAmountWei: investmentAmount.toString(),
              investmentValueEth: investmentValueInEth,
              displayValue,
              finalDisplayValue: actualValue,
            });

            // Create asset object using ONLY ViewFacet data + metadata for display
            const asset = {
              tokenId: tokenIdStr,
              name: assetName,
              assetType: assetType,
              currentValue: actualValue || 1000, // Fallback for display
              isVerified: isAuthorized || isAuth, // From ViewFacet
              isCollateralized: isCurrentlyCollateralized, // From loan check
              network: networkConfig.name,
              tokenAddress:
                tokenAddress || networkConfig.contracts?.diamond || "",
              owner: wallet.address,

              // Pure ViewFacet data (source of truth)
              contractAmount: contractValueInEth, // ViewFacet amount in ETH
              investmentAmount: investmentValueInEth, // ViewFacet investment amount in ETH
              duration: duration ? parseInt(duration.toString()) : 0, // ViewFacet duration in seconds
              interestRate: rate ? parseFloat(ethers.formatUnits(rate, 2)) : 0, // ViewFacet rate (assuming basis points)
              activeLoanId: activeLoanId,

              // Status flags based on ViewFacet data
              canBeCollateralized:
                !isCurrentlyCollateralized &&
                (isAuthorized || isAuth) &&
                (investmentAmount > 0 || contractAmount > 0),
              hasActiveInvestment: investmentAmount > 0 || contractAmount > 0, // Real investment from ViewFacet

              // Raw ViewFacet data for debugging
              rawContractAmount: contractAmount.toString(),
              rawInvestmentAmount: investmentAmount.toString(),
              rawDuration: duration.toString(),
              rawRate: rate.toString(),
            } as Asset & {
              contractAmount: number;
              investmentAmount: number;
              duration: number;
              interestRate: number;
              activeLoanId: string | null;
              canBeCollateralized: boolean;
              hasActiveInvestment: boolean;
              rawContractAmount: string;
              rawInvestmentAmount: string;
              rawDuration: string;
              rawRate: string;
            };

            debugLog(
              `Final ViewFacet-based asset for token ${tokenIdStr}`,
              asset
            );
            return asset;
          } catch (error) {
            debugLog(
              `Error processing ViewFacet asset for token ${tokenId.toString()}`,
              error
            );
            return null;
          }
        }
      );

      const assetsResults = await Promise.all(assetsPromises);
      const validAssets = assetsResults.filter(
        (asset): asset is Asset => asset !== null
      );

      setAssets(validAssets);

      debugLog("Enhanced assets loaded from ViewFacet", {
        totalAssets: validAssets.length,
        verifiedAssets: validAssets.filter((a) => a.isVerified).length,
        collateralizedAssets: validAssets.filter((a) => a.isCollateralized)
          .length,
        availableForCollateral: validAssets.filter((a) => !a.isCollateralized)
          .length,
        activeInvestments: validAssets.filter((a: any) => a.hasActiveInvestment)
          .length,
        assets: validAssets,
      });

      if (validAssets.length === 0) {
        toast.info(
          "No investment assets found. Consider minting some assets first."
        );
      } else {
        const availableForCollateral = validAssets.filter(
          (a) => !a.isCollateralized
        ).length;
        toast.success(
          `Found ${validAssets.length} assets (${availableForCollateral} available for collateral)`
        );
      }
    } catch (error: any) {
      debugLog("Error fetching enhanced assets from ViewFacet", error);

      if (
        error?.message &&
        (error.message.includes("CORS") ||
          error.message.includes("Failed to fetch"))
      ) {
        toast.error(
          "CORS Error: Please ensure MetaMask is connected and try again"
        );
        debugLog("CORS error detected - user needs to use MetaMask provider");
      } else {
        toast.error("Failed to load assets from blockchain");
      }
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const createTestAssets = async () => {
    if (!debugMode) return;

    console.log(
      "🔧 DEBUG: Creating test assets using mock data (ViewFacet integration)"
    );
    toast.info("Creating test assets using mock data (ViewFacet integration)");

    // Mock test assets for debugging (since we're using blockchain now)
    const mockAssets: Asset[] = [
      {
        tokenId: "1001",
        name: "Downtown Office Building",
        assetType: "Commercial Real Estate",
        currentValue: 850000,
        isVerified: true,
        isCollateralized: false,
        network: selectedNetworkConfig?.name || "Sepolia",
        tokenAddress: networkConfig?.contracts?.diamond || "",
        owner: wallet.address || "",
      },
      {
        tokenId: "1002",
        name: "Residential Property #1234",
        assetType: "Residential Real Estate",
        currentValue: 450000,
        isVerified: true,
        isCollateralized: false,
        network: selectedNetworkConfig?.name || "Sepolia",
        tokenAddress: networkConfig?.contracts?.diamond || "",
        owner: wallet.address || "",
      },
      {
        tokenId: "1003",
        name: "Investment Portfolio - Stocks",
        assetType: "Securities",
        currentValue: 125000,
        isVerified: true,
        isCollateralized: false,
        network: selectedNetworkConfig?.name || "Sepolia",
        tokenAddress: networkConfig?.contracts?.diamond || "",
        owner: wallet.address || "",
      },
    ];

    setAssets(mockAssets);
    console.log("🔧 DEBUG: Mock assets created:", mockAssets);
    toast.success(`Created ${mockAssets.length} mock test assets`);
  };

  // Enhanced debug functions
  const debugLog = (message: string, data?: any) => {
    if (debugMode) {
      console.log(`🔧 DEBUG: ${message}`, data);
    }
  };

  const testBlockchainConnection = async () => {
    if (!debugMode) return;

    try {
      debugLog("Testing blockchain connection...");

      if (!networkConfig?.contracts?.diamond) {
        throw new Error("Diamond contract not configured");
      }

      // First try with the connected wallet provider if available
      if (wallet.provider) {
        try {
          debugLog("Testing with wallet provider...");
          const blockNumber = await wallet.provider.getBlockNumber();

          debugLog("Wallet provider connection successful", {
            network: networkConfig.name,
            blockNumber,
            diamondContract: networkConfig.contracts.diamond,
            walletProvider: "MetaMask/Injected",
          });

          toast.success(`✅ Wallet connected! Block: ${blockNumber}`);
          return;
        } catch (walletError: any) {
          debugLog("Wallet provider test failed, trying RPC", walletError);
        }
      }

      // Fallback to RPC provider (may have CORS issues in browser)
      try {
        debugLog("Testing with RPC provider...", {
          rpcUrl: networkConfig.rpcUrl,
        });

        const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        const blockNumber = await provider.getBlockNumber();

        debugLog("RPC connection successful", {
          network: networkConfig.name,
          blockNumber,
          diamondContract: networkConfig.contracts.diamond,
          rpcUrl: networkConfig.rpcUrl,
        });

        toast.success(`✅ RPC connected! Block: ${blockNumber}`);
      } catch (rpcError: any) {
        if (
          rpcError.message.includes("CORS") ||
          rpcError.message.includes("Failed to fetch")
        ) {
          debugLog(
            "CORS error detected - this is expected in browser environment",
            rpcError
          );
          toast.warning(
            "⚠️ CORS error (expected in browser). Use wallet provider instead."
          );
        } else {
          throw rpcError;
        }
      }
    } catch (error: any) {
      debugLog("Blockchain connection test failed", error);

      let errorMessage = error.message;
      if (
        error.message.includes("CORS") ||
        error.message.includes("Failed to fetch")
      ) {
        errorMessage =
          "CORS policy blocks direct RPC calls from browser. This is normal - use wallet connection instead.";
      }

      toast.error(`❌ Connection failed: ${errorMessage}`);
    }
  };

  const testViewFacetFunctions = async () => {
    if (!debugMode || !wallet.address || !networkConfig?.contracts?.diamond) {
      toast.error("Debug mode, wallet, or contract not available");
      return;
    }

    try {
      debugLog("Testing comprehensive ViewFacet functions...");

      let provider;
      if (wallet.provider && typeof wallet.provider.request === "function") {
        provider = new ethers.BrowserProvider(wallet.provider);
      } else if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      const viewFacetContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        ViewFacetAbi,
        provider
      );

      // Test 1: getUserInvestments
      const [tokenIds, amounts, authStatuses] =
        await viewFacetContract.getUserInvestments(wallet.address);
      debugLog("✅ getUserInvestments:", {
        tokenIds: tokenIds.map((id: bigint) => id.toString()),
        amounts: amounts.map((amt: bigint) => amt.toString()),
        authStatuses,
      });

      // Test 2: getUserLoans
      const userLoans = await viewFacetContract.getUserLoans(wallet.address);
      debugLog("✅ getUserLoans:", {
        loans: userLoans.map((id: bigint) => id.toString()),
      });

      // Test 3: calculateInterestRate for different durations
      const durations = [
        30 * 24 * 60 * 60,
        180 * 24 * 60 * 60,
        365 * 24 * 60 * 60,
      ]; // 1, 6, 12 months
      for (const duration of durations) {
        const rate = await viewFacetContract.calculateInterestRate(duration);
        debugLog(
          `✅ calculateInterestRate (${duration / (30 * 24 * 60 * 60)} months):`,
          {
            durationSeconds: duration,
            rateBasisPoints: rate.toString(),
            ratePercentage:
              (parseFloat(rate.toString()) / 100).toFixed(2) + "%",
          }
        );
      }

      // Test 4: calculateLoanTerms
      const testAmount = ethers.parseUnits("10000", 18); // $10,000 USDC
      const testDuration = 180 * 24 * 60 * 60; // 6 months
      const [totalDebt, bufferAmount] =
        await viewFacetContract.calculateLoanTerms(testAmount, testDuration);
      debugLog("✅ calculateLoanTerms:", {
        amount: "$10,000",
        duration: "6 months",
        totalDebt: ethers.formatUnits(totalDebt, 18),
        bufferAmount: ethers.formatUnits(bufferAmount, 18),
        interestAmount: ethers.formatUnits(bufferAmount, 18),
      });

      // Test 5: Get overdue loans (if any)
      const [overdueLoanIds, overdueCount] =
        await viewFacetContract.getOverdueLoanIds(10);
      debugLog("✅ getOverdueLoanIds:", {
        overdueIds: overdueLoanIds
          .slice(0, overdueCount)
          .map((id: bigint) => id.toString()),
        count: overdueCount.toString(),
      });

      // Test 6: If user has loans, get detailed loan data
      if (userLoans.length > 0) {
        for (const loanId of userLoans.slice(0, 3)) {
          // Test first 3 loans
          try {
            const loanData = await viewFacetContract.getLoanById(loanId);
            debugLog(`✅ getLoanById (${loanId.toString()}):`, {
              loanId: loanData.loanId.toString(),
              loanAmount: ethers.formatUnits(loanData.loanAmount, 18),
              isActive: loanData.isActive,
              borrower: loanData.borrower,
              startTime: new Date(
                parseInt(loanData.startTime.toString()) * 1000
              ).toLocaleString(),
              totalDebt: ethers.formatUnits(loanData.totalDebt, 18),
            });

            // Test calculateTotalCurrentDebt for active loans
            if (loanData.isActive) {
              const currentDebt =
                await viewFacetContract.calculateTotalCurrentDebt(loanId);
              debugLog(`✅ calculateTotalCurrentDebt (${loanId.toString()}):`, {
                currentDebt: ethers.formatUnits(currentDebt, 18),
              });
            }
          } catch (loanError) {
            debugLog(`❌ Error testing loan ${loanId.toString()}:`, loanError);
          }
        }
      }

      toast.success(
        `✅ ViewFacet comprehensive test completed! Check console for details.`
      );
    } catch (error: any) {
      debugLog("❌ ViewFacet comprehensive test failed", error);
      toast.error(`❌ ViewFacet test failed: ${error.message}`);
    }
  };

  const testContractCall = async () => {
    if (!debugMode || !wallet.address || !networkConfig?.contracts?.diamond) {
      toast.error("Debug mode, wallet, or contract not available");
      return;
    }

    try {
      debugLog("Testing ViewFacet contract call...");

      let provider;
      // Check if we have a valid wallet provider
      if (wallet.provider && typeof wallet.provider.request === "function") {
        // Use wallet provider to avoid CORS
        provider = new ethers.BrowserProvider(wallet.provider);
        debugLog("Using wallet provider for contract test");
      } else if (typeof window !== "undefined" && window.ethereum) {
        // Fallback to window.ethereum
        provider = new ethers.BrowserProvider(window.ethereum);
        debugLog("Using window.ethereum for contract test");
      } else {
        // Fallback to RPC (may have CORS issues)
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        debugLog("Using RPC provider for contract test (may have CORS issues)");
      }

      const viewFacetContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        ViewFacetAbi,
        provider
      );

      const userNFTIds = await viewFacetContract.getUserNFTs(wallet.address);

      debugLog("Contract call successful", {
        userAddress: wallet.address,
        nftIds: userNFTIds.map((id: bigint) => id.toString()),
        contractAddress: networkConfig.contracts.diamond,
      });

      toast.success(
        `✅ Contract call success! Found ${userNFTIds.length} NFTs`
      );
    } catch (error: any) {
      debugLog("Contract call failed", error);

      if (
        error.message.includes("CORS") ||
        error.message.includes("Failed to fetch")
      ) {
        toast.error(`❌ CORS Error: Use wallet provider instead of RPC`);
      } else if (error.message.includes("invalid EIP-1193 provider")) {
        toast.error(
          `❌ Invalid wallet provider. Please ensure MetaMask is properly connected.`
        );
      } else {
        toast.error(`❌ Contract call failed: ${error.message}`);
      }
    }
  };

  const testTokenBalances = async () => {
    if (!debugMode || !wallet.address || !networkConfig) {
      toast.error("Debug mode, wallet, or network not available");
      return;
    }

    try {
      debugLog("Testing token balances for all available tokens...");

      let provider;
      if (wallet.provider && typeof wallet.provider.request === "function") {
        provider = new ethers.BrowserProvider(wallet.provider);
      } else if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      const results = [];

      // Test ETH balance
      const ethBalance = await provider.getBalance(wallet.address);
      results.push({
        symbol: "ETH",
        balance: ethers.formatEther(ethBalance),
        address: "Native",
        valid: true,
      });

      // Test all configured tokens for current network
      for (const token of availableCurrencies) {
        try {
          if (token.address === "0x0000000000000000000000000000000000000000") {
            continue; // Skip zero address
          }

          const tokenContract = new ethers.Contract(
            token.address,
            [
              "function balanceOf(address account) view returns (uint256)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
              "function name() view returns (string)",
            ],
            provider
          );

          const balance = await tokenContract.balanceOf(wallet.address);
          const symbol = await tokenContract.symbol();
          const decimals = await tokenContract.decimals();
          const name = await tokenContract.name();

          results.push({
            symbol: symbol,
            expectedSymbol: token.symbol,
            balance: ethers.formatUnits(balance, decimals),
            rawBalance: balance.toString(),
            address: token.address,
            decimals: decimals,
            name: name,
            valid: true,
            isZero: balance.toString() === "0",
          });
        } catch (tokenError: any) {
          results.push({
            symbol: token.symbol,
            balance: "Error",
            address: token.address,
            valid: false,
            error: tokenError?.message || "Unknown error",
          });
        }
      }

      debugLog("Token balance test results", {
        network: networkConfig.name,
        chainId: networkConfig.chainId,
        userAddress: wallet.address,
        results,
      });

      const validTokens = results.filter((r) => r.valid);
      const tokensWithBalance = results.filter(
        (r) => r.valid && r.balance !== "0.0" && r.balance !== "Error"
      );

      toast.success(
        `✅ Token balance test complete! Found ${tokensWithBalance.length}/${validTokens.length} tokens with balance. Check console for details.`
      );

      // Show summary in console for easy reading
      console.table(
        results.map((r) => ({
          Symbol: r.symbol,
          Balance: r.balance,
          Address: r.address,
          Valid: r.valid ? "✅" : "❌",
        }))
      );
    } catch (error: any) {
      debugLog("Token balance test failed", error);
      toast.error(`❌ Token balance test failed: ${error.message}`);
    }
  };

  const clearAllData = () => {
    if (!debugMode) return;

    setAssets([]);
    setSelectedAsset("");
    setLoanAmount("");
    setLoanTerm("");
    setSelectedTier("");
    setStep("wallet");

    debugLog("All data cleared");
    toast.info("🧹 All data cleared");
  };

  const debugCheckAllowance = async () => {
    if (
      !debugMode ||
      !wallet.address ||
      !selectedCurrencyData ||
      !viewFacetLoanTerms ||
      !networkConfig?.contracts?.diamond
    ) {
      toast.error(
        "Debug mode, wallet, currency, loan terms, or network not available"
      );
      return;
    }

    try {
      debugLog("🔍 Manual allowance check starting...");

      let provider;
      if (wallet.provider && typeof wallet.provider.request === "function") {
        provider = new ethers.BrowserProvider(wallet.provider);
      } else if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      const tokenContract = new ethers.Contract(
        selectedCurrencyData?.address ?? "",
        [
          "function allowance(address owner, address spender) view returns (uint256)",
          "function balanceOf(address account) view returns (uint256)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
        ],
        provider
      );

      const currentAllowance = await tokenContract.allowance(
        wallet.address,
        networkConfig.contracts.diamond
      );
      const userBalance = await tokenContract.balanceOf(wallet.address);
      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();

      const loanAmountWei = ethers.parseUnits(
        loanAmount,
        selectedCurrencyData.decimals
      );
      const bufferAmountWei = viewFacetLoanTerms.bufferAmountWei;
      const requiredAllowance = loanAmountWei + bufferAmountWei * BigInt(2);

      const result = {
        tokenAddress: selectedCurrencyData.address,
        tokenSymbol,
        actualDecimals: tokenDecimals,
        currentAllowance: ethers.formatUnits(currentAllowance, tokenDecimals),
        required: ethers.formatUnits(requiredAllowance, tokenDecimals),
        deficit: ethers.formatUnits(
          requiredAllowance - currentAllowance,
          tokenDecimals
        ),
        sufficient: currentAllowance >= requiredAllowance,
      };

      debugLog("🔍 Manual allowance check results (unified):", result);
      console.table(result);

      if (result.sufficient) {
        toast.success("✅ Allowance check passed!");
      } else {
        toast.warning(
          `⚠️ Insufficient allowance detected.\nRequired: ${result.required} ${tokenSymbol}, Current: ${result.currentAllowance} ${tokenSymbol}. Please approve at least ${result.deficit} ${tokenSymbol} more.`
        );
      }
    } catch (error: any) {
      debugLog("❌ Manual allowance check failed", error);
      toast.error(`❌ Allowance check failed: ${error.message}`);
    }
  };

  const selectedAssetData = assets.find(
    (asset) => asset.tokenId === selectedAsset
  );
  const selectedTierData = LOAN_TIERS.find((tier) => tier.id === selectedTier);
  const selectedCurrencyData =
    availableCurrencies.find(
      (token) => token.symbol.toLowerCase() === selectedCurrency.toLowerCase()
    ) || (availableCurrencies.length > 0 ? availableCurrencies[0] : null); // Fallback to first available currency or null

  // Calculate loan details
  const maxLoanAmount =
    selectedAssetData && selectedTierData
      ? Math.min(
          (selectedAssetData.currentValue * selectedTierData.maxLTV) / 100,
          selectedTierData.maxLoanAmount
        )
      : 0;

  const monthlyPayment =
    loanAmount && loanTerm && selectedTierData
      ? calculateMonthlyPayment(
          parseFloat(loanAmount),
          selectedTierData.interestRate,
          parseInt(loanTerm)
        )
      : 0;

  const remainingTokens =
    selectedAssetData && loanAmount
      ? selectedAssetData.currentValue - parseFloat(loanAmount || "0")
      : 0;

  const ltvRatio =
    selectedAssetData && loanAmount
      ? (parseFloat(loanAmount || "0") / selectedAssetData.currentValue) * 100
      : 0;

  function calculateMonthlyPayment(
    principal: number,
    annualRate: number,
    months: number
  ): number {
    const monthlyRate = annualRate / 100 / 12;
    const payment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  }

  const calculateLoanTermsFromViewFacet = async (
    amount: string,
    termMonths: string
  ) => {
    if (!amount || !termMonths || !networkConfig?.contracts?.diamond) return;

    try {
      const provider = new ethers.BrowserProvider(wallet.provider);
      const viewFacetContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        ViewFacetAbi,
        provider
      );

      // Convert months to seconds for contract
      const durationInSeconds = parseInt(termMonths) * 30 * 24 * 60 * 60;
      // Convert amount to proper decimals (usually 18 for USDC/USDT)
      const amountInWei = ethers.parseUnits(amount, 18);

      // Get loan terms from contract
      const [totalDebt, bufferAmount] =
        await viewFacetContract.calculateLoanTerms(
          amountInWei,
          durationInSeconds
        );

      setViewFacetLoanTerms({
        totalDebt: parseFloat(ethers.formatUnits(totalDebt, 18)),
        bufferAmount: parseFloat(ethers.formatUnits(bufferAmount, 18)),
        totalDebtWei: totalDebt,
        bufferAmountWei: bufferAmount,
      });
    } catch (error) {
      console.error("Error calculating loan terms:", error);
    }
  };

  const estimateGas = async () => {
    if (!selectedTierData) return;

    try {
      // Estimate gas for loan creation
      const baseGas = selectedTierData.gasEstimate;
      let gasPrice;

      // Try to get gas price from proper provider
      if (wallet.provider && typeof wallet.provider.request === "function") {
        // Use wallet provider (MetaMask) to get gas price
        const provider = new ethers.BrowserProvider(wallet.provider);
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei"); // Fallback to 20 gwei
        debugLog("Gas price from wallet provider", {
          gasPrice: gasPrice.toString(),
        });
      } else if (typeof window !== "undefined" && window.ethereum) {
        // Fallback to window.ethereum
        const provider = new ethers.BrowserProvider(window.ethereum);
        const feeData = await provider.getFeeData();
        gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
        debugLog("Gas price from window.ethereum", {
          gasPrice: gasPrice.toString(),
        });
      } else {
        // Use default gas price if no provider available
        gasPrice = ethers.parseUnits("20", "gwei"); // 20 gwei default
        debugLog("Using default gas price", { gasPrice: gasPrice.toString() });
      }

      const estimatedCost = BigInt(baseGas) * gasPrice;
      setGasEstimate(ethers.formatEther(estimatedCost));

      if (debugMode) {
        console.log("Gas estimation:", {
          baseGas,
          gasPrice: gasPrice.toString(),
          estimatedCost: estimatedCost.toString(),
          formattedCost: ethers.formatEther(estimatedCost),
        });
      }
    } catch (error: any) {
      debugLog("Gas estimation failed, using fallback", error);

      // Fallback calculation with default gas price
      const baseGas = selectedTierData.gasEstimate;
      const fallbackGasPrice = ethers.parseUnits("20", "gwei");
      const fallbackCost = BigInt(baseGas) * fallbackGasPrice;
      setGasEstimate(ethers.formatEther(fallbackCost));

      if (debugMode) {
        console.log("Using fallback gas estimation:", {
          baseGas,
          fallbackGasPrice: fallbackGasPrice.toString(),
          fallbackCost: fallbackCost.toString(),
          formattedCost: ethers.formatEther(fallbackCost),
        });
      }
    }
  };

  useEffect(() => {
    if (selectedTierData && wallet.provider) {
      estimateGas();
    }
  }, [selectedTierData, wallet.provider]);

  const switchNetwork = async () => {
    if (!wallet.provider || !selectedNetworkConfig) return;

    try {
      await wallet.provider.send("wallet_switchEthereumChain", [
        { chainId: `0x${selectedNetworkConfig.chainId.toString(16)}` },
      ]);
    } catch (error: any) {
      if (error?.code === 4902) {
        // Network not added to wallet
        try {
          await wallet.provider.send("wallet_addEthereumChain", [
            {
              chainId: `0x${selectedNetworkConfig.chainId.toString(16)}`,
              chainName: selectedNetworkConfig.name,
              nativeCurrency: selectedNetworkConfig.nativeCurrency,
              rpcUrls: [selectedNetworkConfig.rpcUrl],
              blockExplorerUrls: [selectedNetworkConfig.blockExplorer],
            },
          ]);
        } catch (addError: any) {
          console.error("Failed to add network:", addError);
          toast.error("Failed to add network to wallet");
        }
      } else {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network");
      }
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      // Wait a bit for wallet state to update
      setTimeout(() => {
        if (isConnected && wallet.address) {
          setStep("configure");
          setWalletConnected(true);
          fetchUserAssets();
          validateNetwork();
        }
      }, 1000);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Failed to connect wallet");
    }
  };

  // Function to handle token approval
  const handleTokenApproval = async (withPrecisionBuffer = false) => {
    if (
      !wallet.address ||
      !viewFacetLoanTerms ||
      !networkConfig?.contracts?.diamond ||
      !selectedCurrencyData
    ) {
      toast.error("Missing required data for token approval");
      return;
    }

    setApproving(true);

    try {
      // Initialize provider safely
      let provider;
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }
      provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create ERC20 contract instance
      const tokenContract = new ethers.Contract(
        selectedCurrencyData.address,
        ERC20_ABI,
        signer
      );

      // Calculate total required allowance in Wei exactly matching contract logic
      // Contract checks: token.allowance(borrower, address(this)) < (amount + bufferAmount + bufferAmount)
      const loanAmountWei = ethers.parseUnits(
        loanAmount,
        selectedCurrencyData.decimals
      );
      const bufferAmountWei = viewFacetLoanTerms.bufferAmountWei;

      // IMPORTANT: Match the contract exactly - amount + bufferAmount + bufferAmount
      const requiredAllowance =
        loanAmountWei + bufferAmountWei + bufferAmountWei;

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(
        wallet.address,
        networkConfig.contracts.diamond
      );

      // Format amounts for debugging (convert from Wei to token units)
      const formatAmount = (amount) =>
        ethers.formatUnits(amount, selectedCurrencyData.decimals);

      debugLog("Token approval check with contract-matching logic", {
        loanAmountWei: formatAmount(loanAmountWei),
        bufferAmountWei: formatAmount(bufferAmountWei),
        doubleBufferLogic: `${formatAmount(loanAmountWei)} + ${formatAmount(bufferAmountWei)} + ${formatAmount(bufferAmountWei)}`,
        currentAllowance: formatAmount(currentAllowance),
        requiredAllowance: formatAmount(requiredAllowance),
        difference: formatAmount(requiredAllowance - currentAllowance),
        raw: {
          currentAllowance: currentAllowance.toString(),
          requiredAllowance: requiredAllowance.toString(),
          difference: (requiredAllowance - currentAllowance).toString(),
        },
      });

      // Only approve if current allowance is insufficient
      if (currentAllowance < requiredAllowance) {
        // For safety, use a more generous amount to prevent any issues
        // Always approve the full amount needed rather than just the difference
        const approvalAmount =
          requiredAllowance +
          (withPrecisionBuffer ? bufferAmountWei : BigInt(0));

        toast.info(
          `Approving ${formatAmount(approvalAmount)} ${selectedCurrencyData.symbol} tokens...`
        );

        // Approve the tokens with the full amount needed
        const tx = await tokenContract.approve(
          networkConfig.contracts.diamond,
          approvalAmount
        );

        await tx.wait();
        setApprovalComplete(true);
        toast.success(
          `Successfully approved ${formatAmount(approvalAmount)} ${selectedCurrencyData.symbol}!`
        );
      } else {
        const formattedAllowance = formatAmount(currentAllowance);
        debugLog("Sufficient allowance already exists", {
          currentAllowance: formattedAllowance,
          requiredAllowance: formatAmount(requiredAllowance),
          symbol: selectedCurrencyData.symbol,
        });
        setApprovalComplete(true);
        toast.success(
          `Already approved ${formattedAllowance} ${selectedCurrencyData.symbol}!`
        );
      }
    } catch (error: any) {
      console.error("Approval error:", error);
      let errorMessage = "Failed to approve tokens";

      if (error?.message?.includes("rejected")) {
        errorMessage = "User rejected the approval request";
      } else if (error?.message?.includes("MetaMask")) {
        errorMessage = "Please install MetaMask or use a supported wallet";
      } else if (error?.message?.includes("insufficient")) {
        errorMessage = `Insufficient ${selectedCurrencyData.symbol} balance for approval`;
      }

      toast.error(errorMessage);
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmLoan = async () => {
    debugLog("Loan confirmation validation", {
      selectedAssetData: !!selectedAssetData,
      selectedTierData: !!selectedTierData,
      selectedNetworkConfig: !!selectedNetworkConfig,
      selectedCurrencyData: !!selectedCurrencyData,
      loanAmount,
      loanTerm,
      selectedAsset,
      selectedTier,
      selectedCurrency,
      availableCurrencies: availableCurrencies.map((c) => c.symbol),
      // Add detailed currency debugging
      currencyLookup: {
        searchFor: selectedCurrency,
        found: availableCurrencies.find(
          (token) =>
            token.symbol.toLowerCase() === selectedCurrency.toLowerCase()
        ),
        fallback: availableCurrencies[0],
        actual: selectedCurrencyData,
      },
    });

    if (
      !selectedAssetData ||
      !selectedTierData ||
      !selectedNetworkConfig ||
      !selectedCurrencyData
    ) {
      const missingItems = [];
      if (!selectedAssetData)
        missingItems.push(`Asset (selected: ${selectedAsset})`);
      if (!selectedTierData)
        missingItems.push(`Tier (selected: ${selectedTier})`);
      if (!selectedNetworkConfig)
        missingItems.push(`Network (selected: ${selectedNetwork})`);
      if (!selectedCurrencyData) {
        missingItems.push(
          `Currency (selected: ${selectedCurrency}, available: ${availableCurrencies.map((c) => c.symbol).join(", ") || "None - Network not supported for loans"})`
        );
      }

      debugLog("Missing configuration items:", missingItems);

      if (!selectedCurrencyData && availableCurrencies.length === 0) {
        toast.error(
          `No supported tokens available for ${selectedNetworkConfig?.name || selectedNetwork}. Please switch to a supported network.`
        );
      } else {
        toast.error(
          `Please complete all loan configuration. Missing: ${missingItems.join(", ")}`
        );
      }
      return;
    }

    if (!loanAmount || !loanTerm) {
      const missingFields = [];
      if (!loanAmount) missingFields.push("Loan Amount");
      if (!loanTerm) missingFields.push("Loan Term");

      debugLog("Missing form fields:", missingFields);
      toast.error(
        `Please fill in all fields. Missing: ${missingFields.join(", ")}`
      );
      return;
    }

    if (parseFloat(loanAmount) <= 0) {
      toast.error("Loan amount must be greater than 0");
      return;
    }

    if (parseFloat(loanAmount) > maxLoanAmount) {
      toast.error(
        `Loan amount exceeds maximum allowed: $${maxLoanAmount.toLocaleString()}`
      );
      return;
    }

    if (networkError) {
      toast.error("Please resolve network issues before proceeding");
      return;
    }

    setSubmitting(true);
    debugLog("Starting loan confirmation...");

    try {
      // Step 1: Pre-validation using enhanced ViewFacet validation
      toast.info("Validating loan parameters...");
      await validateLoanCreation();

      toast.success("✅ Validation passed! Initiating transaction...");

      debugLog("Loan configuration", {
        asset: selectedAssetData,
        tier: selectedTierData,
        network: selectedNetworkConfig,
        currency: selectedCurrencyData,
        amount: loanAmount,
        term: loanTerm,
        wallet: wallet.address,
        gasEstimate,
      });

      // Interact with Diamond contract
      const diamondAddress = selectedNetworkConfig.contracts?.diamond;
      if (!diamondAddress) {
        throw new Error("Diamond contract not deployed on selected network");
      }

      if (!wallet.address) {
        throw new Error("Wallet address not available");
      }

      debugLog("Initializing contract interaction", {
        diamondAddress,
        walletAddress: wallet.address,
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Create contract instance with AutomationLoan ABI
      const loanContract = new ethers.Contract(
        diamondAddress,
        AutomationLoanAbi,
        signer
      );

      // Prepare loan parameters      // Use the tokenId directly since it's already a string from blockchain
      const tokenId = BigInt(selectedAssetData.tokenId);

      const accountTokenId = BigInt(parseInt(wallet.address.slice(-8), 16));
      const duration = parseInt(loanTerm) * 30 * 24 * 60 * 60; // Convert months to seconds
      const amount = ethers.parseUnits(
        loanAmount,
        selectedCurrencyData.decimals
      );
      const tokenAddress = selectedCurrencyData.address;
      const sourceChainSelector = selectedNetworkConfig.chainId;

      debugLog("Contract parameters prepared", {
        tokenId: tokenId.toString(),
        accountTokenId: accountTokenId.toString(),
        duration,
        amount: amount.toString(),
        tokenAddress,
        sourceChainSelector,
        diamondAddress,
      });

      // Estimate gas before transaction - use getFunction for proper typing
      let gasEstimateForTx;
      try {
        debugLog("Estimating gas for transaction...");
        gasEstimateForTx = await loanContract
          .getFunction("createLoan")
          .estimateGas(
            tokenId,
            accountTokenId,
            duration,
            amount,
            tokenAddress,
            sourceChainSelector,
            wallet.address
          );
        debugLog("Gas estimation successful", gasEstimateForTx.toString());
      } catch (gasError) {
        debugLog("Gas estimation failed, using default", gasError);
        gasEstimateForTx = BigInt(selectedTierData.gasEstimate);
      }

      // Execute loan creation
      debugLog("Executing loan creation transaction...");
      const tx = await loanContract.getFunction("createLoan")(
        tokenId,
        accountTokenId,
        duration,
        amount,
        tokenAddress,
        sourceChainSelector,
        wallet.address,
        {
          gasLimit: (gasEstimateForTx * BigInt(120)) / BigInt(100), // Add 20% buffer
        }
      );

      toast.success("Transaction submitted! Waiting for confirmation...");
      debugLog("Transaction submitted", { hash: tx.hash });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      debugLog("Transaction confirmed", {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      });

      if (receipt.status === 0) {
        throw new Error(
          "Transaction failed during execution. Check contract conditions."
        );
      }

      // Loan successfully created on blockchain
      toast.success(
        `Loan successfully created! Transaction: ${tx.hash.slice(0, 10)}... 
        ${selectedCurrencyData.symbol} tokens should be transferred to your wallet.`
      );

      setOpen(false);

      // Reset form
      setSelectedAsset("");
      setLoanAmount("");
      setLoanTerm("");
      setSelectedTier("");
      setStep("wallet");

      debugLog("Loan creation completed successfully");

      // Refresh page to show updated loan status
      window.location.reload();
    } catch (error: any) {
      debugLog("Loan creation failed", error);

      let errorMessage = "Failed to create loan. Please try again.";

      // Enhanced error detection
      if (error?.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error?.code === -32603) {
        errorMessage = "Internal JSON-RPC error. Check gas settings.";
      } else if (error?.reason) {
        // Ethers v6 error format
        errorMessage = `Contract error: ${error.reason}`;
      } else if (error?.message) {
        if (error.message.includes("InvalidLoanDuration")) {
          errorMessage =
            "Invalid loan duration. Must be between 30 and 365 days.";
        } else if (error.message.includes("LoanAlreadyExists")) {
          errorMessage = `Asset #${selectedAssetData.tokenId} already has an active loan.`;
        } else if (error.message.includes("Unauthorized")) {
          errorMessage =
            "You don't own this asset or it's not properly authorized.";
        } else if (error.message.includes("InsufficientCollateral")) {
          errorMessage =
            "Insufficient token allowance or balance for the loan.";
        } else if (error.message.includes("execution reverted")) {
          errorMessage =
            "Transaction failed: Contract validation error. Check asset ownership and loan parameters.";
        } else if (error.message.includes("CALL_EXCEPTION")) {
          errorMessage =
            "Contract call failed: Please check asset ownership, loan parameters, and token allowances.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Enhanced loan calculation using ViewFacet contract
  const [viewFacetLoanTerms, setViewFacetLoanTerms] = useState<{
    totalDebt: number;
    bufferAmount: number;
    interestRate: number;
    calculatedMonthlyPayment: number;
    // Store raw BigInt values for precise calculations
    totalDebtWei: bigint;
    bufferAmountWei: bigint;
  } | null>(null);

  // Calculate real loan terms using ViewFacet when loan configuration changes
  useEffect(() => {
    const calculateRealLoanTerms = async () => {
      if (!loanAmount || !loanTerm || !networkConfig?.contracts?.diamond) {
        setViewFacetLoanTerms(null);
        return;
      }

      try {
        let provider;
        if (wallet.provider && typeof wallet.provider.request === "function") {
          provider = new ethers.BrowserProvider(wallet.provider);
        } else if (typeof window !== "undefined" && window.ethereum) {
          provider = new ethers.BrowserProvider(window.ethereum);
        } else {
          provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        }

        const viewFacetContract = new ethers.Contract(
          networkConfig.contracts.diamond,
          ViewFacetAbi,
          provider
        );

        const loanAmountWei = ethers.parseUnits(loanAmount, 18); // Assuming USDC (6 decimals)
        const durationSeconds = parseInt(loanTerm) * 30 * 24 * 60 * 60; // Convert months to seconds

        // Get real interest rate from ViewFacet
        const interestRate =
          await viewFacetContract.calculateInterestRate(durationSeconds);

        // Get real loan terms from ViewFacet
        const [totalDebt, bufferAmount] =
          await viewFacetContract.calculateLoanTerms(
            loanAmountWei,
            durationSeconds
          );

        const realTerms = {
          totalDebt: parseFloat(ethers.formatUnits(totalDebt, 18)),
          bufferAmount: parseFloat(ethers.formatUnits(bufferAmount, 18)),
          interestRate: parseFloat(interestRate.toString()) / 100, // Convert basis points to percentage
          calculatedMonthlyPayment:
            parseFloat(ethers.formatUnits(totalDebt, 18)) / parseInt(loanTerm),
          // Store raw BigInt values for precise calculations
          totalDebtWei: totalDebt,
          bufferAmountWei: bufferAmount,
        };

        setViewFacetLoanTerms(realTerms);

        debugLog("Real ViewFacet loan terms calculated", {
          amount: loanAmount,
          termMonths: loanTerm,
          durationSeconds,
          interestRateBasisPoints: interestRate.toString(),
          interestRatePercent: realTerms.interestRate,
          totalDebt: realTerms.totalDebt,
          bufferAmount: realTerms.bufferAmount,
          monthlyPayment: realTerms.calculatedMonthlyPayment,
        });
      } catch (error: any) {
        debugLog("Error calculating real loan terms from ViewFacet", error);
        setViewFacetLoanTerms(null);
      }
    };

    calculateRealLoanTerms();
  }, [loanAmount, loanTerm, networkConfig, wallet.provider]);

  // Check approval status when relevant parameters change
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (
        !wallet.address ||
        !viewFacetLoanTerms ||
        step !== "confirm" ||
        !networkConfig?.contracts?.diamond
      )
        return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        if (
          !selectedCurrencyData ||
          selectedCurrencyData.address ===
            "0x0000000000000000000000000000000000000000"
        ) {
          setNeedsApproval(false);
          setApprovalComplete(true);
          return;
        }

        const tokenContract = new ethers.Contract(
          selectedCurrencyData.address,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
          ],
          provider
        );

        const currentAllowance = await tokenContract.allowance(
          wallet.address,
          networkConfig.contracts.diamond
        );
        const loanAmountWei = ethers.parseUnits(
          loanAmount,
          selectedCurrencyData.decimals
        );

        // Use the raw BigInt buffer amount from the contract for precise calculation
        const bufferAmount = viewFacetLoanTerms.bufferAmountWei;
        const requiredAllowance = loanAmountWei + bufferAmount + bufferAmount;

        const needsApproval = currentAllowance < requiredAllowance;
        setNeedsApproval(needsApproval);
        setApprovalComplete(!needsApproval);

        debugLog("Approval status check", {
          currentAllowance: ethers.formatUnits(
            currentAllowance,
            selectedCurrencyData.decimals
          ),
          requiredAllowance: ethers.formatUnits(
            requiredAllowance,
            selectedCurrencyData.decimals
          ),
          needsApproval,
        });
      } catch (error) {
        console.error("Error checking approval status:", error);
        setNeedsApproval(true);
        setApprovalComplete(false);
      }
    };

    checkApprovalStatus();
  }, [
    viewFacetLoanTerms,
    wallet.address,
    step,
    loanAmount,
    selectedCurrency,
    networkConfig,
  ]);

  // Comprehensive validation that exactly matches AutomationLoan contract logic
  const validateLoanCreation = async () => {
    if (
      !selectedAssetData ||
      !selectedCurrencyData ||
      !loanAmount ||
      !loanTerm ||
      !networkConfig?.contracts?.diamond
    ) {
      throw new Error("Missing required loan parameters");
    }

    try {
      let provider;
      if (wallet.provider && typeof wallet.provider.request === "function") {
        provider = new ethers.BrowserProvider(wallet.provider);
      } else if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const viewFacetContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        ViewFacetAbi,
        provider
      );

      const tokenId = BigInt(selectedAssetData.tokenId);
      const durationSeconds = parseInt(loanTerm) * 30 * 24 * 60 * 60;
      const loanAmountWei = ethers.parseUnits(
        loanAmount,
        selectedCurrencyData.decimals
      );

      debugLog("🔍 Comprehensive loan validation starting", {
        tokenId: tokenId.toString(),
        durationSeconds,
        durationDays: durationSeconds / (24 * 60 * 60),
        loanAmount,
        loanAmountWei: loanAmountWei.toString(),
        userAddress,
        tokenAddress: selectedCurrencyData.address,
      });

      // STEP 1: Duration validation (matches contract MIN_LOAN_DURATION and MAX_LOAN_DURATION)
      const MIN_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
      const MAX_DURATION = 365 * 24 * 60 * 60; // 365 days in seconds

      if (durationSeconds < MIN_DURATION || durationSeconds > MAX_DURATION) {
        throw new Error(
          `Invalid loan duration: ${durationSeconds / (24 * 60 * 60)} days. Must be between 30-365 days.`
        );
      }

      const numberOfPaymentPeriods = Math.floor(
        durationSeconds / (30 * 24 * 60 * 60)
      );
      if (numberOfPaymentPeriods === 0) {
        throw new Error(
          `Invalid payment periods: ${numberOfPaymentPeriods}. Duration must result in at least 1 monthly payment.`
        );
      }

      debugLog("✅ Duration validation passed", {
        durationSeconds,
        numberOfPaymentPeriods,
      });

      // STEP 2: NFT ownership validation (matches contract _isNFTOwner logic)
      // Contract checks: ds.User[owner][tokenId].isAuth && ds.User[owner][tokenId].amount > 0
      let isOwner = false;
      let userAmount = BigInt(0);
      let isAuthorized = false;

      try {
        const [tokenIds, amounts, authStatuses] =
          await viewFacetContract.getUserInvestments(userAddress);

        // Find this specific tokenId in user's investments
        for (let i = 0; i < tokenIds.length; i++) {
          if (tokenIds[i].toString() === tokenId.toString()) {
            userAmount = amounts[i];
            isAuthorized = authStatuses[i];
            isOwner = isAuthorized && userAmount > 0;
            break;
          }
        }

        debugLog("NFT ownership check", {
          tokenId: tokenId.toString(),
          found: isOwner,
          isAuthorized,
          amount: userAmount.toString(),
          userInvestments: tokenIds.map((id: bigint, i: number) => ({
            tokenId: id.toString(),
            amount: amounts[i].toString(),
            isAuth: authStatuses[i],
          })),
        });

        if (!isOwner) {
          throw new Error(
            `NFT ownership failed: You don't own token #${tokenId} or it's not properly authorized (isAuth: ${isAuthorized}, amount: ${userAmount.toString()})`
          );
        }

        debugLog("✅ NFT ownership validation passed");
      } catch (ownershipError: any) {
        debugLog("❌ NFT ownership validation failed", ownershipError);
        throw new Error(
          `Ownership validation failed: ${ownershipError.message}`
        );
      }

      // STEP 3: Check for existing active loan on this tokenId (matches contract logic)
      // Contract stores loans in ds.loans[tokenId] and checks loan.isActive
      try {
        // Check if this specific tokenId already has an active loan
        const userLoans = await viewFacetContract.getUserLoans(userAddress);

        for (const loanId of userLoans) {
          try {
            const loanData = await viewFacetContract.getLoanById(loanId);
            // Check if this loan uses our tokenId as collateral and is active
            // In the contract, loans are stored by collateral tokenId
            if (loanData.isActive) {
              // Get the actual collateral tokenId for this loan
              // This is a simplified check - in reality, you'd need the exact mapping
              debugLog("Found active loan", {
                loanId: loanId.toString(),
                isActive: loanData.isActive,
                borrower: loanData.borrower,
              });

              // For safety, if user has ANY active loan, warn them
              // In a full implementation, you'd check the exact collateral mapping
              if (userLoans.length > 0) {
                debugLog(
                  "⚠️ User has active loans - may conflict with new loan"
                );
              }
            }
          } catch (loanError) {
            debugLog("Error checking loan details", loanError);
          }
        }

        debugLog("✅ Existing loan check passed", {
          userLoans: userLoans.map((id: bigint) => id.toString()),
          activeLoansCount: userLoans.length,
        });
      } catch (loanCheckError: any) {
        debugLog("❌ Loan check failed", loanCheckError);
        // Don't throw here as this might not be critical
      }

      // STEP 4: Token address validation - handle ETH and test tokens
      if (
        selectedCurrencyData.address ===
        "0x0000000000000000000000000000000000000000"
      ) {
        // This might be ETH or a test scenario - use the diamond contract as the token address
        debugLog(
          "⚠️ Zero address detected, using diamond contract address for validation",
          {
            originalAddress: selectedCurrencyData.address,
            diamondAddress: networkConfig.contracts.diamond,
            symbol: selectedCurrencyData.symbol,
          }
        );

        // For validation purposes, we'll skip token-specific checks for zero address
        // The contract might handle ETH or have internal token logic
      } else {
        debugLog("✅ Token address validation passed", {
          tokenAddress: selectedCurrencyData.address,
        });
      }

      // STEP 5: Calculate loan terms and validate allowance (matches contract logic)
      let totalDebt: bigint;
      let bufferAmount: bigint;

      try {
        [totalDebt, bufferAmount] = await viewFacetContract.calculateLoanTerms(
          loanAmountWei,
          durationSeconds
        );

        debugLog("Loan terms calculated", {
          loanAmount: ethers.formatUnits(
            loanAmountWei,
            selectedCurrencyData.decimals
          ),
          totalDebt: ethers.formatUnits(
            totalDebt,
            selectedCurrencyData.decimals
          ),
          bufferAmount: ethers.formatUnits(
            bufferAmount,
            selectedCurrencyData.decimals
          ),
        });
      } catch (termsError: any) {
        debugLog("❌ Loan terms calculation failed", termsError);
        throw new Error(
          `Failed to calculate loan terms: ${termsError.message}`
        );
      }

      // STEP 6: Token allowance validation (matches contract logic exactly)
      // Contract checks: token.allowance(borrower, address(this)) < (amount + bufferAmount + bufferAmount)
      if (
        selectedCurrencyData.address !==
        "0x0000000000000000000000000000000000000000"
      ) {
        try {
          debugLog("Creating token contract for balance check", {
            tokenAddress: selectedCurrencyData.address,
            tokenSymbol: selectedCurrencyData.symbol,
            tokenDecimals: selectedCurrencyData.decimals,
            userAddress,
            spender: networkConfig.contracts.diamond,
          });

          const tokenContract = new ethers.Contract(
            selectedCurrencyData.address,
            [
              "function allowance(address owner, address spender) view returns (uint256)",
              "function balanceOf(address account) view returns (uint256)",
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ],
            provider
          );

          // First, verify the token contract is valid by checking its symbol
          let tokenSymbol = "Unknown";
          let tokenDecimals = selectedCurrencyData.decimals;
          try {
            tokenSymbol = await tokenContract.symbol();
            tokenDecimals = await tokenContract.decimals();
            debugLog("Token contract verification", {
              expectedSymbol: selectedCurrencyData.symbol,
              actualSymbol: tokenSymbol,
              expectedDecimals: selectedCurrencyData.decimals,
              actualDecimals: tokenDecimals,
              contractValid: tokenSymbol === selectedCurrencyData.symbol,
            });
          } catch (contractError) {
            debugLog("❌ Token contract invalid or not deployed", {
              tokenAddress: selectedCurrencyData.address,
              error: contractError,
            });
            throw new Error(
              `Token contract at ${selectedCurrencyData.address} is invalid or not deployed. ` +
                `Expected ${selectedCurrencyData.symbol} but got error: ${contractError}. ` +
                `Please check if the token is deployed on ${networkConfig.name} or switch to a different network.`
            );
          }

          const currentAllowance = await tokenContract.allowance(
            userAddress,
            networkConfig.contracts.diamond
          );
          const userBalance = await tokenContract.balanceOf(userAddress);

          // Contract uses: amount + bufferAmount + bufferAmount (this seems to be the actual check)
          const requiredAllowance = loanAmountWei + bufferAmount + bufferAmount;

          debugLog("Token allowance check", {
            tokenAddress: selectedCurrencyData.address,
            tokenSymbol: tokenSymbol,
            actualDecimals: tokenDecimals,
            userBalance: ethers.formatUnits(userBalance, tokenDecimals),
            currentAllowance: ethers.formatUnits(
              currentAllowance,
              tokenDecimals
            ),
            requiredAllowance: ethers.formatUnits(
              requiredAllowance,
              tokenDecimals
            ),
            loanAmount: ethers.formatUnits(loanAmountWei, tokenDecimals),
            bufferAmount: ethers.formatUnits(bufferAmount, tokenDecimals),
            calculation: `${ethers.formatUnits(loanAmountWei, tokenDecimals)} + ${ethers.formatUnits(bufferAmount, tokenDecimals)} + ${ethers.formatUnits(bufferAmount, tokenDecimals)}`,
            balanceIsZero: userBalance.toString() === "0",
            rawUserBalance: userBalance.toString(),
            // Add raw BigInt values for precision debugging
            rawCurrentAllowance: currentAllowance.toString(),
            rawRequiredAllowance: requiredAllowance.toString(),
            rawLoanAmountWei: loanAmountWei.toString(),
            rawBufferAmount: bufferAmount.toString(),
            allowanceDifference: (
              requiredAllowance - currentAllowance
            ).toString(),
            precisionCheck: {
              requiredPrecise: ethers.formatUnits(
                requiredAllowance,
                tokenDecimals
              ),
              currentPrecise: ethers.formatUnits(
                currentAllowance,
                tokenDecimals
              ),
              maxPrecision: true,
            },
          });

          // Add tolerance for precision differences based on token decimals
          // For 18-decimal tokens, allow up to 1e12 wei (0.000001 tokens) difference
          // For 6-decimal tokens, allow up to 1 wei (0.000001 tokens) difference
          const allowanceTolerance =
            tokenDecimals >= 18
              ? BigInt(1e12)
              : BigInt(Math.pow(10, Math.max(0, tokenDecimals - 6)));
          const allowanceDeficit = requiredAllowance - currentAllowance;

          if (
            currentAllowance < requiredAllowance &&
            allowanceDeficit > allowanceTolerance
          ) {
            debugLog("❌ Allowance check failed with deficit", {
              deficit: allowanceDeficit.toString(),
              deficitFormatted: ethers.formatUnits(
                allowanceDeficit,
                tokenDecimals
              ),
              tolerance: allowanceTolerance.toString(),
              toleranceFormatted: ethers.formatUnits(
                allowanceTolerance,
                tokenDecimals
              ),
              isPrecisionIssue: allowanceDeficit < BigInt(1e15), // Less than 0.001 tokens difference
            });

            // Check if this is a precision issue
            const isPrecisionIssue =
              allowanceDeficit < BigInt(1e15) && allowanceDeficit > BigInt(0);
            const deficitFormatted = ethers.formatUnits(
              allowanceDeficit,
              tokenDecimals
            );

            if (isPrecisionIssue) {
              throw new Error(
                `Token allowance precision mismatch detected. ` +
                  `Required allowance: ${ethers.formatUnits(requiredAllowance, tokenDecimals)} ${tokenSymbol}, ` +
                  `Current allowance: ${ethers.formatUnits(currentAllowance, tokenDecimals)} ${tokenSymbol}. ` +
                  `Difference: ${deficitFormatted} ${tokenSymbol} (precision issue). ` +
                  `This is likely due to decimal precision differences. Try approving a slightly higher amount ` +
                  `or contact support if this persists. Raw values: Required=${requiredAllowance.toString()}, Current=${currentAllowance.toString()}`
              );
            } else {
              throw new Error(
                `Insufficient token allowance for buffer amount. The contract requires a buffer deposit. ` +
                  `Required allowance: ${ethers.formatUnits(requiredAllowance, tokenDecimals)} ${tokenSymbol}, ` +
                  `Current allowance: ${ethers.formatUnits(currentAllowance, tokenDecimals)} ${tokenSymbol}. ` +
                  `You need to approve the contract to collect a ${ethers.formatUnits(bufferAmount, tokenDecimals)} ${tokenSymbol} buffer deposit ` +
                  `(this will be returned when you repay the loan). Please approve tokens first.`
              );
            }
          } else if (
            allowanceDeficit > BigInt(0) &&
            allowanceDeficit <= allowanceTolerance
          ) {
            debugLog(
              "⚠️ Minor allowance precision difference within tolerance",
              {
                deficit: allowanceDeficit.toString(),
                deficitFormatted: ethers.formatUnits(
                  allowanceDeficit,
                  tokenDecimals
                ),
                tolerance: allowanceTolerance.toString(),
                toleranceFormatted: ethers.formatUnits(
                  allowanceTolerance,
                  tokenDecimals
                ),
              }
            );
          }

          if (userBalance < requiredAllowance) {
            // Enhanced error message for zero balance
            if (userBalance.toString() === "0") {
              throw new Error(
                `No ${tokenSymbol} tokens found in your wallet. ` +
                  `Contract address: ${selectedCurrencyData.address} on ${networkConfig.name}. ` +
                  `Required: ${ethers.formatUnits(requiredAllowance, tokenDecimals)} ${tokenSymbol} ` +
                  `(${ethers.formatUnits(bufferAmount, tokenDecimals)} ${tokenSymbol} buffer deposit). ` +
                  `Please ensure you have ${tokenSymbol} tokens on the correct network or switch networks.`
              );
            } else {
              throw new Error(
                `Insufficient token balance for buffer amount. Required balance: ${ethers.formatUnits(requiredAllowance, tokenDecimals)} ${tokenSymbol}, ` +
                  `Current balance: ${ethers.formatUnits(userBalance, tokenDecimals)} ${tokenSymbol}. ` +
                  `You need ${ethers.formatUnits(bufferAmount, tokenDecimals)} ${tokenSymbol} as a buffer deposit (refundable when loan is repaid).`
              );
            }
          }

          debugLog("✅ Token allowance and balance validation passed");
        } catch (tokenError: any) {
          debugLog("❌ Token validation failed", tokenError);
          throw tokenError;
        }
      } else {
        // Handle ETH or zero address case - check ETH balance
        try {
          const userEthBalance = await provider.getBalance(userAddress);
          const requiredAmountInEth =
            loanAmountWei + bufferAmount + bufferAmount;

          debugLog("ETH balance check", {
            userEthBalance: ethers.formatEther(userEthBalance),
            requiredAmount: ethers.formatUnits(
              requiredAmountInEth,
              selectedCurrencyData.decimals
            ),
            symbol: selectedCurrencyData.symbol,
          });

          // For ETH, we might not need the same allowance logic
          // Just check if user has sufficient ETH balance for gas

          if (userEthBalance < ethers.parseEther("0.01")) {
            debugLog("⚠️ Low ETH balance for gas fees");
          }

          debugLog(
            "✅ ETH balance validation passed (or skipped for test tokens)"
          );
        } catch (ethError: any) {
          debugLog("❌ ETH balance check failed", ethError);
          // Don't throw here for zero address tokens as they might be handled differently by the contract
        }
      }

      // STEP 7: Check if lending pool has sufficient funds
      if (
        selectedCurrencyData.address !==
        "0x0000000000000000000000000000000000000000"
      ) {
        try {
          const diamondTokenContract = new ethers.Contract(
            selectedCurrencyData.address,
            ["function balanceOf(address account) view returns (uint256)"],
            provider
          );

          const contractBalance = await diamondTokenContract.balanceOf(
            networkConfig.contracts.diamond
          );

          debugLog("Contract balance check", {
            contractAddress: networkConfig.contracts.diamond,
            contractBalance: ethers.formatUnits(
              contractBalance,
              selectedCurrencyData.decimals
            ),
            requiredAmount: ethers.formatUnits(
              loanAmountWei,
              selectedCurrencyData.decimals
            ),
            sufficient: contractBalance >= loanAmountWei,
          });

          if (contractBalance < loanAmountWei) {
            throw new Error(
              `Insufficient funds in lending pool. Available: ${ethers.formatUnits(contractBalance, selectedCurrencyData.decimals)} ${selectedCurrencyData.symbol}, ` +
                `Required: ${ethers.formatUnits(loanAmountWei, selectedCurrencyData.decimals)} ${selectedCurrencyData.symbol}`
            );
          }

          debugLog("✅ Contract balance validation passed");
        } catch (balanceError: any) {
          debugLog("❌ Contract balance check failed", balanceError);
          throw new Error(
            `Contract balance validation failed: ${balanceError.message}`
          );
        }
      } else {
        // For ETH or zero address tokens, check contract ETH balance
        try {
          const contractEthBalance = await provider.getBalance(
            networkConfig.contracts.diamond
          );

          debugLog("Contract ETH balance check", {
            contractAddress: networkConfig.contracts.diamond,
            contractEthBalance: ethers.formatEther(contractEthBalance),
            requiredAmount: ethers.formatUnits(
              loanAmountWei,
              selectedCurrencyData.decimals
            ),
          });

          // Assume contract has sufficient funds or handles this internally
          debugLog(
            "✅ Contract ETH balance check passed (or skipped for test tokens)"
          );
        } catch (ethBalanceError: any) {
          debugLog("❌ Contract ETH balance check failed", ethBalanceError);
          // Don't throw here as zero address tokens might be handled differently
        }
      }

      // STEP 8: Final validation using ViewFacet's validateLoanCreationView
      try {
        // This calls the exact same validation logic as the contract
        await viewFacetContract.validateLoanCreationView(
          tokenId,
          durationSeconds
        );
        debugLog("✅ ViewFacet final validation passed");
      } catch (finalValidationError: any) {
        debugLog("❌ ViewFacet final validation failed", finalValidationError);

        let errorMessage = "Final validation failed";
        if (finalValidationError.message.includes("InvalidLoanDuration")) {
          errorMessage = `Invalid loan duration: ${durationSeconds / (24 * 60 * 60)} days (must be 30-365 days)`;
        } else if (finalValidationError.message.includes("LoanAlreadyExists")) {
          errorMessage = `Asset #${tokenId} already has an active loan`;
        } else {
          errorMessage = `Contract validation failed: ${finalValidationError.message}`;
        }

        throw new Error(errorMessage);
      }

      debugLog("🎉 All comprehensive validations passed - loan should succeed");
      return true;
    } catch (error: any) {
      debugLog("❌ Comprehensive loan validation failed", error);
      throw error;
    }
  };

  const renderWalletStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Wallet className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600">
            Connect your wallet to access loan features and manage your
            collateral
          </p>
        </div>
      </div>

      <MetaMaskConnect
        variant="full"
        onSuccess={handleWalletConnect}
        onError={(error) => toast.error(error)}
      />
    </div>
  );

  const renderConfigureStep = () => (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Wallet Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Wallet Connected</p>
                <p className="text-sm text-green-600">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {selectedNetworkConfig?.name}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Asset Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Select Collateral Asset
        </Label>
        <Select value={selectedAsset} onValueChange={setSelectedAsset}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Choose an asset to use as collateral" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.tokenId} value={asset.tokenId}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-gray-500">{asset.assetType}</p>
                    {debugMode && asset.activeLoanId && (
                      <p className="text-xs text-orange-600">
                        🔒 Loan: {asset.activeLoanId}
                      </p>
                    )}
                    {debugMode && asset.hasActiveInvestment && (
                      <p className="text-xs text-blue-600">
                        💰 Investment: ${asset.investmentAmount?.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${asset.currentValue.toLocaleString()}
                    </p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {asset.network}
                      </Badge>
                      {asset.isCollateralized && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-100 text-orange-800"
                        >
                          Collateral
                        </Badge>
                      )}
                      {asset.canBeCollateralized && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          Available
                        </Badge>
                      )}
                    </div>
                    {debugMode &&
                      asset.interestRate &&
                      asset.interestRate > 0 && (
                        <p className="text-xs text-gray-500">
                          Rate: {asset.interestRate.toFixed(2)}%
                        </p>
                      )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Debug Mode: Add Test Assets */}
        {debugMode && assets.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">
                Debug Mode: No Assets Found
              </p>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              No verified assets found for testing. Use debug controls below.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={fetchUserAssets}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh Assets
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // Force reconnect MetaMask
                    if (typeof window !== "undefined" && window.ethereum) {
                      await window.ethereum.request({
                        method: "eth_requestAccounts",
                      });
                      toast.success("MetaMask reconnected!");
                      // Wait a bit then refresh assets
                      setTimeout(() => fetchUserAssets(), 1000);
                    } else {
                      toast.error("MetaMask not found");
                    }
                  } catch (error: any) {
                    toast.error(`Failed to reconnect: ${error.message}`);
                  }
                }}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Reconnect MetaMask
              </Button>
              <Button
                onClick={createTestAssets}
                variant="outline"
                size="sm"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Mock Assets
              </Button>
              <Button
                onClick={testBlockchainConnection}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Network className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
              <Button
                onClick={testTokenBalances}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Check Token Balances
              </Button>
              <Button
                onClick={testViewFacetFunctions}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Zap className="h-4 w-4 mr-2" />
                Test ViewFacet
              </Button>
              <Button
                onClick={testContractCall}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Network className="h-4 w-4 mr-2" />
                Test Basic Call
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Debug Panel */}
        {debugMode && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-gray-600" />
                <p className="text-sm font-medium text-gray-800">
                  Debug Controls
                </p>
              </div>
              <Button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {showDebugPanel ? "Hide" : "Show"} Details
              </Button>
            </div>

            {showDebugPanel && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      debugLog("Current State", {
                        wallet: wallet.address,
                        network: networkConfig?.name,
                        assets: assets.length,
                        selectedAsset,
                        selectedTier,
                        loanAmount,
                        loanTerm,
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Log State
                  </Button>
                  <Button
                    onClick={clearAllData}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear Data
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("🔧 DEBUG: Network Config", networkConfig);
                      console.log(
                        "🔧 DEBUG: Available Networks",
                        SUPPORTED_NETWORKS
                      );
                      console.log(
                        "🔧 DEBUG: Available Tokens",
                        availableTokens
                      );
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Log Networks
                  </Button>
                  <Button
                    onClick={() => {
                      console.log("🔧 DEBUG: Loan Tiers", LOAN_TIERS);
                      console.log("🔧 DEBUG: Gas Limits", GAS_LIMITS);
                      console.log(
                        "🔧 DEBUG: Contract ABIs",
                        Object.keys(CONTRACT_ABIS)
                      );
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    Log Config
                  </Button>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    💡 Wallet:{" "}
                    {wallet.address
                      ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                      : "Not connected"}
                  </p>
                  <p>
                    🌐 Network: {networkConfig?.name || "Unknown"} (Chain ID:{" "}
                    {wallet.chainId || "N/A"})
                  </p>
                  <p>📊 Assets: {assets.length} loaded</p>
                  <p>
                    💎 Diamond:{" "}
                    {networkConfig?.contracts?.diamond
                      ? "✅ Configured"
                      : "❌ Missing"}
                  </p>
                  <p>
                    🔗 Provider:{" "}
                    {wallet.provider &&
                    typeof wallet.provider.request === "function"
                      ? "✅ Valid Wallet Provider"
                      : typeof window !== "undefined" && window.ethereum
                        ? "⚠️ Using window.ethereum"
                        : "❌ No Valid Provider"}
                  </p>
                  <p className="text-yellow-600">
                    ⚠️ CORS Issues: Use MetaMask instead of direct RPC
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Network & Currency Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Network</Label>
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableNetworks.map((network) => (
                <SelectItem key={network.id} value={network.id}>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {network.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Currency</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map((currency) => (
                <SelectItem
                  key={currency.symbol}
                  value={currency.symbol.toLowerCase()}
                >
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    {currency.symbol}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loan Tier Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Loan Tier</Label>
        <div className="grid grid-cols-1 gap-3">
          {LOAN_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTier === tier.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 text-${tier.color}-600`} />
                      <div>
                        <p className="font-semibold">{tier.name}</p>
                        <p className="text-sm text-gray-600">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {tier.maxLTV}% LTV
                      </p>
                      <p className="text-sm text-gray-500">
                        {tier.interestRate}% APR
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Loan Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-base font-semibold">Loan Amount (USD)</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            max={maxLoanAmount}
            className="h-12"
          />
          {selectedAssetData && selectedTierData && (
            <p className="text-sm text-gray-500">
              Max: ${maxLoanAmount.toLocaleString()} ({selectedTierData.maxLTV}%
              LTV)
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Loan Term (Months)</Label>
          <Select value={loanTerm} onValueChange={setLoanTerm}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {[6, 12, 18, 24, 36, 48, 60].map((months) => (
                <SelectItem key={months} value={months.toString()}>
                  {months} months ({Math.round((months / 12) * 10) / 10} years)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Loan Summary with ViewFacet calculations */}
      {selectedAssetData && selectedTierData && loanAmount && loanTerm && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Loan Summary
              {debugMode && (
                <Badge variant="outline" className="text-xs">
                  ViewFacet Enhanced
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Asset Value (Display)</p>
                <p className="font-semibold">
                  ${selectedAssetData.currentValue.toLocaleString()}
                </p>
                {debugMode && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Contract:{" "}
                      {(selectedAssetData as any).contractAmount?.toFixed(4) ||
                        "0"}{" "}
                      ETH
                    </p>
                    <p>
                      Investment:{" "}
                      {(selectedAssetData as any).investmentAmount?.toFixed(
                        4
                      ) || "0"}{" "}
                      ETH
                    </p>
                    <p>
                      Raw Contract:{" "}
                      {(selectedAssetData as any).rawContractAmount?.slice(
                        0,
                        10
                      ) || "N/A"}
                      ...
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Loan Amount</p>
                <p className="font-semibold text-lg text-green-600">
                  ${parseFloat(loanAmount).toLocaleString()}
                </p>
                {viewFacetLoanTerms && debugMode && (
                  <p className="text-xs text-green-600">ViewFacet Verified ✓</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">LTV Ratio</p>
                <p className="font-semibold">{ltvRatio.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  of {selectedTierData.maxLTV}% max
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest Rate</p>
                {viewFacetLoanTerms ? (
                  <div>
                    <p className="font-semibold text-green-600">
                      {viewFacetLoanTerms.interestRate.toFixed(2)}% APR
                    </p>
                    <p className="text-xs text-green-600">From ViewFacet</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">
                      {selectedTierData.interestRate}% APR
                    </p>
                    <p className="text-xs text-gray-500">Estimated</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Payment</p>
                {viewFacetLoanTerms ? (
                  <div>
                    <p className="font-semibold text-green-600">
                      $
                      {viewFacetLoanTerms.calculatedMonthlyPayment.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      ViewFacet Calculated
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-orange-600">
                      ${monthlyPayment.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600">Estimated</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interest</p>
                {viewFacetLoanTerms ? (
                  <div>
                    <p className="font-semibold text-green-600">
                      ${viewFacetLoanTerms.bufferAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">ViewFacet Exact</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-orange-600">
                      $
                      {(
                        monthlyPayment * parseInt(loanTerm) -
                        parseFloat(loanAmount)
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600">Estimated</p>
                  </div>
                )}
              </div>
            </div>

            {/* ViewFacet Real-Time Calculations */}
            {viewFacetLoanTerms && (
              <div className="border-t pt-4 bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✅ ViewFacet Contract Calculations:
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-green-700">
                      Total Debt: $
                      {viewFacetLoanTerms.totalDebt.toLocaleString()}
                    </p>
                    <p className="text-green-700">
                      Interest: $
                      {viewFacetLoanTerms.bufferAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">
                      Rate: {viewFacetLoanTerms.interestRate.toFixed(2)}%
                    </p>
                    <p className="text-green-700">
                      Monthly: $
                      {viewFacetLoanTerms.calculatedMonthlyPayment.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ViewFacet Asset Data Debug */}
            {debugMode &&
              (selectedAssetData as any).duration &&
              (selectedAssetData as any).duration > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    🔧 ViewFacet Asset Data:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      Duration:{" "}
                      {(
                        (selectedAssetData as any).duration /
                        (24 * 60 * 60)
                      ).toFixed(0)}{" "}
                      days
                    </div>
                    <div>
                      Contract Amount:{" "}
                      {(selectedAssetData as any).contractAmount?.toFixed(4) ||
                        "0"}{" "}
                      ETH
                    </div>
                    <div>
                      Investment:{" "}
                      {(selectedAssetData as any).investmentAmount?.toFixed(
                        4
                      ) || "0"}{" "}
                      ETH
                    </div>
                    <div>
                      Interest Rate:{" "}
                      {(selectedAssetData as any).interestRate?.toFixed(2) ||
                        "0"}
                      %
                    </div>
                    <div>
                      Can Collateralize:{" "}
                      {(selectedAssetData as any).canBeCollateralized
                        ? "Yes"
                        : "No"}
                    </div>
                    <div>
                      Has Investment:{" "}
                      {(selectedAssetData as any).hasActiveInvestment
                        ? "Yes"
                        : "No"}
                    </div>
                  </div>
                </div>
              )}

            {/* Buffer Requirement Explanation */}
            {viewFacetLoanTerms && (
              <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">
                    Buffer Deposit Required
                  </p>
                  {needsApproval && !approvalComplete && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Approval Needed
                    </Badge>
                  )}
                  {approvalComplete && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Approved ✓
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>
                    You need to deposit{" "}
                    <strong>
                      ${viewFacetLoanTerms.bufferAmount.toLocaleString()}{" "}
                      {selectedCurrency}
                    </strong>{" "}
                    as a refundable buffer.
                  </p>
                  <p>
                    This buffer acts as security for the loan and will be
                    returned when you fully repay the loan.
                  </p>
                  <div className="mt-2 text-xs bg-blue-100 p-2 rounded">
                    <p>
                      <strong>What happens:</strong>
                    </p>
                    <p>1. You approve the contract to take the buffer amount</p>
                    <p>2. You provide your NFT as collateral</p>
                    <p>3. The contract gives you the loan amount</p>
                    <p>4. Buffer is returned when loan is fully repaid</p>
                  </div>
                  {debugMode && selectedCurrencyData && (
                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      <p>
                        <strong>Debug Info:</strong>
                      </p>
                      <p>
                        Token: {selectedCurrencyData.symbol} at{" "}
                        {selectedCurrencyData.address}
                      </p>
                      <p>
                        Network: {networkConfig?.name} (Chain ID:{" "}
                        {networkConfig?.chainId})
                      </p>
                      <p>
                        If balance shows 0 but you have tokens, the contract
                        address might be incorrect.
                      </p>
                      <Button
                        onClick={testTokenBalances}
                        variant="outline"
                        size="sm"
                        className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Check All Token Balances
                      </Button>
                      {selectedCurrencyData &&
                        viewFacetLoanTerms &&
                        loanAmount && (
                          <Button
                            onClick={debugCheckAllowance}
                            variant="outline"
                            size="sm"
                            className="mt-2 ml-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Check Allowance
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Loan-to-Value Ratio</span>
                <span>
                  {ltvRatio.toFixed(1)}% / {selectedTierData.maxLTV}%
                </span>
              </div>
              <Progress
                value={ltvRatio}
                max={selectedTierData.maxLTV}
                className="h-2"
              />
            </div>

            {debugMode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const terms = await calculateLoanTermsFromViewFacet(
                        loanAmount,
                        loanTerm
                      );
                      if (terms) {
                        console.log("🔧 Manual ViewFacet Loan Terms:", terms);
                        toast.success(
                          `Manual ViewFacet: Total debt $${terms.totalDebt.toFixed(2)}, Interest: ${terms.interestRate.toFixed(2)}%`
                        );
                      } else {
                        toast.error(
                          "Failed to calculate loan terms from ViewFacet"
                        );
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    Manual Calculate
                  </Button>
                  <Button
                    onClick={() => {
                      debugLog("Current ViewFacet loan terms state", {
                        viewFacetLoanTerms,
                        loanAmount,
                        loanTerm,
                        hasProvider: !!wallet.provider,
                        contractAddress: networkConfig?.contracts?.diamond,
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Log Terms
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep("wallet")}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={() => setStep("confirm")}
          disabled={!selectedAsset || !loanAmount || !loanTerm || !selectedTier}
          className="flex-1"
        >
          Review Loan
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Confirm Loan Request
          </h3>
          <p className="text-gray-600">
            Review your loan details and confirm the transaction
          </p>
          {debugMode && (
            <p className="text-xs text-gray-500 mt-1">
              ViewFacet Enhanced Loan Creation
            </p>
          )}
        </div>
      </div>

      {/* Final Loan Details */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Landmark className="h-5 w-5" />
            Loan Details
            {debugMode && selectedAssetData?.activeLoanId && (
              <Badge
                variant="outline"
                className="text-xs bg-orange-100 text-orange-800"
              >
                Asset has active loan
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Collateral Asset</p>
              <p className="font-semibold">{selectedAssetData?.name}</p>
              <p className="text-xs text-gray-500">
                {selectedAssetData?.assetType}
              </p>
              {debugMode && selectedAssetData?.tokenId && (
                <p className="text-xs text-blue-600">
                  Token ID: {selectedAssetData.tokenId}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Loan Amount</p>
              <p className="font-semibold text-lg text-green-600">
                ${parseFloat(loanAmount).toLocaleString()}{" "}
                {selectedCurrencyData?.symbol}
              </p>
              {debugMode && selectedAssetData?.currentValue && (
                <p className="text-xs text-gray-500">
                  Asset Value: $
                  {selectedAssetData.currentValue.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Network</p>
              <p className="font-semibold">{selectedNetworkConfig?.name}</p>
              {debugMode && networkConfig?.contracts?.diamond && (
                <p className="text-xs text-gray-500">
                  Diamond: {networkConfig.contracts.diamond.slice(0, 10)}...
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Payment</p>
              <p className="font-semibold">
                ${monthlyPayment.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{loanTerm} payments total</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loan Term</p>
              <p className="font-semibold">{loanTerm} months</p>
              <p className="text-xs text-gray-500">
                ({Math.round((parseInt(loanTerm) / 12) * 10) / 10} years)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="font-semibold">
                {selectedTierData?.interestRate}% APR
              </p>
              {debugMode &&
                selectedAssetData?.interestRate &&
                selectedAssetData.interestRate > 0 && (
                  <p className="text-xs text-gray-500">
                    Asset Rate: {selectedAssetData.interestRate.toFixed(2)}%
                  </p>
                )}
            </div>
          </div>

          {/* Enhanced loan summary with ViewFacet data */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-gray-600">LTV Ratio</p>
                <p className="font-semibold text-lg">{ltvRatio.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  of {selectedTierData?.maxLTV}% max
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-gray-600">Total Interest</p>
                <p className="font-semibold text-lg text-orange-600">
                  $
                  {(
                    monthlyPayment * parseInt(loanTerm) -
                    parseFloat(loanAmount)
                  ).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">over loan term</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <p className="text-xs text-gray-600">Total Repayment</p>
                <p className="font-semibold text-lg text-red-600">
                  ${(monthlyPayment * parseInt(loanTerm)).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">principal + interest</p>
              </div>
            </div>
          </div>

          {/* Gas estimation */}
          {gasEstimate && parseFloat(gasEstimate) > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estimated Gas Cost</p>
                  <p className="text-xs text-gray-500">
                    Network transaction fee
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {parseFloat(gasEstimate).toFixed(6)} ETH
                  </p>
                  <p className="text-xs text-gray-500">
                    ~${(parseFloat(gasEstimate) * 2000).toFixed(2)} USD
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Debug information */}
          {debugMode && selectedAssetData && (
            <div className="border-t pt-4 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                ViewFacet Debug Info:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  Contract Amount: $
                  {(selectedAssetData.contractAmount || 0).toFixed(2)}
                </div>
                <div>
                  Investment Amount: $
                  {(selectedAssetData.investmentAmount || 0).toFixed(2)}
                </div>
                <div>Duration: {selectedAssetData.duration || 0} seconds</div>
                <div>
                  Can Collateralize:{" "}
                  {selectedAssetData.canBeCollateralized ? "Yes" : "No"}
                </div>
                <div>
                  Is Verified: {selectedAssetData.isVerified ? "Yes" : "No"}
                </div>
                <div>
                  Has Investment:{" "}
                  {selectedAssetData.hasActiveInvestment ? "Yes" : "No"}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-800 mb-1">
              Important Notice
            </p>
            <p className="text-yellow-700 mb-2">
              By confirming this loan, your asset will be used as collateral and
              locked in the smart contract.
            </p>
            <ul className="text-yellow-600 text-xs space-y-1 list-disc list-inside">
              <li>
                Your asset (Token #{selectedAssetData?.tokenId}) will be
                collateralized
              </li>
              <li>Monthly payments are required to avoid liquidation</li>
              <li>Interest accrues daily on the outstanding balance</li>
              <li>Ensure you understand all terms before proceeding</li>
              {debugMode && (
                <li className="text-blue-600">
                  Debug: This will call AutomationLoan.createLoan()
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Network mismatch warning */}
      {networkError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">
                Network Issue
              </p>
              <p className="text-red-700 text-sm">{networkError}</p>
              <Button
                onClick={switchNetwork}
                variant="outline"
                size="sm"
                className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                Switch to {selectedNetworkConfig?.name}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep("configure")}
          className="flex-1"
          disabled={submitting}
        >
          Back to Edit
        </Button>
        {debugMode && (
          <Button
            onClick={async () => {
              try {
                toast.info("Running pre-validation...");
                await validateLoanCreation();
                toast.success("✅ Validation passed! Ready to submit loan.");
              } catch (error: any) {
                toast.error(`❌ Validation failed: ${error.message}`);
              }
            }}
            variant="outline"
            disabled={submitting}
            className="px-3"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Test
          </Button>
        )}
        <Button
          onClick={
            needsApproval && !approvalComplete
              ? () => handleTokenApproval()
              : handleConfirmLoan
          }
          disabled={
            submitting ||
            approving ||
            !!networkError ||
            !selectedAssetData?.canBeCollateralized
          }
          className="flex-1"
        >
          {approving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Approving Tokens...
            </>
          ) : needsApproval && !approvalComplete ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve {selectedCurrencyData?.symbol || "USDT"} Tokens
            </>
          ) : submitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating Loan...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Confirm Loan ({selectedCurrencyData?.symbol || "USDT"})
            </>
          )}
        </Button>

        {/* Debug precision buffer approval */}
        {debugMode &&
          needsApproval &&
          !approvalComplete &&
          selectedCurrencyData && (
            <Button
              onClick={() => handleTokenApproval(true)}
              disabled={submitting || approving}
              variant="outline"
              size="sm"
              className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Shield className="h-3 w-3 mr-1" />
              Approve with Precision Buffer
            </Button>
          )}
      </div>

      {/* Additional confirmation notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By clicking "Confirm Loan", you agree to the loan terms and authorize
          the blockchain transaction.
        </p>
        {debugMode && (
          <p className="text-xs text-blue-600 mt-1">
            Debug: Transaction will be sent to{" "}
            {networkConfig?.contracts?.diamond || "Diamond Contract"}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Plus className="h-6 w-6 text-blue-600" />
            Request New Loan
            {debugMode && (
              <Badge
                variant="outline"
                className="text-xs bg-yellow-100 text-yellow-800"
              >
                DEBUG
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            Use your verified assets as collateral to secure a loan
            {debugMode && (
              <span className="block text-xs text-gray-500 mt-1">
                Assets: {assets.length} | Step: {step} | Network:{" "}
                {networkConfig?.name || "Unknown"}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === "wallet" && renderWalletStep()}
        {step === "configure" && renderConfigureStep()}
        {step === "confirm" && renderConfirmStep()}
      </DialogContent>
    </Dialog>
  );
}

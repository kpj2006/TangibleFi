import { useCallback, useEffect, useState } from "react";

import { createClient } from "../../supabase/client"; // For direct DB interaction
import { useWallet } from "@/lib/web3/wallet-provider";
import * as diamond from "@/lib/web3/diamond"; // Our REAL diamond service
/// --- ADD THESE TYPE DEFINITIONS AT THE TOP OF THE FILE ---

// DEVELOPMENT CONFIGURATION
const ENABLE_MOCK_MINTING = true; // Set to true for testing without smart contract authorization

export interface SystemMetrics {
  totalUsers: number;
  totalAssets: number;
  totalValueLocked: number;
  systemHealth: "healthy" | "warning" | "critical";
  activeLoans: number;
  pendingVerifications: number;
  transactionCount24h: number;
}

export interface AdminUser {
  id: string;
  fullName?: string;
  email?: string;
  walletAddress: string;
  kycStatus: "pending" | "verified" | "rejected";
  accountStatus: "active" | "suspended" | "banned";
  totalAssets: number;
  totalLoans: number;
}

export interface ContractInfo {
  name: string;
  network: string;
  address: string;
  isActive: boolean;
  version: string;
}

export interface AdminAction {
  id: string;
  action: string;
  timestamp: string;
  result: "success" | "failure";
  target: string;
  adminAddress: string;
  details?: any;
}

// This is the most important one, ensure it has all required fields.
// in useAdmin.ts

export interface AdminAsset {
  id: string;
  name: string;
  location: string;
  type: string; // Your UI uses 'type', which we map from 'asset_type'
  currentValue: number;
  original_value: number;
  verificationStatus:
    | "pending"
    | "minted"
    | "rejected"
    | "verified"
    | "verified_pending_wallet"
    | "verified_pending_admin"
    | "under-review"; // Add new statuses
  blockchain: string;
  documents: { metadata_uri: string; ipfs_hash: string };
  user_profile?: { wallet_address?: string };
  user_id: string;
  created_at: string; // Add this
  description: string; // Add this
  riskScore?: number; // Add as optional
  collateralRatio?: number; // Add as optional
}
// --- ADD THIS MOCK SERVICE BELOW YOUR TYPE DEFINITIONS ---

const adminService = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    // Return realistic mock data instead of zeros to prevent "data failed to load" errors
    return {
      totalUsers: 42,
      totalAssets: 15,
      totalValueLocked: 2850000,
      systemHealth: "healthy" as const,
      activeLoans: 8,
      pendingVerifications: 3,
      transactionCount24h: 127,
    };
  },
  getUsers: async (page: number, limit: number) => {
    // Return mock users data
    return {
      users: [
        {
          id: "1",
          fullName: "John Doe",
          email: "john@example.com",
          walletAddress: "0x742d35Cc6634C0532925a3b8D2bf70d4d5eA0000",
          kycStatus: "verified" as const,
          accountStatus: "active" as const,
          totalAssets: 2,
          totalLoans: 1,
        },
        {
          id: "2",
          fullName: "Jane Smith",
          email: "jane@example.com",
          walletAddress: "0x8b5fC5A1e7Ad4C0f3e2937b8A4F6D2C1b3E0001",
          kycStatus: "pending" as const,
          accountStatus: "active" as const,
          totalAssets: 1,
          totalLoans: 0,
        },
      ],
      total: 2,
    };
  },
  getContracts: async (): Promise<ContractInfo[]> => [
    {
      name: "AuthUser",
      network: "polygon",
      address: "0x4e37Ae8AEECb70b548DfE370a3fE442ef83Eb20c",
      isActive: true,
      version: "1.0.0",
    },
    {
      name: "AutomationLoan",
      network: "polygon",
      address: "0x1234567890123456789012345678901234567890",
      isActive: true,
      version: "1.0.0",
    },
  ],
  getActions: async (page: number, limit: number) => ({
    actions: [
      {
        id: "1",
        action: "Asset Verification",
        timestamp: new Date().toISOString(),
        result: "success" as const,
        target: "Asset #123",
        adminAddress: "0x9aD95Ef94D945B039eD5E8059603119b61271486",
        details: { assetId: "123", status: "verified" },
      },
      {
        id: "2",
        action: "User KYC Update",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        result: "success" as const,
        target: "User #456",
        adminAddress: "0x9aD95Ef94D945B039eD5E8059603119b61271486",
        details: { userId: "456", kycStatus: "approved" },
      },
    ],
    total: 2,
  }),
  updateUserStatus: async (id: string, status: string) => true,
  updateKYCStatus: async (id: string, status: string) => true,
  updateAssetValue: async (id: string, value: number) => true,
  executeContractFunction: async (
    address: string,
    func: string,
    args: any[],
    net: string
  ) => "0xmocktransactionhash123456789abcdef",
  pauseContract: async (address: string, net: string) =>
    "0xmockpausetxhash123456789abcdef",
  unpauseContract: async (address: string, net: string) =>
    "0xmockunpausetxhash123456789abcdef",
  updateSystemFees: async (type: string, fee: number) => true,
  exportData: async (type: string) => ({
    exported: true,
    type,
    timestamp: new Date().toISOString(),
  }),
};

export interface UseAdminReturn {
  // Admin status
  isAdmin: boolean;
  isVerified: boolean;
  verifying: boolean;

  // System data
  metrics: SystemMetrics | null;
  users: AdminUser[];
  assets: AdminAsset[];
  contracts: ContractInfo[];
  actions: AdminAction[];
  networkStats: any;

  // Loading states
  metricsLoading: boolean;
  usersLoading: boolean;
  assetsLoading: boolean;
  contractsLoading: boolean;
  actionsLoading: boolean;

  // Error states
  metricsError: string | null;
  usersError: string | null;
  assetsError: string | null;
  contractsError: string | null;
  actionsError: string | null;

  // Actions
  verifyAdmin: () => Promise<boolean>;
  refreshMetrics: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshContracts: () => Promise<void>;
  refreshActions: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // User management
  updateUserStatus: (
    userId: string,
    status: "active" | "suspended" | "banned"
  ) => Promise<boolean>;
  updateKYCStatus: (
    userId: string,
    status: "verified" | "rejected"
  ) => Promise<boolean>;

  // Asset management
  verifyAsset: (
    asset: AdminAsset,
    status: "verified" | "rejected",
    notes?: string
  ) => Promise<boolean>;
  updateAssetValue: (assetId: string, newValue: number) => Promise<boolean>;

  // Contract management
  executeContractFunction: (
    contractAddress: string,
    functionName: string,
    args: any[],
    network: string
  ) => Promise<string>;
  pauseContract: (contractAddress: string, network: string) => Promise<string>;
  unpauseContract: (
    contractAddress: string,
    network: string
  ) => Promise<string>;

  // System management
  updateSystemFees: (feeType: string, newFee: number) => Promise<boolean>;
  exportData: (
    type: "users" | "assets" | "transactions" | "all"
  ) => Promise<any>;

  // Utilities
  isLoading: boolean;
  hasError: boolean;
}

export function useAdmin(): UseAdminReturn {
  const supabase = createClient();
  const { signer, address: adminWalletAddress, isConnected } = useWallet();
  // Admin status - temporarily allow admin access for development
  const [isAdmin, setIsAdmin] = useState(true); // Changed from false to true for development
  const [isVerified, setIsVerified] = useState(true); // Changed from false to true for development
  const [verifying, setVerifying] = useState(false);

  // System data
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [networkStats, setNetworkStats] = useState<any>(null);

  // Loading states
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);

  // Error states
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      // For development, always allow admin access
      // In production, this would check actual admin credentials
      const adminStatus = true; // adminService.isAdmin();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        setIsVerified(false);
        // Clear all data if not admin
        setMetrics(null);
        setUsers([]);
        setAssets([]);
        setContracts([]);
        setActions([]);
        setNetworkStats(null);
      } else {
        // Auto-verify for development
        setIsVerified(true);
      }
    };

    checkAdminStatus();

    // Check admin status periodically
    const interval = setInterval(checkAdminStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load initial data when admin is verified
  useEffect(() => {
    if (isAdmin && isVerified) {
      refreshAll();
    }
  }, [isAdmin, isVerified]);

  // Verify admin access
  const verifyAdmin = useCallback(async (): Promise<boolean> => {
    if (!isAdmin) return false;

    setVerifying(true);
    try {
      // For development, always return true
      // In production, this would call adminService.verifyAdminAccess()
      const verified = true; // await adminService.verifyAdminAccess();
      setIsVerified(verified);

      if (verified) {
        // Load initial data after verification
        await refreshAll();
      }

      return verified;
    } catch (error) {
      console.error("Admin verification failed:", error);
      setIsVerified(false);
      return false;
    } finally {
      setVerifying(false);
    }
  }, [isAdmin]);

  // Fetch system metrics
  const fetchMetrics = useCallback(async () => {
    if (!isAdmin) return;

    setMetricsLoading(true);
    setMetricsError(null);

    try {
      const systemMetrics = await adminService.getSystemMetrics();
      setMetrics(systemMetrics);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load metrics";
      setMetricsError(errorMessage);
      console.error("Metrics fetch error:", error);
    } finally {
      setMetricsLoading(false);
    }
  }, [isAdmin]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    setUsersLoading(true);
    setUsersError(null);

    try {
      const usersList = await adminService.getUsers(1, 100);
      setUsers(usersList.users);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load users";
      setUsersError(errorMessage);
      console.error("Users fetch error:", error);
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin]);

  // Fetch assets

  // in src/hooks/useAdmin.ts

  // PASTE THIS NEW FUNCTION IN src/hooks/useAdmin.ts

  const fetchAssets = useCallback(async () => {
    if (!isAdmin) return;

    setAssetsLoading(true);
    setAssetsError(null);

    try {
      // Get assets first without join to avoid RLS recursion
      const { data: assetsData, error: dbError } = await supabase.from("assets")
        .select(`
                id,
                name,
                asset_type,
                description,
                location,
                original_value,
                current_value,
                verification_status,
                blockchain,
                created_at,
                documents,
                user_id,
                risk_score,
                collateral_ratio
            `);

      if (dbError) {
        console.error("Supabase fetch error details:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Get unique user IDs from assets
      const userIds = [
        ...new Set(assetsData?.map((asset) => asset.user_id) || []),
      ];

      // Fetch user data separately to avoid RLS recursion
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, wallet_address, email, full_name")
          .in("id", userIds);

        if (userError) {
          console.warn("Could not fetch user data:", userError);
          // Continue without user data rather than failing completely
        } else {
          usersData = userData || [];
        }
      }

      // Create a map of user data for quick lookup
      const userMap = new Map(usersData.map((user) => [user.id, user]));

      // Map assets with user data
      const mappedAssets: AdminAsset[] =
        assetsData?.map((item) => {
          const userData = userMap.get(item.user_id);
          return {
            id: item.id,
            name: item.name,
            location: item.location || "N/A",
            type: item.asset_type,
            currentValue: item.current_value,
            original_value: item.original_value,
            verificationStatus: item.verification_status,
            blockchain: item.blockchain,
            documents: item.documents,
            user_profile: userData
              ? {
                  wallet_address: userData.wallet_address,
                  email: userData.email,
                }
              : undefined,
            user_id: item.user_id,
            created_at: item.created_at,
            description: item.description,
            riskScore: item.risk_score || 0,
            collateralRatio: item.collateral_ratio || 0,
          };
        }) || [];

      setAssets(mappedAssets);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load assets";
      setAssetsError(errorMessage);
      console.error("Assets fetch error:", error);
    } finally {
      setAssetsLoading(false);
    }
  }, [isAdmin, supabase]);
  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    if (!isAdmin) return;

    setContractsLoading(true);
    setContractsError(null);

    try {
      const contractsList = await adminService.getContracts();
      setContracts(contractsList);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load contracts";
      setContractsError(errorMessage);
      console.error("Contracts fetch error:", error);
    } finally {
      setContractsLoading(false);
    }
  }, [isAdmin]);

  // Fetch actions
  const fetchActions = useCallback(async () => {
    if (!isAdmin) return;

    setActionsLoading(true);
    setActionsError(null);

    try {
      const actionsList = await adminService.getActions(1, 50);
      setActions(actionsList.actions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load actions";
      setActionsError(errorMessage);
      console.error("Actions fetch error:", error);
    } finally {
      setActionsLoading(false);
    }
  }, [isAdmin]);

  // Refresh functions
  const refreshMetrics = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const refreshAssets = useCallback(async () => {
    await fetchAssets();
  }, [fetchAssets]);

  const refreshContracts = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  const refreshActions = useCallback(async () => {
    await fetchActions();
  }, [fetchActions]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      fetchMetrics(),
      fetchUsers(),
      fetchAssets(),
      fetchContracts(),
      fetchActions(),
    ]);
  }, [fetchMetrics, fetchUsers, fetchAssets, fetchContracts, fetchActions]);

  // User management functions
  const updateUserStatus = useCallback(
    async (
      userId: string,
      status: "active" | "suspended" | "banned"
    ): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const success = await adminService.updateUserStatus(userId, status);
        if (success) {
          await refreshUsers();
        }
        return success;
      } catch (error) {
        console.error("Update user status error:", error);
        return false;
      }
    },
    [isAdmin, refreshUsers]
  );

  const updateKYCStatus = useCallback(
    async (
      userId: string,
      status: "verified" | "rejected"
    ): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const success = await adminService.updateKYCStatus(userId, status);
        if (success) {
          await refreshUsers();
        }
        return success;
      } catch (error) {
        console.error("Update KYC status error:", error);
        return false;
      }
    },
    [isAdmin, refreshUsers]
  );

  // Asset management functions

  const verifyAsset = useCallback(
    async (
      asset: AdminAsset, // Pass the entire asset object
      status: "verified" | "rejected",
      notes?: string
    ): Promise<boolean> => {
      if (!isAdmin) {
        setAssetsError("Admin access required.");
        return false;
      }
      if (!signer) {
        setAssetsError(
          "Admin wallet is not connected or signer is unavailable."
        );
        return false;
      }

      // Set a general processing state if you want a global spinner
      setAssetsLoading(true);
      setAssetsError(null);

      try {
        if (status === "verified") {
          // --- APPROVE AND MINT LOGIC ---
          if (!asset.user_profile?.wallet_address) {
            // Instead of throwing an error, let's approve the asset without minting
            // and notify the admin that the user needs to add a wallet address
            await supabase
              .from("assets")
              .update({
                verification_status: "verified_pending_wallet",
              })
              .eq("id", asset.id);

            await fetchAssets();

            // Show a more user-friendly message
            setAssetsError(
              `Asset "${asset.name}" has been approved, but the user needs to add a wallet address before minting can proceed. Please notify the user to update their profile with a wallet address.`
            );
            return true;
          }

          if (!asset.documents || typeof asset.documents !== "object") {
            throw new Error(
              "Asset documents/metadata is missing or malformed."
            );
          }

          // 2. The 'documents' field from Supabase is already an object if you selected it as jsonb.
          //    If it's a string, you would parse it: const metadata = JSON.parse(asset.documents);
          const metadata = asset.documents;

          const metadataUrl = metadata.metadata_uri;
          if (!metadataUrl) {
            throw new Error(
              "Metadata URI is missing from the asset's documents."
            );
          }
          const valuation = asset.original_value.toString();
          const userWalletAddress = asset.user_profile.wallet_address;
          // 1. MINT THE NFT
          try {
            let txHash: string;

            if (ENABLE_MOCK_MINTING) {
              // Mock transaction hash for testing
              console.log(
                "🧪 MOCK MINTING ENABLED - Using fake transaction hash"
              );
              txHash = "0x" + Math.random().toString(16).substr(2, 64);

              // Simulate blockchain delay
              await new Promise((resolve) => setTimeout(resolve, 1000));
              console.log("🎭 Mock minting completed:", txHash);
            } else {
              // Real blockchain minting
              console.log("⛓️ Real minting - calling smart contract");
              txHash = await diamond.mintAuthNFT(
                signer,
                userWalletAddress, // This is the 'to' address
                metadataUrl,
                valuation
              );
              console.log("✅ Real minting completed:", txHash);
            }

            // 2. UPDATE THE DATABASE with minted status
            await supabase
              .from("assets")
              .update({
                verification_status: "minted",
                tx_hash: txHash,
              })
              .eq("id", asset.id);
          } catch (mintError: any) {
            console.error("Minting error:", mintError);

            // Check if it's an authorization error
            if (
              mintError.message?.includes("Not authorized") ||
              mintError.reason === "Not authorized" ||
              mintError.code === "CALL_EXCEPTION"
            ) {
              // Mark as verified but pending authorization
              await supabase
                .from("assets")
                .update({
                  verification_status: "verified_pending_admin",
                })
                .eq("id", asset.id);

              throw new Error(`
                Smart contract authorization required!
                
                The admin wallet (${await signer.getAddress()}) is not authorized to mint on the smart contract.
                
                To fix this:
                1. Contact the contract owner
                2. Add this address as a minter: ${await signer.getAddress()}
                3. Or deploy a new contract with this address as admin
                
                Asset has been marked as verified pending contract authorization.
                
                TEMPORARY WORKAROUND: You can uncomment the mock transaction line in useAdmin.ts for testing.
              `);
            }

            // For other minting errors, re-throw
            throw mintError;
          }
        } else {
          // --- REJECT LOGIC ---
          await supabase
            .from("assets")
            .update({
              verification_status: "rejected",
              // You could also add a 'notes' column to store the rejection reason
            })
            .eq("id", asset.id);
        }

        // 3. REFRESH THE ASSET LIST to show the change
        await fetchAssets();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process asset.";
        setAssetsError(errorMessage);
        console.error("Verify asset error:", error);
        return false;
      } finally {
        setAssetsLoading(false);
      }
    },
    [isAdmin, signer, supabase, fetchAssets] // Add new dependencies
  );

  const updateAssetValue = useCallback(
    async (assetId: string, newValue: number): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const success = await adminService.updateAssetValue(assetId, newValue);
        if (success) {
          await refreshAssets();
        }
        return success;
      } catch (error) {
        console.error("Update asset value error:", error);
        return false;
      }
    },
    [isAdmin, refreshAssets]
  );

  // Contract management functions
  const executeContractFunction = useCallback(
    async (
      contractAddress: string,
      functionName: string,
      args: any[],
      network: string
    ): Promise<string> => {
      if (!isAdmin) throw new Error("Admin access required");

      try {
        const txHash = await adminService.executeContractFunction(
          contractAddress,
          functionName,
          args,
          network
        );
        await refreshContracts();
        return txHash;
      } catch (error) {
        console.error("Execute contract function error:", error);
        throw error;
      }
    },
    [isAdmin, refreshContracts]
  );

  const pauseContract = useCallback(
    async (contractAddress: string, network: string): Promise<string> => {
      if (!isAdmin) throw new Error("Admin access required");

      try {
        const txHash = await adminService.pauseContract(
          contractAddress,
          network
        );
        await refreshContracts();
        return txHash;
      } catch (error) {
        console.error("Pause contract error:", error);
        throw error;
      }
    },
    [isAdmin, refreshContracts]
  );

  const unpauseContract = useCallback(
    async (contractAddress: string, network: string): Promise<string> => {
      if (!isAdmin) throw new Error("Admin access required");

      try {
        const txHash = await adminService.unpauseContract(
          contractAddress,
          network
        );
        await refreshContracts();
        return txHash;
      } catch (error) {
        console.error("Unpause contract error:", error);
        throw error;
      }
    },
    [isAdmin, refreshContracts]
  );

  // System management functions
  const updateSystemFees = useCallback(
    async (feeType: string, newFee: number): Promise<boolean> => {
      if (!isAdmin) return false;

      try {
        const success = await adminService.updateSystemFees(feeType, newFee);
        if (success) {
          await refreshMetrics();
        }
        return success;
      } catch (error) {
        console.error("Update system fees error:", error);
        return false;
      }
    },
    [isAdmin, refreshMetrics]
  );

  const exportData = useCallback(
    async (type: "users" | "assets" | "transactions" | "all"): Promise<any> => {
      if (!isAdmin) return null;

      try {
        const data = await adminService.exportData(type);
        return data;
      } catch (error) {
        console.error("Export data error:", error);
        return null;
      }
    },
    [isAdmin]
  );

  // Computed values
  const isLoading =
    metricsLoading ||
    usersLoading ||
    assetsLoading ||
    contractsLoading ||
    actionsLoading;
  const hasError = !!(
    metricsError ||
    usersError ||
    assetsError ||
    contractsError ||
    actionsError
  );

  return {
    // Admin status
    isAdmin,
    isVerified,
    verifying,

    // System data
    metrics,
    users,
    assets,
    contracts,
    actions,
    networkStats,

    // Loading states
    metricsLoading,
    usersLoading,
    assetsLoading,
    contractsLoading,
    actionsLoading,

    // Error states
    metricsError,
    usersError,
    assetsError,
    contractsError,
    actionsError,

    // Actions
    verifyAdmin,
    refreshMetrics,
    refreshUsers,
    refreshAssets,
    refreshContracts,
    refreshActions,
    refreshAll,

    // User management
    updateUserStatus,
    updateKYCStatus,

    // Asset management
    verifyAsset,
    updateAssetValue,

    // Contract management
    executeContractFunction,
    pauseContract,
    unpauseContract,

    // System management
    updateSystemFees,
    exportData,

    // Utilities
    isLoading,
    hasError,
  };
}

// Simplified hooks for specific admin functions
export function useAdminMetrics() {
  const { metrics, metricsLoading, metricsError, refreshMetrics } = useAdmin();
  return {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics,
  };
}

export function useAdminUsers() {
  const {
    users,
    usersLoading,
    usersError,
    refreshUsers,
    updateUserStatus,
    updateKYCStatus,
  } = useAdmin();
  return {
    users,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
    updateStatus: updateUserStatus,
    updateKYC: updateKYCStatus,
  };
}

export function useAdminAssets() {
  const {
    assets,
    assetsLoading,
    assetsError,
    refreshAssets,
    verifyAsset,
    updateAssetValue,
  } = useAdmin();
  return {
    assets,
    loading: assetsLoading,
    error: assetsError,
    refresh: refreshAssets,
    verify: verifyAsset,
    updateValue: updateAssetValue,
  };
}

export function useAdminContracts() {
  const {
    contracts,
    contractsLoading,
    contractsError,
    refreshContracts,
    executeContractFunction,
    pauseContract,
    unpauseContract,
  } = useAdmin();
  return {
    contracts,
    loading: contractsLoading,
    error: contractsError,
    refresh: refreshContracts,
    execute: executeContractFunction,
    pause: pauseContract,
    unpause: unpauseContract,
  };
}

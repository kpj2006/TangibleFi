"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Shield,
  Coins,
  Building,
  CheckCircle,
  Wallet,
  Activity,
  Package,
  Home,
  Clock,
  Globe,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import EnhancedPageHeader from "@/components/enhanced-page-header";
import NFTMintModal from "@/components/nft-mint-modal";
import { toast } from "sonner";
import { ethers } from "ethers";
import { SUPPORTED_NETWORKS } from "@/lib/web3/blockchain-config";

// Import ABIs
import ViewFacetABI from "@/contracts/abis/ViewFacet.json";
import AuthUserABI from "@/contracts/abis/AuthUser.json";

// Utility function to format large numbers compactly
const formatCompactNumber = (num: number) => {
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
};

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  description: string;
  current_value: number;
  original_value: number;
  verification_status: string;
  collateralization_status: string;
  location: string;
  blockchain: string;
  created_at: string;
  tokenId?: string; // For NFT assets
}

interface NFTAsset {
  name: string;
  description: string;
  assetType: string;
  value: string;
  location: string;
  imageUrl: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

function getStatusBadge(status: string) {
  const colors = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    collateralized: "bg-blue-50 text-blue-700 border-blue-200",
    available: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={`${colors[status as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"} font-medium`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}



export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [networkConfig, setNetworkConfig] = useState(SUPPORTED_NETWORKS.sepolia);

  // Check wallet connection and fetch assets
  useEffect(() => {
    checkWalletAndFetchAssets();
  }, []);

  const checkWalletAndFetchAssets = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setIsConnected(true);
          const userAddress = accounts[0].address;
          setAddress(userAddress);
          
          // Get current network
          const network = await provider.getNetwork();
          const currentNetwork = Object.values(SUPPORTED_NETWORKS).find(
            net => net.chainId === Number(network.chainId)
          );
          if (currentNetwork) {
            setNetworkConfig(currentNetwork);
          }
          
          // Fetch user NFTs from ViewFacet
          await fetchUserAssets(userAddress, provider, currentNetwork || SUPPORTED_NETWORKS.sepolia);
        } else {
          // No wallet connected, show empty state
          setAssets([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("No wallet connected, showing empty state");
        setAssets([]);
        setIsLoading(false);
      }
    } else {
      // No MetaMask, show empty state
      setAssets([]);
      setIsLoading(false);
    }
  };

  const fetchUserAssets = async (userAddress: string, provider: ethers.BrowserProvider, network: any) => {
    setIsLoading(true);
    
    try {
      if (!network.contracts?.diamond) {
        console.log("🔧 DEBUG: No diamond contract configured for this network");
        toast.error("No contract deployed on this network. Please switch to a supported network.");
        setAssets([]);
        setIsLoading(false);
        return;
      }

      // Create ViewFacet contract instance
      const viewFacetContract = new ethers.Contract(
        network.contracts.diamond,
        ViewFacetABI,
        provider
      );

      // Create AuthUser contract instance for metadata access
      const authUserContract = new ethers.Contract(
        network.contracts.diamond,
        AuthUserABI,
        provider
      );

      console.log("🔧 DEBUG: Fetching user NFTs...", {
        userAddress,
        contract: network.contracts.diamond,
        network: network.name,
      });

      // Get user NFT IDs
      const nftIds = await viewFacetContract.getUserNFTs(userAddress);
      console.log("🔧 DEBUG: User NFT IDs:", nftIds);

      if (nftIds.length === 0) {
        console.log("🔧 DEBUG: No NFTs found for user, using empty state");
        setAssets([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each NFT
      const assetPromises = nftIds.map(async (tokenId: bigint) => {
        try {
          // Get the basic NFT data from ViewFacet (financial/loan data)
          const [isAuth, amount, duration, rate, tokenAddress] = await viewFacetContract.getUserNFTDetail(userAddress, tokenId);
          
          console.log("🔧 DEBUG: NFT Details for token", tokenId.toString(), {
            isAuth,
            amount: amount.toString(),
            duration: duration.toString(),
            rate: rate.toString(),
            tokenAddress,
          });

          // Get token URI and metadata from AuthUser contract
          let metadata = null;
          let tokenURI = null;
          
          try {
            // Get tokenURI from AuthUser contract (it has ERC721URIStorage)
            tokenURI = await authUserContract.tokenURI(tokenId);
            console.log("🔧 DEBUG: Token URI for", tokenId.toString(), ":", tokenURI);
            
            if (tokenURI) {
              // Parse metadata from URI
              if (tokenURI.startsWith('data:application/json;base64,')) {
                const base64Data = tokenURI.split(',')[1];
                metadata = JSON.parse(atob(base64Data));
                console.log("🔧 DEBUG: Parsed metadata:", metadata);
              } else if (tokenURI.startsWith('http')) {
                // Try to fetch from HTTP URL
                try {
                  const response = await fetch(tokenURI);
                  metadata = await response.json();
                  console.log("🔧 DEBUG: Fetched metadata from URL:", metadata);
                } catch (fetchError) {
                  console.log("🔧 DEBUG: Failed to fetch metadata from URL:", fetchError);
                }
              }
            }
          } catch (error) {
            console.log("🔧 DEBUG: Error getting tokenURI for token", tokenId.toString(), ":", error);
          }

          // Extract asset information - use metadata if available, otherwise generate from contract data
          let assetValue = Number(ethers.formatEther(amount));
          
          let assetName, assetType, assetDescription, assetLocation;
          
          if (metadata) {
            // Use real metadata from tokenURI
            console.log("🔧 DEBUG: Using real metadata for token", tokenId.toString());
            assetName = metadata.name || `NFT Asset #${tokenId.toString()}`;
            assetDescription = metadata.description || `Asset with ${assetValue} ETH value`;
            
            // Extract asset type from metadata attributes
            const assetTypeFromMetadata = metadata.attributes?.find((attr: any) => 
              attr.trait_type === "Asset Type" || attr.trait_type === "Type"
            )?.value;
            assetType = assetTypeFromMetadata?.toLowerCase()?.replace(/\s+/g, "_") || "other";
            
            // Extract location from metadata attributes
            assetLocation = metadata.attributes?.find((attr: any) => 
              attr.trait_type === "Location"
            )?.value || "On-chain";
            
            // Try to get value from metadata if available
            const assetValueFromMetadata = metadata.attributes?.find((attr: any) => 
              attr.trait_type === "Value (USD)" || attr.trait_type === "Value"
            )?.value;
            
            if (assetValueFromMetadata) {
              // Use metadata value if it exists
              const metadataValue = typeof assetValueFromMetadata === 'number' 
                ? assetValueFromMetadata 
                : parseFloat(assetValueFromMetadata.toString()) || assetValue;
              // Use the higher of contract value or metadata value
              if (metadataValue > assetValue) {
                assetValue = metadataValue;
              }
            }

            console.log("🔧 DEBUG: Final asset data for token", tokenId.toString(), ":", {
              name: assetName,
              type: assetType,
              value: assetValue,
              location: assetLocation,
              hasMetadata: true
            });

            // Try to get actual mint timestamp from blockchain
            const actualMintTime = await getMintTimestamp(tokenId.toString(), provider, network.contracts.diamond);
            
            // Create asset from real metadata
            const asset: Asset = {
              id: tokenId.toString(),
              name: assetName,
              asset_type: assetType,
              description: assetDescription,
              current_value: assetValue,
              original_value: assetValue,
              verification_status: isAuth ? "verified" : "pending",
              collateralization_status: amount > 0 ? "collateralized" : "available",
              location: assetLocation,
              blockchain: network.name,
              created_at: actualMintTime || (metadata?.attributes?.find((attr: any) => 
                attr.trait_type === "Minted Date" || attr.trait_type === "Created"
              )?.value ? new Date(metadata.attributes.find((attr: any) => 
                attr.trait_type === "Minted Date" || attr.trait_type === "Created"
              ).value).toISOString() : new Date().toISOString()),
              tokenId: tokenId.toString(),
            };

            return asset;
          } else {
            // No metadata available - skip this asset
            console.log("🔧 DEBUG: No metadata found for token", tokenId.toString(), "- skipping");
            return null;
          }
        } catch (error) {
          console.error("Error fetching NFT details for token", tokenId.toString(), error);
          return null;
        }
      });

      const fetchedAssets = (await Promise.all(assetPromises)).filter(Boolean) as Asset[];
      
      console.log("🔧 DEBUG: Final fetched assets:", fetchedAssets);
      setAssets(fetchedAssets);

    } catch (error) {
      console.error("Error fetching user assets:", error);
      toast.error("Failed to fetch assets from blockchain");
      // Show empty state instead of mock data when blockchain fetch fails
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  };



  const handleMintSuccess = async (tokenId: string, metadata: NFTAsset & { actualMintTime?: string }) => {
    // Create new asset from minted NFT
    const newAsset: Asset = {
      id: tokenId,
      name: metadata.name,
      asset_type: metadata.assetType,
      description: metadata.description,
      current_value: parseFloat(metadata.value) || 0,
      original_value: parseFloat(metadata.value) || 0,
      verification_status: "pending",
      collateralization_status: "available",
      location: metadata.location,
      blockchain: networkConfig.name,
      created_at: metadata.actualMintTime || new Date().toISOString(), // Use actual blockchain timestamp if available
      tokenId: tokenId,
    };

    // Add to assets list immediately for UI feedback
    setAssets(prev => [newAsset, ...prev]);
    toast.success(`Asset "${metadata.name}" added to your portfolio!`);

    // Optionally refresh from blockchain after a delay
    if (isConnected && address) {
      setTimeout(async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await fetchUserAssets(address, provider, networkConfig);
        } catch (error) {
          console.log("Could not refresh from blockchain:", error);
        }
      }, 3000);
    }
  };

  // Function to get the actual mint timestamp from blockchain
  const getMintTimestamp = async (tokenId: string, provider: ethers.BrowserProvider, contractAddress: string): Promise<string | null> => {
    try {
      // Get Transfer events for this token ID (ERC721 mint events)
      const authUserContract = new ethers.Contract(contractAddress, AuthUserABI, provider);
      
      // Query Transfer events from null address (minting)
      const filter = authUserContract.filters.Transfer(ethers.ZeroAddress, null, tokenId);
      const events = await authUserContract.queryFilter(filter);
      
      if (events.length > 0) {
        // Get the block timestamp of the first (mint) event
        const mintEvent = events[0];
        const block = await provider.getBlock(mintEvent.blockNumber);
        return block ? new Date(block.timestamp * 1000).toISOString() : null;
      }
      
      return null;
    } catch (error) {
      console.log("🔧 DEBUG: Could not fetch mint timestamp for token", tokenId, error);
      return null;
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
  const verifiedAssets = assets.filter((asset) => asset.verification_status === "verified").length;
  const collateralizedAssets = assets.filter(
    (asset) => asset.collateralization_status === "collateralized"
  ).length;
  const pendingAssets = assets.filter((asset) => asset.verification_status === "pending").length;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <EnhancedPageHeader
            title="Asset Management"
            description="Track and manage your tokenized real-world assets with comprehensive portfolio analytics"
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Assets" },
            ]}
            badges={[
              {
                text: `${assets?.length || 0} Total Assets`,
                variant: "outline" as const,
                icon: <Building className="h-3 w-3" />,
                className: "text-blue-700 border-blue-200",
              },
              {
                text: `${verifiedAssets} Verified`,
                variant: "default" as const,
                icon: <CheckCircle className="h-3 w-3" />,
                className: "bg-green-100 text-green-800 border-green-200",
              },
              {
                text: `$${totalValue.toLocaleString()} Total Value`,
                variant: "outline" as const,
                icon: <DollarSign className="h-3 w-3" />,
                className: "text-emerald-700 border-emerald-200",
              },
              ...(pendingAssets > 0
                ? [
                    {
                      text: `${pendingAssets} Pending Review`,
                      variant: "outline" as const,
                      icon: <Clock className="h-3 w-3" />,
                      className: "text-yellow-700 border-yellow-200",
                    },
                  ]
                : []),
            ]}
            actions={
              <div className="flex gap-3">
                <NFTMintModal
                  trigger={
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Create Asset NFT
                    </Button>
                  }
                  onMintSuccess={handleMintSuccess}
                />
              </div>
            }
          />

          {/* Content */}
          <div className="px-6">
            <div className="w-full space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-staggerIn">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2 uppercase tracking-wide">
                      <Building className="h-4 w-4" />
                      Total Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {assets?.length || 0}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 mt-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">NFTs Minted</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-emerald-600 flex items-center gap-2 uppercase tracking-wide">
                      <DollarSign className="h-4 w-4" />
                      Total Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {formatCompactNumber(totalValue)}
                    </p>
                    <div className="flex items-center gap-1 text-emerald-600 mt-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Portfolio Value
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-600 flex items-center gap-2 uppercase tracking-wide">
                      <CheckCircle className="h-4 w-4" />
                      Verified Assets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {verifiedAssets}
                    </p>
                    <div className="flex items-center gap-1 text-purple-600 mt-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Ready for Lending
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-600 flex items-center gap-2 uppercase tracking-wide">
                      <Wallet className="h-4 w-4" />
                      Collateralized
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                      {collateralizedAssets}
                    </p>
                    <div className="flex items-center gap-1 text-orange-600 mt-2">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Loans</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assets Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm animate-pulse">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            <div>
                              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
                  {assets.map((asset) => (
                    <Card
                      key={asset.id}
                      className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <span className="text-white font-bold text-lg">
                                {asset.asset_type === "real_estate"
                                  ? "🏢"
                                  : asset.asset_type === "commodity"
                                    ? "🥇"
                                    : asset.asset_type === "equipment"
                                      ? "⚙️"
                                      : asset.asset_type === "vehicle"
                                        ? "🚗"
                                        : asset.asset_type === "art"
                                          ? "🎨"
                                          : "📄"}
                              </span>
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {asset.name}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground capitalize">
                                {asset.asset_type.replace("_", " ")}
                                {asset.tokenId && (
                                  <span className="ml-2 text-purple-600 font-medium">
                                    NFT #{asset.tokenId}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getStatusBadge(asset.verification_status)}
                            {getStatusBadge(asset.collateralization_status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Asset Description */}
                        {asset.description && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {asset.description}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Current Value
                            </span>
                            <span className="font-bold text-base sm:text-lg text-gray-900 break-words">
                              {formatCompactNumber(asset.current_value)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Original Value
                            </span>
                            <span className="text-sm text-gray-600 break-words">
                              {formatCompactNumber(asset.original_value)}
                            </span>
                          </div>
                          {asset.location && asset.location !== "On-chain" && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {asset.location}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            {asset.blockchain}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Created {formatTimeAgo(asset.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                            asChild
                          >
                            <Link href={`/dashboard/assets/${asset.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          
                          {/* Show Mint button for assets without tokenId */}
                          {!asset.tokenId ? (
                            <NFTMintModal
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 group-hover:border-purple-300 group-hover:text-purple-600 transition-colors"
                                >
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Mint NFT
                                </Button>
                              }
                              onMintSuccess={handleMintSuccess}
                            />
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 group-hover:border-green-300 group-hover:text-green-600 transition-colors"
                              disabled
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Minted
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Ready to Mint Your First NFT Asset?
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Start building your on-chain portfolio by minting your first
                      NFT asset. Quick, simple, and fully integrated with our loan system.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <NFTMintModal
                        trigger={
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Sparkles className="h-5 w-5 mr-2" />
                            Mint Your First NFT
                          </Button>
                        }
                        onMintSuccess={handleMintSuccess}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

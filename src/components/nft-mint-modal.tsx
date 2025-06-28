"use client";

import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { SUPPORTED_NETWORKS, getNetworkConfig } from "@/lib/web3/blockchain-config";

// Import ABIs
import AuthUserABI from "@/contracts/abis/AuthUser.json";
import ViewFacetABI from "@/contracts/abis/ViewFacet.json";

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
  actualMintTime?: string; // Actual blockchain timestamp when minted
}

interface NFTMintModalProps {
  trigger?: React.ReactNode;
  onMintSuccess?: (tokenId: string, metadata: NFTAsset) => void;
}

const assetTypes = [
  { value: "real_estate", label: "Real Estate", icon: "🏢" },
  { value: "vehicle", label: "Vehicle", icon: "🚗" },
  { value: "equipment", label: "Equipment", icon: "⚙️" },
  { value: "commodity", label: "Commodity", icon: "🥇" },
  { value: "art", label: "Art & Collectibles", icon: "🎨" },
  { value: "other", label: "Other", icon: "📄" },
];

export default function NFTMintModal({ trigger, onMintSuccess }: NFTMintModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextTokenId, setNextTokenId] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("sepolia");
  const [networkConfig, setNetworkConfig] = useState(SUPPORTED_NETWORKS.sepolia);
  
  const [formData, setFormData] = useState<NFTAsset>({
    name: "",
    description: "",
    assetType: "",
    value: "",
    location: "",
    imageUrl: "",
    attributes: [],
  });

  // Initialize wallet connection state
  useEffect(() => {
    checkWalletConnection();
    generateTokenId();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0].address);
          
          // Get current network
          const network = await provider.getNetwork();
          const currentNetwork = Object.values(SUPPORTED_NETWORKS).find(
            net => net.chainId === Number(network.chainId)
          );
          if (currentNetwork) {
            setNetworkConfig(currentNetwork);
            const networkKey = Object.keys(SUPPORTED_NETWORKS).find(
              key => SUPPORTED_NETWORKS[key].chainId === Number(network.chainId)
            );
            if (networkKey) setNetwork(networkKey);
          }
        }
      } catch (error) {
        console.log("No wallet connected");
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setIsConnected(true);
        setAddress(userAddress);
        
        // Get network info
        const network = await provider.getNetwork();
        const currentNetwork = Object.values(SUPPORTED_NETWORKS).find(
          net => net.chainId === Number(network.chainId)
        );
        if (currentNetwork) {
          setNetworkConfig(currentNetwork);
          const networkKey = Object.keys(SUPPORTED_NETWORKS).find(
            key => SUPPORTED_NETWORKS[key].chainId === Number(network.chainId)
          );
          if (networkKey) setNetwork(networkKey);
        }
        
        toast.success("Wallet connected successfully!");
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast.error("Failed to connect wallet");
      }
    } else {
      toast.error("Please install MetaMask");
    }
  };

  const generateTokenId = () => {
    // Generate a random token ID for demo purposes
    const randomId = Math.floor(Math.random() * 1000000) + 1;
    setNextTokenId(randomId);
  };

  const createMetadata = (asset: NFTAsset) => {
    const selectedAssetType = assetTypes.find(type => type.value === asset.assetType);
    
    return {
      name: asset.name,
      description: asset.description,
      image: asset.imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(asset.name)}`,
      attributes: [
        {
          trait_type: "Asset Type",
          value: selectedAssetType?.label || asset.assetType,
        },
        {
          trait_type: "Value (USD)",
          value: parseFloat(asset.value || "0"),
          display_type: "number",
        },
        {
          trait_type: "Location",
          value: asset.location,
        },
        {
          trait_type: "Minted Date",
          value: new Date().toISOString().split('T')[0],
        },
        {
          trait_type: "Blockchain",
          value: networkConfig.name,
        },
        ...asset.attributes,
      ].filter(attr => attr.value),
    };
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.name || !formData.assetType || !formData.value) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Create metadata
      const metadata = createMetadata(formData);
      
      // Create metadata URI (in production, upload to IPFS)
      const metadataJSON = JSON.stringify(metadata, null, 2);
      const metadataURI = `data:application/json;base64,${btoa(metadataJSON)}`;

      if (!networkConfig.contracts?.diamond) {
        throw new Error("Diamond contract address not configured for this network");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance
      const authUserContract = new ethers.Contract(
        networkConfig.contracts.diamond,
        AuthUserABI,
        signer
      );

      console.log("🔧 DEBUG: Attempting to mint NFT...", {
        contract: networkConfig.contracts.diamond,
        to: address,
        tokenURI: metadataURI,
        valuation: ethers.parseEther(formData.value),
      });

      // Mint the NFT
      try {
        const tx = await authUserContract.mintAuthNFT(
          address,
          metadataURI,
          ethers.parseEther(formData.value) // Convert USD to ETH (simplified)
        );

        console.log("🔧 DEBUG: Transaction sent:", tx.hash);
        toast.success("Transaction sent! Waiting for confirmation...", {
          description: "Your NFT is being minted on-chain..."
        });

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("🔧 DEBUG: Transaction confirmed:", receipt);

        // Get the actual block timestamp for accurate minting time
        const block = await provider.getBlock(receipt.blockNumber);
        const actualMintTime = block ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString();

        // Extract token ID from logs
        const mintEvent = receipt.logs.find((log: any) => log.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"); // Transfer event
        const tokenId = mintEvent ? parseInt(mintEvent.topics[3], 16).toString() : nextTokenId.toString();

        toast.success(`NFT minted successfully! Token ID: ${tokenId}`, {
          description: "Your asset is now available for loans"
        });
        
        // Call success callback with actual mint time
        if (onMintSuccess) {
          onMintSuccess(tokenId, { ...formData, actualMintTime });
        }

        // Reset form and close modal
        setFormData({
          name: "",
          description: "",
          assetType: "",
          value: "",
          location: "",
          imageUrl: "",
          attributes: [],
        });
        setIsOpen(false);

      } catch (contractError: any) {
        console.error("Contract call failed:", contractError);
        toast.error(`Minting failed: ${contractError.shortMessage || contractError.message}`);
      }

    } catch (error) {
      console.error("Minting error:", error);
      toast.error(`Failed to mint NFT: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: "", value: "" }],
    }));
  };

  const updateAttribute = (index: number, field: "trait_type" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Mint NFT Asset
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Create Asset NFT
          </DialogTitle>
          <DialogDescription>
            Create an on-chain NFT representing your real-world asset for use as collateral in loans.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          {!isConnected ? (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Wallet not connected</span>
                  </div>
                  <Button
                    onClick={connectWallet}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  <Badge variant="outline" className="ml-auto">
                    Token ID: #{nextTokenId.toString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Luxury Apartment NYC"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="assetType">Asset Type *</Label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your asset..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Estimated Value (USD) *</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="100000"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </div>
          </div>

          {/* Custom Attributes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Custom Attributes</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                <Plus className="h-4 w-4 mr-1" />
                Add Attribute
              </Button>
            </div>
            
            {formData.attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Trait name"
                  value={attr.trait_type}
                  onChange={(e) => updateAttribute(index, "trait_type", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={attr.value.toString()}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAttribute(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>

          {/* Preview */}
          {formData.name && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-sm">NFT Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">{formData.name}</span>
                </div>
                {formData.assetType && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <span className="text-sm">
                      {assetTypes.find(t => t.value === formData.assetType)?.label}
                    </span>
                  </div>
                )}
                {formData.value && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Value:</span>
                    <span className="text-sm">${parseInt(formData.value).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              disabled={!formData.name || !formData.assetType || !formData.value || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create NFT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

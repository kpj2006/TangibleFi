"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../../supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  Upload,
  Plus,
  ArrowLeft,
  FileText,
  Camera,
  MapPin,
  DollarSign,
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Globe,
  Sparkles,
  Info,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { web3Service } from "@/lib/web3/contracts";
import { ipfsService } from "@/lib/ipfs/service";

export default function NewAssetPage() {
  const router = useRouter();
  const supabase = createClient();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    asset_type: "",
    description: "",
    location: "",
    original_value: "",
    blockchain: "ethereum",
  });

  // Connect wallet on component mount
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const address = await web3Service.connect();
        setWalletAddress(address);
      } catch (error) {
        console.error("Wallet connection error:", error);
      }
    };
    connectWallet();
  }, []);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "documents" | "image"
  ) => {
    const files = event.target.files;
    if (!files) return;

    if (type === "documents") {
      setSelectedFiles(Array.from(files));
    } else if (type === "image") {
      setImageFile(files[0]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const createAsset = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStep(1);

    try {
      // Step 1: Upload documents to IPFS
      setCurrentStep(1);
      let documentHashes: string[] = [];
      let imageHash: string = "";

      if (selectedFiles.length > 0) {
        const uploadResults =
          await ipfsService.uploadAssetDocuments(selectedFiles);
        documentHashes = uploadResults.map((result) => result.hash);
      }

      if (imageFile) {
        const imageResult = await ipfsService.uploadFile(imageFile, {
          name: `${formData.name}_image`,
          description: "Asset image",
        });
        imageHash = imageResult.hash;
      }

      // Step 2: Create metadata
      setCurrentStep(2);
      const metadataResult = await ipfsService.createAssetMetadata({
        name: formData.name,
        description: formData.description,
        asset_type: formData.asset_type,
        location: formData.location,
        valuation: formData.original_value,
        blockchain: formData.blockchain,
        imageHash,
        documentHashes,
      });

      // Step 3: Mint NFT on blockchain
      setCurrentStep(3);
      const mintResult = await web3Service.mintAssetNFT(
        walletAddress,
        metadataResult.url,
        formData.original_value,
        formData.blockchain
      );

      setTxHash(mintResult.txHash);

      // Step 4: Save to database
      setCurrentStep(4);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: dbError } = await supabase.from("assets").insert({
          user_id: user.id,
          name: formData.name,
          asset_type: formData.asset_type,
          description: formData.description,
          location: formData.location,
          original_value: parseFloat(formData.original_value),
          current_value: parseFloat(formData.original_value),
          blockchain: formData.blockchain,
          verification_status: "pending",
          collateralization_status: "available",
          token_address: web3Service.getContractAddress(formData.blockchain),
          documents: JSON.stringify({
            token_id: mintResult.tokenId,
            metadata_uri: metadataResult.url,
            ipfs_hash: metadataResult.hash,
            transaction_hash: mintResult.txHash,
            uploaded_files: selectedFiles.map((f) => f.name),
          }),
        });

        if (dbError) {
          console.error("Database error details:", {
            message: dbError.message,
            details: dbError.details,
            hint: dbError.hint,
            code: dbError.code,
          });
          // Don't fail the entire process for database errors, but log the details
          setError(
            `Database save failed: ${dbError.message || "Unknown error"}`
          );
        } else {
          console.log("Asset successfully saved to database");
        }
      }

      setSuccess(
        `Asset successfully tokenized! Token ID: ${mintResult.tokenId}`
      );

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard/assets");
      }, 3000);
    } catch (error: any) {
      console.error("Asset creation error:", error);
      setError(error.message || "Failed to create asset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fadeIn">
        <div className="w-full px-6 py-6">
          {/* Enhanced Header with Back Button */}
          <div className="mb-8 animate-slideDown">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Link
                  href="/dashboard/assets"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Assets
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Estimated time: 5-10 minutes</span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Tokenize New Asset
              </h1>
              <p className="text-lg text-muted-foreground">
                Transform your real-world assets into blockchain-based NFTs for
                lending and investment opportunities
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
                {txHash && (
                  <div className="mt-2">
                    <a
                      href={web3Service.getBlockExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      View Transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Indicator */}
          {isLoading && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {currentStep === 1 && "Uploading documents to IPFS..."}
                      {currentStep === 2 && "Creating metadata..."}
                      {currentStep === 3 && "Minting NFT on blockchain..."}
                      {currentStep === 4 && "Saving to database..."}
                    </p>
                    <p className="text-sm text-blue-700">
                      Step {currentStep} of 4
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-slideUp">
            {/* Main Form - Takes 3 columns */}
            <div className="xl:col-span-3">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    Asset Information
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Provide comprehensive details about the asset you want to
                    tokenize on the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">
                            1
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Basic Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Asset Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            placeholder="e.g., Downtown Office Building"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="asset_type"
                            className="text-sm font-semibold text-gray-700"
                          >
                            Asset Type *
                          </Label>
                          <Select
                            value={formData.asset_type}
                            onValueChange={(value) =>
                              handleInputChange("asset_type", value)
                            }
                            required
                          >
                            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Commercial Real Estate">
                                Commercial Real Estate
                              </SelectItem>
                              <SelectItem value="Residential Real Estate">
                                Residential Real Estate
                              </SelectItem>
                              <SelectItem value="Industrial Real Estate">
                                Industrial Real Estate
                              </SelectItem>
                              <SelectItem value="Commodity">
                                Commodity
                              </SelectItem>
                              <SelectItem value="Vehicle">Vehicle</SelectItem>
                              <SelectItem value="Equipment">
                                Equipment
                              </SelectItem>
                              <SelectItem value="Art & Collectibles">
                                Art & Collectibles
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="description"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Provide a comprehensive description of your asset including its condition, features, and any relevant details..."
                          required
                          rows={4}
                          className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base"
                        />
                      </div>
                    </div>

                    {/* Location & Valuation Section */}
                    <div className="space-y-6 border-t border-gray-200 pt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-600">
                            2
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Location & Valuation
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="location"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                          >
                            <MapPin className="h-4 w-4" />
                            Location *
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            placeholder="e.g., New York, NY, USA"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="original_value"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                          >
                            <DollarSign className="h-4 w-4" />
                            Asset Value (USD) *
                          </Label>
                          <Input
                            id="original_value"
                            value={formData.original_value}
                            onChange={(e) =>
                              handleInputChange(
                                "original_value",
                                e.target.value
                              )
                            }
                            type="number"
                            step="0.01"
                            min="10000"
                            placeholder="1000000"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 text-base"
                          />
                          <p className="text-xs text-gray-500">
                            Minimum value: $10,000
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Selection Section */}
                    <div className="space-y-6 border-t border-gray-200 pt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">
                            3
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Blockchain Network
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="blockchain"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                        >
                          <Globe className="h-4 w-4" />
                          Select Blockchain Network *
                        </Label>
                        <Select
                          value={formData.blockchain}
                          onValueChange={(value) =>
                            handleInputChange("blockchain", value)
                          }
                          required
                        >
                          <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                            <SelectValue placeholder="Choose your preferred blockchain" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ethereum">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                Ethereum - Most secure, highest fees
                              </div>
                            </SelectItem>
                            <SelectItem value="polygon">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                                Polygon - Fast & low cost
                              </div>
                            </SelectItem>
                            <SelectItem value="arbitrum">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                                Arbitrum - Ethereum Layer 2
                              </div>
                            </SelectItem>
                            <SelectItem value="optimism">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                Optimism - Scalable Ethereum
                              </div>
                            </SelectItem>
                            <SelectItem value="bsc">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                BNB Chain - Low fees, fast
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Choose based on your preference for speed, cost, and
                          security. You can always bridge to other networks
                          later.
                        </p>
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-6 border-t border-gray-200 pt-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">
                            4
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Documentation & Images
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Camera className="h-4 w-4" />
                            Asset Image
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "image")}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer"
                            >
                              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {imageFile
                                  ? imageFile.name
                                  : "Click to upload asset image"}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <FileText className="h-4 w-4" />
                            Supporting Documents
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(e, "documents")}
                              className="hidden"
                              id="documents-upload"
                            />
                            <label
                              htmlFor="documents-upload"
                              className="cursor-pointer"
                            >
                              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                {selectedFiles.length > 0
                                  ? `${selectedFiles.length} files selected`
                                  : "Click to upload documents"}
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Wallet Connection Status */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Wallet Status
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {walletAddress ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                {walletAddress.slice(0, 6)}...
                                {walletAddress.slice(-4)}
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-700">
                                Not Connected
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="border-t border-gray-200 pt-8">
                      <Button
                        onClick={createAsset}
                        disabled={isLoading || !walletAddress}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 rounded-xl disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Creating Your Asset NFT...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Tokenize Asset & Create NFT
                          </>
                        )}
                      </Button>
                      <p className="text-center text-sm text-gray-500 mt-3">
                        By proceeding, you agree to our terms and understand
                        that your asset will undergo verification
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Takes 1 column */}
            <div className="xl:col-span-1 space-y-6">
              {/* Process Timeline */}
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    Tokenization Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 border-2 border-blue-500 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-blue-600">
                          1
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">
                          Submit Details
                        </h4>
                        <p className="text-sm text-gray-600">
                          Provide asset information and documentation
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 border-2 border-yellow-500 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-yellow-600">
                          2
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">
                          Expert Verification
                        </h4>
                        <p className="text-sm text-gray-600">
                          Our team verifies your asset details (1-3 business
                          days)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 border-2 border-emerald-500 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-emerald-600">
                          3
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">
                          NFT Minting
                        </h4>
                        <p className="text-sm text-gray-600">
                          Asset becomes an NFT ready for lending
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Checklist */}
              <Card className="border border-gray-200 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-gray-700">
                        Asset must be owned by you
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-gray-700">
                        Minimum value of $10,000
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-gray-700">
                        Valid ownership documentation
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                      <span className="text-gray-700">
                        Asset location verification
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Help & Support */}
              <Card className="border border-blue-200 shadow-lg bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-3 text-gray-900">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Our expert team is here to guide you through the
                    tokenization process and answer any questions.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

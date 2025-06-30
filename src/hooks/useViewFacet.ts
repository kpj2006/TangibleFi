import { useState, useEffect } from 'react';
import { getFacetContract } from '../lib/web3/diamond';
import { ethers } from 'ethers';

export interface ViewFacetData {
  netWorth: number;
  totalAssets: number;
  verifiedAssets: number;
  portfolioHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  totalValue: number;
  nftsMinted: number;
  readyForLending: number;
  collateralizedAssets: number;
  activeLoans: number;
}

export const useViewFacet = () => {
  const [data, setData] = useState<ViewFacetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Connect to provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const viewFacet = await getFacetContract('ViewFacet', provider);

        // Get user address
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Only call functions that exist on the contract
        // Example: getUserAssets, getUserLoans, getUserNetWorth
        // Please adjust these names to match your actual ABI
        let netWorth = 0;
        let totalAssets = 0;
        let verifiedAssets = 0;
        let totalValue = 0;
        let nftsMinted = 0;
        let readyForLending = 0;
        let collateralizedAssets = 0;
        let activeLoans = 0;
        let portfolioHealth: ViewFacetData['portfolioHealth'] = 'Fair';

        // Example: getUserNetWorth
        if (typeof viewFacet.getUserNetWorth === 'function') {
          const netWorthRaw = await viewFacet.getUserNetWorth(userAddress);
          netWorth = Number(ethers.formatEther(netWorthRaw));
        }
        // Example: getUserAssets
        if (typeof viewFacet.getUserAssets === 'function') {
          const assets = await viewFacet.getUserAssets(userAddress);
          totalAssets = Array.isArray(assets) ? assets.length : Number(assets.totalAssets || 0);
          verifiedAssets = Array.isArray(assets)
            ? assets.filter((a: any) => a.verified).length
            : Number(assets.verifiedAssets || 0);
          nftsMinted = totalAssets;
          totalValue = Array.isArray(assets)
            ? assets.reduce((sum: number, a: any) => sum + Number(ethers.formatEther(a.value)), 0)
            : Number(ethers.formatEther(assets.totalValue || 0));
        }
        // Example: getUserLoans
        if (typeof viewFacet.getUserLoans === 'function') {
          const loans = await viewFacet.getUserLoans(userAddress);
          activeLoans = Array.isArray(loans) ? loans.length : Number(loans.activeLoans || 0);
          collateralizedAssets = Array.isArray(loans)
            ? loans.filter((l: any) => l.collateralized).length
            : Number(loans.collateralizedAssets || 0);
        }

        // Portfolio health logic (example)
        if (netWorth > 1000000) portfolioHealth = 'Excellent';
        else if (netWorth > 500000) portfolioHealth = 'Good';
        else if (netWorth > 100000) portfolioHealth = 'Fair';
        else portfolioHealth = 'Poor';

        setData({
          netWorth,
          totalAssets,
          verifiedAssets,
          portfolioHealth,
          totalValue,
          nftsMinted,
          readyForLending,
          collateralizedAssets,
          activeLoans,
        });
        setError(null);
      } catch (err: any) {
        console.error('Error fetching ViewFacet data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // No event listeners for non-existent events
  }, []);

  const calculateHealthStatus = (healthRatio: bigint): ViewFacetData['portfolioHealth'] => {
    const ratio = Number(healthRatio) / 100; // Assuming ratio is stored with 2 decimal places
    if (ratio >= 2.0) return 'Excellent';
    if (ratio >= 1.5) return 'Good';
    if (ratio >= 1.0) return 'Fair';
    return 'Poor';
  };

  return { data, loading, error };
};

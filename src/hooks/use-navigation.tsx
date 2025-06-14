"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useNavigation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoading = useCallback(
    (href: string, delay: number = 0) => {
      // Remove artificial delays for better performance
      router.push(href);
    },
    [router]
  );

  const quickNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  return {
    isLoading: false, // Disable loading states for better performance
    navigateWithLoading,
    quickNavigate,
    setIsLoading,
  };
}

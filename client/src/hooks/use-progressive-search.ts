import { useState, useEffect, useRef } from "react";
import { TravelSearchParams } from "@shared/schema";

interface ProgressiveState {
  results: any[];
  countries: any[];
  status: "idle" | "loading" | "processing" | "completed" | "error";
  progress: {
    processed: number;
    total: number;
    percentage: number;
  };
  totalResults: number;
}

export function useProgressiveSearch(params: TravelSearchParams | null) {
  const [state, setState] = useState<ProgressiveState>({
    results: [],
    countries: [],
    status: "idle",
    progress: { processed: 0, total: 0, percentage: 0 },
    totalResults: 0,
  });

  const sessionIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Start progressive search
  const startSearch = async (searchParams: TravelSearchParams) => {
    setState((prev) => ({
      ...prev,
      status: "loading",
      results: [],
      countries: [],
    }));
    sessionIdRef.current = null;

    try {
      const queryString = new URLSearchParams({
        budget: searchParams.budget.toString(),
        nights: searchParams.nights.toString(),
        ...(searchParams.origin && { origin: searchParams.origin }),
        ...(searchParams.month && { month: searchParams.month.toString() }),
        ...(searchParams.region && { region: searchParams.region }),
        ...(searchParams.country && { country: searchParams.country }),
        ...(searchParams.travelStyle && { travelStyle: searchParams.travelStyle }),
        includeEstimates: "true",
      }).toString();

      const response = await fetch(
        `/api/travel/search/progressive?${queryString}`,
      );
      const data = await response.json();

      if (data.success) {
        sessionIdRef.current = data.sessionId;
        setState((prev) => ({
          ...prev,
          status: data.status,
          results: data.results || [],
          countries: data.countries || [],
          progress: data.progress || { processed: 0, total: 0, percentage: 0 },
          totalResults: data.totalResults || 0,
        }));

        // Start polling if still processing
        if (data.status === "processing") {
          startPolling(searchParams);
        }
      }
    } catch (error) {
      console.error("Progressive search error:", error);
      setState((prev) => ({ ...prev, status: "error" }));
    }
  };

  // Poll for updates
  const startPolling = (searchParams: TravelSearchParams) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      if (!sessionIdRef.current) return;

      try {
        const queryString = new URLSearchParams({
          budget: searchParams.budget.toString(),
          nights: searchParams.nights.toString(),
          ...(searchParams.origin && { origin: searchParams.origin }),
          ...(searchParams.month && { month: searchParams.month.toString() }),
          ...(searchParams.region && { region: searchParams.region }),
          ...(searchParams.country && { country: searchParams.country }),
          ...(searchParams.travelStyle && { travelStyle: searchParams.travelStyle }),
          includeEstimates: "true",
        }).toString();

        const response = await fetch(
          `/api/travel/search/progressive/${sessionIdRef.current}?${queryString}`,
        );
        const data = await response.json();

        console.log("🔍 Polling response:", {
          sessionId: sessionIdRef.current,
          status: data.status,
          resultsCount: data.results?.length || 0,
          totalResults: data.totalResults,
          progress: data.progress,
          timestamp: data.timestamp
        });

        setState((prev) => ({
          ...prev,
          status: data.status,
          results: data.results || [],
          countries: data.countries || [],
          progress: data.progress || prev.progress,
          totalResults: data.totalResults || 0,
        }));

        // Stop polling when completed
        if (data.status === "completed" || data.status === "timeout") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Auto-start search when params change
  useEffect(() => {
    if (params) {
      startSearch(params);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [params]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  return state;
}

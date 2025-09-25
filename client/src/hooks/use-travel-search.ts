import { useQuery } from "@tanstack/react-query";
import type { TravelSearchParams, TravelRecommendationsResponse } from "@/types/travel";

export function useTravelSearch(params: TravelSearchParams | null) {
  // Build query string for centralized fetcher
  const queryString = params ? (() => {
    const searchParams = new URLSearchParams();
    
    searchParams.set('budget', params.budget.toString());
    searchParams.set('nights', params.nights.toString());
    
    if (params.origin) searchParams.set('origin', params.origin);
    if (params.month) searchParams.set('month', params.month.toString());
    if (params.region) searchParams.set('region', params.region);
    if (params.country) searchParams.set('country', params.country);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    // Note: sort is now handled client-side, removed from server query
    if (params.includeEstimates !== undefined) searchParams.set('includeEstimates', params.includeEstimates.toString());
    
    return `/api/travel/recs?${searchParams.toString()}`;
  })() : null;

  return useQuery<TravelRecommendationsResponse>({
    queryKey: [queryString],
    enabled: !!params && !!params.budget && !!queryString,
    // Use default centralized fetcher - no custom queryFn needed
  });
}

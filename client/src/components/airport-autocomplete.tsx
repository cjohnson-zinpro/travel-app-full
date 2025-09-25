import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AirportResult {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  type: "airport" | "city";
  displayText: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface AirportSearchResponse {
  success: boolean;
  query: string;
  results: AirportResult[];
  count: number;
  timestamp: string;
}

interface AirportAutocompleteProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AirportAutocomplete({ 
  value = "", 
  onValueChange, 
  placeholder = "Search airports...", 
  disabled 
}: AirportAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(value);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch airport search results
  const { data, isLoading, error } = useQuery<AirportSearchResponse>({
    queryKey: ['airports-search', debouncedQuery],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        const url = `/api/airports/search?q=${encodeURIComponent(debouncedQuery)}`;
        const res = await fetch(url, {
          credentials: "include",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }
        
        return await res.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    enabled: debouncedQuery.length >= 2, // Only search if 2+ characters
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 4xx/5xx errors
      if (failureCount >= 3) return false;
      return error?.message?.includes('abort') || error?.message?.includes('timeout') || error?.message?.includes('network');
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    networkMode: 'online', // Only run when online
  });

  // Update selected value when external value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Find selected airport details for display
  const selectedAirport = data?.results?.find(airport => airport.iataCode === selectedValue);
  const displayValue = selectedAirport 
    ? `${selectedAirport.iataCode} - ${selectedAirport.name}, ${selectedAirport.cityName}`
    : selectedValue;

  const handleSelect = (airport: AirportResult) => {
    setSelectedValue(airport.iataCode);
    onValueChange(airport.iataCode);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    setSelectedValue("");
    onValueChange("");
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
          data-testid="button-airport-autocomplete"
        >
          <span className={cn("truncate", !selectedValue && "text-muted-foreground")}>
            {selectedValue ? displayValue : placeholder}
          </span>
          <Plane className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search airports..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            data-testid="input-airport-search"
          />
          <CommandList>
            {/* Loading State */}
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground" data-testid="loading-airports">
                Searching airports...
              </div>
            )}

            {/* Error State */}
            {(error || (data && !data.success)) && (
              <div className="py-6 text-center text-sm text-destructive" data-testid="error-airports">
                {error?.message?.includes('abort') || error?.message?.includes('timeout') ? 
                  'Search timed out. Please try again.' : 
                  'Failed to search airports. Please try again.'
                }
                {import.meta.env.DEV && error && (
                  <div className="mt-2 text-xs opacity-75">
                    Debug: {error.message}
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && data && data.results.length === 0 && debouncedQuery.length >= 2 && (
              <CommandEmpty data-testid="empty-airports">
                No airports found for "{debouncedQuery}".
              </CommandEmpty>
            )}

            {/* Search Prompt */}
            {!isLoading && !error && debouncedQuery.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground" data-testid="prompt-airports">
                Type at least 2 characters to search airports
              </div>
            )}

            {/* Clear Selection */}
            {selectedValue && (
              <CommandGroup heading="Current Selection">
                <CommandItem
                  onSelect={handleClear}
                  className="text-destructive"
                  data-testid="button-clear-airport"
                >
                  Clear selection
                </CommandItem>
              </CommandGroup>
            )}

            {/* Results */}
            {data && data.results.length > 0 && (
              <CommandGroup heading={`${data.count} airports found`}>
                {data.results.map((airport) => (
                  <CommandItem
                    key={`${airport.iataCode}-${airport.type}`}
                    onSelect={() => handleSelect(airport)}
                    className="flex items-center justify-between"
                    data-testid={`option-airport-${airport.iataCode}`}
                  >
                    <div className="flex items-center">
                      {airport.type === "airport" ? (
                        <Plane className="mr-2 h-4 w-4 opacity-50" />
                      ) : (
                        <MapPin className="mr-2 h-4 w-4 opacity-50" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {airport.iataCode} - {airport.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {airport.cityName}, {airport.countryName}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedValue === airport.iataCode ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
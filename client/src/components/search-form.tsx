import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { AirportAutocomplete } from "@/components/airport-autocomplete";
import type { TravelSearchParams } from "@/types/travel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const searchFormSchema = z.object({
  budget: z
    .number()
    .min(100, "Budget must be at least $100")
    .max(50000, "Budget must be less than $50,000"),
  origin: z.string().optional(),
  nights: z.number().min(3).max(30),
  month: z.number().min(1).max(12).optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  travelStyle: z.enum(["budget", "mid", "luxury"]).default("budget"), // ADD THIS LINE
});

type SearchFormData = z.infer<typeof searchFormSchema>;

interface SearchFormProps {
  onSearch: (params: TravelSearchParams) => void;
  isLoading?: boolean;
  initialValues?: Partial<TravelSearchParams>;
}

export function SearchForm({
  onSearch,
  isLoading,
  initialValues,
}: SearchFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      budget: initialValues?.budget || 3000,
      origin: initialValues?.origin || "",
      nights: initialValues?.nights || 10,
      month: initialValues?.month || undefined,
      region: initialValues?.region || undefined,
      country: initialValues?.country || "",
      travelStyle: "budget", // ADD THIS LINE
    },
  });

  const watchedRegion = watch("region");
  const [availableCountries, setAvailableCountries] = useState<{ code: string; name: string }[]>([]);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const regions = [
    { value: "asia", label: "Asia" },
    { value: "europe", label: "Europe" },
    { value: "north-america", label: "North America" },
    { value: "central-america-caribbean", label: "Central America / Caribbean" },
    { value: "south-america", label: "South America" },
    { value: "africa", label: "Africa" },
    { value: "oceania", label: "Oceania" },
  ];

  const nightOptions = [
    { value: "3", label: "3 nights" },
    { value: "7", label: "7 nights" },
    { value: "10", label: "10 nights" },
    { value: "14", label: "14 nights" },
    { value: "21", label: "21 nights" },
    { value: "30", label: "30 nights" },
  ];

  useEffect(() => {
    // Populate available countries when region changes
    const region = watchedRegion;
    if (!region) {
      setAvailableCountries([]);
      return;
    }

    fetch(`/api/countries?region=${encodeURIComponent(region)}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve([])))
      .then((data: { code: string; name: string }[]) => {
        setAvailableCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => setAvailableCountries([]));
  }, [watchedRegion]);

  const onSubmit = (data: SearchFormData) => {
    const params: TravelSearchParams = {
      budget: data.budget,
      nights: data.nights,
      sort: "alphabetical",
      includeEstimates: true,
      limit: 25,
      travelStyle: data.travelStyle, // ADD THIS LINE
    };

    if (data.origin && data.origin.trim()) params.origin = data.origin.trim();
    if (data.month) params.month = data.month;
    if (data.region && data.region.trim()) params.region = data.region.trim();
    if (data.country && data.country.trim())
      params.country = data.country.trim();

    onSearch(params);
  };

  return (
    <Card
      className="shadow-lg border border-border bg-background"
      data-testid="search-form-card"
    >
      <CardContent className="p-6 md:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="travel-search-form"
          className="space-y-6"
        >
          {/* First Row: Basic Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Origin */}
            <div>
              <Label
                htmlFor="origin"
                className="block text-sm font-medium text-foreground mb-2"
              >
                From
                <span className="text-muted-foreground text-xs ml-1">
                  (optional)
                </span>
              </Label>
              <AirportAutocomplete
                value={watch("origin") || ""}
                onValueChange={(value) => setValue("origin", value)}
                placeholder="Search airports..."
                disabled={isLoading}
              />
            </div>

            {/* Nights */}
            <div>
              <Label
                htmlFor="nights"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Nights
              </Label>
              <Select
                value={watch("nights")?.toString()}
                onValueChange={(value) => setValue("nights", parseInt(value))}
              >
                <SelectTrigger data-testid="select-nights">
                  <SelectValue placeholder="Select nights" />
                </SelectTrigger>
                <SelectContent>
                  {nightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div>
              <Label
                htmlFor="month"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Month
                <span className="text-muted-foreground text-xs ml-1">
                  (optional)
                </span>
              </Label>
              <Select
                value={watch("month")?.toString() || "any"}
                onValueChange={(value) =>
                  setValue("month", value === "any" ? undefined : parseInt(value))
                }
              >
                <SelectTrigger data-testid="select-month">
                  <SelectValue placeholder="Any month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any month</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row: Travel Style (Full Width) */}
          <div>
            <Label className="block text-sm font-medium text-foreground mb-3">
              Travel Style
            </Label>
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Budget */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setValue('travelStyle', 'budget')}
                      className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted transition-colors ${
                        watch("travelStyle") === "budget"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setValue("travelStyle", "budget")}
                      data-testid="button-tier-budget"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="text-sm font-medium">Budget</div>
                        <p className="text-xs text-muted-foreground">
                          2-3★ stays, street food
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Budget Travel: Hostels or basic hotels, local transport, street food, and free/low-cost activities.
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Mid-range */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setValue('travelStyle', 'mid')}
                      className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted transition-colors ${
                        watch("travelStyle") === "mid"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setValue("travelStyle", "mid")}
                      data-testid="button-tier-mid"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="text-sm font-medium">Mid-range</div>
                        <p className="text-xs text-muted-foreground">
                          3★ hotels, mix dining
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Mid-Range Travel: 3-star hotels, mix of local and tourist transport, standard restaurants, typical attractions.
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Luxury */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setValue('travelStyle', 'luxury')}
                      className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted transition-colors ${
                        watch("travelStyle") === "luxury"
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setValue("travelStyle", "luxury")}
                      data-testid="button-tier-luxury"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="text-sm font-medium">Luxury</div>
                        <p className="text-xs text-muted-foreground">
                          4-5★ hotels, fine dining
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Luxury Travel: 4-5 star hotels, premium transport, fine dining, and curated experiences.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Third Row: Region and Search Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-end">
            {/* Region */}
            <div>
              <Label
                htmlFor="region"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Region
                <span className="text-muted-foreground text-xs ml-1">
                  (optional)
                </span>
              </Label>
              <Select
                value={watch("region") || "all"}
                onValueChange={(value) => {
                  setValue("region", value === "all" ? undefined : value);
                  if (value !== watchedRegion) {
                    setValue("country", undefined); // Reset country when region changes
                  }
                }}
              >
                <SelectTrigger data-testid="select-region">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country combo: datalist with free-input */}
            <div>
              <Label htmlFor="country-combo" className="block text-sm font-medium text-foreground mb-2">
                Country
                <span className="text-muted-foreground text-xs ml-1">(optional)</span>
              </Label>
              <div className="relative">
                <input
                  id="country-combo"
                  list="country-options"
                  className="w-full rounded-md border px-3 py-2 pr-10"
                  placeholder={availableCountries.length ? "All countries in region (or select specific)" : "Type a country (or select a region first)"}
                  value={watch("country") || ""}
                  onChange={(e) => setValue("country", e.target.value || undefined)}
                  onBlur={(e) => setValue("country", e.target.value || undefined)}
                  data-testid="input-country-combo"
                />
                {watch("country") && (
                  <button
                    type="button"
                    onClick={() => setValue("country", undefined)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    data-testid="button-clear-country"
                    title="Clear country selection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <datalist id="country-options">
                <option value="">🌍 All countries in this region</option>
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.name} />
                ))}
              </datalist>
              {watch("country") && (
                <p className="text-xs text-muted-foreground mt-1">
                  Searching in: {watch("country")} only • <button 
                    type="button" 
                    onClick={() => setValue("country", undefined)}
                    className="text-primary hover:underline"
                    data-testid="link-show-all-countries"
                  >
                    Show all countries in region
                  </button>
                </p>
              )}
            </div>

            {/* Search Button */}
            <div>
              <Button
                type="submit"
                className="w-full h-16 text-xl font-bold rounded-2xl bg-primary hover:bg-primary/90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                size="lg"
                disabled={isLoading}
                data-testid="button-search"
              >
                <Search className="h-6 w-6 mr-4" />
                {isLoading ? "Searching..." : "Search Destinations"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

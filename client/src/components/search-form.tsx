import { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Budget Input */}
            <div>
              <Label
                htmlFor="budget"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Budget (USD)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2000"
                  className="pl-8"
                  data-testid="input-budget"
                  {...register("budget", { valueAsNumber: true })}
                />
              </div>
              {errors.budget && (
                <p className="text-destructive text-sm mt-1">
                  {errors.budget.message}
                </p>
              )}
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <div
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
                </PopoverTrigger>
                <PopoverContent>
                  <div className="text-sm">
                    Budget: Comfortable for budget-conscious travelers — lower-cost hotels (2–3★), mostly local dining/street food, and economical transport. Good for visitors who want a comfortable but value-minded trip.
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <div
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
                        3–4★ hotels, mix dining
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="text-sm">
                    Mid-range: Comfortable 3–4★ hotels and a mix of casual and nicer dining options, with moderate transport. Some destinations in this range offer affordable 4★ properties, making it a good choice for travelers who want added comfort without premium prices.
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <div
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
                </PopoverTrigger>
                <PopoverContent>
                  <div className="text-sm">
                    Luxury: High-end 4–5★ hotels, fine dining, premium experiences and upgraded transport. Higher nightly rates and daily expenses for premium comfort.
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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

            {/* Empty space for alignment */}
            <div></div>

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

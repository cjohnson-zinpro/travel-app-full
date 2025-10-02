import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CityCard } from "@/components/city-card";
import type { CityRecommendation } from "@/types/travel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileCityCarouselProps {
  cities: CityRecommendation[];
  onCityClick?: (city: CityRecommendation) => void;
  travelStyle?: "budget" | "mid" | "luxury";
  originAirport?: string;
}

export function MobileCityCarousel({
  cities,
  onCityClick,
  travelStyle = "budget",
  originAirport,
}: MobileCityCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    loop: false,
    skipSnaps: false,
    inViewThreshold: 0.7,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );
  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Don't render carousel if there's only 1 city (no need for carousel)
  if (cities.length <= 1) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {cities.map((city, index) => (
          <CityCard
            key={`${city.cityId}-${index}`}
            city={city}
            onClick={onCityClick}
            travelStyle={travelStyle}
            originAirport={originAirport}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex w-full">
          {cities.map((city, index) => (
            <div
              key={`${city.cityId}-${index}`}
              className="flex-[0_0_100%] min-w-0 md:flex-[0_0_calc(50%-12px)] md:mr-6"
              data-testid={`carousel-slide-${city.cityId}`}
            >
              <CityCard
                city={city}
                onClick={onCityClick}
                travelStyle={travelStyle}
                originAirport={originAirport}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show if needed */}
      {cities.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border-border/60 bg-background/80 backdrop-blur-sm disabled:opacity-30"
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            data-testid="carousel-prev-button"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous cities</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full border-border/60 bg-background/80 backdrop-blur-sm disabled:opacity-30"
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            data-testid="carousel-next-button"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next cities</span>
          </Button>
        </>
      )}

      {/* Dot Indicators - Only show if more than 1 slide */}
      {cities.length > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? "bg-primary"
                  : "bg-border hover:bg-muted-foreground"
              }`}
              onClick={() => scrollTo(index)}
              data-testid={`carousel-dot-${index}`}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
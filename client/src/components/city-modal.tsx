import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, HelpCircle, Clock, MapPin, Info, Calendar, Globe, Users, MessageCircle, Lightbulb, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { CityRecommendation } from "@shared/schema";
import { getFlagImageComponent } from "@/lib/flag-utils";
import { ClaudeDailyCosts } from "@shared/data/claude-daily-costs";
import { CityModalSmartInsights } from "./city-modal-smart-insights";
import { getCostComparison, getDisplayCityName, canCompareCosts, CostComparison } from "@shared/utils/cost-comparison";
import InteractiveMap from "./interactive-map";

// Utility function for formatting currency
const formatCurrency = (amount: number) => `$${amount}`;

// Price accuracy functions (matching city-card.tsx)
const getAccuracyLevel = (city: CityRecommendation): "verified" | "estimated" | "approximate" => {
  // Check if city has Claude data
  const claudeCosts = ClaudeDailyCosts.getDailyCosts(city.city);
  
  if (claudeCosts?.accommodation) {
    // Has comprehensive accommodation and daily cost data
    return "verified";
  } else if (claudeCosts) {
    // Has daily costs but estimated hotel rates
    return "estimated";
  } else {
    // No Claude data, using regional estimates
    return "approximate";
  }
};

const accuracyClasses = {
  verified: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  estimated: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  approximate: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
} as const;

const getAccuracyTooltip = (level: "verified" | "estimated" | "approximate") => {
  switch (level) {
    case "verified":
      return "Verified Pricing: Real market data analyzed by AI from current hotel rates and comprehensive local cost analysis";
    case "estimated":
      return "Estimated Pricing: AI-powered estimates based on detailed local knowledge with some market rate interpolation";
    case "approximate":
      return "Approximate Pricing: AI estimates using regional patterns and historical data - less precise but directionally accurate";
  }
};

// Cultural insights interface and data
interface CulturalInsights {
  primaryLanguage: string;
  secondaryLanguages?: string[];
  currency: string;
  culturalNorms: string[];
  tippingCustoms: string;
  businessHours: string;
  localEtiquette: string[];
  religiousConsiderations?: string[];
  safetyTips: string[];
  localCuisine: string[];
  transportTips: string[];
}

// City overview data with attractions and itineraries
interface CityOverviewData {
  attractions: string[];
  itinerary: string[];
  imageUrl?: string;
}

const CITY_DATA: Record<string, CityOverviewData> = {
  paris: {
    imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?auto=format&fit=crop&w=800&h=400",
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe', 'Champs-Élysées', 'Montmartre', 'Seine River Cruise', 'Palace of Versailles'],
    itinerary: [
      'Day 1: Explore the Louvre Museum and Tuileries Garden',
      'Day 2: Visit Eiffel Tower, Seine River cruise, and Latin Quarter',
      'Day 3: Discover Montmartre, Sacré-Cœur, and local cafés',
      'Day 4: Day trip to Palace of Versailles',
      'Day 5: Shopping on Champs-Élysées and Arc de Triomphe'
    ]
  },
  tokyo: {
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&h=400",
    attractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Meiji Shrine', 'Tsukiji Outer Market', 'Imperial Palace', 'Harajuku', 'Tokyo DisneySea'],
    itinerary: [
      'Day 1: Traditional Tokyo - Senso-ji Temple and Asakusa district',
      'Day 2: Modern Tokyo - Shibuya, Harajuku, and Meiji Shrine',
      'Day 3: Tsukiji Outer Market breakfast and Imperial Palace gardens',
      'Day 4: Tokyo Skytree and Sumida River area',
      'Day 5: Day trip to Tokyo DisneySea or Nikko'
    ]
  },
  london: {
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&h=400",
    attractions: ['Big Ben', 'Tower of London', 'British Museum', 'London Eye', 'Buckingham Palace', 'Westminster Abbey', 'Hyde Park', 'Tate Modern'],
    itinerary: [
      'Day 1: Westminster area - Big Ben, Westminster Abbey, London Eye',
      'Day 2: Royal London - Buckingham Palace, Hyde Park, Kensington',
      'Day 3: Historic London - Tower of London, Tower Bridge, Borough Market',
      'Day 4: Museums - British Museum, Tate Modern, South Bank walk',
      'Day 5: Greenwich or Windsor Castle day trip'
    ]
  },
  'new-york': {
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&h=400",
    attractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge', 'Empire State Building', '9/11 Memorial', 'High Line', 'Metropolitan Museum'],
    itinerary: [
      'Day 1: Lower Manhattan - Statue of Liberty, 9/11 Memorial, Wall Street',
      'Day 2: Midtown - Empire State Building, Times Square, Broadway show',
      'Day 3: Central Park, Metropolitan Museum, Upper East Side',
      'Day 4: Brooklyn Bridge, DUMBO, High Line, Chelsea Market',
      'Day 5: Museums - MoMA, Guggenheim, or Coney Island'
    ]
  },
  rome: {
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&h=400",
    attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Pantheon', 'Roman Forum', 'Spanish Steps', 'Trastevere', 'Villa Borghese'],
    itinerary: [
      'Day 1: Ancient Rome - Colosseum, Roman Forum, Palatine Hill',
      'Day 2: Vatican City - St. Peters Basilica, Sistine Chapel, Vatican Museums',
      'Day 3: Historic Center - Pantheon, Trevi Fountain, Spanish Steps',
      'Day 4: Trastevere neighborhood and Villa Borghese gardens',
      'Day 5: Day trip to Tivoli or explore local markets'
    ]
  },
  barcelona: {
    imageUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&h=400",
    attractions: ['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Gothic Quarter', 'Casa Batlló', 'Barceloneta Beach', 'Camp Nou', 'Picasso Museum'],
    itinerary: [
      'Day 1: Gaudí architecture - Sagrada Familia, Casa Batlló, Casa Milà',
      'Day 2: Park Güell and Gràcia neighborhood exploration',
      'Day 3: Gothic Quarter, Las Ramblas, and Picasso Museum',
      'Day 4: Barceloneta Beach and seafront promenade',
      'Day 5: Montjuïc Hill, magic fountains, and local tapas'
    ]
  },
  amsterdam: {
    imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&h=400",
    attractions: ['Anne Frank House', 'Van Gogh Museum', 'Rijksmuseum', 'Jordaan District', 'Vondelpark', 'Red Light District', 'Canal Cruise', 'Bloemenmarkt'],
    itinerary: [
      'Day 1: Museum Quarter - Van Gogh Museum, Rijksmuseum, Vondelpark',
      'Day 2: Historic Amsterdam - Anne Frank House, canal cruise',
      'Day 3: Jordaan District exploration and local markets',
      'Day 4: Bike tour through city and Vondelpark',
      'Day 5: Day trip to Keukenhof (seasonal) or Zaanse Schans'
    ]
  },
  dubai: {
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&h=400",
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Burj Al Arab', 'Palm Jumeirah', 'Dubai Marina', 'Old Dubai Souks', 'Desert Safari', 'Dubai Fountain'],
    itinerary: [
      'Day 1: Modern Dubai - Burj Khalifa, Dubai Mall, Dubai Fountain',
      'Day 2: Beach day at Palm Jumeirah and Atlantis',
      'Day 3: Traditional Dubai - Gold Souk, Spice Souk, Dubai Creek',
      'Day 4: Desert safari and traditional Bedouin experience',
      'Day 5: Dubai Marina, shopping, and luxury experiences'
    ]
  },
  singapore: {
    imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&h=400",
    attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Chinatown', 'Little India', 'Orchard Road', 'Clarke Quay', 'Singapore Zoo'],
    itinerary: [
      'Day 1: Marina Bay area - Marina Bay Sands, Gardens by the Bay',
      'Day 2: Cultural districts - Chinatown, Little India, Arab Street',
      'Day 3: Sentosa Island - beaches, Universal Studios, S.E.A. Aquarium',
      'Day 4: Singapore Zoo or River Safari, Orchard Road shopping',
      'Day 5: Clarke Quay, Singapore Flyer, local hawker centers'
    ]
  },
  sydney: {
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=400",
    attractions: ['Sydney Opera House', 'Sydney Harbour Bridge', 'Bondi Beach', 'The Rocks', 'Royal Botanic Gardens', 'Darling Harbour', 'Manly Beach', 'Blue Mountains'],
    itinerary: [
      'Day 1: Sydney Harbour - Opera House, Harbour Bridge, The Rocks',
      'Day 2: Beaches - Bondi Beach, Coogee coastal walk',
      'Day 3: Royal Botanic Gardens, Darling Harbour, Sydney Tower',
      'Day 4: Manly Beach and Northern Beaches exploration',
      'Day 5: Blue Mountains day trip or Taronga Zoo'
    ]
  },
  istanbul: {
    imageUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&h=400",
    attractions: ['Hagia Sophia', 'Blue Mosque', 'Grand Bazaar', 'Topkapi Palace', 'Galata Tower', 'Bosphorus Cruise', 'Basilica Cistern', 'Spice Bazaar'],
    itinerary: [
      'Day 1: Historic Peninsula - Hagia Sophia, Blue Mosque, Hippodrome',
      'Day 2: Topkapi Palace, Basilica Cistern, Turkish baths',
      'Day 3: Grand Bazaar, Spice Bazaar, traditional Turkish lunch',
      'Day 4: Bosphorus cruise, Galata Tower, modern Istanbul',
      'Day 5: Asian side exploration or Princes Islands day trip'
    ]
  },
  bangkok: {
    imageUrl: "https://images.unsplash.com/photo-1563492065-0881a8f44d48?auto=format&fit=crop&w=800&h=400",
    attractions: ['Grand Palace', 'Wat Pho', 'Wat Arun', 'Chatuchak Market', 'Khao San Road', 'Chao Phraya River', 'Jim Thompson House', 'Floating Markets'],
    itinerary: [
      'Day 1: Royal Bangkok - Grand Palace, Wat Pho, Wat Arun',
      'Day 2: Markets - Chatuchak Weekend Market, local street food',
      'Day 3: Chao Phraya River tour, Jim Thompson House',
      'Day 4: Floating markets day trip (Damnoen Saduak)',
      'Day 5: Modern Bangkok - shopping malls, rooftop bars, massage'
    ]
  },
  mumbai: {
    imageUrl: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&h=400",
    attractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Crawford Market', 'Bollywood Studios', 'Dhobi Ghat', 'Chhatrapati Shivaji Terminus', 'Hanging Gardens'],
    itinerary: [
      'Day 1: South Mumbai - Gateway of India, Taj Hotel, Colaba',
      'Day 2: Elephanta Caves day trip and Marine Drive sunset',
      'Day 3: Markets - Crawford Market, street food tour',
      'Day 4: Bollywood studio tour, Bandra-Worli Sea Link',
      'Day 5: Dhobi Ghat, Hanging Gardens, local train experience'
    ]
  },
  'rio-de-janeiro': {
    imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&h=400",
    attractions: ['Christ the Redeemer', 'Copacabana Beach', 'Sugarloaf Mountain', 'Ipanema Beach', 'Santa Teresa', 'Maracanã Stadium', 'Tijuca Forest', 'Selarón Steps'],
    itinerary: [
      'Day 1: Iconic Rio - Christ the Redeemer, Corcovado',
      'Day 2: Sugarloaf Mountain, Urca neighborhood',
      'Day 3: Beach day - Copacabana and Ipanema beaches',
      'Day 4: Santa Teresa district, Selarón Steps, local culture',
      'Day 5: Tijuca Forest hike or Maracanã Stadium tour'
    ]
  },
  'buenos-aires': {
    attractions: ['Plaza de Mayo', 'San Telmo', 'La Boca', 'Recoleta Cemetery', 'Puerto Madero', 'Palermo', 'Tango Shows', 'Teatro Colón'],
    itinerary: [
      'Day 1: Historic center - Plaza de Mayo, Casa Rosada, San Telmo',
      'Day 2: La Boca, Caminito, colorful neighborhoods',
      'Day 3: Recoleta Cemetery, MALBA museum, upscale areas',
      'Day 4: Palermo parks, trendy restaurants, nightlife',
      'Day 5: Tango show, Puerto Madero, river walks'
    ]
  },
  cairo: {
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?auto=format&fit=crop&w=800&h=400",
    attractions: ['Pyramids of Giza', 'Sphinx', 'Egyptian Museum', 'Islamic Cairo', 'Khan el-Khalili', 'Citadel of Saladin', 'Nile River Cruise', 'Coptic Cairo'],
    itinerary: [
      'Day 1: Giza Plateau - Pyramids, Sphinx, camel rides',
      'Day 2: Egyptian Museum, Tahrir Square, downtown Cairo',
      'Day 3: Islamic Cairo, Citadel of Saladin, mosque visits',
      'Day 4: Khan el-Khalili bazaar, traditional crafts shopping',
      'Day 5: Coptic Cairo, Nile River felucca cruise'
    ]
  },
  marrakech: {
    imageUrl: "https://images.unsplash.com/photo-1544411047-c491e34ac4ee?auto=format&fit=crop&w=800&h=400",
    attractions: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Bahia Palace', 'Saadian Tombs', 'Atlas Mountains', 'Souks', 'Koutoubia Mosque', 'Menara Gardens'],
    itinerary: [
      'Day 1: Medina exploration - Jemaa el-Fnaa, traditional souks',
      'Day 2: Palaces - Bahia Palace, Saadian Tombs, El Badi Palace',
      'Day 3: Majorelle Garden, Yves Saint Laurent Museum',
      'Day 4: Atlas Mountains day trip, Berber villages',
      'Day 5: Menara Gardens, traditional hammam experience'
    ]
  },
  'cape-town': {
    imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&h=400",
    attractions: ['Table Mountain', 'V&A Waterfront', 'Robben Island', 'Cape Point', 'Winelands', 'Bo-Kaap', 'Camps Bay', 'Kirstenbosch Gardens'],
    itinerary: [
      'Day 1: Table Mountain cable car, city center exploration',
      'Day 2: Robben Island tour, V&A Waterfront',
      'Day 3: Cape Peninsula - Cape Point, penguins at Boulders Beach',
      'Day 4: Winelands day trip - Stellenbosch or Franschhoek',
      'Day 5: Bo-Kaap, Camps Bay beach, Kirstenbosch Gardens'
    ]
  },
  melbourne: {
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=400",
    attractions: ['Federation Square', 'Royal Botanic Gardens', 'Queen Victoria Market', 'St. Kilda', 'Great Ocean Road', 'Eureka Skydeck', 'Flinders Street Station', 'Royal Exhibition Building'],
    itinerary: [
      'Day 1: City center - Federation Square, Flinders Street, laneways',
      'Day 2: Royal Botanic Gardens, Eureka Skydeck, Southbank',
      'Day 3: Queen Victoria Market, inner suburbs exploration',
      'Day 4: St. Kilda, Brighton Beach boxes, coastal areas',
      'Day 5: Great Ocean Road day trip or Yarra Valley wineries'
    ]
  },
  vancouver: {
    imageUrl: "https://images.unsplash.com/photo-1549388604-817d15aa0968?auto=format&fit=crop&w=800&h=400",
    attractions: ['Stanley Park', 'Granville Island', 'Grouse Mountain', 'Capilano Suspension Bridge', 'Gastown', 'English Bay', 'Science World', 'Queen Elizabeth Park'],
    itinerary: [
      'Day 1: Stanley Park, English Bay, downtown Vancouver',
      'Day 2: Grouse Mountain, Capilano Suspension Bridge',
      'Day 3: Granville Island, False Creek, local markets',
      'Day 4: Gastown, Science World, Olympic Village',
      'Day 5: Queen Elizabeth Park, VanDusen Botanical Garden'
    ]
  },
  montreal: {
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=400",
    attractions: ['Old Montreal', 'Mount Royal', 'Notre-Dame Basilica', 'Jean-Talon Market', 'Plateau Mont-Royal', 'Olympic Stadium', 'Biodome', 'Underground City'],
    itinerary: [
      'Day 1: Old Montreal, Notre-Dame Basilica, Old Port',
      'Day 2: Mount Royal Park, downtown exploration',
      'Day 3: Plateau Mont-Royal, Jean-Talon Market',
      'Day 4: Olympic Stadium, Biodome, Botanical Garden',
      'Day 5: Underground City, local neighborhoods, poutine tour'
    ]
  },
  lisbon: {
    imageUrl: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&h=400",
    attractions: ['Belém Tower', 'Jerónimos Monastery', 'Alfama District', 'Tram 28', 'Sintra', 'Fado Houses', 'Rossio Square', 'LX Factory'],
    itinerary: [
      'Day 1: Belém area - Belém Tower, Jerónimos Monastery, pastéis de nata',
      'Day 2: Alfama district, Fado houses, traditional Portuguese culture',
      'Day 3: Tram 28 tour, Rossio Square, Chiado district',
      'Day 4: Sintra day trip - Pena Palace, Quinta da Regaleira',
      'Day 5: LX Factory, modern Lisbon, sunset viewpoints'
    ]
  },
  vienna: {
    imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&h=400",
    attractions: ['Schönbrunn Palace', 'Hallstatt', 'St. Stephens Cathedral', 'Belvedere Palace', 'Naschmarkt', 'Ringstrasse', 'Vienna State Opera', 'Melk Abbey'],
    itinerary: [
      'Day 1: Schönbrunn Palace and gardens exploration',
      'Day 2: Historic center - St. Stephens Cathedral, Ringstrasse',
      'Day 3: Belvedere Palace, Naschmarkt, local cafés',
      'Day 4: Hallstatt day trip - scenic lakes and mountains',
      'Day 5: Vienna State Opera, Melk Abbey, Danube Valley'
    ]
  },
  prague: {
    imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=800&h=400",
    attractions: ['Prague Castle', 'Charles Bridge', 'Old Town Square', 'Astronomical Clock', 'Jewish Quarter', 'Wenceslas Square', 'Petřín Hill', 'Vyšehrad'],
    itinerary: [
      'Day 1: Prague Castle complex, Lesser Town exploration',
      'Day 2: Charles Bridge, Old Town Square, Astronomical Clock',
      'Day 3: Jewish Quarter, synagogues, local history',
      'Day 4: Wenceslas Square, New Town, local beer halls',
      'Day 5: Petřín Hill, Vyšehrad, panoramic city views'
    ]
  },
  stockholm: {
    imageUrl: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&h=400",
    attractions: ['Gamla Stan', 'Vasa Museum', 'ABBA Museum', 'Skansen', 'Royal Palace', 'Archipelago', 'Fotografiska', 'City Hall'],
    itinerary: [
      'Day 1: Gamla Stan (Old Town), Royal Palace, Nobel Museum',
      'Day 2: Djurgården island - Vasa Museum, ABBA Museum',
      'Day 3: Skansen open-air museum, Fotografiska photography museum',
      'Day 4: Stockholm Archipelago day trip by boat',
      'Day 5: City Hall, Södermalm district, local design shops'
    ]
  },
  copenhagen: {
    imageUrl: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&h=400",
    attractions: ['Nyhavn', 'Little Mermaid', 'Tivoli Gardens', 'Rosenborg Castle', 'Freetown Christiania', 'Amalienborg Palace', 'National Museum', 'Strøget'],
    itinerary: [
      'Day 1: Nyhavn, Little Mermaid, waterfront areas',
      'Day 2: Tivoli Gardens, City Hall, downtown Copenhagen',
      'Day 3: Rosenborg Castle, King\'s Garden, crown jewels',
      'Day 4: Freetown Christiania, alternative culture, local markets',
      'Day 5: Amalienborg Palace, National Museum, Strøget shopping'
    ]
  },
  helsinki: {
    attractions: ['Senate Square', 'Uspenski Cathedral', 'Market Square', 'Suomenlinna', 'Temppeliaukio Church', 'Design District', 'Sibelius Monument', 'Linnanmäki'],
    itinerary: [
      'Day 1: Senate Square, Uspenski Cathedral, Helsinki Cathedral',
      'Day 2: Suomenlinna fortress island day trip',
      'Day 3: Temppeliaukio Church, Design District, local design',
      'Day 4: Market Square, Sibelius Monument, parks',
      'Day 5: Linnanmäki amusement park or sauna experience'
    ]
  },
  oslo: {
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&h=400",
    attractions: ['Vigeland Park', 'Opera House', 'Akershus Fortress', 'Munch Museum', 'Holmenkollen', 'Bygdøy Peninsula', 'Karl Johans Gate', 'Fjord Cruises'],
    itinerary: [
      'Day 1: Vigeland Park, Opera House, city center',
      'Day 2: Akershus Fortress, Munch Museum, art galleries',
      'Day 3: Bygdøy Peninsula - Viking Ship Museum, Norwegian Folk Museum',
      'Day 4: Holmenkollen ski jump, panoramic views',
      'Day 5: Oslo Fjord cruise, Karl Johans Gate shopping'
    ]
  },
  reykjavik: {
    imageUrl: "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=800&h=400",
    attractions: ['Hallgrímskirkja', 'Golden Circle', 'Blue Lagoon', 'Harpa Concert Hall', 'Perlan', 'Northern Lights', 'Geysir', 'Gullfoss Waterfall'],
    itinerary: [
      'Day 1: Reykjavik city - Hallgrímskirkja, Harpa, old town',
      'Day 2: Golden Circle tour - Geysir, Gullfoss, Þingvellir',
      'Day 3: Blue Lagoon geothermal spa relaxation',
      'Day 4: Perlan museum, Northern Lights hunt (seasonal)',
      'Day 5: South Coast - waterfalls, black sand beaches'
    ]
  },
  zurich: {
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=400",
    attractions: ['Lake Zurich', 'Old Town', 'Rhine Falls', 'Uetliberg', 'Bahnhofstrasse', 'Swiss National Park', 'Fraumünster Church', 'Kunsthaus'],
    itinerary: [
      'Day 1: Lake Zurich, Old Town, Fraumünster Church',
      'Day 2: Rhine Falls day trip, Europe\'s most powerful waterfall',
      'Day 3: Uetliberg mountain, panoramic views, hiking',
      'Day 4: Bahnhofstrasse shopping, Kunsthaus art museum',
      'Day 5: Swiss National Park or Alps day trip'
    ]
  },
  brussels: {
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&h=400",
    attractions: ['Grand Place', 'Atomium', 'Manneken Pis', 'Royal Museums', 'European Quarter', 'Delirium Café', 'Waffle Houses', 'Chocolate Shops'],
    itinerary: [
      'Day 1: Grand Place, Manneken Pis, historic Brussels',
      'Day 2: Atomium, European Quarter, EU institutions',
      'Day 3: Royal Museums, art and history collections',
      'Day 4: Belgian specialties - waffles, chocolate, beer',
      'Day 5: Bruges day trip or local neighborhood exploration'
    ]
  },
  'kuala-lumpur': {
    imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&h=400",
    attractions: ['Petronas Towers', 'Batu Caves', 'KL Tower', 'Central Market', 'Chinatown', 'Little India', 'KLCC Park', 'Islamic Arts Museum'],
    itinerary: [
      'Day 1: Petronas Towers, KLCC Park, city center',
      'Day 2: Batu Caves, traditional temples, limestone caves',
      'Day 3: Cultural districts - Chinatown, Little India',
      'Day 4: Central Market, Islamic Arts Museum, local crafts',
      'Day 5: KL Tower, food courts, shopping malls'
    ]
  },
  jakarta: {
    imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&h=400",
    attractions: ['National Monument', 'Old Town Batavia', 'Istiqlal Mosque', 'National Museum', 'Thousand Islands', 'Jakarta Cathedral', 'Ancol Dreamland', 'Taman Mini'],
    itinerary: [
      'Day 1: National Monument, Old Town Batavia exploration',
      'Day 2: Istiqlal Mosque, Jakarta Cathedral, religious sites',
      'Day 3: National Museum, Indonesian culture and history',
      'Day 4: Thousand Islands day trip, beach relaxation',
      'Day 5: Ancol Dreamland, Taman Mini Indonesia Indah'
    ]
  },
  manila: {
    imageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&h=400",
    attractions: ['Rizal Park', 'Intramuros', 'Manila Bay', 'National Museum', 'Malacañang Palace', 'Chinatown', 'Fort Santiago', 'Cultural Center'],
    itinerary: [
      'Day 1: Intramuros historic district, Fort Santiago',
      'Day 2: Rizal Park, National Museum, cultural sites',
      'Day 3: Manila Bay sunset, Cultural Center complex',
      'Day 4: Chinatown, Malacañang Palace area',
      'Day 5: Day trip to Tagaytay or local markets'
    ]
  },
  'ho-chi-minh-city': {
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&h=400",
    attractions: ['War Remnants Museum', 'Cu Chi Tunnels', 'Notre-Dame Cathedral', 'Central Post Office', 'Ben Thanh Market', 'Reunification Palace', 'Jade Emperor Pagoda', 'Mekong Delta'],
    itinerary: [
      'Day 1: War Remnants Museum, Reunification Palace, history',
      'Day 2: Cu Chi Tunnels day trip, underground network',
      'Day 3: Notre-Dame Cathedral, Central Post Office, French architecture',
      'Day 4: Ben Thanh Market, Jade Emperor Pagoda, local culture',
      'Day 5: Mekong Delta day trip, floating markets'
    ]
  },
  delhi: {
    imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&h=400",
    attractions: ['Red Fort', 'India Gate', 'Qutub Minar', 'Lotus Temple', 'Chandni Chowk', 'Humayuns Tomb', 'Raj Ghat', 'Jama Masjid'],
    itinerary: [
      'Day 1: Old Delhi - Red Fort, Chandni Chowk, Jama Masjid',
      'Day 2: New Delhi - India Gate, Raj Ghat, government buildings',
      'Day 3: Qutub Minar, Humayuns Tomb, Mughal architecture',
      'Day 4: Lotus Temple, local markets, street food tour',
      'Day 5: Day trip to Agra for Taj Mahal'
    ]
  },
  kolkata: {
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&h=400",
    attractions: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Temple', 'Park Street', 'Indian Museum', 'Kalighat Temple', 'Science City', 'Eden Gardens'],
    itinerary: [
      'Day 1: Victoria Memorial, Park Street, colonial architecture',
      'Day 2: Howrah Bridge, Dakshineswar Temple, Ganges River',
      'Day 3: Indian Museum, Kalighat Temple, cultural sites',
      'Day 4: Science City, Eden Gardens, modern Kolkata',
      'Day 5: Local markets, traditional sweets, cultural performances'
    ]
  },
  chennai: {
    imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&h=400",
    attractions: ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George', 'Government Museum', 'San Thome Cathedral', 'Mahabalipuram', 'DakshinaChitra', 'Express Avenue Mall'],
    itinerary: [
      'Day 1: Marina Beach, Kapaleeshwarar Temple, traditional Chennai',
      'Day 2: Fort St. George, Government Museum, colonial history',
      'Day 3: San Thome Cathedral, local markets, street food',
      'Day 4: Mahabalipuram day trip, ancient rock temples',
      'Day 5: DakshinaChitra cultural center, modern shopping'
    ]
  },
  bangalore: {
    imageUrl: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&h=400",
    attractions: ['Lalbagh Garden', 'Bangalore Palace', 'ISCKON Temple', 'UB City Mall', 'Cubbon Park', 'Tipu Sultan Palace', 'Nandi Hills', 'Commercial Street'],
    itinerary: [
      'Day 1: Lalbagh Garden, Bangalore Palace, city heritage',
      'Day 2: ISCKON Temple, Cubbon Park, peaceful areas',
      'Day 3: Tipu Sultan Palace, local history and culture',
      'Day 4: Nandi Hills day trip, sunrise views',
      'Day 5: UB City Mall, Commercial Street, modern Bangalore'
    ]
  },
  pune: {
    imageUrl: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&h=400",
    attractions: ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Osho Ashram', 'Dagdusheth Ganpati', 'Pataleshwar Cave', 'Koregaon Park', 'Phoenix MarketCity'],
    itinerary: [
      'Day 1: Shaniwar Wada, Dagdusheth Ganpati, old Pune',
      'Day 2: Aga Khan Palace, historical significance',
      'Day 3: Sinhagad Fort, trekking and panoramic views',
      'Day 4: Osho Ashram, Koregaon Park, meditation',
      'Day 5: Pataleshwar Cave, Phoenix MarketCity, modern areas'
    ]
  },
  hyderabad: {
    imageUrl: "https://images.unsplash.com/photo-1582502845149-a1c9c5c2e333?auto=format&fit=crop&w=800&h=400",
    attractions: ['Charminar', 'Golconda Fort', 'Hussain Sagar Lake', 'Ramoji Film City', 'Birla Mandir', 'Salar Jung Museum', 'Nehru Zoological Park', 'Hitech City'],
    itinerary: [
      'Day 1: Charminar, Salar Jung Museum, old city exploration',
      'Day 2: Golconda Fort, historical fort complex',
      'Day 3: Hussain Sagar Lake, Birla Mandir, peaceful sites',
      'Day 4: Ramoji Film City, entertainment complex',
      'Day 5: Nehru Zoological Park, Hitech City, modern Hyderabad'
    ]
  },
  ahmedabad: {
    attractions: ['Sabarmati Ashram', 'Akshardham Temple', 'Kankaria Lake', 'Jama Masjid', 'Calico Museum', 'Adalaj Stepwell', 'Manek Chowk', 'Science City'],
    itinerary: [
      'Day 1: Sabarmati Ashram, Gandhi\'s legacy, peaceful reflection',
      'Day 2: Akshardham Temple, spiritual and architectural beauty',
      'Day 3: Jama Masjid, Calico Museum, cultural heritage',
      'Day 4: Adalaj Stepwell day trip, architectural marvel',
      'Day 5: Kankaria Lake, Science City, family attractions'
    ]
  },
  jaipur: {
    attractions: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort', 'Jaigarh Fort', 'Albert Hall Museum', 'Johri Bazaar'],
    itinerary: [
      'Day 1: Amber Fort, elephant rides, fort exploration',
      'Day 2: City Palace, Hawa Mahal, royal heritage',
      'Day 3: Jantar Mantar, Albert Hall Museum, science and culture',
      'Day 4: Nahargarh Fort, Jaigarh Fort, panoramic views',
      'Day 5: Johri Bazaar, local shopping, traditional crafts'
    ]
  }
};

// Generate themed city placeholder image
const createCityPlaceholder = (cityName: string) => {
  const cityThemes = {
    paris: { color: '#8B5CF6', icon: '🗼', pattern: 'url(%23eiffel)' },
    tokyo: { color: '#EF4444', icon: '🏯', pattern: 'url(%23sakura)' },
    london: { color: '#3B82F6', icon: '🏰', pattern: 'url(%23crown)' },
    'new-york': { color: '#10B981', icon: '🏙️', pattern: 'url(%23skyline)' },
    rome: { color: '#F59E0B', icon: '🏛️', pattern: 'url(%23columns)' },
    barcelona: { color: '#EC4899', icon: '🏗️', pattern: 'url(%23gaudi)' },
    amsterdam: { color: '#06B6D4', icon: '🏘️', pattern: 'url(%23canal)' },
    dubai: { color: '#F97316', icon: '🌴', pattern: 'url(%23desert)' },
    default: { color: '#6366F1', icon: '🌍', pattern: 'url(%23world)' }
  };
  
  const theme = cityThemes[cityName as keyof typeof cityThemes] || cityThemes.default;
  
  const svg = `
    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.color};stop-opacity:0.8"/>
          <stop offset="100%" style="stop-color:${theme.color};stop-opacity:0.3"/>
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="${theme.color}" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(%23bg)"/>
      <rect width="400" height="200" fill="url(%23dots)"/>
      <text x="200" y="100" text-anchor="middle" font-size="48" fill="white">${theme.icon}</text>
      <text x="200" y="140" text-anchor="middle" font-size="18" fill="white" font-weight="bold">${cityName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</text>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Function to open Google Maps
const openGoogleMaps = (cityName: string) => {
  const query = encodeURIComponent(cityName.replace('-', ' '));
  window.open(`https://www.google.com/maps/search/${query}`, '_blank');
};

const culturalData: Record<string, CulturalInsights> = {
  tokyo: {
    primaryLanguage: "Japanese",
    secondaryLanguages: ["English (limited)"],
    currency: "Japanese Yen (¥)",
    culturalNorms: [
      "Bowing is a common greeting - reciprocate with a slight nod",
      "Remove shoes when entering homes, temples, and some restaurants",
      "Avoid eating or drinking while walking",
      "Keep conversations quiet on public transport"
    ],
    tippingCustoms: "Tipping is not customary and can be considered rude",
    businessHours: "Most shops: 10 AM - 8 PM, Restaurants: 11 AM - 10 PM",
    localEtiquette: [
      "Point with your whole hand, not a single finger",
      "Don't blow your nose in public",
      "Slurping noodles is acceptable and shows appreciation",
      "Always use both hands when giving/receiving business cards"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting temples and shrines",
      "Follow purification rituals at shrine entrances",
      "Photography may be restricted in some religious sites"
    ],
    safetyTips: [
      "Japan is extremely safe - violent crime is rare",
      "Carry cash as many places don't accept cards",
      "Download translation apps for emergencies",
      "Keep your passport with you at all times"
    ],
    localCuisine: [
      "Try authentic ramen, sushi, and tempura",
      "Visit izakayas (Japanese pubs) for local atmosphere",
      "Don't miss seasonal specialties like sakura mochi in spring",
      "Convenience store food is surprisingly good and cheap"
    ],
    transportTips: [
      "Get a JR Pass for unlimited train travel",
      "Download Google Translate with camera for signs",
      "Rush hours are 7-9 AM and 5-7 PM - avoid if possible",
      "Trains stop running around midnight"
    ]
  },
  paris: {
    primaryLanguage: "French",
    secondaryLanguages: ["English (widely spoken in tourist areas)"],
    currency: "Euro (€)",
    culturalNorms: [
      "Always greet with 'Bonjour/Bonsoir' when entering shops",
      "Dress well - Parisians value style and appearance",
      "Dining is leisurely - don't rush meals",
      "Say 'Excusez-moi' to get attention, not 'Garçon'"
    ],
    tippingCustoms: "10% is standard for good service, round up for drinks",
    businessHours: "Most shops: 9 AM - 7 PM (closed Sundays), Restaurants: 12-2 PM, 7-10 PM",
    localEtiquette: [
      "Learn basic French phrases - effort is appreciated",
      "Don't speak loudly in public places",
      "Wait to be seated at restaurants",
      "Keep hands visible on the table while dining"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting churches and cathedrals",
      "Remain quiet and respectful in religious sites",
      "Some churches have specific visiting hours"
    ],
    safetyTips: [
      "Watch for pickpockets on metro and tourist areas",
      "Avoid displaying expensive items openly",
      "Be cautious around major tourist attractions",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try croissants from local bakeries, not tourist cafes",
      "Visit traditional bistros for authentic French cuisine",
      "Don't miss cheese and wine tastings",
      "Lunch is typically 12-2 PM, dinner after 7 PM"
    ],
    transportTips: [
      "Get a Navigo weekly pass for metro/bus",
      "Metro runs until 1:15 AM (2:15 AM Fridays/Saturdays)",
      "Validate your ticket or face fines",
      "Walking is often faster than metro in central areas"
    ]
  },
  london: {
    primaryLanguage: "English",
    secondaryLanguages: ["Many languages due to diversity"],
    currency: "British Pound (£)",
    culturalNorms: [
      "Queue politely and wait your turn - jumping queues is very rude",
      "Stand right, walk left on escalators",
      "Pub culture is important - buying rounds is expected",
      "Small talk about weather is common and appreciated"
    ],
    tippingCustoms: "10-15% in restaurants if service charge not included, round up for drinks",
    businessHours: "Most shops: 9 AM - 6 PM (later on Thursdays), Pubs: 11 AM - 11 PM",
    localEtiquette: [
      "Say 'please' and 'thank you' frequently",
      "Apologize even when it's not your fault - it's cultural",
      "Don't jump queues or cut in line",
      "Remove hats when entering churches"
    ],
    religiousConsiderations: [
      "Many historic churches welcome visitors during specific hours",
      "Be respectful during services",
      "Photography may be restricted in some religious sites"
    ],
    safetyTips: [
      "London is generally safe but watch for pickpockets in tourist areas",
      "Stay aware on public transport, especially at night",
      "Emergency number is 999 or 112",
      "Keep belongings secure in crowded areas"
    ],
    localCuisine: [
      "Try traditional fish and chips, Sunday roast, and afternoon tea",
      "Explore diverse food markets like Borough Market",
      "Pub food has improved significantly in recent years",
      "Don't miss Indian curry - it's practically a national dish"
    ],
    transportTips: [
      "Get an Oyster Card or use contactless payment",
      "Mind the gap when boarding the Tube",
      "Night Tube runs on weekends on some lines",
      "Black cabs are expensive but iconic - use Uber for cheaper rides"
    ]
  },
  singapore: {
    primaryLanguage: "English",
    secondaryLanguages: ["Mandarin", "Malay", "Tamil"],
    currency: "Singapore Dollar (S$)",
    culturalNorms: [
      "Punctuality is highly valued - arrive on time",
      "Modest dress appreciated, especially in religious sites",
      "Avoid chewing gum - it's heavily regulated", 
      "Keep voices down in public spaces"
    ],
    tippingCustoms: "Not required - service charge usually included, but small tips appreciated",
    businessHours: "Most shops: 10 AM - 10 PM, Hawker centers: 6 AM - 10 PM",
    localEtiquette: [
      "Use both hands when giving/receiving items",
      "Remove shoes when entering homes and some restaurants",
      "Don't waste food - it's considered disrespectful",
      "Wait for others to start eating before beginning your meal"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting temples, mosques, or churches",
      "Remove shoes before entering most religious sites",
      "Be quiet and respectful during prayers",
      "Follow photography restrictions"
    ],
    safetyTips: [
      "Singapore is extremely safe with low crime rates",
      "Strict laws are heavily enforced - follow all rules",
      "Death penalty exists for drug trafficking",
      "Emergency number is 999 or 995"
    ],
    localCuisine: [
      "Try hawker center classics: chicken rice, laksa, char kway teow",
      "Food courts offer diverse options at reasonable prices",
      "Singapore sling cocktail is a must-try",
      "Durian fruit is beloved locally but has strong smell"
    ],
    transportTips: [
      "Get EZ-Link card for MRT and buses",
      "MRT is clean, efficient, and air-conditioned",
      "Eating and drinking prohibited on public transport",
      "Changi Airport consistently rated world's best"
    ]
  },
  bangkok: {
    primaryLanguage: "Thai",
    secondaryLanguages: ["English (in tourist areas)", "Chinese"],
    currency: "Thai Baht (฿)",
    culturalNorms: [
      "Wai greeting (hands together, slight bow) shows respect",
      "Never touch someone's head or point feet at people",
      "Remove shoes when entering temples and many homes",
      "Show respect for the Thai Royal Family at all times"
    ],
    tippingCustoms: "Not required but appreciated - round up bills or leave small change",
    businessHours: "Most shops: 10 AM - 9 PM, Street food: 6 AM - midnight",
    localEtiquette: [
      "Dress modestly, especially when visiting temples",
      "Don't raise your voice or show anger in public",
      "Use both hands when giving or receiving items",
      "Step over thresholds, don't step on them"
    ],
    religiousConsiderations: [
      "Cover shoulders and knees when visiting temples",
      "Remove shoes before entering temple buildings",
      "Don't point feet toward Buddha statues",
      "Women should not touch monks or hand them items directly"
    ],
    safetyTips: [
      "Bangkok is generally safe but watch for scams targeting tourists",
      "Be cautious of tuk-tuk drivers offering 'special deals'",
      "Don't accept drinks from strangers",
      "Use reputable taxi apps or metered taxis"
    ],
    localCuisine: [
      "Street food is safe, delicious, and incredibly cheap",
      "Try pad thai, som tam, mango sticky rice, and tom yum",
      "Specify spice level - Thai food can be very spicy",
      "Don't miss floating markets and food courts in malls"
    ],
    transportTips: [
      "BTS Skytrain and MRT are clean, efficient, and air-conditioned",
      "Tuk-tuks are fun but negotiate price beforehand",
      "Boat taxis on the river are scenic and practical",
      "Traffic is heavy - plan extra time for ground transport"
    ]
  },
  "new york": {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish", "Chinese", "Many others"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Walk fast and with purpose - don't block sidewalks",
      "Be direct in communication - New Yorkers appreciate efficiency",
      "Don't make eye contact with strangers on the subway",
      "Tipping is essential and expected in most service industries"
    ],
    tippingCustoms: "18-20% in restaurants, $1-2 per drink at bars, 15-20% for taxis",
    businessHours: "Many places open 24/7, most shops: 10 AM - 8 PM",
    localEtiquette: [
      "Keep right when walking, pass on the left",
      "Don't stop suddenly on busy sidewalks",
      "Hold elevator doors for others",
      "Be prepared to wait in lines for popular attractions"
    ],
    religiousConsiderations: [
      "NYC is very diverse - respect all religious practices",
      "Many beautiful churches and synagogues welcome visitors",
      "Be respectful during religious services"
    ],
    safetyTips: [
      "NYC is much safer than its reputation suggests",
      "Stay aware of your surroundings, especially late at night",
      "Keep valuables secure in crowded areas",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Try authentic NYC pizza, bagels, and deli sandwiches",
      "Explore diverse neighborhoods for ethnic cuisines",
      "Food trucks offer quick, affordable meals",
      "Don't miss classic NY cheesecake and hot dogs"
    ],
    transportTips: [
      "Get a MetroCard or use OMNY contactless payment",
      "Subway runs 24/7 but some lines have weekend service changes",
      "Taxis and rideshares are abundant but can be expensive",
      "Walking is often faster than driving in Manhattan"
    ]
  },
  rome: {
    primaryLanguage: "Italian",
    secondaryLanguages: ["English (in tourist areas)", "Spanish"],
    currency: "Euro (€)",
    culturalNorms: [
      "Greet with 'Ciao' (informal) or 'Buongiorno/Buonasera' (formal)",
      "Dress well - Italians take pride in appearance",
      "Meal times are later - lunch 1-3 PM, dinner after 8 PM",
      "Family is very important in Italian culture"
    ],
    tippingCustoms: "10% in restaurants if satisfied, round up for coffee and drinks",
    businessHours: "Shops: 9 AM - 1 PM, 3:30-7:30 PM (siesta break), Restaurants: 12:30-3 PM, 7:30-11 PM",
    localEtiquette: [
      "Don't order cappuccino after 11 AM (considered a breakfast drink)",
      "Eat pasta with a fork only - no spoon needed",
      "Don't ask for parmesan on seafood pasta",
      "Stand at the bar for cheaper coffee prices"
    ],
    religiousConsiderations: [
      "Dress modestly when visiting churches (cover shoulders and knees)",
      "St. Peter's Basilica and other major churches have strict dress codes",
      "Be respectful during religious services",
      "Many churches close for lunch (12:30-3:30 PM)"
    ],
    safetyTips: [
      "Rome is generally safe but watch for pickpockets near tourist sites",
      "Be cautious around Termini Station and on crowded buses",
      "Avoid walking alone in quiet areas late at night",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try authentic Roman dishes: carbonara, cacio e pepe, amatriciana",
      "Gelato is best from gelaterias, not tourist shops",
      "Aperitivo culture - drinks with snacks before dinner",
      "Pizza al taglio (by the slice) is perfect for lunch"
    ],
    transportTips: [
      "Buy metro tickets before boarding - validate them",
      "Walking is often faster than public transport in the center",
      "Taxis are expensive - use only official white taxis",
      "Many attractions are within walking distance of each other"
    ]
  },
  barcelona: {
    primaryLanguage: "Catalan",
    secondaryLanguages: ["Spanish", "English (in tourist areas)"],
    currency: "Euro (€)",
    culturalNorms: [
      "Greet with two kisses on the cheek (air kisses)",
      "Dinner is very late - typically after 9 PM",
      "Siesta time is respected - many shops close 2-5 PM",
      "Catalan culture is distinct from Spanish culture"
    ],
    tippingCustoms: "5-10% in restaurants if satisfied, round up for drinks and taxis",
    businessHours: "Shops: 9 AM - 2 PM, 5-8 PM, Restaurants: 1-4 PM, 8 PM-midnight",
    localEtiquette: [
      "Learn a few words in Catalan - it's appreciated",
      "Don't expect restaurants to be open between meal times",
      "Topless sunbathing is normal on beaches",
      "Don't walk around the city in beachwear"
    ],
    religiousConsiderations: [
      "Sagrada Familia and other churches require modest dress",
      "Cover shoulders and knees when visiting religious sites",
      "Book tickets in advance for popular churches",
      "Be respectful of ongoing construction at Sagrada Familia"
    ],
    safetyTips: [
      "Watch for pickpockets on Las Ramblas and in metro",
      "Be cautious with belongings on beaches",
      "Avoid walking alone in El Raval area late at night",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try authentic paella (not the touristy versions on Las Ramblas)",
      "Tapas culture - small plates shared with drinks",
      "Pa amb tomàquet (bread with tomato) is a local staple",
      "Don't miss pintxos bars in the Gothic Quarter"
    ],
    transportTips: [
      "Get a T-10 ticket for multiple metro/bus rides",
      "Metro runs until 2 AM on weekdays, 24 hours on weekends",
      "Bicing (bike sharing) is popular and tourist-friendly",
      "Beach is easily accessible by metro"
    ]
  },
  sydney: {
    primaryLanguage: "English",
    secondaryLanguages: ["Mandarin", "Arabic", "Cantonese"],
    currency: "Australian Dollar (A$)",
    culturalNorms: [
      "Australians are generally laid-back and friendly",
      "Mate culture - calling people 'mate' is common and friendly",
      "Outdoor lifestyle is central - beaches, BBQs, and sports",
      "Work-life balance is highly valued"
    ],
    tippingCustoms: "10-15% in restaurants for good service, not mandatory",
    businessHours: "Most shops: 9 AM - 5:30 PM (9 PM Thursdays), Restaurants vary widely",
    localEtiquette: [
      "Remove shoes when entering homes",
      "Australians value punctuality",
      "Don't take yourself too seriously - humor is appreciated",
      "Sun safety is taken very seriously"
    ],
    religiousConsiderations: [
      "Australia is multicultural with many faiths represented",
      "St. Mary's Cathedral and other historic churches welcome visitors",
      "Be respectful of all religious practices"
    ],
    safetyTips: [
      "Sydney is very safe with low crime rates",
      "Be sun smart - UV levels are extreme, use sunscreen",
      "Be aware of strong ocean currents and swim between flags",
      "Emergency number is 000"
    ],
    localCuisine: [
      "Try meat pies, fish and chips, and pavlova",
      "Coffee culture is excellent - flat whites originated here",
      "Fresh seafood and barbecue are staples",
      "Don't miss Tim Tams and Vegemite (acquired taste)"
    ],
    transportTips: [
      "Get an Opal Card for public transport",
      "Ferries are scenic and practical for harbor travel",
      "Trains connect most areas but can be delayed",
      "Walking and cycling are popular in the city center"
    ]
  },
  dubai: {
    primaryLanguage: "Arabic",
    secondaryLanguages: ["English (widely spoken)", "Hindi", "Urdu"],
    currency: "UAE Dirham (AED)",
    culturalNorms: [
      "Modest dress is required - cover shoulders and knees",
      "Public displays of affection should be minimal",
      "Respect Islamic customs and traditions",
      "Friday is the holy day - many businesses closed or have limited hours"
    ],
    tippingCustoms: "10-15% in restaurants if service charge not included, round up for taxis",
    businessHours: "Malls: 10 AM - 10 PM (later on weekends), Restaurants: 12 PM - 2 AM",
    localEtiquette: [
      "Use right hand for eating and greeting",
      "Remove shoes when entering homes and some restaurants",
      "Don't point feet toward people or show sole of shoe",
      "Be respectful during Ramadan - avoid eating/drinking in public during fasting hours"
    ],
    religiousConsiderations: [
      "Cover up when visiting mosques - dress code is strict",
      "Non-Muslims can visit some mosques during specific hours",
      "Remove shoes before entering mosque areas",
      "Be quiet and respectful in religious spaces"
    ],
    safetyTips: [
      "Dubai is extremely safe with very low crime rates",
      "Zero tolerance for drugs - severe penalties including jail time",
      "Alcohol only allowed in licensed venues and hotels",
      "Emergency number is 999"
    ],
    localCuisine: [
      "Try Middle Eastern dishes: shawarma, hummus, falafel",
      "Emirati cuisine: machboos, luqaimat, camel meat",
      "International food scene is excellent",
      "Alcohol available in hotels and licensed restaurants only"
    ],
    transportTips: [
      "Dubai Metro is clean, efficient, and has women-only cars",
      "Taxis are plentiful and air-conditioned",
      "Uber and Careem widely available",
      "Walking outside can be challenging due to heat and lack of sidewalks"
    ]
  },
  istanbul: {
    primaryLanguage: "Turkish",
    secondaryLanguages: ["English (in tourist areas)", "German", "Arabic"],
    currency: "Turkish Lira (₺)",
    culturalNorms: [
      "Remove shoes when entering homes and mosques",
      "Dress modestly, especially when visiting religious sites",
      "Tea culture is central - accepting tea shows respect",
      "Bargaining is expected in markets and bazaars"
    ],
    tippingCustoms: "10-15% in restaurants, round up for taxis and services",
    businessHours: "Shops: 9 AM - 7 PM (later in tourist areas), Restaurants: 12 PM - midnight",
    localEtiquette: [
      "Learn basic Turkish phrases - effort is appreciated",
      "Don't refuse offered tea - it's a sign of hospitality",
      "Haggle respectfully in Grand Bazaar and markets",
      "Show respect for Turkish flag and Atatürk images"
    ],
    religiousConsiderations: [
      "Cover head, arms, and legs when visiting mosques",
      "Remove shoes before entering mosque prayer areas",
      "Be quiet during prayer times",
      "Many mosques close to tourists during prayer times"
    ],
    safetyTips: [
      "Istanbul is generally safe but watch for pickpockets in crowded areas",
      "Be cautious in less touristy areas at night",
      "Avoid political discussions and demonstrations",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Try Turkish classics: kebabs, baklava, Turkish delight, döner",
      "Turkish breakfast is elaborate and worth experiencing",
      "Turkish tea and coffee culture is important",
      "Street food is generally safe and delicious"
    ],
    transportTips: [
      "Get Istanbulkart for public transport",
      "Ferries across Bosphorus are scenic and practical",
      "Taxis are plentiful but traffic can be heavy",
      "Walking in Sultanahmet and Beyoğlu areas is pleasant"
    ]
  },
  mumbai: {
    primaryLanguage: "Hindi",
    secondaryLanguages: ["English (widely spoken)", "Marathi", "Gujarati"],
    currency: "Indian Rupee (₹)",
    culturalNorms: [
      "Namaste greeting with hands together is respectful",
      "Remove shoes when entering homes and temples",
      "Modest dress appreciated, especially in religious sites",
      "Respect for elders is very important"
    ],
    tippingCustoms: "10% in restaurants, small tips for services appreciated",
    businessHours: "Shops: 10 AM - 9 PM, Restaurants: 11 AM - 11 PM",
    localEtiquette: [
      "Use right hand for eating and giving items",
      "Don't touch someone's head or point feet at people",
      "Learn basic Hindi greetings - they're appreciated",
      "Be patient with crowds and queues"
    ],
    religiousConsiderations: [
      "Cover head and remove shoes in temples and mosques",
      "Dress modestly when visiting religious sites",
      "Be respectful of all faiths - Mumbai is very diverse",
      "Photography may be restricted in some religious sites"
    ],
    safetyTips: [
      "Mumbai is generally safe but be aware of pickpockets in crowded areas",
      "Avoid drinking tap water - stick to bottled water",
      "Be cautious during monsoon season (June-September)",
      "Emergency number is 100 (police) or 102 (ambulance)"
    ],
    localCuisine: [
      "Try Mumbai street food: vada pav, pav bhaji, bhel puri",
      "South Indian dosas and North Indian curries available",
      "Vegetarian options are abundant",
      "Eat at busy stalls for fresh food"
    ],
    transportTips: [
      "Local trains are lifeline but extremely crowded during rush hours",
      "Taxis and auto-rickshaws widely available",
      "Uber and Ola provide app-based rides",
      "Walking can be challenging due to crowds and traffic"
    ]
  },
  'new-york': {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish", "Many immigrant languages"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Fast-paced lifestyle - people walk quickly and with purpose",
      "Direct communication style is normal and not considered rude",
      "Standing right, walking left on escalators",
      "Tipping is expected for most services"
    ],
    tippingCustoms: "15-20% at restaurants, 18-25% for excellent service, $1-2 per drink at bars",
    businessHours: "Most shops: 10 AM - 8 PM, Restaurants vary widely, many 24/7 options",
    localEtiquette: [
      "Eye contact and firm handshakes are standard",
      "Don't block subway doors or walkways",
      "It's normal to eat while walking",
      "Honking in traffic is common"
    ],
    religiousConsiderations: [
      "Very diverse religious landscape",
      "Dress codes vary by institution",
      "Many services available in multiple languages"
    ],
    safetyTips: [
      "Stay aware of surroundings, especially at night",
      "Keep valuables secure in crowded areas",
      "Use official taxi services or rideshare apps",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Pizza by the slice is a staple",
      "Diverse ethnic cuisines in every neighborhood",
      "Food trucks offer quick, affordable options",
      "Bagels and deli culture are iconic"
    ],
    transportTips: [
      "MetroCard or OMNY for subway and buses",
      "Subway runs 24/7 but can be delayed",
      "Walking is often faster than driving",
      "Yellow taxis, Uber, and Lyft widely available"
    ]
  },
  'los-angeles': {
    primaryLanguage: "English", 
    secondaryLanguages: ["Spanish (widely spoken)", "Korean", "Armenian"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Car culture dominates - driving is essential",
      "Casual dress code, even for business",
      "Health and fitness consciousness is high",
      "Entertainment industry presence is noticeable"
    ],
    tippingCustoms: "18-20% at restaurants, 20-25% for excellent service, $1-2 per drink",
    businessHours: "Most shops: 10 AM - 9 PM, Restaurants: varies, many open late",
    localEtiquette: [
      "Personal space is important - maintain distance",
      "Casual conversation about entertainment industry common",
      "Environmental consciousness is valued",
      "Traffic complaints are a bonding experience"
    ],
    religiousConsiderations: [
      "Very diverse religious communities",
      "Many denominations and faiths represented",
      "Interfaith dialogue is common"
    ],
    safetyTips: [
      "Some neighborhoods vary in safety - research beforehand",
      "Car break-ins can occur - don't leave valuables visible",
      "Beach areas generally safe during day",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Mexican food is exceptional and authentic",
      "Korean BBQ and Asian fusion widely available",
      "Health-conscious options abundant",
      "Food truck culture is thriving"
    ],
    transportTips: [
      "Car rental or rideshare necessary for most activities",
      "Metro system exists but limited coverage",
      "Traffic is heavy 7-9 AM and 4-7 PM",
      "Parking can be expensive in popular areas"
    ]
  },
  'san-francisco': {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish", "Chinese", "Tagalog"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Progressive values and social consciousness",
      "Tech industry influence is pervasive",
      "Environmental awareness is high",
      "LGBTQ+ friendly and inclusive"
    ],
    tippingCustoms: "18-22% at restaurants, 20% for good service, $1-2 per drink",
    businessHours: "Most shops: 10 AM - 8 PM, Restaurants: 11 AM - 10 PM",
    localEtiquette: [
      "Conversations about technology and startups common",
      "Dress can be casual even in business settings",
      "Respect for homeless population is expected",
      "Sustainability practices are valued"
    ],
    religiousConsiderations: [
      "Very diverse and tolerant religious landscape",
      "Many non-traditional spiritual practices",
      "Interfaith and secular communities strong"
    ],
    safetyTips: [
      "Property crime can occur - secure belongings",
      "Some neighborhoods safer than others",
      "Public transit generally safe during day",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Outstanding Chinese food in Chinatown",
      "Farm-to-table and organic options abundant",
      "Sourdough bread is a local specialty",
      "Mission burritos are legendary"
    ],
    transportTips: [
      "Public transit covers most areas",
      "Cable cars are tourist attraction but functional",
      "Parking is extremely limited and expensive",
      "Walking and biking popular despite hills"
    ]
  },
  'chicago': {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish", "Polish"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Friendly Midwest hospitality",
      "Deep dish pizza vs thin crust debates are serious",
      "Sports culture is passionate",
      "Neighborhood identity is strong"
    ],
    tippingCustoms: "18-20% at restaurants, 15-20% for good service, $1 per drink",
    businessHours: "Most shops: 10 AM - 8 PM, Restaurants: 11 AM - 10 PM",
    localEtiquette: [
      "Small talk is common and appreciated",
      "Sports discussions are social bonding",
      "Weather complaints are universal topic",
      "Punctuality is valued"
    ],
    religiousConsiderations: [
      "Strong Catholic and Protestant presence",
      "Diverse religious communities",
      "Many beautiful historic churches"
    ],
    safetyTips: [
      "Stick to tourist and business areas",
      "Be aware of neighborhood differences",
      "Public transit generally safe during day",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Deep dish pizza is a must-try",
      "Italian beef sandwiches are local favorite",
      "Polish and Eastern European influences",
      "Craft beer scene is excellent"
    ],
    transportTips: [
      "L train system covers most areas",
      "Ventra card for public transit",
      "Parking downtown is expensive",
      "Winter weather affects all transportation"
    ]
  },
  'miami': {
    primaryLanguage: "Spanish/English (bilingual city)",
    secondaryLanguages: ["Portuguese", "Haitian Creole"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "Latin culture heavily influences lifestyle",
      "Fashion and appearance are important",
      "Late dining and nightlife are standard",
      "Beach culture is central to life"
    ],
    tippingCustoms: "18-20% at restaurants, 20-25% at beach clubs, $1-2 per drink",
    businessHours: "Most shops: 10 AM - 10 PM, Restaurants: often open late",
    localEtiquette: [
      "Greetings often include air kisses",
      "Dress stylishly, especially for nightlife",
      "Spanish is widely spoken and appreciated",
      "Music and dancing are part of social life"
    ],
    religiousConsiderations: [
      "Strong Catholic influence",
      "Santería practices present",
      "Many Spanish-speaking congregations"
    ],
    safetyTips: [
      "Tourist areas generally safe",
      "Beach areas patrolled during day",
      "Be cautious in some neighborhoods at night",
      "Emergency number is 911"
    ],
    localCuisine: [
      "Cuban food is authentic and excellent",
      "Ceviche and Latin American specialties",
      "Fresh seafood is outstanding",
      "Café Cubano culture is strong"
    ],
    transportTips: [
      "Metromover is free in downtown",
      "Uber and Lyft widely available",
      "Car helpful for beach hopping",
      "Parking at beaches can be challenging"
    ]
  },
  'las-vegas': {
    primaryLanguage: "English",
    secondaryLanguages: ["Spanish"],
    currency: "US Dollar ($)",
    culturalNorms: [
      "24/7 entertainment and dining culture",
      "Adult entertainment and gambling normalized",
      "Service industry focused on hospitality",
      "Excess and indulgence are celebrated"
    ],
    tippingCustoms: "20-25% expected given service industry economy, tip dealers, valets, everyone",
    businessHours: "Many businesses open 24/7, especially on the Strip",
    localEtiquette: [
      "What happens in Vegas stays in Vegas",
      "Dress codes enforced at upscale venues",
      "Drinking alcohol allowed on street",
      "Photos may be restricted in casinos"
    ],
    religiousConsiderations: [
      "Wedding chapels operate 24/7",
      "Traditional religious services available",
      "Tolerance for all lifestyle choices"
    ],
    safetyTips: [
      "Tourist areas heavily patrolled and safe",
      "Don't leave drinks unattended",
      "Stay hydrated in desert climate",
      "Emergency number is 911"
    ],
    localCuisine: [
      "World-class buffets at major hotels",
      "Celebrity chef restaurants",
      "24-hour dining options everywhere",
      "Steakhouses are particularly notable"
    ],
    transportTips: [
      "Strip monorail connects major hotels",
      "Free hotel shuttles available",
      "Uber and taxi readily available",
      "Walking the Strip takes longer than expected"
    ]
  },
  'berlin': {
    primaryLanguage: "German",
    secondaryLanguages: ["English (widely spoken)", "Turkish", "Russian"],
    currency: "Euro (€)",
    culturalNorms: [
      "Punctuality is extremely important",
      "Direct communication style",
      "Environmental consciousness is high",
      "Work-life balance is valued"
    ],
    tippingCustoms: "5-10% at restaurants, round up for drinks and taxis",
    businessHours: "Most shops: 10 AM - 8 PM, Many closed Sundays",
    localEtiquette: [
      "Shake hands with everyone when introduced",
      "Wait for 'Sie' or 'Du' guidance for formal/informal address",
      "Don't jaywalk - wait for pedestrian signals",
      "Quiet hours (Ruhezeiten) 10 PM - 6 AM are observed"
    ],
    religiousConsiderations: [
      "Protestant and Catholic churches welcome visitors",
      "Synagogues require advance arrangements",
      "Mosque visits should respect prayer times"
    ],
    safetyTips: [
      "Generally very safe, even at night",
      "Some areas like Görlitzer Park can be sketchy",
      "Bike theft is common - use good locks",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Currywurst is the iconic street food",
      "Döner kebab is ubiquitous and excellent",
      "Beer gardens and halls are social centers",
      "Pretzels and bread culture is important"
    ],
    transportTips: [
      "Excellent public transport with U-Bahn, S-Bahn, buses",
      "Day passes offer good value",
      "Bike-friendly city with many rental options",
      "Trust system for tickets but inspections happen"
    ]
  },
  'vienna': {
    primaryLanguage: "German",
    secondaryLanguages: ["English (commonly spoken)"],
    currency: "Euro (€)",
    culturalNorms: [
      "Coffee house culture is central to social life",
      "Classical music and arts are deeply valued",
      "Formal politeness is important",
      "Quality of life and tradition emphasized"
    ],
    tippingCustoms: "5-10% at restaurants, round up for coffee and taxis",
    businessHours: "Most shops: 9 AM - 6 PM, Many closed Sundays",
    localEtiquette: [
      "Use titles and formal address initially",
      "Coffee house etiquette: sit, read, relax for hours",
      "Dress formally for opera and concerts",
      "Greet shopkeepers when entering and leaving"
    ],
    religiousConsiderations: [
      "Beautiful Catholic churches and cathedrals",
      "St. Stephen's Cathedral is major landmark",
      "Respect during services and ceremonies"
    ],
    safetyTips: [
      "One of the world's safest capitals",
      "Petty crime is rare",
      "Public transport very safe at all hours",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Sachertorte and Viennese pastries are world-famous",
      "Coffee culture includes specific drink names",
      "Schnitzel should be authentic Wiener Schnitzel",
      "Wine taverns (Heuriger) offer local wines"
    ],
    transportTips: [
      "Excellent public transport system",
      "Vienna Card offers transport and museum discounts",
      "Walking in historic center is pleasant",
      "Bike sharing system available"
    ]
  },
  'seoul': {
    primaryLanguage: "Korean",
    secondaryLanguages: ["English (limited, more in tourist areas)"],
    currency: "South Korean Won (₩)",
    culturalNorms: [
      "Bowing is important - depth shows respect level",
      "Remove shoes when entering homes and some restaurants",
      "Age hierarchy is very important in social interactions",
      "Technology integration is extremely high"
    ],
    tippingCustoms: "Tipping is not customary and can be confusing or refused",
    businessHours: "Most shops: 10 AM - 10 PM, Restaurants: often 24/7, Many businesses close Sundays",
    localEtiquette: [
      "Use both hands when giving/receiving items",
      "Don't blow your nose in public",
      "Wait for elderly to sit first",
      "Loud talking on public transport is frowned upon"
    ],
    religiousConsiderations: [
      "Buddhism and Christianity are main religions",
      "Temples welcome visitors with respectful behavior",
      "Some areas around temples require quiet respect"
    ],
    safetyTips: [
      "Seoul is extremely safe, even at night",
      "Petty crime is very rare",
      "Public transport is very safe for solo travelers",
      "Emergency number is 112"
    ],
    localCuisine: [
      "Korean BBQ is social dining - share with group",
      "Kimchi is served with almost every meal",
      "Street food culture is vibrant and safe",
      "Convenience store food is surprisingly good"
    ],
    transportTips: [
      "T-money card works on all public transport",
      "Subway announcements in Korean and English",
      "Buses can be confusing for tourists",
      "KakaoTaxi app is essential for taxis"
    ]
  },
  'hong-kong': {
    primaryLanguage: "Cantonese",
    secondaryLanguages: ["English (official)", "Mandarin"],
    currency: "Hong Kong Dollar (HK$)",
    culturalNorms: [
      "East meets West cultural blend",
      "Business culture is fast-paced and efficient",
      "Feng shui influences architecture and daily life",
      "Food culture is central to social life"
    ],
    tippingCustoms: "10% in restaurants if service charge not included, round up for taxis",
    businessHours: "Most shops: 10 AM - 10 PM, Restaurants: 11 AM - 11 PM, Many open later",
    localEtiquette: [
      "Business cards exchanged with both hands",
      "Stand right on escalators",
      "Don't point with single finger",
      "Queuing culture is very important"
    ],
    religiousConsiderations: [
      "Buddhism, Taoism, and Christianity coexist",
      "Temples often have incense burning",
      "Respect religious practices and spaces"
    ],
    safetyTips: [
      "Very safe city with low crime rates",
      "Protests can occur - avoid political gatherings",
      "Typhoon season June-November",
      "Emergency number is 999"
    ],
    localCuisine: [
      "Dim sum is breakfast/lunch tradition",
      "Cha chaan tengs serve Hong Kong-style Western food",
      "Street food is generally safe and delicious",
      "Tea culture is important - tea served with meals"
    ],
    transportTips: [
      "Octopus card works on all transport and many shops",
      "MTR is efficient and covers most areas",
      "Trams are historic and scenic",
      "Star Ferry is iconic harbor crossing"
    ]
  }
};

const getCulturalInsights = (cityKey: string): CulturalInsights | null => {
  return culturalData[cityKey.toLowerCase()] || null;
};

// Hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Seasonal data utility functions
const getSeasonalData = (cityKey: string, hotelPrice: number, dailyCosts: number) => {
  // Realistic hotel seasonal multipliers - hotels vary significantly by season
  const hotelMultipliers = {
    winter: 0.75,  // 25% cheaper hotels
    spring: 1.0,   // baseline pricing
    summer: 1.4,   // 40% more expensive (peak season)
    fall: 0.85     // 15% cheaper
  };
  
  const crowdLevels = {
    winter: 25,   // Very low crowds
    spring: 75,   // High crowds (good weather)
    summer: 95,   // Very high crowds (peak season)
    fall: 55      // Moderate crowds
  };
  
  const currentSeason = getCurrentSeason();
  
  return [
    { 
      season: 'Winter', 
      month: 'Dec-Feb',
      hotelMultiplier: hotelMultipliers.winter,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.winter),
      dailyCosts: dailyCosts, // Daily costs stay the same
      totalDaily: Math.round(hotelPrice * hotelMultipliers.winter + dailyCosts),
      crowdLevel: crowdLevels.winter,
      isCurrent: currentSeason === 'winter',
      weather: '❄️',
      description: 'Budget-Friendly & Quiet',
      recommendation: 'Great value with fewer crowds, but check weather conditions'
    },
    { 
      season: 'Spring', 
      month: 'Mar-May',
      hotelMultiplier: hotelMultipliers.spring,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.spring),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.spring + dailyCosts),
      crowdLevel: crowdLevels.spring,
      isCurrent: currentSeason === 'spring',
      weather: '🌸',
      description: 'Perfect Weather',
      recommendation: 'Ideal weather and blooming seasons, book early'
    },
    { 
      season: 'Summer', 
      month: 'Jun-Aug',
      hotelMultiplier: hotelMultipliers.summer,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.summer),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.summer + dailyCosts),
      crowdLevel: crowdLevels.summer,
      isCurrent: currentSeason === 'summer',
      weather: '☀️',
      description: 'Peak Season',
      recommendation: 'Highest prices and crowds, book months ahead'
    },
    { 
      season: 'Fall', 
      month: 'Sep-Nov',
      hotelMultiplier: hotelMultipliers.fall,
      hotelPrice: Math.round(hotelPrice * hotelMultipliers.fall),
      dailyCosts: dailyCosts,
      totalDaily: Math.round(hotelPrice * hotelMultipliers.fall + dailyCosts),
      crowdLevel: crowdLevels.fall,
      isCurrent: currentSeason === 'fall',
      weather: '🍂',
      description: 'Great Value',
      recommendation: 'Good weather, moderate crowds, excellent value'
    }
  ];
};

const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
};

// Interactive Seasonal Chart Component
function SeasonalChart({ cityKey, hotelPrice, dailyCosts }: { cityKey: string, hotelPrice: number, dailyCosts: number }) {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const seasonalData = getSeasonalData(cityKey, hotelPrice, dailyCosts);
  const maxPrice = Math.max(...seasonalData.map(s => s.hotelPrice));

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-sm text-blue-800">Best Time to Visit & Hotel Pricing</span>
      </div>
      
      {/* Interactive Chart */}
      <div className="space-y-4">
        {/* Hotel Price Chart */}
        <div>
          <div className="text-xs text-blue-600 mb-2 font-medium">
            Hotel Costs by Season
            <span className="text-gray-500 font-normal ml-1">(daily costs remain ~${dailyCosts})</span>
          </div>
          <div className="flex items-end gap-2 h-20 bg-white rounded-lg p-3">
            {seasonalData.map((season, idx) => (
              <div 
                key={season.season}
                className="flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105"
                onMouseEnter={() => setSelectedSeason(season.season)}
                onMouseLeave={() => setSelectedSeason(null)}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    season.isCurrent 
                      ? 'bg-blue-500 shadow-lg' 
                      : selectedSeason === season.season
                      ? 'bg-blue-400'
                      : 'bg-blue-300'
                  }`}
                  style={{ 
                    height: `${(season.hotelPrice / maxPrice) * 100}%`,
                    minHeight: '20px'
                  }}
                />
                <div className="mt-1 text-center">
                  <div className="text-xs font-medium text-gray-700">{season.weather}</div>
                  <div className="text-xs text-gray-600">{season.season}</div>
                  {(selectedSeason === season.season || season.isCurrent) && (
                    <div className="text-xs font-bold text-blue-700">
                      ${season.hotelPrice}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crowd Level Chart */}
        <div>
          <div className="text-xs text-blue-600 mb-2 font-medium">Tourist Crowd Levels</div>
          <div className="space-y-2">
            {seasonalData.map((season) => (
              <div 
                key={`crowd-${season.season}`}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                  selectedSeason === season.season || season.isCurrent
                    ? 'bg-white shadow-sm'
                    : 'bg-white/50'
                }`}
                onMouseEnter={() => setSelectedSeason(season.season)}
                onMouseLeave={() => setSelectedSeason(null)}
              >
                <div className="w-16 text-xs font-medium text-gray-700">
                  {season.season}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          season.crowdLevel > 80 ? 'bg-red-500' :
                          season.crowdLevel > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${season.crowdLevel}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 w-8">
                      {season.crowdLevel}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 w-28 text-right leading-relaxed">
                  {season.description}
                </div>
                {season.isCurrent && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Now
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Season Details */}
        {selectedSeason && (
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            {(() => {
              const season = seasonalData.find(s => s.season === selectedSeason);
              if (!season) return null;
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-blue-800">
                      {season.weather} {season.season} ({season.month})
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      ${season.hotelPrice} hotels + ${season.dailyCosts} daily
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Hotel Price vs Current: </span>
                      <span className={`font-medium ${
                        season.hotelPrice < hotelPrice ? 'text-green-600' : 
                        season.hotelPrice > hotelPrice ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {season.hotelPrice < hotelPrice ? '-' : season.hotelPrice > hotelPrice ? '+' : ''}
                        {Math.abs(Math.round(((season.hotelPrice - hotelPrice) / hotelPrice) * 100))}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Crowds: </span>
                      <span className={`font-medium ${
                        season.crowdLevel > 80 ? 'text-red-600' :
                        season.crowdLevel > 60 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {season.crowdLevel > 80 ? 'Very Busy' :
                         season.crowdLevel > 60 ? 'Moderate' : 'Quiet'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 italic bg-blue-50 p-2 rounded">
                    💡 <strong>Best for:</strong> {season.recommendation}
                  </div>
                </div>
              );
            })()} 
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for responsive detailed breakdown display
function ResponsiveBreakdownDisplay({ 
  category, 
  amount,
  claudeData, 
  travelStyle, 
  cityKey,
  colorClass 
}: { 
  category: string,
  amount: number,
  claudeData: any, 
  travelStyle: "budget" | "mid" | "luxury",
  cityKey: string,
  colorClass: string
}) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fix the mapping between travelStyle and data structure
  const styleMapping = {
    budget: 'budget',
    mid: 'midRange',  // This was the issue - 'mid' should map to 'midRange'
    luxury: 'luxury'
  };
  
  // Debug: Check if we have detailedBreakdown for this city
  const hasDetailedBreakdown = !!claudeData?.detailedBreakdown;
  const targetTier = styleMapping[travelStyle];
  const tierExists = !!claudeData?.detailedBreakdown?.[targetTier];
  
  console.log(`[DEBUG] ResponsiveBreakdownDisplay for ${cityKey}:`, {
    hasDetailedBreakdown,
    targetTier,
    tierExists,
    categoryRequested: category,
    travelStyle
  });
  
  const detailedBreakdown = claudeData?.detailedBreakdown?.[styleMapping[travelStyle]];
  const categoryData = detailedBreakdown?.[category];
  
  // Calculate accurate percentage based on total daily costs
  const currentBreakdown = claudeData?.breakdown?.[styleMapping[travelStyle]];
  const totalDailyCost = currentBreakdown ? 
    (currentBreakdown.meals + currentBreakdown.transport + currentBreakdown.activities + currentBreakdown.drinks) : 
    (amount * 4); // fallback
  const percentage = Math.round((amount / totalDailyCost) * 100);
  
  // Get category icon
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'meals': return '🍽️';
      case 'transport': return '🚇';
      case 'activities': return '🎯';
      case 'drinks': return '🍻';
      default: return '💰';
    }
  };

  // Generate fallback examples and tips for cities without detailed data
  const generateFallbackContent = (cat: string) => {
    const fallbackData = {
      meals: {
        examples: [
          'Local restaurant meal: $12-18',
          'Street food/quick bite: $5-8', 
          'Mid-range restaurant: $20-35',
          'Coffee shop breakfast: $6-10'
        ],
        tips: [
          'Try local street food for authentic and affordable meals',
          'Look for lunch specials at restaurants',
          'Visit local markets for fresh, budget-friendly options'
        ]
      },
      transport: {
        examples: [
          'Metro/subway day pass: $3-6',
          'Bus single ride: $1-3',
          'Taxi short distance: $8-15',
          'Bike rental per day: $10-20'
        ],
        tips: [
          'Use public transport day passes for savings',
          'Walk when possible to explore and save money',
          'Consider bike rentals for medium distances'
        ]
      },
      activities: {
        examples: [
          'Museum admission: $8-15',
          'Walking tour: $10-25',
          'Local attraction: $12-30',
          'Cultural experience: $15-40'
        ],
        tips: [
          'Look for free walking tours',
          'Check for museum free days',
          'Book activities online for discounts'
        ]
      },
      drinks: {
        examples: [
          'Local beer: $3-6',
          'Coffee: $2-5',
          'Cocktail: $8-15',
          'Soft drink: $1-3'
        ],
        tips: [
          'Try local beverages for authentic experience',
          'Happy hours offer great drink deals',
          'Buy drinks from local stores to save money'
        ]
      }
    };
    
    return fallbackData[cat as keyof typeof fallbackData] || { examples: [], tips: [] };
  };

  // Use real data if available, otherwise use fallback
  const displayData = categoryData || generateFallbackContent(category);

  // Debug logging to see if data is being accessed (remove after testing)
  const shouldShowDetailed = categoryData && categoryData.examples;
  
  if (!shouldShowDetailed) {
    console.log(`[DEBUG] ${cityKey} ${travelStyle} ${category}: Using fallback display`, {
      categoryData: !!categoryData,
      examples: !!categoryData?.examples,
      detailedBreakdown: !!claudeData?.detailedBreakdown,
      mappedStyle: styleMapping[travelStyle]
    });
  } else {
    console.log(`[DEBUG] ${cityKey} ${travelStyle} ${category}: Using detailed display!`);
  }

  if (!shouldShowDetailed) {
    // Enhanced fallback for cities without detailed breakdown - simplified display
    if (isMobile) {
      return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex justify-between items-center w-full p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-muted/40">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getCategoryIcon(category)}</span>
              <div>
                <span className="text-sm font-medium capitalize text-gray-700">
                  {category}
                </span>
                <span className="text-xs text-gray-500">{percentage}% of daily costs</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} text-gray-400`} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3">
            <div className="mt-3 space-y-4 text-sm bg-white/50 rounded-lg p-3 border border-muted/20">
              <div>
                <div className="font-medium text-gray-700 mb-2">Examples in {getDisplayCityName(cityKey)}:</div>
                <div className="space-y-2 pl-4">
                  {displayData.examples.slice(0, 4).map((example: string, index: number) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-xs mt-1 text-gray-400">•</span>
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {displayData.tips && displayData.tips.length > 0 && (
                <div>
                  <div className="font-medium text-sm text-blue-700 mb-2">💡 Money-Saving Tips:</div>
                  <div className="space-y-2 pl-4">
                    {displayData.tips.slice(0, 3).map((tip: string, index: number) => (
                      <div key={index} className="text-sm text-blue-600 flex items-start gap-2">
                        <span className="text-xs mt-1 text-blue-400">→</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    } else {
      return (
        <div className="flex justify-between items-center group hover:bg-muted/10 p-2 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(category)}</span>
            <div className="flex flex-col">
              <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>
                {category}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent className="max-w-md p-4" side="top">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm capitalize flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      {category} in {getDisplayCityName(cityKey)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-xs text-gray-600 mb-2">TYPICAL EXAMPLES:</div>
                    <div className="space-y-1">
                      {displayData.examples.slice(0, 4).map((example: string, index: number) => (
                        <div key={index} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {displayData.tips && displayData.tips.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="font-medium text-xs text-blue-700 mb-2">💡 MONEY-SAVING TIPS:</div>
                      <div className="space-y-1">
                        {displayData.tips.slice(0, 3).map((tip: string, index: number) => (
                          <div key={index} className="text-xs text-blue-600 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">→</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
          </div>
        </div>
      );
    }
  }
  
  // For cities WITH detailed breakdown data - enhanced mobile and desktop
  if (isMobile) {
    // Enhanced Mobile: Expandable section with visual improvements  
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="flex justify-between items-center w-full p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-muted/40">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getCategoryIcon(category)}</span>
            <div className="flex flex-col text-left">
              <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>
                {category}
              </span>
              <span className="text-xs text-gray-500">{percentage}% of daily costs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} text-gray-400`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <div className="mt-3 space-y-4 text-sm bg-white/50 rounded-lg p-3 border border-muted/20">
            <div>
              <div className="font-medium text-gray-700 mb-2">Examples in {getDisplayCityName(cityKey)}:</div>
              <div className="space-y-2 pl-4">
                {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
                  <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-xs mt-1 text-gray-400">•</span>
                    <span>{example}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {categoryData.tips && categoryData.tips.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <div className="font-medium text-sm text-blue-700 mb-2">💡 Money-Saving Tips:</div>
                <div className="space-y-2 pl-4">
                  {categoryData.tips.slice(0, 3).map((tip: string, index: number) => (
                    <div key={index} className="text-sm text-blue-600 flex items-start gap-2">
                      <span className="text-xs mt-1 text-blue-400">→</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  } else {
    // Enhanced Desktop: Rich tooltip with visual elements
    return (
      <div className="flex justify-between items-center group hover:bg-muted/10 p-2 rounded-lg transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(category)}</span>
          <div className="flex flex-col">
            <span className={`${colorClass.replace('text-', 'text-').replace('-800', '-700')} font-medium capitalize`}>
              {category}
            </span>
            <span className="text-xs text-gray-500">{percentage}% of daily costs</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
            </TooltipTrigger>
            <TooltipContent className="max-w-md p-4" side="top">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm capitalize flex items-center gap-2">
                    <span>{getCategoryIcon(category)}</span>
                    {category} in {getDisplayCityName(cityKey)}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium text-xs text-gray-600 mb-2">TYPICAL EXAMPLES:</div>
                  <div className="space-y-1">
                    {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
                      <div key={index} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {categoryData.tips && categoryData.tips.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="font-medium text-xs text-blue-700 mb-2">💡 MONEY-SAVING TIPS:</div>
                    <div className="space-y-1">
                      {categoryData.tips.slice(0, 3).map((tip: string, index: number) => (
                        <div key={index} className="text-xs text-blue-600 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${colorClass}`}>{formatCurrency(amount)}</span>
        </div>
      </div>
    );
  }
}

// Mobile-friendly expandable breakdown component
function MobileBreakdownSection({ 
  category, 
  amount, 
  claudeData, 
  travelStyle, 
  cityKey,
  colorClass 
}: { 
  category: string, 
  amount: number, 
  claudeData: any, 
  travelStyle: "budget" | "mid" | "luxury",
  cityKey: string,
  colorClass: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fix the mapping between travelStyle and data structure
  const styleMapping = {
    budget: 'budget',
    mid: 'midRange',  // This was the issue - 'mid' should map to 'midRange'
    luxury: 'luxury'
  };
  
  const detailedBreakdown = claudeData?.detailedBreakdown?.[styleMapping[travelStyle]];
  const categoryData = detailedBreakdown?.[category];
  
  const formatCurrency = (amount: number) => `$${amount}`;
  
  if (!categoryData || !categoryData.examples) {
    // Fallback to simple display if no detailed data
    return (
      <div className="flex justify-between items-center py-2">
        <span className={`${colorClass} font-medium capitalize`}>{category}:</span>
        <span className={`font-bold ${colorClass.replace('text-', 'text-').replace('-700', '-800')}`}>
          {formatCurrency(amount)}
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-left">
        <span className={`${colorClass} font-medium capitalize`}>{category}:</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${colorClass.replace('text-', 'text-').replace('-700', '-800')}`}>
            {formatCurrency(amount)}
          </span>
          <ChevronDown className={`w-4 h-4 ${colorClass} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
          <div className="space-y-1">
            <div className="font-medium text-sm text-gray-800">Examples:</div>
            {categoryData.examples.slice(0, 4).map((example: string, index: number) => (
              <div key={index} className="text-sm text-gray-700 pl-2">
                • {example}
              </div>
            ))}
          </div>
          {categoryData.tips && categoryData.tips.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <div className="font-medium text-sm text-blue-700 mb-1">Local Tips:</div>
              {categoryData.tips.slice(0, 2).map((tip: string, index: number) => (
                <div key={index} className="text-sm text-blue-600 pl-2">
                  💡 {tip}
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface CityModalProps {
  city: CityRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
  travelStyle?: "budget" | "mid" | "luxury";
  userBudget?: number;
  originAirport?: string;
}

export function CityModal({ 
  city, 
  isOpen, 
  onClose, 
  travelStyle = "budget",
  userBudget = 0,
  originAirport
}: CityModalProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!city) return null;

  // Get Claude data for enhanced breakdown
  const claudeData = ClaudeDailyCosts.getDailyCosts(city.city);

  // Safety calculation system
  const calculateSafetyScore = (cityName: string, country: string, region: string) => {
    // Base safety scores by region (out of 100)
    const regionalBaselines = {
      'Western Europe': 85,
      'Northern Europe': 90,
      'Southern Europe': 80,
      'Eastern Europe': 75,
      'North America': 82,
      'East Asia': 88,
      'Southeast Asia': 70,
      'South Asia': 65,
      'Middle East': 60,
      'Africa': 55,
      'South America': 58,
      'Central America': 52,
      'Caribbean': 68,
      'Oceania': 88
    };

    // Country-specific modifiers
    const countryModifiers = {
      'Japan': +15, 'South Korea': +12, 'Singapore': +15, 'Taiwan': +12,
      'Switzerland': +10, 'Norway': +8, 'Denmark': +8, 'Iceland': +12,
      'Netherlands': +8, 'Germany': +5, 'Austria': +5, 'Sweden': +8,
      'Canada': +8, 'Australia': +8, 'New Zealand': +10,
      'United Kingdom': +3, 'France': +2, 'Italy': +0, 'Spain': +2,
      'United States': +0, 'China': -5, 'Thailand': +5, 'Malaysia': +5,
      'India': -8, 'Indonesia': -5, 'Philippines': -10, 'Vietnam': -3,
      'Turkey': -8, 'Egypt': -15, 'Morocco': -10, 'South Africa': -12,
      'Brazil': -8, 'Argentina': -5, 'Mexico': -12, 'Colombia': -15
    };

    // City-specific adjustments
    const cityAdjustments = {
      'Tokyo': +5, 'Kyoto': +8, 'Osaka': +3,
      'Zurich': +5, 'Geneva': +3, 'Copenhagen': +3,
      'Amsterdam': +3, 'Munich': +5, 'Vienna': +5,
      'Toronto': +5, 'Vancouver': +8, 'Sydney': +5, 'Melbourne': +3,
      'London': +2, 'Paris': +0, 'Rome': -3, 'Barcelona': +2, 'Madrid': +3,
      'New York': -5, 'San Francisco': +3, 'Los Angeles': -3, 'Chicago': -5,
      'Bangkok': +3, 'Kuala Lumpur': +3, 'Seoul': +8,
      'Delhi': -12, 'Mumbai': -8, 'Kolkata': -15, 'Chennai': -5,
      'Jakarta': -8, 'Manila': -12, 'Ho Chi Minh City': -5,
      'Istanbul': -5, 'Cairo': -18, 'Marrakech': -8, 'Cape Town': -8,
      'Rio de Janeiro': -12, 'São Paulo': -10, 'Buenos Aires': -3,
      'Mexico City': -8, 'Bogotá': -15, 'Lima': -10,
      'Dubai': +8, 'Tel Aviv': -5, 'Amman': -10
    };

    let score = regionalBaselines[region as keyof typeof regionalBaselines] || 70;
    score += countryModifiers[country as keyof typeof countryModifiers] || 0;
    score += cityAdjustments[cityName as keyof typeof cityAdjustments] || 0;

    // Ensure score stays within bounds
    return Math.max(20, Math.min(100, score));
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 85) return 'very_safe';
    if (score >= 75) return 'safe';
    if (score >= 65) return 'moderate';
    if (score >= 50) return 'caution';
    return 'high_caution';
  };

  const getSafetyBadgeConfig = (level: string) => {
    const configs = {
      very_safe: {
        label: 'Very Safe',
        icon: '🛡️',
        colorClass: 'bg-green-100 text-green-800 border-green-300',
        description: 'Extremely low crime rates, excellent infrastructure, and tourist-friendly environment'
      },
      safe: {
        label: 'Safe',
        icon: '✅',
        colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
        description: 'Generally safe with standard precautions, good tourist infrastructure'
      },
      moderate: {
        label: 'Moderate',
        icon: '⚠️',
        colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        description: 'Exercise normal precautions, be aware of surroundings, especially in tourist areas'
      },
      caution: {
        label: 'Caution',
        icon: '🔶',
        colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
        description: 'Exercise increased caution, avoid certain areas, use reliable transportation'
      },
      high_caution: {
        label: 'High Caution',
        icon: '⚡',
        colorClass: 'bg-red-100 text-red-800 border-red-300',
        description: 'Exercise heightened awareness, research thoroughly, consider guided tours'
      }
    };
    return configs[level as keyof typeof configs];
  };

  const safetyScore = calculateSafetyScore(city.city, city.country, city.region);
  const safetyLevel = getSafetyLevel(safetyScore);
  const safetyBadgeConfig = getSafetyBadgeConfig(safetyLevel);

  // Get city data with case-insensitive lookup
  const getCityData = (cityName: string) => {
    // Handle special city name mappings
    const cityMappings: Record<string, string> = {
      'new york': 'new-york',
      'new york city': 'new-york',
      'nyc': 'new-york',
      'washington dc': 'washington-dc',
      'washington d.c.': 'washington-dc',
      'los angeles': 'los-angeles',
      'san francisco': 'san-francisco',
      'las vegas': 'las-vegas',
      'hong kong': 'hong-kong',
      'kuala lumpur': 'kuala-lumpur',
      'ho chi minh city': 'ho-chi-minh-city',
      'cape town': 'cape-town',
      'rio de janeiro': 'rio-de-janeiro',
      'são paulo': 'sao-paulo',
      'buenos aires': 'buenos-aires',
      'mexico city': 'mexico-city',
      'tel aviv': 'tel-aviv'
    };
    
    const normalizedName = cityName.toLowerCase();
    const key = cityMappings[normalizedName] || normalizedName;
    return CITY_DATA[key] || null;
  };

  const cityData = getCityData(city.city);
  
  // Calculate trip total based on travel style
  const getTripTotal = () => {
    if (city.totals) {
      switch (travelStyle) {
        case "luxury": return city.totals.p75;
        case "mid": return city.totals.p50;
        default: return city.totals.p25;
      }
    }
    return 0;
  };

  // Determine budget alignment
  const getBudgetAlignment = (tripTotal: number) => {
    if (!userBudget) return { 
      status: "mid_range_fit", 
      color: "bg-blue-100 text-blue-800",
      difference: 0,
      percentage: 0
    };
    
    const difference = tripTotal - userBudget;
    const percentage = (Math.abs(difference) / userBudget) * 100;
    const ratio = tripTotal / userBudget;
    
    if (ratio <= 1.0) {
      return { 
        status: "under_budget", 
        color: "bg-green-100 text-green-800", 
        icon: TrendingDown,
        difference,
        percentage
      };
    } else if (ratio <= 1.1) {
      return { 
        status: "slightly_over", 
        color: "bg-yellow-100 text-yellow-800", 
        icon: Minus,
        difference,
        percentage
      };
    } else {
      return { 
        status: "over_budget", 
        color: "bg-red-100 text-red-800", 
        icon: TrendingUp,
        difference,
        percentage
      };
    }
  };

  const tripTotal = getTripTotal();
  const budgetAlignment = getBudgetAlignment(tripTotal);
  // Flight costs completely removed - displayTotal is now just the backend total
  const displayTotal = tripTotal;

  // Format currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount)) return '$0';
    return `$${amount.toLocaleString()}`;
  };

  // Get budget alignment text
  const getBudgetText = (status: string) => {
    switch (status) {
      case "under_budget": return "Under Budget";
      case "slightly_over": return "Slightly Over Budget";
      case "over_budget": return "Over Budget";
      default: return "Mid-Range Fit";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Top Section - Overview */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-background rounded-full border-2">
              {getFlagImageComponent(city.country)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{city.city}</h2>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">{city.country} • {city.region}</p>
                <div className="flex items-center gap-2">
                  {/* Safety Badge */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <Badge variant="outline" className={`text-xs whitespace-nowrap border px-2 py-0.5 font-medium ${safetyBadgeConfig.colorClass}`}>
                            <span className="mr-1">{safetyBadgeConfig.icon}</span>
                            {safetyBadgeConfig.label}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{safetyBadgeConfig.icon}</span>
                            <div>
                              <p className="font-semibold">{safetyBadgeConfig.label} ({safetyScore}/100)</p>
                              <p className="text-muted-foreground">{safetyBadgeConfig.description}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <p className="font-medium mb-1">Safety assessment based on:</p>
                            <div className="space-y-1 text-xs">
                              <p>• Regional security baseline</p>
                              <p>• Country stability metrics</p>
                              <p>• City-specific safety data</p>
                              <p>• Tourist infrastructure quality</p>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Pricing Accuracy Badge */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-help">
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className={`text-xs whitespace-nowrap border px-2 py-0.5 font-medium ${accuracyClasses[getAccuracyLevel(city)]}`}>
                            {(() => {
                              const level = getAccuracyLevel(city);
                              if (level === 'verified') return 'Verified Pricing';
                              return level.charAt(0).toUpperCase() + level.slice(1) + ' Pricing';
                            })()}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-xs">
                          <p><strong>Verified:</strong> Real market data analyzed by AI from current hotel rates and comprehensive local cost analysis</p>
                          <p><strong>Estimated:</strong> AI-powered estimates based on detailed local knowledge with market rate interpolation</p>
                          <p><strong>Approximate:</strong> AI estimates using regional patterns and historical data - directionally accurate</p>
                          <div className="pt-2 border-t border-gray-200 space-y-1">
                            <p className="font-medium">Current data sources:</p>
                            <p>• Hotels: {claudeData?.accommodation ? "Real market rates" : claudeData ? "AI estimates" : "Regional averages"}</p>
                            <p>• Daily costs: {claudeData ? "Local AI analysis" : "Regional patterns"}</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          {/* City Description Placeholder */}
          <p className="text-sm text-muted-foreground">
            {city.city} is a vibrant destination offering unique cultural experiences and attractions for travelers.
          </p>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          {/* Hero Section - Trip Total with City Image Background */}
          <div className="relative overflow-hidden rounded-xl h-80 border border-primary/20 mb-6">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${cityData?.imageUrl || createCityPlaceholder(city.city)})`
              }}
            />
            {/* Dark overlay for better text contrast */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Gradient overlay for enhanced text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Trip Total Content */}
            <div className="relative h-full flex flex-col justify-center p-8 pb-28">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-sm font-medium text-white/90 drop-shadow-lg">Estimated Trip Total</p>
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
                <p className="text-5xl font-bold text-white drop-shadow-lg mb-4">
                  {(() => {
                    const baseTotal = displayTotal;
                    const lowerBound = Math.round(baseTotal * 0.85); // 15% lower
                    const upperBound = Math.round(baseTotal * 1.15); // 15% higher
                    return `${formatCurrency(lowerBound)} - ${formatCurrency(upperBound)}`;
                  })()} 
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-white/80 mb-6 drop-shadow">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{city.nights} nights</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      travelStyle === "budget" ? "bg-green-400" :
                      travelStyle === "mid" ? "bg-blue-400" : "bg-purple-400"
                    }`} />
                    <span className="capitalize">{travelStyle === "mid" ? "Mid-Range" : travelStyle} Travel</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/50" />
                  <span>Excludes flights</span>
                </div>
              </div>
              <div className="flex justify-center mb-4">
                <Badge className={`${budgetAlignment.color} border-0 shadow-lg backdrop-blur-sm bg-white/10 px-4 py-2`}>
                  <div className="flex items-center gap-1 text-white drop-shadow">
                    {budgetAlignment.icon && <budgetAlignment.icon className="h-4 w-4" />}
                    <span className="font-medium">{getBudgetText(budgetAlignment.status)}</span>
                  </div>
                </Badge>
              </div>
            </div>

            {/* Overlaid Tabs */}
            <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
              <div className="backdrop-blur-md bg-black/30 rounded-lg border border-white/20">
                <TabsList className="grid w-full grid-cols-4 bg-transparent border-0 h-10 sm:h-12">
                  <TabsTrigger value="overview" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 border-0 text-xs sm:text-sm px-1 sm:px-3">Overview</TabsTrigger>
                  <TabsTrigger value="costs" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 border-0 text-xs sm:text-sm px-1 sm:px-3">Cost Breakdown</TabsTrigger>
                  <TabsTrigger value="insights" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 border-0 text-xs sm:text-sm px-1 sm:px-3">Smart Insights</TabsTrigger>
                  <TabsTrigger value="culture" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 border-0 text-xs sm:text-sm px-1 sm:px-3">Cultural Guide</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-6 min-h-[600px] w-full max-w-none">
            {/* City Image and Quick Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Quick Summary Card - Full Width */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Trip Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-bold text-blue-700 text-sm">{city.nights} nights</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                        <p className="text-xs text-muted-foreground">Daily Budget</p>
                        <p className="font-bold text-green-700 text-sm">
                          {formatCurrency((() => {
                            if (!claudeData?.breakdown) return city.breakdown?.dailyPerDay || 0;
                            const breakdown = travelStyle === "luxury" ? claudeData.breakdown.luxury :
                                            travelStyle === "mid" ? claudeData.breakdown.midRange :
                                            claudeData.breakdown.budget;
                            if (!breakdown) return city.breakdown?.dailyPerDay || 0;
                            return breakdown.meals + breakdown.transport + breakdown.activities + breakdown.drinks;
                          })())}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                        <p className="text-xs text-muted-foreground">Travel Style</p>
                        <p className="font-bold text-purple-700 text-sm capitalize">
                          {travelStyle === "mid" ? "Mid-Range" : travelStyle}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <MapPin className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                        <p className="text-xs text-muted-foreground">Region</p>
                        <p className="font-bold text-orange-700 text-sm capitalize">{city.region.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attractions and Itinerary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Attractions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🎯 Must-See Attractions
                  </h3>
                  {cityData?.attractions ? (
                    <div className="space-y-2">
                      {cityData.attractions.slice(0, 6).map((attraction, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <span className="text-sm">{attraction}</span>
                        </div>
                      ))}
                      {cityData.attractions.length > 6 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          +{cityData.attractions.length - 6} more attractions to explore
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">#1</span>
                        <span className="text-sm">Historic city center</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">#2</span>
                        <span className="text-sm">Local museums and galleries</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">#3</span>
                        <span className="text-sm">Traditional markets</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground">#4</span>
                        <span className="text-sm">Scenic viewpoints</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Suggested Itinerary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    📅 Suggested Itinerary
                  </h3>
                  {cityData?.itinerary ? (
                    <div className="space-y-3">
                      {cityData.itinerary.slice(0, 5).map((day, index) => (
                        <div key={index} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm leading-relaxed">{day}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-3 p-2 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span className="text-sm">Explore the historic city center and main landmarks</span>
                      </div>
                      <div className="flex gap-3 p-2 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span className="text-sm">Visit museums, galleries, and cultural sites</span>
                      </div>
                      <div className="flex gap-3 p-2 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span className="text-sm">Experience local markets, food, and nightlife</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map and Safety */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Interactive Map Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🗺️ Explore the Area
                  </h3>
                  
                  {/* Interactive Leaflet Map */}
                  <div className="mb-4">
                    <InteractiveMap 
                      city={getDisplayCityName(city.city)}
                      coordinates={city.coordinates}
                      height="h-80"
                      className="w-full"
                    />
                  </div>
                  
                  {/* Fallback to Google Maps */}
                  <div 
                    className="w-full h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center cursor-pointer hover:from-blue-700 hover:to-green-700 transition-all duration-200 group mb-3"
                    onClick={() => openGoogleMaps(city.city)}
                  >
                    <div className="text-center">
                      <MapPin className="h-4 w-4 inline mr-2 text-white group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-white">Open in Google Maps</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-1">💡 Pro Tip</p>
                    <p className="text-xs text-blue-600">
                      Use the interactive map above to explore the area, or click "Open in Google Maps" for turn-by-turn navigation
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Safety & Travel Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🛡️ Safety & Travel Info
                  </h3>
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${safetyBadgeConfig.colorClass.replace('text-', 'bg-').replace('-800', '-50').replace('border-', 'border ')}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{safetyBadgeConfig.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{safetyBadgeConfig.label}</div>
                          <div className="text-xs opacity-75">{safetyBadgeConfig.description}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-medium">
                        {safetyScore}/100
                      </Badge>
                    </div>
                    {culturalData[city.city.toLowerCase()]?.safetyTips && culturalData[city.city.toLowerCase()].safetyTips.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-800">Local Safety Tips:</div>
                        {culturalData[city.city.toLowerCase()].safetyTips.slice(0, 3).map((tip: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <span className="text-blue-600">💳</span>
                      <span className="text-sm text-blue-700">Credit cards widely accepted</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                      <span className="text-purple-600">🌐</span>
                      <span className="text-sm text-purple-700">English commonly spoken in tourist areas</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
                      <span className="text-orange-600">📱</span>
                      <span className="text-sm text-orange-700">Good mobile connectivity and WiFi</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Travel Reminder</p>
                    <p className="text-xs text-amber-600">
                      Check current visa requirements and travel advisories before departure
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Breakdown Tab */}
          <TabsContent value="costs" className="space-y-4 mt-6 min-h-[600px] w-full max-w-none">
            <Card>
              <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
            
            {/* Hotel Costs */}
            {claudeData?.accommodation && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Hotel Costs per Night</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "budget" 
                      ? "bg-green-100 border-green-500 shadow-lg ring-2 ring-green-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "budget" && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "budget" ? "text-green-700" : "text-muted-foreground"}`}>Budget</p>
                    <p className={`text-lg font-bold ${travelStyle === "budget" ? "text-green-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.budget)}
                    </p>
                    {travelStyle === "budget" && (
                      <p className="text-xs text-green-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "mid" 
                      ? "bg-blue-100 border-blue-500 shadow-lg ring-2 ring-blue-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "mid" && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "mid" ? "text-blue-700" : "text-muted-foreground"}`}>Mid-Range</p>
                    <p className={`text-lg font-bold ${travelStyle === "mid" ? "text-blue-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.midRange)}
                    </p>
                    {travelStyle === "mid" && (
                      <p className="text-xs text-blue-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                  <div className={`relative text-center p-4 rounded-lg border-2 transition-all ${
                    travelStyle === "luxury" 
                      ? "bg-purple-100 border-purple-500 shadow-lg ring-2 ring-purple-200" 
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}>
                    {travelStyle === "luxury" && (
                      <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <p className={`text-xs font-medium ${travelStyle === "luxury" ? "text-purple-700" : "text-muted-foreground"}`}>Luxury</p>
                    <p className={`text-lg font-bold ${travelStyle === "luxury" ? "text-purple-800" : "text-gray-600"}`}>
                      {formatCurrency(claudeData.accommodation.luxury)}
                    </p>
                    {travelStyle === "luxury" && (
                      <p className="text-xs text-purple-600 font-medium mt-1">Your Selection</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Cost Breakdown Display with Examples */}
            {claudeData?.breakdown && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-3 text-center w-full">Daily Cost Categories</h4>
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {/* Meals Category */}
                  <div
                    className="p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-help group relative w-full text-center"
                    title={claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.meals?.examples ? 
                      `Examples: ${claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].meals.examples.slice(0,2).join(', ')}...` : 
                      'Hover for local meal examples and tips'}
                  >
                    <div className="flex flex-col items-center justify-center mb-1 mx-auto">
                      <svg className="w-5 h-5 text-green-700 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      <span className="font-medium text-green-800">Meals</span>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {travelStyle === "budget" && claudeData.breakdown.budget ? formatCurrency(claudeData.breakdown.budget.meals) :
                       travelStyle === "mid" && claudeData.breakdown.midRange ? formatCurrency(claudeData.breakdown.midRange.meals) :
                       travelStyle === "luxury" && claudeData.breakdown.luxury ? formatCurrency(claudeData.breakdown.luxury.meals) : "$0"}
                    </div>
                    <div className="text-xs text-green-600">per day</div>
                    
                    {/* Hover tooltip for meals */}
                    {claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.meals && (
                      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <h5 className="font-semibold text-green-800 mb-2">Meal Examples:</h5>
                        <ul className="text-xs text-gray-700 mb-2 space-y-1">
                          {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].meals.examples?.slice(0,3).map((example, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-600">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                        {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].meals.tips && (
                          <p className="text-xs text-green-700 font-medium">
                            💡 {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].meals.tips[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Transport Category */}
                  <div 
                    className="p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-help group relative w-full text-center"
                    title={claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.transport?.examples ? 
                      `Examples: ${claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].transport.examples.slice(0,2).join(', ')}...` : 
                      'Hover for local transport options and tips'}
                  >
                    <div className="flex flex-col items-center justify-center mb-1 mx-auto">
                      <svg className="w-5 h-5 text-blue-700 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium text-blue-800">Transport</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {travelStyle === "budget" && claudeData.breakdown.budget ? formatCurrency(claudeData.breakdown.budget.transport) :
                       travelStyle === "mid" && claudeData.breakdown.midRange ? formatCurrency(claudeData.breakdown.midRange.transport) :
                       travelStyle === "luxury" && claudeData.breakdown.luxury ? formatCurrency(claudeData.breakdown.luxury.transport) : "$0"}
                    </div>
                    <div className="text-xs text-blue-600">per day</div>
                    
                    {/* Hover tooltip for transport */}
                    {claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.transport && (
                      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <h5 className="font-semibold text-blue-800 mb-2">Transport Options:</h5>
                        <ul className="text-xs text-gray-700 mb-2 space-y-1">
                          {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].transport.examples?.slice(0,3).map((example, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-blue-600">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                        {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].transport.tips && (
                          <p className="text-xs text-blue-700 font-medium">
                            💡 {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].transport.tips[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Activities Category */}
                  <div 
                    className="p-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors cursor-help group relative w-full text-center"
                    title={claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.activities?.examples ? 
                      `Examples: ${claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].activities.examples.slice(0,2).join(', ')}...` : 
                      'Hover for activity suggestions and tips'}
                  >
                    <div className="flex flex-col items-center justify-center mb-1 mx-auto">
                      <svg className="w-5 h-5 text-purple-700 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium text-purple-800">Activities</span>
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {travelStyle === "budget" && claudeData.breakdown.budget ? formatCurrency(claudeData.breakdown.budget.activities) :
                       travelStyle === "mid" && claudeData.breakdown.midRange ? formatCurrency(claudeData.breakdown.midRange.activities) :
                       travelStyle === "luxury" && claudeData.breakdown.luxury ? formatCurrency(claudeData.breakdown.luxury.activities) : "$0"}
                    </div>
                    <div className="text-xs text-purple-600">per day</div>
                    
                    {/* Hover tooltip for activities */}
                    {claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.activities && (
                      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <h5 className="font-semibold text-purple-800 mb-2">Activity Ideas:</h5>
                        <ul className="text-xs text-gray-700 mb-2 space-y-1">
                          {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].activities.examples?.slice(0,3).map((example, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-purple-600">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                        {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].activities.tips && (
                          <p className="text-xs text-purple-700 font-medium">
                            💡 {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].activities.tips[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Drinks Category */}
                  <div 
                    className="p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors cursor-help group relative w-full text-center"
                    title={claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.drinks?.examples ? 
                      `Examples: ${claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].drinks.examples.slice(0,2).join(', ')}...` : 
                      'Hover for drink prices and nightlife tips'}
                  >
                    <div className="flex flex-col items-center justify-center mb-1 mx-auto">
                      <svg className="w-5 h-5 text-orange-700 mb-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a4 4 0 00-4.136 6.081 1 1 0 001.481 1.341l5.927-5.927a1 1 0 00-1.341-1.481z" clipRule="evenodd"/>
                        <path d="M12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"/>
                      </svg>
                      <span className="font-medium text-orange-800">Drinks</span>
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {travelStyle === "budget" && claudeData.breakdown.budget ? formatCurrency(claudeData.breakdown.budget.drinks) :
                       travelStyle === "mid" && claudeData.breakdown.midRange ? formatCurrency(claudeData.breakdown.midRange.drinks) :
                       travelStyle === "luxury" && claudeData.breakdown.luxury ? formatCurrency(claudeData.breakdown.luxury.drinks) : "$0"}
                    </div>
                    <div className="text-xs text-orange-600">per day</div>
                    
                    {/* Hover tooltip for drinks */}
                    {claudeData.detailedBreakdown && claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle]?.drinks && (
                      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        <h5 className="font-semibold text-orange-800 mb-2">Drink Options:</h5>
                        <ul className="text-xs text-gray-700 mb-2 space-y-1">
                          {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].drinks.examples?.slice(0,3).map((example, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-orange-600">•</span>
                              <span>{example}</span>
                            </li>
                          ))}
                        </ul>
                        {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].drinks.tips && (
                          <p className="text-xs text-orange-700 font-medium">
                            💡 {claudeData.detailedBreakdown[travelStyle === "mid" ? "midRange" : travelStyle].drinks.tips[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Total Summary */}
            {claudeData?.breakdown && (
              <div className="mb-6">
                <div className={`p-4 rounded-lg border-2 ${
                  travelStyle === "budget" ? "bg-green-50 border-green-200" :
                  travelStyle === "mid" ? "bg-blue-50 border-blue-200" :
                  "bg-purple-50 border-purple-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        travelStyle === "budget" ? "bg-green-100 text-green-700" :
                        travelStyle === "mid" ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        ✓ {travelStyle === "mid" ? "Mid-Range" : travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Style
                      </div>
                      <span className={`text-sm font-medium ${
                        travelStyle === "budget" ? "text-green-700" :
                        travelStyle === "mid" ? "text-blue-700" :
                        "text-purple-700"
                      }`}>Daily Total:</span>
                    </div>
                    <div className={`text-xl font-bold ${
                      travelStyle === "budget" ? "text-green-800" :
                      travelStyle === "mid" ? "text-blue-800" :
                      "text-purple-800"
                    }`}>
                      {formatCurrency((() => {
                        // Use the same source as city card for consistency
                        // Fall back to Claude breakdown calculation if backend value not available
                        const backendDaily = city.breakdown?.dailyPerDay;
                        if (backendDaily) {
                          return backendDaily;
                        }
                        
                        // Fallback: calculate from Claude breakdown components
                        const breakdown = travelStyle === "luxury" ? claudeData.breakdown.luxury :
                                        travelStyle === "mid" ? claudeData.breakdown.midRange :
                                        claudeData.breakdown.budget;
                        
                        if (!breakdown) return 0;
                        return breakdown.meals + breakdown.transport + breakdown.activities + breakdown.drinks;
                      })())}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </CardContent>
        </Card>

            {/* Cost Comparison */}
            {originAirport && (() => {
              const comparison = getCostComparison(city.city, originAirport, travelStyle === "mid" ? "midRange" : travelStyle);
              if (!comparison) return null;
              
              return (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Cost Comparison
                    </h3>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Compared to {getDisplayCityName(comparison.homeCity)}
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {comparison.overallComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.overallComparison.percentageDifference)}%
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {comparison.overallComparison.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Hotels</p>
                          <p className={`text-lg font-semibold ${comparison.hotelComparison.percentageDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {comparison.hotelComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.hotelComparison.percentageDifference)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparison.hotelComparison.description}
                          </p>
                        </div>
                        
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Daily Costs</p>
                          <p className={`text-lg font-semibold ${comparison.dailyComparison.percentageDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {comparison.dailyComparison.percentageDifference > 0 ? '+' : ''}{Math.round(comparison.dailyComparison.percentageDifference)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comparison.dailyComparison.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

          </TabsContent>

          {/* Smart Insights Tab */}
          <TabsContent value="insights" className="space-y-4 mt-6 min-h-[600px] w-full max-w-none">
            <CityModalSmartInsights 
              city={city}
              travelStyle={travelStyle}
              userBudget={userBudget}
              originAirport={originAirport}
            />
          </TabsContent>

          {/* Cultural Guide Tab */}
          <TabsContent value="culture" className="space-y-4 mt-6 min-h-[600px] w-full max-w-none">
            {(() => {
              const cultural = getCulturalInsights(city.city);
              
              if (!cultural) {
                return (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Cultural Guide Coming Soon</h3>
                      <p className="text-muted-foreground">
                        We're working on adding detailed cultural insights for {city.city}. 
                        Check back soon for language tips, local customs, and cultural etiquette!
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <>
                  {/* Language & Currency */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Language & Currency</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Primary Language</h4>
                            <p className="font-semibold text-lg">{cultural.primaryLanguage}</p>
                          </div>
                          {cultural.secondaryLanguages && cultural.secondaryLanguages.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Also Spoken</h4>
                              <div className="flex flex-wrap gap-2">
                                {cultural.secondaryLanguages.map((lang, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Currency</h4>
                            <p className="font-semibold text-lg">{cultural.currency}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Tipping</h4>
                            <p className="text-sm">{cultural.tippingCustoms}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cultural Norms & Etiquette */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Cultural Norms & Etiquette</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Essential Cultural Norms</h4>
                          <div className="space-y-2">
                            {cultural.culturalNorms.map((norm, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-1">•</span>
                                <span>{norm}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-3">Local Etiquette</h4>
                          <div className="space-y-2">
                            {cultural.localEtiquette.map((etiquette, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{etiquette}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Practical Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Calendar className="h-5 w-5 text-purple-600" />
                          <h3 className="text-lg font-semibold">Practical Info</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">Business Hours</h4>
                            <p className="text-sm">{cultural.businessHours}</p>
                          </div>
                          {cultural.religiousConsiderations && (
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2">Religious Sites</h4>
                              <div className="space-y-1">
                                {cultural.religiousConsiderations.map((consideration, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span>{consideration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb className="h-5 w-5 text-orange-600" />
                          <h3 className="text-lg font-semibold">Safety Tips</h3>
                        </div>
                        <div className="space-y-2">
                          {cultural.safetyTips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-orange-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Local Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">🍽️ Food & Dining</h3>
                        <div className="space-y-2">
                          {cultural.localCuisine.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-red-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">🚌 Transportation</h3>
                        <div className="space-y-2">
                          {cultural.transportTips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Updated {new Date(city.lastUpdatedISO || '').toLocaleDateString()}
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Plan This Trip
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
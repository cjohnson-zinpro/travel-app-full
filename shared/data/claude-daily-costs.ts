/**
 * Claude Knowledge-Based Daily Cost Database
 * 
 * Structure:
 * - Simple daily totals for city cards
 * - Detailed breakdowns for modal popouts
 * - All costs in USD and represent vacation/tourist spending patterns
 */

interface CostBreakdown {
  total: number;
  meals: number;
  transport: number;
  activities: number;
  drinks: number;
  incidentals: number;
}

interface DetailedCostBreakdown {
  total: number;
  meals: {
    amount: number;
    examples: string[];
    tips?: string[];
  };
  transport: {
    amount: number;
    examples: string[];
    tips?: string[];
  };
  activities: {
    amount: number;
    examples: string[];
    tips?: string[];
  };
  drinks: {
    amount: number;
    examples: string[];
    tips?: string[];
  };
  incidentals: {
    amount: number;
    examples: string[];
    tips?: string[];
  };
}

export interface CityDailyCosts {
  // Simple totals for city cards
  dailyCost: {
    budget: number;
    midRange: number; 
    luxury: number;
  };
  
  // Realistic accommodation costs (hotels + Airbnb blended)
  accommodation?: {
    budget: number;
    midRange: number;
    luxury: number;
  };
  
  // Detailed breakdowns for modal popouts
  breakdown: {
    budget: CostBreakdown;
    midRange: CostBreakdown;
    luxury: CostBreakdown;
  };
  
  // Enhanced breakdowns with examples (optional for now)
  detailedBreakdown?: {
    budget: DetailedCostBreakdown;
    midRange: DetailedCostBreakdown;
    luxury: DetailedCostBreakdown;
  };
  
  confidence: 'high' | 'medium' | 'low';
}

export const CLAUDE_DAILY_COSTS_DATABASE: Record<string, CityDailyCosts> = {
  // NORTH AMERICA - MAJOR CITIES
  'new-york': {
    dailyCost: { budget: 65, midRange: 145, luxury: 480 },
    accommodation: { budget: 106, midRange: 228, luxury: 332 }, // Blended: hotels + limited Airbnb (regulated market)
    breakdown: {
      budget: { total: 65, meals: 28, transport: 12, activities: 18, drinks: 9, incidentals: 8 },
      midRange: { total: 145, meals: 55, transport: 20, activities: 42, drinks: 28, incidentals: 15 },
      luxury: { total: 480, meals: 170, transport: 35, activities: 150, drinks: 95, incidentals: 30 }
    },
    detailedBreakdown: {
      budget: {
        total: 65,
        meals: {
          amount: 28,
          examples: ["Food truck lunch $8-12", "Pizza slice $3-5", "Bodega sandwich $6-9", "Happy hour specials $12-18"],
          tips: ["Many restaurants offer lunch specials", "Food trucks offer authentic diverse cuisine", "Happy hour 4-7pm at many bars"]
        },
        transport: {
          amount: 12,
          examples: ["MetroCard 7-day $33", "Single subway ride $2.90", "Citi Bike day pass $15", "Walking Manhattan free"],
          tips: ["Unlimited MetroCard best for 3+ days", "Walking faster than subway for short distances", "Download subway app for real-time delays"]
        },
        activities: {
          amount: 18,
          examples: ["Central Park free", "Staten Island Ferry free", "Brooklyn Bridge walk free", "Museums suggested donation"],
          tips: ["Many museums have suggested (not required) admission", "Free events in Central Park", "Walking tours available by donation"]
        },
        drinks: {
          amount: 9,
          examples: ["Happy hour beer $4-6", "Coffee cart $2-3", "Bodega drinks $1-3", "Bar beer $6-9"],
          tips: ["Happy hour varies by neighborhood", "Bodega coffee surprisingly good", "BYOB restaurants common in outer boroughs"]
        },
        incidentals: {
          amount: 8,
          examples: ["Souvenir from street vendor $5-10", "Public restroom access varies", "Tip cash preferred", "Phone charger $10-15"],
          tips: ["Tipping 18-20% standard in restaurants", "Public restrooms limited - use Starbucks/hotels", "Street vendors often cash only"]
        }
      },
      midRange: {
        total: 145,
        meals: {
          amount: 55,
          examples: ["Restaurant dinner $25-40", "Brunch $18-28", "Quality lunch $15-25", "Cocktail hour $35-50"],
          tips: ["Reservations recommended for dinner", "Brunch very popular on weekends", "Explore neighborhoods beyond Midtown for value"]
        },
        transport: {
          amount: 20,
          examples: ["Taxi short rides $12-20", "Uber/Lyft $15-25", "Airport express $15-20", "Car service $25-35"],
          tips: ["Surge pricing common during rush hours", "Yellow cabs vs. app-based pricing varies", "Airport express buses efficient option"]
        },
        activities: {
          amount: 42,
          examples: ["Broadway shows $75-150", "Top of the Rock $37", "9/11 Memorial $26", "Museum admission $25-30"],
          tips: ["Lottery tickets available for Broadway shows", "CityPASS covers multiple attractions", "Book popular attractions in advance"]
        },
        drinks: {
          amount: 28,
          examples: ["Craft cocktails $14-18", "Wine bar $12-16/glass", "Rooftop bars $15-22", "Brewery tastings $15-25"],
          tips: ["Rooftop bars have dress codes", "Wine scene strong in West Village", "Craft beer scene thriving in Brooklyn"]
        },
        incidentals: {
          amount: 15,
          examples: ["Shopping in SoHo $25-75", "Tip for doorman/concierge $5-10", "Drugstore items $8-20", "Laundry service $15-25"],
          tips: ["Sales tax 8.25% on most purchases", "Tipping culture very important", "Pharmacies on every corner"]
        }
      },
      luxury: {
        total: 480,
        meals: {
          amount: 170,
          examples: ["Michelin starred dinner $150-300", "High-end steakhouse $80-150", "Tasting menu $125-250", "Celebrity chef restaurant $100-200"],
          tips: ["Book Michelin restaurants months ahead", "Lunch tasting menus offer better value", "Restaurant Week offers deals at top spots"]
        },
        transport: {
          amount: 35,
          examples: ["Private car service $40-60", "Helicopter tour $200-400", "Premium taxi $25-40", "Luxury car rental $100+/day"],
          tips: ["Private drivers know best routes", "Helicopter tours offer stunning views", "Luxury car rentals include insurance"]
        },
        activities: {
          amount: 150,
          examples: ["VIP Broadway experience $200-400", "Private museum tours $150-300", "Yankees premium seats $100-500", "Exclusive gallery openings $50-150"],
          tips: ["VIP experiences skip all lines", "Private tours avoid crowds completely", "Sports premium seating includes food/drinks"]
        },
        drinks: {
          amount: 95,
          examples: ["Hotel bar cocktails $20-35", "Wine tasting experiences $75-150", "Whiskey club membership $40-80", "Champagne service $50-100"],
          tips: ["Hotel bars in Midtown have incredible views", "Wine clubs offer exclusive tastings", "Speakeasies still popular throughout city"]
        },
        incidentals: {
          amount: 30,
          examples: ["Designer shopping $100-500", "Spa services $150-300", "Personal shopping $200/day", "Concierge services $50-100"],
          tips: ["Fifth Avenue for luxury shopping", "Hotel spas often best in class", "Personal shoppers access exclusive items"]
        }
      }
    },
    confidence: 'high'
  },

  'los-angeles': {
    dailyCost: { budget: 58, midRange: 125, luxury: 420 },
    accommodation: { budget: 89, midRange: 185, luxury: 298 }, // Blended: strong Airbnb market provides 15-20% savings
    breakdown: {
      budget: { total: 58, meals: 24, transport: 10, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 125, meals: 48, transport: 18, activities: 35, drinks: 24, incidentals: 15 },
      luxury: { total: 420, meals: 145, transport: 30, activities: 125, drinks: 90, incidentals: 30 }
    },
    detailedBreakdown: {
      budget: {
        total: 58,
        meals: {
          amount: 24,
          examples: [
            "Food truck tacos $2-4 each",
            "Korean BBQ lunch $12-18",
            "Thai food $8-15",
            "In-N-Out burger $8-12"
          ],
          tips: ["Food trucks offer diverse, authentic cuisine", "Happy hour deals 3-6pm", "Koreatown has excellent value"]
        },
        transport: {
          amount: 10,
          examples: [
            "Metro day pass $7",
            "Bus fare $1.75",
            "Metro bike share $5/30min",
            "Parking meters $1-4/hour"
          ],
          tips: ["Car is often necessary for LA", "Metro covers downtown and beach areas", "Parking can be expensive in popular areas"]
        },
        activities: {
          amount: 16,
          examples: [
            "Griffith Observatory free",
            "Beach access free",
            "Hollywood Walk of Fame free",
            "Getty Center free"
          ],
          tips: ["Many beaches are free", "Griffith Park offers hiking and views", "Free outdoor concerts in summer"]
        },
        drinks: {
          amount: 8,
          examples: [
            "Coffee shops $3-6",
            "Happy hour drinks $5-10",
            "Beach bars $8-15",
            "Craft beer $6-12"
          ],
          tips: ["Happy hours common 3-6pm", "Rooftop bars offer great views", "Beach bars can be pricey"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Parking $5-20/day",
            "Venice Beach souvenirs $10-30",
            "Uber short ride $8-15",
            "Tips $5-15"
          ],
          tips: ["Factor in parking costs", "Venice Beach good for souvenirs", "Tipping 18-20% standard"]
        }
      },
      midRange: {
        total: 125,
        meals: {
          amount: 48,
          examples: [
            "Restaurant dinner $25-40",
            "Brunch in West Hollywood $18-28",
            "Sushi dinner $30-50",
            "Farm-to-table lunch $20-35"
          ],
          tips: ["West Hollywood great for dining", "Reservations recommended", "Many restaurants offer patio dining"]
        },
        transport: {
          amount: 18,
          examples: [
            "Uber Pool $12-25",
            "Rental car $40-60/day",
            "Valet parking $15-30",
            "Airport shuttle $15-25"
          ],
          tips: ["Rental car gives flexibility", "Valet common at restaurants", "Traffic heaviest 7-9am, 4-7pm"]
        },
        activities: {
          amount: 35,
          examples: [
            "Universal Studios $109+",
            "Museum tickets $15-25",
            "Hollywood tour $35-60",
            "Concert tickets $50-150"
          ],
          tips: ["Book theme parks in advance", "Many museums have discount days", "Check venue websites for deals"]
        },
        drinks: {
          amount: 24,
          examples: [
            "Cocktails $12-18",
            "Wine bars $10-20/glass",
            "Rooftop bars $15-25",
            "Brewery visits $8-15"
          ],
          tips: ["Sunset Strip famous for nightlife", "Rooftop bars offer city views", "Craft beer scene thriving"]
        },
        incidentals: {
          amount: 15,
          examples: [
            "Shopping Rodeo Drive $100-500",
            "Spa services $80-200",
            "Photography tours $50-150",
            "Private parking $20-40"
          ],
          tips: ["Melrose Ave for vintage shopping", "Santa Monica Pier for entertainment", "Beverly Hills for luxury shopping"]
        }
      },
      luxury: {
        total: 420,
        meals: {
          amount: 145,
          examples: [
            "Michelin restaurants $150-300",
            "Celebrity chef dinner $100-200",
            "Nobu Malibu $80-150",
            "Private chef $200-500"
          ],
          tips: ["Book Michelin restaurants weeks ahead", "Malibu offers oceanfront dining", "Private chefs popular for groups"]
        },
        transport: {
          amount: 30,
          examples: [
            "Private driver $80-150/day",
            "Luxury car rental $150-400/day",
            "Helicopter tour $200-500",
            "Private jet charter $2000-5000"
          ],
          tips: ["Private drivers know traffic patterns", "Helicopter tours offer unique views", "Luxury car rentals for special occasions"]
        },
        activities: {
          amount: 125,
          examples: [
            "VIP studio tours $300-600",
            "Private yacht charter $500-2000",
            "Exclusive events $200-1000",
            "Golf at exclusive clubs $200-500"
          ],
          tips: ["VIP experiences avoid crowds", "Yacht charters popular for groups", "Exclusive clubs require connections"]
        },
        drinks: {
          amount: 90,
          examples: [
            "High-end cocktails $20-35",
            "Wine tastings $50-200",
            "Private bar experiences $200-800",
            "Champagne service $100-300"
          ],
          tips: ["West Hollywood has premium bars", "Wine country day trips available", "Hotel bars very sophisticated"]
        },
        incidentals: {
          amount: 30,
          examples: [
            "Luxury shopping $500-5000",
            "Spa at 5-star hotel $200-800",
            "Personal shopper $200-500",
            "VIP concert tickets $500-2000"
          ],
          tips: ["Rodeo Drive for luxury shopping", "Hotel spas offer premium treatments", "Personal shoppers provide insider access"]
        }
      }
    },
    confidence: 'high'
  },

  'san-francisco': {
    dailyCost: { budget: 68, midRange: 155, luxury: 520 },
    accommodation: { budget: 118, midRange: 248, luxury: 385 }, // Blended: expensive market, limited Airbnb savings (10%)
    breakdown: {
      budget: { total: 68, meals: 30, transport: 12, activities: 18, drinks: 10, incidentals: 8 },
      midRange: { total: 155, meals: 62, transport: 22, activities: 42, drinks: 29, incidentals: 15 },
      luxury: { total: 520, meals: 185, transport: 40, activities: 155, drinks: 110, incidentals: 30 }
    },
    detailedBreakdown: {
      budget: {
        total: 68,
        meals: {
          amount: 30,
          examples: [
            "Mission burrito $8-12",
            "Chinatown dim sum $15-25",
            "Food trucks $6-12",
            "Happy hour deals $10-18"
          ],
          tips: ["Mission District has excellent value", "Chinatown offers authentic cuisine", "Happy hour 3-6pm common"]
        },
        transport: {
          amount: 12,
          examples: [
            "Muni day pass $5",
            "Cable car ride $8",
            "BART to airport $10",
            "Citi Bike $15/day"
          ],
          tips: ["Muni covers most of city", "Cable cars are tourist experience", "Walking up hills is free exercise"]
        },
        activities: {
          amount: 18,
          examples: [
            "Golden Gate Park free",
            "Lombard Street free",
            "Crissy Field free",
            "Mission murals free walking tour"
          ],
          tips: ["Many parks and views are free", "Golden Gate Bridge walk is free", "Free museum days available"]
        },
        drinks: {
          amount: 10,
          examples: [
            "Coffee shops $3-7",
            "Happy hour beer $4-8",
            "Wine bars $8-15",
            "Local breweries $6-12"
          ],
          tips: ["Coffee culture is strong", "Many breweries offer tastings", "Happy hours very popular"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Pier 39 souvenirs $10-25",
            "Parking meters $3-7/hour",
            "Tips $5-15",
            "Public restrooms $1"
          ],
          tips: ["Parking is expensive and limited", "Street parking requires coins/card", "Tipping 18-20% standard"]
        }
      },
      midRange: {
        total: 155,
        meals: {
          amount: 62,
          examples: [
            "Union Square dining $25-45",
            "North Beach Italian $30-50",
            "Ferry Building food hall $20-35",
            "Castro brunch $18-30"
          ],
          tips: ["Ferry Building has artisanal foods", "North Beach excellent for Italian", "Reservations recommended weekends"]
        },
        transport: {
          amount: 22,
          examples: [
            "Uber rides $15-30",
            "Parking garages $25-45/day",
            "Car rental $60-100/day",
            "Private tours $40-80"
          ],
          tips: ["Uber/Lyft common due to parking issues", "Valet parking $20-40", "Public transit often faster"]
        },
        activities: {
          amount: 42,
          examples: [
            "Alcatraz tour $37-45",
            "Museum admissions $15-25",
            "Wine country tours $100-200",
            "Bay cruise $35-60"
          ],
          tips: ["Book Alcatraz in advance", "Many museums have discount days", "Wine tours popular day trips"]
        },
        drinks: {
          amount: 29,
          examples: [
            "Cocktails $14-20",
            "Wine flights $15-30",
            "Rooftop bars $18-28",
            "Whiskey bars $12-25"
          ],
          tips: ["SoMa has trendy cocktail scene", "Napa wine available in city", "Views from rooftop bars spectacular"]
        },
        incidentals: {
          amount: 15,
          examples: [
            "Union Square shopping $50-300",
            "Spa services $100-250",
            "Art galleries free-$20",
            "Private parking $30-60"
          ],
          tips: ["Union Square for major shopping", "Many galleries in SoMa", "Parking very expensive downtown"]
        }
      },
      luxury: {
        total: 520,
        meals: {
          amount: 185,
          examples: [
            "Michelin restaurants $200-400",
            "Nob Hill fine dining $150-300",
            "Private chef $300-800",
            "Wine pairing dinners $250-500"
          ],
          tips: ["SF has many Michelin-starred restaurants", "Nob Hill offers elegant dining", "Private chefs popular for special occasions"]
        },
        transport: {
          amount: 40,
          examples: [
            "Private driver $100-200/day",
            "Luxury car rental $200-500/day",
            "Helicopter tours $300-800",
            "Private jet $3000-8000"
          ],
          tips: ["Private drivers know the city well", "Helicopter tours offer Golden Gate views", "Luxury cars for special occasions"]
        },
        activities: {
          amount: 155,
          examples: [
            "Private Alcatraz tour $300-500",
            "Yacht charters $800-2500",
            "VIP wine experiences $300-1000",
            "Exclusive cultural events $200-800"
          ],
          tips: ["Private tours avoid crowds", "Yacht charters popular for bay views", "VIP wine experiences in Napa"]
        },
        drinks: {
          amount: 110,
          examples: [
            "Premium cocktails $25-40",
            "Fine wine $30-100/glass",
            "Private tastings $200-600",
            "Hotel bar premium service $200-500"
          ],
          tips: ["Top hotel bars offer exceptional service", "Private wine tastings available", "Rare whiskeys and wines available"]
        },
        incidentals: {
          amount: 30,
          examples: [
            "Luxury shopping $1000-10000",
            "5-star spa treatments $300-1000",
            "Personal shopping $300-800",
            "VIP event tickets $500-3000"
          ],
          tips: ["Union Square has luxury boutiques", "Hotel spas offer premium treatments", "Personal shoppers provide access to exclusive items"]
        }
      }
    },
    confidence: 'high'
  },

  'chicago': {
    dailyCost: { budget: 52, midRange: 115, luxury: 390 },
    accommodation: { budget: 78, midRange: 155, luxury: 275 }, // Blended: business city with strong Airbnb market (17% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 115, meals: 42, transport: 15, activities: 32, drinks: 26, incidentals: 15 },
      luxury: { total: 390, meals: 135, transport: 25, activities: 115, drinks: 85, incidentals: 30 }
    },
    detailedBreakdown: {
      budget: {
        total: 52,
        meals: {
          amount: 22,
          examples: [
            "Deep dish pizza slice $6-10",
            "Italian beef sandwich $8-12",
            "Polish sausage $5-8",
            "Ethnic neighborhood meals $10-18"
          ],
          tips: ["Deep dish pizza is tourist must-try", "Neighborhood ethnic food offers great value", "Happy hour specials 3-6pm"]
        },
        transport: {
          amount: 8,
          examples: [
            "CTA day pass $20",
            "Single L ride $2.50",
            "Bus fare $2.25",
            "Divvy bike share $15/day"
          ],
          tips: ["Ventra card works on all CTA", "L train covers most tourist areas", "Walking downtown is pleasant in good weather"]
        },
        activities: {
          amount: 16,
          examples: [
            "Millennium Park free",
            "Lakefront beaches free", 
            "Architecture walking tours $20-30",
            "Lincoln Park Zoo free"
          ],
          tips: ["Many parks and beaches are free", "Architecture tours are excellent value", "Museums have resident discount days"]
        },
        drinks: {
          amount: 8,
          examples: [
            "Local brewery beers $5-9",
            "Coffee shops $3-6",
            "Happy hour specials $4-8",
            "Sports bar beers $6-12"
          ],
          tips: ["Chicago has excellent craft beer scene", "Sports bars popular during games", "Happy hours common weekdays"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Navy Pier souvenirs $10-25",
            "Tips $5-15",
            "Public parking $8-15",
            "L train snacks $3-8"
          ],
          tips: ["Parking downtown can add up", "Tipping 18-20% standard", "Navy Pier has tourist shopping"]
        }
      },
      midRange: {
        total: 115,
        meals: {
          amount: 42,
          examples: [
            "Steakhouse dinner $35-60",
            "River North dining $25-45",
            "Craft cocktail dinner $30-50",
            "Ethnic fine dining $20-40"
          ],
          tips: ["River North has excellent restaurant scene", "Reservations recommended for popular spots", "BYOB restaurants offer value"]
        },
        transport: {
          amount: 15,
          examples: [
            "Uber rides $12-25",
            "Taxi rides $15-30",
            "Parking garages $20-35/day",
            "Car rental $45-80/day"
          ],
          tips: ["Rideshare common especially at night", "Parking garages safer than street", "Car useful for suburban attractions"]
        },
        activities: {
          amount: 32,
          examples: [
            "Museum admissions $15-25",
            "Architecture boat tour $40-50",
            "Sports tickets $50-150",
            "Theater shows $40-100"
          ],
          tips: ["Architecture boat tours are must-do", "Sports tickets vary wildly by team/season", "Theater district offers great shows"]
        },
        drinks: {
          amount: 26,
          examples: [
            "Craft cocktails $12-18",
            "Wine bars $10-20/glass",
            "Rooftop bars $15-25",
            "Brewery tours $15-30"
          ],
          tips: ["Rooftop bars offer great skyline views", "Craft cocktail scene is excellent", "Brewery tours popular weekend activity"]
        },
        incidentals: {
          amount: 15,
          examples: [
            "Magnificent Mile shopping $50-300",
            "Spa services $80-200",
            "Cubs/Sox merchandise $25-100",
            "Art galleries $10-30"
          ],
          tips: ["Magnificent Mile for major shopping", "Sports merchandise very popular", "Many galleries in River North"]
        }
      },
      luxury: {
        total: 390,
        meals: {
          amount: 135,
          examples: [
            "Michelin restaurants $150-350",
            "Celebrity chef dinners $100-250",
            "Private chef $250-600",
            "Wine pairing dinners $180-400"
          ],
          tips: ["Chicago has excellent Michelin dining scene", "Alinea requires advance booking", "Private chefs popular for groups"]
        },
        transport: {
          amount: 25,
          examples: [
            "Private driver $100-200/day",
            "Luxury car rental $150-400/day",
            "Helicopter tours $300-800",
            "Private jet charter $2500-8000"
          ],
          tips: ["Private drivers know the city well", "Helicopter tours offer unique skyline views", "Luxury cars for special occasions"]
        },
        activities: {
          amount: 115,
          examples: [
            "VIP sports experiences $300-1500",
            "Private museum tours $200-500",
            "Yacht charters $800-2500",
            "Exclusive cultural events $200-1000"
          ],
          tips: ["VIP sports experiences include premium seating", "Private tours avoid crowds", "Lake Michigan yacht charters popular"]
        },
        drinks: {
          amount: 85,
          examples: [
            "Premium cocktails $20-35",
            "Fine wine $25-80/glass",
            "Private tastings $150-500",
            "Hotel bar premium service $200-600"
          ],
          tips: ["Top hotel bars offer exceptional service", "Wine scene includes rare bottles", "Private tastings can be arranged"]
        },
        incidentals: {
          amount: 30,
          examples: [
            "Luxury shopping $500-5000",
            "5-star spa treatments $250-800",
            "Personal shopping $200-600",
            "VIP event tickets $500-2500"
          ],
          tips: ["Oak Street for luxury shopping", "Hotel spas offer premium treatments", "Personal shoppers provide insider access"]
        }
      }
    },
    confidence: 'high'
  },

  'miami': {
    dailyCost: { budget: 55, midRange: 125, luxury: 450 },
    accommodation: { budget: 78, midRange: 165, luxury: 285 }, // Blended: strong Airbnb presence, seasonal pricing (15-20% savings)
    breakdown: {
      budget: { total: 55, meals: 24, transport: 8, activities: 16, drinks: 9, incidentals: 8 },
      midRange: { total: 125, meals: 48, transport: 15, activities: 35, drinks: 27, incidentals: 15 },
      luxury: { total: 450, meals: 160, transport: 25, activities: 135, drinks: 100, incidentals: 30 }
    },
    confidence: 'high'
  },

  'las-vegas': {
    dailyCost: { budget: 58, midRange: 140, luxury: 580 },
    accommodation: { budget: 62, midRange: 128, luxury: 245 }, // Blended: casino comps + vacation rentals compete with hotels (20% savings)
    breakdown: {
      budget: { total: 58, meals: 22, transport: 8, activities: 13, drinks: 15, incidentals: 8 },
      midRange: { total: 140, meals: 40, transport: 12, activities: 35, drinks: 38, incidentals: 15 },
      luxury: { total: 580, meals: 120, transport: 20, activities: 180, drinks: 200, incidentals: 60 }
    },
    confidence: 'high'
  },

  'washington-d-c': {
    dailyCost: { budget: 58, midRange: 128, luxury: 430 },
    accommodation: { budget: 85, midRange: 175, luxury: 298 }, // Blended: business-focused market, moderate Airbnb presence (15% savings)
    breakdown: {
      budget: { total: 58, meals: 24, transport: 10, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 128, meals: 48, transport: 18, activities: 35, drinks: 27, incidentals: 15 },
      luxury: { total: 430, meals: 150, transport: 30, activities: 125, drinks: 95, incidentals: 30 }
    },
    confidence: 'high'
  },

  'boston': {
    dailyCost: { budget: 55, midRange: 125, luxury: 440 },
    accommodation: { budget: 92, midRange: 185, luxury: 315 }, // Blended: educated market with good Airbnb options (15% savings)
    breakdown: {
      budget: { total: 55, meals: 24, transport: 8, activities: 16, drinks: 9, incidentals: 8 },
      midRange: { total: 125, meals: 48, transport: 15, activities: 35, drinks: 27, incidentals: 15 },
      luxury: { total: 440, meals: 155, transport: 25, activities: 130, drinks: 100, incidentals: 30 }
    },
    confidence: 'high'
  },

  'seattle': {
    dailyCost: { budget: 52, midRange: 115, luxury: 400 },
    accommodation: { budget: 78, midRange: 155, luxury: 268 }, // Blended: tech-friendly market with strong Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 115, meals: 42, transport: 15, activities: 32, drinks: 26, incidentals: 15 },
      luxury: { total: 400, meals: 140, transport: 25, activities: 120, drinks: 85, incidentals: 30 }
    },
    confidence: 'high'
  },

  'atlanta': {
    dailyCost: { budget: 45, midRange: 98, luxury: 340 },
    accommodation: { budget: 65, midRange: 125, luxury: 208 }, // Blended: affordable market with good vacation rental penetration (20% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 12, activities: 28, drinks: 22, incidentals: 12 },
      luxury: { total: 340, meals: 115, transport: 20, activities: 105, drinks: 70, incidentals: 30 }
    },
    confidence: 'high'
  },

  'denver': {
    dailyCost: { budget: 48, midRange: 105, luxury: 360 },
    accommodation: { budget: 68, midRange: 135, luxury: 225 }, // Blended: outdoor tourism market with good vacation rental options (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 38, transport: 12, activities: 32, drinks: 23, incidentals: 12 },
      luxury: { total: 360, meals: 125, transport: 20, activities: 115, drinks: 70, incidentals: 30 }
    },
    confidence: 'high'
  },

  'orlando': {
    dailyCost: { budget: 48, midRange: 105, luxury: 360 },
    accommodation: { budget: 72, midRange: 148, luxury: 265 }, // Blended: theme park tourism, strong vacation rental market (20% savings)
    breakdown: {
      budget: { total: 48, meals: 22, transport: 12, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 20, activities: 25, drinks: 15, incidentals: 12 },
      luxury: { total: 360, meals: 125, transport: 35, activities: 110, drinks: 65, incidentals: 35 }
    },
    confidence: 'high'
  },

  'dallas': {
    dailyCost: { budget: 42, midRange: 88, luxury: 310 },
    accommodation: { budget: 58, midRange: 115, luxury: 185 }, // Blended: business-friendly market with competitive vacation rentals (22% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 8, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 88, meals: 34, transport: 12, activities: 22, drinks: 15, incidentals: 12 },
      luxury: { total: 310, meals: 110, transport: 18, activities: 85, drinks: 67, incidentals: 30 }
    },
    confidence: 'high'
  },

  'houston': {
    dailyCost: { budget: 40, midRange: 85, luxury: 300 },
    accommodation: { budget: 55, midRange: 105, luxury: 175 }, // Blended: business city with affordable vacation rental market (20% savings)
    breakdown: {
      budget: { total: 40, meals: 18, transport: 8, activities: 9, drinks: 5, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 21, drinks: 15, incidentals: 12 },
      luxury: { total: 300, meals: 105, transport: 18, activities: 80, drinks: 67, incidentals: 30 }
    },
    confidence: 'high'
  },

  'philadelphia': {
    dailyCost: { budget: 45, midRange: 95, luxury: 330 },
    accommodation: { budget: 68, midRange: 125, luxury: 205 }, // Blended: historic tourism with growing Airbnb market (18% savings)
    breakdown: {
      budget: { total: 45, meals: 20, transport: 8, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 95, meals: 36, transport: 12, activities: 25, drinks: 17, incidentals: 12 },
      luxury: { total: 330, meals: 115, transport: 18, activities: 95, drinks: 72, incidentals: 30 }
    },
    confidence: 'high'
  },

  'san-diego': {
    dailyCost: { budget: 52, midRange: 110, luxury: 380 },
    accommodation: { budget: 88, midRange: 168, luxury: 278 }, // Blended: coastal tourism with strong vacation rental market (18% savings)
    breakdown: {
      budget: { total: 52, meals: 24, transport: 8, activities: 14, drinks: 8, incidentals: 8 },
      midRange: { total: 110, meals: 42, transport: 15, activities: 28, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 25, activities: 110, drinks: 80, incidentals: 30 }
    },
    confidence: 'high'
  },

  // CANADA
  'toronto': {
    dailyCost: { budget: 45, midRange: 98, luxury: 350 },
    accommodation: { budget: 72, midRange: 145, luxury: 248 }, // Blended: major business city with good Airbnb penetration (17% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 15, activities: 27, drinks: 20, incidentals: 12 },
      luxury: { total: 350, meals: 125, transport: 25, activities: 105, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'vancouver': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 78, midRange: 158, luxury: 268 }, // Blended: expensive west coast city with strong Airbnb market (15% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 15, activities: 30, drinks: 20, incidentals: 12 },
      luxury: { total: 380, meals: 135, transport: 25, activities: 120, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'montreal': {
    dailyCost: { budget: 40, midRange: 88, luxury: 320 },
    accommodation: { budget: 58, midRange: 118, luxury: 198 }, // Blended: affordable city with strong francophone Airbnb culture (20% savings)
    breakdown: {
      budget: { total: 40, meals: 16, transport: 6, activities: 14, drinks: 6, incidentals: 8 },
      midRange: { total: 88, meals: 32, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 320, meals: 115, transport: 20, activities: 100, drinks: 60, incidentals: 25 }
    },
    confidence: 'high'
  },

  'ottawa': {
    dailyCost: { budget: 42, midRange: 88, luxury: 310 },
    accommodation: { budget: 62, midRange: 125, luxury: 218 }, // Blended: government city with good Airbnb options (18% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 8, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 88, meals: 34, transport: 12, activities: 24, drinks: 18, incidentals: 12 },
      luxury: { total: 310, meals: 110, transport: 20, activities: 95, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'calgary': {
    dailyCost: { budget: 48, midRange: 100, luxury: 350 },
    accommodation: { budget: 68, midRange: 138, luxury: 238 }, // Blended: western Canadian city with good vacation rental market (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 10, activities: 14, drinks: 6, incidentals: 8 },
      midRange: { total: 100, meals: 38, transport: 15, activities: 28, drinks: 19, incidentals: 12 },
      luxury: { total: 350, meals: 125, transport: 25, activities: 105, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'quebec-city': {
    dailyCost: { budget: 40, midRange: 85, luxury: 300 },
    accommodation: { budget: 58, midRange: 115, luxury: 195 }, // Blended: historic French city with strong vacation rental culture (20% savings)
    breakdown: {
      budget: { total: 40, meals: 16, transport: 6, activities: 14, drinks: 6, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 25, drinks: 16, incidentals: 12 },
      luxury: { total: 300, meals: 105, transport: 20, activities: 95, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  // LATIN AMERICA
  'mexico-city': {
    dailyCost: { budget: 50, midRange: 75, luxury: 200 },
    accommodation: { budget: 45, midRange: 85, luxury: 175 }, // Blended: popular destination, Airbnb pricing normalized (20% savings)
    breakdown: {
      budget: { total: 50, meals: 22, transport: 8, activities: 15, drinks: 10, incidentals: 8 },
      midRange: { total: 75, meals: 32, transport: 12, activities: 25, drinks: 18, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 58, drinks: 30, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 50,
        meals: {
          amount: 22,
          examples: [
            "Breakfast: Café con leche + pan dulce $3-4",
            "Lunch: Tacos de pastor (4-5) $4-6",
            "Dinner: Comida corrida $6-10",
            "Snacks: Elote or esquites $2-3"
          ],
          tips: ["Avoid Polanco/Roma Norte for cheaper eats", "Try mercados for authentic meals"]
        },
        transport: {
          amount: 8,
          examples: [
            "Metro rides: $0.25 per trip",
            "Metrobus: $0.30 per trip",
            "Short Uber rides: $2-4",
            "Pesero (minibus): $0.30"
          ],
          tips: ["Metro is cheapest but crowded", "Uber is safe and affordable"]
        },
        activities: {
          amount: 15,
          examples: [
            "Museums: $3-6 entry (many free on Sundays)",
            "Teotihuacan day trip: $8-12",
            "Walking tours: Free (tip $5-8)",
            "Chapultepec Park: Free"
          ],
          tips: ["Many museums free on Sundays", "Book Frida Kahlo museum in advance"]
        },
        drinks: {
          amount: 10,
          examples: [
            "Pulque: $2-3",
            "Mezcal shot: $3-5",
            "Fresh agua fresca: $1-2",
            "Coffee: $2-3"
          ]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Tips: $1-2 per service",
            "Market souvenirs: $3-8",
            "Phone data: $10-15"
          ]
        }
      },
      midRange: {
        total: 75,
        meals: {
          amount: 32,
          examples: [
            "Breakfast: Nice café $6-8",
            "Lunch: Restaurant in Roma Norte $10-15",
            "Dinner: Traditional cantina $12-18",
            "Cocktails: $5-8"
          ]
        },
        transport: {
          amount: 12,
          examples: [
            "Daily Uber rides: $8-12",
            "Airport taxi: $15-20",
            "Tourist bus: $10-15"
          ]
        },
        activities: {
          amount: 25,
          examples: [
            "Frida Kahlo Museum: $15",
            "Lucha libre tickets: $10-20",
            "Xochimilco trajinera: $15-25",
            "Guided city tour: $25-35"
          ]
        },
        drinks: {
          amount: 18,
          examples: [
            "Mezcal tasting: $8-12",
            "Restaurant cocktails: $6-10",
            "Craft beer: $4-6"
          ]
        },
        incidentals: {
          amount: 12,
          examples: [
            "Shopping in markets: $15-25",
            "Tips: $3-5 per service",
            "Miscellaneous: $5-10"
          ]
        }
      },
      luxury: {
        total: 180,
        meals: {
          amount: 65,
          examples: [
            "5-star hotel breakfast: $15-25",
            "Fine dining lunch: $25-35",
            "Michelin-level dinner: $40-60",
            "Premium mezcal tasting: $20-30"
          ]
        },
        transport: {
          amount: 12,
          examples: [
            "Private driver: $40-60/day",
            "Luxury airport transfer: $25-35",
            "Premium car service: $15-25/trip"
          ]
        },
        activities: {
          amount: 58,
          examples: [
            "Private Teotihuacan tour: $80-120",
            "VIP lucha libre experience: $50-80",
            "Private museum tours: $100-150",
            "Helicopter city tour: $200-300"
          ]
        },
        drinks: {
          amount: 30,
          examples: [
            "High-end mezcal bars: $12-20",
            "Rooftop cocktails: $10-15",
            "Premium wine: $8-15/glass"
          ]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Luxury shopping: $50-200",
            "Concierge services: $10-20",
            "Premium experiences: $20-50"
          ]
        }
      }
    },
    confidence: 'high'
  },

  'cancun': {
    dailyCost: { budget: 35, midRange: 78, luxury: 290 },
    accommodation: { budget: 52, midRange: 118, luxury: 225 }, // Blended: major resort destination with vacation rental alternatives (15% savings)
    breakdown: {
      budget: { total: 35, meals: 15, transport: 6, activities: 11, drinks: 3, incidentals: 8 },
      midRange: { total: 78, meals: 30, transport: 10, activities: 26, drinks: 12, incidentals: 12 },
      luxury: { total: 290, meals: 100, transport: 20, activities: 95, drinks: 50, incidentals: 25 }
    },
    confidence: 'high'
  },

  'rio-de-janeiro': {
    dailyCost: { budget: 48, midRange: 82, luxury: 250 },
    accommodation: { budget: 55, midRange: 98, luxury: 185 }, // Blended: major tourist city with strong vacation rental culture (20% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 8, incidentals: 8 },
      midRange: { total: 82, meals: 32, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 230, meals: 82, transport: 15, activities: 78, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'sao-paulo': {
    dailyCost: { budget: 52, midRange: 90, luxury: 280 },
    accommodation: { budget: 48, midRange: 85, luxury: 165 }, // Blended: business center with emerging vacation rental market (18% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 10, activities: 15, drinks: 8, incidentals: 8 },
      midRange: { total: 90, meals: 35, transport: 15, activities: 28, drinks: 18, incidentals: 12 },
      luxury: { total: 260, meals: 95, transport: 15, activities: 85, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'buenos-aires': {
    dailyCost: { budget: 48, midRange: 78, luxury: 235 },
    accommodation: { budget: 42, midRange: 78, luxury: 160 }, // Blended: South American capital with strong Airbnb culture (22% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 6, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 78, meals: 32, transport: 10, activities: 25, drinks: 18, incidentals: 12 },
      luxury: { total: 215, meals: 78, transport: 10, activities: 75, drinks: 37, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 48,
        meals: {
          amount: 20,
          examples: ["Empanadas $2-4 each", "Pizza slice $3-6", "Parrilla lunch $8-15", "Choripán $3-5"],
          tips: ["Empanadas are everywhere and delicious", "Pizza porteña style is unique", "Lunch is often the main meal"]
        },
        transport: {
          amount: 6,
          examples: ["Subte single ride $0.30", "Bus ride $0.30", "Walking city center free", "Bike sharing $2/day"],
          tips: ["Public transport extremely cheap", "SUBE card works for all transport", "City center very walkable"]
        },
        activities: {
          amount: 16,
          examples: ["Recoleta Cemetery free", "Caminito neighborhood free", "Plaza de Mayo free", "Tango shows $15-30"],
          tips: ["Many neighborhoods perfect for walking", "Free tango performances in San Telmo", "Museums often have free days"]
        },
        drinks: {
          amount: 8,
          examples: ["Café cortado $1-3", "Wine bottle $4-8", "Beer bottle $2-4", "Mate sharing free"],
          tips: ["Coffee culture very strong", "Wine excellent value for quality", "Mate tea sharing is social tradition"]
        },
        incidentals: {
          amount: 8,
          examples: ["Leather goods $10-50", "Tango souvenirs $5-20", "SIM card $10-15", "Market shopping $5-25"],
          tips: ["Argentina famous for leather goods", "Flea markets great for unique finds", "Bring cash as cards not always accepted"]
        }
      },
      midRange: {
        total: 78,
        meals: {
          amount: 32,
          examples: ["Steakhouse dinner $15-30", "Wine bar with food $20-40", "Italian restaurant $12-25", "Brunch in Palermo $10-20"],
          tips: ["Beef quality is world-renowned", "Dinner typically eaten very late", "Palermo neighborhood great for dining"]
        },
        transport: {
          amount: 10,
          examples: ["Taxi across city $8-15", "Uber rides $5-12", "Remise (private car) $10-20", "Airport bus $3-5"],
          tips: ["Taxis relatively affordable", "Remise cars safer for longer distances", "Radio taxis more reliable"]
        },
        activities: {
          amount: 25,
          examples: ["Professional tango show $25-50", "Football match $15-40", "Day trip to Tigre $10-20", "Museo Nacional $5-10"],
          tips: ["Tango shows often include dinner", "Football (soccer) is huge cultural experience", "River tours from Puerto Madero popular"]
        },
        drinks: {
          amount: 18,
          examples: ["Craft cocktails $8-15", "Wine bar tastings $15-30", "Rooftop bars $10-20", "Malbec bottles $8-20"],
          tips: ["Buenos Aires has vibrant nightlife", "Malbec wine is national specialty", "Pre-drinking (previa) common before clubs"]
        },
        incidentals: {
          amount: 12,
          examples: ["Shopping in Palermo $20-100", "Antique market finds $10-80", "Tango lessons $15-30", "Spa treatments $25-60"],
          tips: ["Sunday antique market in San Telmo", "Tango lessons great cultural experience", "Shopping districts vary by neighborhood"]
        }
      },
      luxury: {
        total: 215,
        meals: {
          amount: 78,
          examples: ["Premium steakhouse $40-80", "Wine pairing dinner $60-120", "Celebrity chef restaurant $50-100", "Private asado experience $80-150"],
          tips: ["Book premium parrillas in advance", "Wine pairings showcase local vintages", "Private asado includes full cultural experience"]
        },
        transport: {
          amount: 10,
          examples: ["Private car service $25-50", "Helicopter tour $150-300", "Luxury airport transfer $30-60", "Vintage car tours $100-200"],
          tips: ["Private drivers often speak English", "Helicopter tours offer unique city views", "Classic car tours very popular"]
        },
        activities: {
          amount: 75,
          examples: ["VIP tango experience $80-150", "Private city tour $100-200", "Exclusive wine tour $120-250", "Private cooking class $80-150"],
          tips: ["VIP tango includes private performance", "Wine tours to nearby regions available", "Cooking classes focus on traditional techniques"]
        },
        drinks: {
          amount: 37,
          examples: ["Premium wine tastings $30-80", "Exclusive cocktail bars $15-30", "Private wine cellar visits $50-150", "Hotel rooftop bars $12-25"],
          tips: ["Argentina produces world-class wines", "Some bars require reservations", "Hotel bars offer sophisticated atmosphere"]
        },
        incidentals: {
          amount: 25,
          examples: ["High-end leather goods $100-500", "Designer shopping $50-300", "Luxury spa day $80-200", "Personal tango instruction $60-120"],
          tips: ["Leather goods are exceptional quality", "Personal shoppers available", "Private tango lessons with professionals"]
        }
      }
    },
    confidence: 'high'
  },

  'santiago': {
    dailyCost: { budget: 52, midRange: 90, luxury: 280 },
    accommodation: { budget: 52, midRange: 92, luxury: 180 }, // Blended: Chilean capital with growing vacation rental market (18% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 18, drinks: 8, incidentals: 8 },
      midRange: { total: 90, meals: 35, transport: 12, activities: 32, drinks: 18, incidentals: 12 },
      luxury: { total: 260, meals: 90, transport: 12, activities: 95, drinks: 38, incidentals: 25 }
    },
    confidence: 'high'
  },

  'lima': {
    dailyCost: { budget: 46, midRange: 72, luxury: 215 },
    accommodation: { budget: 38, midRange: 68, luxury: 145 }, // Blended: Peruvian capital with emerging vacation rental options (20% savings)
    breakdown: {
      budget: { total: 46, meals: 19, transport: 7, activities: 15, drinks: 8, incidentals: 8 },
      midRange: { total: 72, meals: 28, transport: 10, activities: 24, drinks: 15, incidentals: 12 },
      luxury: { total: 195, meals: 70, transport: 12, activities: 68, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'bogota': {
    dailyCost: { budget: 45, midRange: 68, luxury: 190 },
    breakdown: {
      budget: { total: 45, meals: 18, transport: 6, activities: 15, drinks: 8, incidentals: 8 },
      midRange: { total: 68, meals: 26, transport: 8, activities: 22, drinks: 15, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 8, activities: 57, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  // EUROPE
  'london': {
    dailyCost: { budget: 58, midRange: 128, luxury: 460 },
    accommodation: { budget: 95, midRange: 185, luxury: 368 }, // Blended: expensive hotels, Airbnb regulated but available (12% savings)
    breakdown: {
      budget: { total: 58, meals: 24, transport: 10, activities: 18, drinks: 8, incidentals: 8 },
      midRange: { total: 128, meals: 48, transport: 18, activities: 38, drinks: 24, incidentals: 15 },
      luxury: { total: 460, meals: 160, transport: 30, activities: 140, drinks: 100, incidentals: 30 }
    },
    detailedBreakdown: {
      budget: {
        total: 58,
        meals: {
          amount: 24,
          examples: ["Pub lunch £8-12", "Fish & chips £6-10", "Indian curry £7-12", "Market food £4-8"],
          tips: ["Pub lunches offer great value", "Borough Market for diverse food options", "Many museums have affordable cafés"]
        },
        transport: {
          amount: 10,
          examples: ["Oyster daily cap £7.70", "Bus single £1.75", "Walking central London free", "Boris bikes £2/30min"],
          tips: ["Oyster card caps daily spending", "Walking often faster than tube", "Night tube available weekends"]
        },
        activities: {
          amount: 18,
          examples: ["British Museum free", "Tate Modern free", "Hyde Park free", "Westminster Abbey £25"],
          tips: ["Most major museums are free", "Walking tours available by donation", "Royal Parks offer great experiences"]
        },
        drinks: {
          amount: 8,
          examples: ["Pub pint £4-6", "Coffee shop £2-4", "Wetherspoons beer £2-4", "Afternoon tea £15-25"],
          tips: ["Happy hour varies by pub", "Wetherspoons reliable budget option", "Free water always available"]
        },
        incidentals: {
          amount: 8,
          examples: ["Oyster card top-up £10-20", "Souvenir shops £3-10", "Public toilet £0.20", "Phone charger £5-15"],
          tips: ["Contactless payment widely accepted", "Many stores offer tax-free shopping", "Libraries offer free wifi and facilities"]
        }
      },
      midRange: {
        total: 128,
        meals: {
          amount: 48,
          examples: ["Restaurant dinner £20-35", "Sunday roast £16-25", "Gastropub meal £15-28", "Afternoon tea £25-45"],
          tips: ["Pre-theater menus offer good value", "Sunday roasts quintessentially British", "Book popular restaurants in advance"]
        },
        transport: {
          amount: 18,
          examples: ["Black cab short rides £8-15", "Uber rides £6-20", "Airport express £15-25", "River bus £7-12"],
          tips: ["Black cabs iconic but expensive", "River buses scenic alternative", "Heathrow Express fastest to airport"]
        },
        activities: {
          amount: 38,
          examples: ["Tower of London £30", "London Eye £27", "West End show £25-80", "Thames cruise £15-30"],
          tips: ["Advance booking often cheaper", "Matinee shows usually less expensive", "Many attractions offer family tickets"]
        },
        drinks: {
          amount: 24,
          examples: ["Cocktail bars £10-15", "Wine bars £8-12/glass", "Rooftop bars £12-18", "Theater district drinks £8-15"],
          tips: ["Happy hour common 5-7pm", "Wine bars around Covent Garden", "Theater bars can be expensive"]
        },
        incidentals: {
          amount: 15,
          examples: ["Oxford Street shopping £20-100", "Souvenir gifts £10-30", "Museum shop items £8-25", "Phone/internet £10-20"],
          tips: ["Oxford Street for mainstream shopping", "Museum shops offer unique items", "Markets like Camden offer alternatives"]
        }
      },
      luxury: {
        total: 460,
        meals: {
          amount: 160,
          examples: ["Michelin starred dinner £80-200", "The Ritz afternoon tea £58-75", "Harrods dining £50-150", "Celebrity chef restaurants £60-180"],
          tips: ["Book Michelin restaurants well in advance", "Afternoon tea at luxury hotels iconic", "Private dining rooms available at top venues"]
        },
        transport: {
          amount: 30,
          examples: ["Private car service £40-80", "Helicopter tour £200-500", "Luxury airport transfer £60-120", "Rolls Royce hire £300-800"],
          tips: ["Private drivers know best routes", "Helicopter tours offer unique perspectives", "Luxury car services include chauffeur"]
        },
        activities: {
          amount: 140,
          examples: ["Private royal tour £200-500", "VIP West End experience £150-400", "Exclusive gallery access £100-300", "Private Thames cruise £300-800"],
          tips: ["Private tours avoid crowds completely", "VIP theater includes premium seats and service", "Exclusive access often includes expert guides"]
        },
        drinks: {
          amount: 100,
          examples: ["Hotel cocktail bars £18-35", "Private members clubs £20-50", "Whiskey tastings £50-150", "Champagne bars £25-60"],
          tips: ["Hotel bars offer sophisticated atmosphere", "Some bars require membership or introduction", "Whiskey scene particularly strong in London"]
        },
        incidentals: {
          amount: 30,
          examples: ["Harrods shopping £100-1000", "Savile Row tailoring £2000-10000", "Luxury spa treatments £150-400", "Personal shopping services £200-500"],
          tips: ["Harrods and Selfridges for ultimate luxury", "Savile Row for bespoke clothing", "Luxury spas often in historic buildings"]
        }
      }
    },
    confidence: 'high'
  },

  'paris': {
    dailyCost: { budget: 55, midRange: 125, luxury: 450 },
    accommodation: { budget: 88, midRange: 175, luxury: 332 }, // Blended: tourist market with good Airbnb options (15% savings)
    breakdown: {
      budget: { total: 55, meals: 24, transport: 8, activities: 17, drinks: 8, incidentals: 8 },
      midRange: { total: 125, meals: 48, transport: 15, activities: 36, drinks: 26, incidentals: 15 },
      luxury: { total: 450, meals: 160, transport: 25, activities: 135, drinks: 100, incidentals: 30 }
    },
    confidence: 'high'
  },

  'rome': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 72, midRange: 145, luxury: 285 }, // Blended: tourist city with strong Airbnb culture (16% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 6, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 12, activities: 32, drinks: 21, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 20, activities: 120, drinks: 80, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 48,
        meals: {
          amount: 20,
          examples: [
            "Pizza al taglio €3-6",
            "Supplì street food €1.50-3",
            "Trattoria lunch €12-18",
            "Gelato €2-4"
          ],
          tips: ["Pizza al taglio is cheap and authentic", "Eat where locals eat for best prices", "Aperitivo often includes free snacks"]
        },
        transport: {
          amount: 6,
          examples: [
            "Single metro ticket €1.50",
            "Day pass €7",
            "Bus fare €1.50",
            "Walking historic center free"
          ],
          tips: ["Roma Pass includes transport and museums", "Walking is often faster in historic center", "Validate tickets or face fines"]
        },
        activities: {
          amount: 16,
          examples: [
            "Pantheon free",
            "Spanish Steps free",
            "Trevi Fountain free",
            "Vatican Museums €17"
          ],
          tips: ["Many iconic sites are free", "First Sunday of month museums free", "Book Vatican in advance"]
        },
        drinks: {
          amount: 8,
          examples: [
            "Espresso at bar €1-2",
            "Wine by glass €3-6",
            "Aperitivo spritz €6-10",
            "Water bottle €1-2"
          ],
          tips: ["Standing at bar much cheaper than sitting", "Aperitivo hour 6-8pm", "Tap water is safe and free"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Souvenir postcards €1-3",
            "Tips €3-8",
            "Public restrooms €1",
            "Phone card €5-15"
          ],
          tips: ["Tipping not obligatory but appreciated", "Public restrooms often cost €1", "Many churches accept small donations"]
        }
      },
      midRange: {
        total: 105,
        meals: {
          amount: 40,
          examples: [
            "Osteria dinner €25-40",
            "Wine with meal €15-25",
            "Roman specialties €20-35",
            "Quality gelato €4-8"
          ],
          tips: ["Book restaurants in Trastevere", "Try carbonara, cacio e pepe, amatriciana", "Wine at lunch is normal"]
        },
        transport: {
          amount: 12,
          examples: [
            "Taxi rides €10-20",
            "Roma Pass 3-day €38.50",
            "Airport train €14",
            "Hop-on-hop-off €25"
          ],
          tips: ["Roma Pass includes transport and skip-lines", "Taxis useful with luggage", "Airport train faster than bus"]
        },
        activities: {
          amount: 32,
          examples: [
            "Colosseum + Forum €16",
            "Vatican Museums €17",
            "Capitoline Museums €15",
            "Borghese Gallery €15"
          ],
          tips: ["Skip-the-line tickets essential", "Roma Pass gives priority access", "Book Borghese Gallery well in advance"]
        },
        drinks: {
          amount: 21,
          examples: [
            "Wine bar €8-15/glass",
            "Cocktails €10-18",
            "Aperitivo €8-15",
            "Restaurant wine €20-40/bottle"
          ],
          tips: ["Wine bars offer excellent local wines", "Aperitivo includes snacks", "House wine usually good value"]
        },
        incidentals: {
          amount: 15,
          examples: [
            "Shopping Via del Corso €30-150",
            "Leather goods €50-300",
            "Art prints €20-80",
            "Private guide tips €10-30"
          ],
          tips: ["Via del Corso for mainstream shopping", "Trastevere for artisan goods", "Negotiate at outdoor markets"]
        }
      },
      luxury: {
        total: 380,
        meals: {
          amount: 135,
          examples: [
            "Michelin restaurants €100-250",
            "Rooftop dining €80-150",
            "Private chef €200-500",
            "Wine pairing dinners €150-300"
          ],
          tips: ["Book Michelin restaurants well ahead", "Rooftop restaurants offer views of ruins", "Private chefs popular for groups"]
        },
        transport: {
          amount: 20,
          examples: [
            "Private driver €80-150/day",
            "Luxury car rental €150-400/day",
            "Helicopter tours €200-500",
            "Private transfers €40-100"
          ],
          tips: ["Private drivers know traffic patterns", "Helicopter tours offer unique perspectives", "Luxury transfers for comfort"]
        },
        activities: {
          amount: 120,
          examples: [
            "Private Vatican tour €300-600",
            "After-hours Colosseum €150-300",
            "Private art tours €200-500",
            "VIP archaeological sites €200-800"
          ],
          tips: ["Private tours avoid crowds", "After-hours access to major sites", "VIP experiences include expert guides"]
        },
        drinks: {
          amount: 80,
          examples: [
            "Fine wine €25-100/glass",
            "Hotel bar cocktails €18-35",
            "Private wine tastings €100-400",
            "Champagne service €50-200"
          ],
          tips: ["Hotel bars offer sophisticated atmosphere", "Private wine tastings in cellars", "Rare Italian wines available"]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Luxury shopping €500-5000",
            "5-star spa treatments €200-600",
            "Personal shopping €200-500",
            "VIP cultural events €300-1500"
          ],
          tips: ["Via Condotti for luxury shopping", "Hotel spas offer premium treatments", "Personal shoppers provide access to exclusive items"]
        }
      }
    },
    confidence: 'high'
  },

  'barcelona': {
    dailyCost: { budget: 45, midRange: 98, luxury: 360 },
    accommodation: { budget: 68, midRange: 135, luxury: 248 }, // Blended: popular tourist city with regulated but active Airbnb market (18% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 6, activities: 15, drinks: 8, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 12, activities: 30, drinks: 20, incidentals: 15 },
      luxury: { total: 360, meals: 125, transport: 20, activities: 115, drinks: 75, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 45,
        meals: {
          amount: 18,
          examples: ["Menu del día €8-12", "Tapas crawl €15-20", "Mercado food court €6-9", "Pintxos bar €2-4 per piece"],
          tips: ["Many restaurants offer lunch menus", "Happy hour tapas 6-8pm", "Markets like Boquería have affordable food courts"]
        },
        transport: {
          amount: 6,
          examples: ["Metro day pass €8.40", "Bus single ticket €2.40", "Bicing bike share €35/year", "Walking tours free"],
          tips: ["T-Casual card offers 10 trips for €11.35", "Many attractions walkable in old city", "Avoid taxis during peak hours"]
        },
        activities: {
          amount: 15,
          examples: ["Sagrada Familia €26", "Park Güell €10", "Beach time free", "Free museum Sundays"],
          tips: ["Many churches free except Sagrada Familia", "Beaches are completely free", "First Sunday monthly many museums free"]
        },
        drinks: {
          amount: 8,
          examples: ["Local beer €2-4", "House wine €3-5", "Coffee €1.50-2.50", "Horchata €2-3"],
          tips: ["Standing at bar cheaper than table service", "Vermut (vermouth) is local tradition", "Coffee culture strong - try cortado"]
        },
        incidentals: {
          amount: 8,
          examples: ["Public restroom €0.50", "Souvenir magnets €2-5", "SIM card €15-20", "Laundromat €5-8"],
          tips: ["Many museums/cafes have free wifi", "Pharmacies everywhere for basics", "Public fountains for water refills"]
        }
      },
      midRange: {
        total: 98,
        meals: {
          amount: 36,
          examples: ["Traditional paella €16-25", "Gothic Quarter restaurants €20-35", "Gracia neighborhood dining €18-28", "Wine bar with tapas €25-40"],
          tips: ["Book dinner after 9pm like locals", "Explore neighborhoods beyond Las Ramblas", "Try vermouth hour (6-8pm) for authentic experience"]
        },
        transport: {
          amount: 12,
          examples: ["Metro weekly pass €30", "Taxi short rides €8-15", "Airport train €4.60", "Tourist bus €30/day"],
          tips: ["Airport train faster than bus", "Uber/Cabify competitive with taxis", "Consider walking + occasional metro"]
        },
        activities: {
          amount: 30,
          examples: ["Casa Batlló €29", "Picasso Museum €14", "FC Barcelona tour €26", "Flamenco show €35-45"],
          tips: ["Skip-the-line tickets worth it for major sites", "Book football tours in advance", "Authentic flamenco in Gràcia neighborhood"]
        },
        drinks: {
          amount: 20,
          examples: ["Craft cocktails €8-12", "Wine bars €6-10/glass", "Rooftop bars €10-15", "Sangria €8-12"],
          tips: ["Cocktail scene centered in Born/El Raval", "Spanish wine excellent value", "Avoid tourist trap sangria"]
        },
        incidentals: {
          amount: 15,
          examples: ["Shopping in Passeig de Gràcia €20-50", "Pharmacy items €8-15", "Tourist gifts €10-25", "Dry cleaning €8-12"],
          tips: ["El Corte Inglés for quality shopping", "Spanish pharmacy brands excellent", "Avoid Las Ramblas for shopping"]
        }
      },
      luxury: {
        total: 360,
        meals: {
          amount: 125,
          examples: ["Michelin-starred tasting menu €150-250", "Rooftop dining with views €80-120", "Premium seafood restaurants €60-90", "Celebrity chef establishments €100-180"],
          tips: ["Book Michelin restaurants weeks in advance", "Hotel rooftops offer stunning city views", "Consider lunch tasting menus for better value"]
        },
        transport: {
          amount: 20,
          examples: ["Private airport transfer €45-60", "Premium taxi services €15-25", "Helicopter tours €180-300", "Private driver €50/hour"],
          tips: ["Book airport transfers in advance", "Traffic can be heavy during rush hours", "Walking still fastest in Gothic Quarter"]
        },
        activities: {
          amount: 115,
          examples: ["Private Gaudí tour €200-300", "VIP football match €150-400", "Sailing boat rental €400/day", "Exclusive art gallery tours €100-150"],
          tips: ["Private tours avoid crowds completely", "Camp Nou experiences vary by season", "Sunset sailing tours most popular"]
        },
        drinks: {
          amount: 75,
          examples: ["Hotel cocktail bars €15-25", "Premium wine tastings €40-80", "Champagne bars €20-40", "Whiskey clubs €18-30"],
          tips: ["Hotel Majestic has stunning views", "Cava (Spanish champagne) excellent local option", "Speakeasies hidden throughout city"]
        },
        incidentals: {
          amount: 25,
          examples: ["Designer shopping €50-200", "Spa treatments €80-150", "Personal shopper €100/day", "Premium travel insurance €15-25"],
          tips: ["Passeig de Gràcia for luxury brands", "Hotel spas often open to non-guests", "Personal shoppers know best local boutiques"]
        }
      }
    },
    confidence: 'high'
  },

  'amsterdam': {
    dailyCost: { budget: 52, midRange: 110, luxury: 420 },
    accommodation: { budget: 78, midRange: 158, luxury: 295 }, // Blended: tourist-friendly Airbnb market with good savings (18% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 15, drinks: 9, incidentals: 8 },
      midRange: { total: 110, meals: 42, transport: 15, activities: 30, drinks: 20, incidentals: 12 },
      luxury: { total: 420, meals: 140, transport: 25, activities: 120, drinks: 95, incidentals: 40 }
    },
    confidence: 'high'
  },

  'berlin': {
    dailyCost: { budget: 42, midRange: 88, luxury: 330 },
    accommodation: { budget: 55, midRange: 115, luxury: 198 }, // Blended: affordable city with strong Airbnb culture (20% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 6, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 88, meals: 32, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 330, meals: 115, transport: 20, activities: 100, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'vienna': {
    dailyCost: { budget: 48, midRange: 100, luxury: 380 },
    accommodation: { budget: 65, midRange: 128, luxury: 228 }, // Blended: historic city with growing Airbnb market (16% savings)
    breakdown: {
      budget: { total: 48, meals: 22, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 100, meals: 40, transport: 15, activities: 28, drinks: 17, incidentals: 12 },
      luxury: { total: 380, meals: 135, transport: 30, activities: 110, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'zurich': {
    dailyCost: { budget: 95, midRange: 195, luxury: 720 },
    accommodation: { budget: 142, midRange: 285, luxury: 485 }, // Blended: expensive Swiss market with limited but premium Airbnb options (8% savings)
    breakdown: {
      budget: { total: 95, meals: 42, transport: 18, activities: 25, drinks: 10, incidentals: 12 },
      midRange: { total: 195, meals: 78, transport: 35, activities: 52, drinks: 30, incidentals: 20 },
      luxury: { total: 720, meals: 260, transport: 60, activities: 220, drinks: 145, incidentals: 35 }
    },
    confidence: 'high'
  },

  'copenhagen': {
    dailyCost: { budget: 68, midRange: 145, luxury: 530 },
    accommodation: { budget: 95, midRange: 185, luxury: 318 }, // Blended: expensive Nordic market with growing Airbnb acceptance (12% savings)
    breakdown: {
      budget: { total: 68, meals: 30, transport: 12, activities: 20, drinks: 8, incidentals: 8 },
      midRange: { total: 145, meals: 58, transport: 25, activities: 42, drinks: 20, incidentals: 15 },
      luxury: { total: 530, meals: 185, transport: 45, activities: 165, drinks: 100, incidentals: 35 }
    },
    confidence: 'high'
  },

  'stockholm': {
    dailyCost: { budget: 62, midRange: 135, luxury: 490 },
    accommodation: { budget: 88, midRange: 175, luxury: 295 }, // Blended: tech-friendly Nordic market with good Airbnb culture (15% savings)
    breakdown: {
      budget: { total: 62, meals: 28, transport: 10, activities: 18, drinks: 8, incidentals: 8 },
      midRange: { total: 135, meals: 52, transport: 20, activities: 38, drinks: 25, incidentals: 15 },
      luxury: { total: 490, meals: 170, transport: 35, activities: 155, drinks: 95, incidentals: 35 }
    },
    confidence: 'high'
  },

  'oslo': {
    dailyCost: { budget: 75, midRange: 165, luxury: 600 },
    accommodation: { budget: 105, midRange: 195, luxury: 348 }, // Blended: expensive Nordic market with moderate Airbnb savings (10% savings)
    breakdown: {
      budget: { total: 75, meals: 35, transport: 15, activities: 20, drinks: 7, incidentals: 8 },
      midRange: { total: 165, meals: 68, transport: 30, activities: 42, drinks: 25, incidentals: 15 },
      luxury: { total: 600, meals: 210, transport: 50, activities: 170, drinks: 135, incidentals: 35 }
    },
    confidence: 'high'
  },

  'reykjavik': {
    dailyCost: { budget: 88, midRange: 190, luxury: 680 },
    accommodation: { budget: 95, midRange: 180, luxury: 320 }, // Blended: expensive Nordic island market with limited Airbnb (8% savings)
    breakdown: {
      budget: { total: 88, meals: 35, transport: 12, activities: 25, drinks: 18, incidentals: 10 },
      midRange: { total: 190, meals: 70, transport: 20, activities: 55, drinks: 40, incidentals: 15 },
      luxury: { total: 680, meals: 250, transport: 35, activities: 200, drinks: 155, incidentals: 40 }
    },
    confidence: 'high'
  },

  'lisbon': {
    dailyCost: { budget: 35, midRange: 78, luxury: 290 },
    accommodation: { budget: 52, midRange: 98, luxury: 260 }, // Blended: trendy Airbnbs now expensive, 15% savings
    breakdown: {
      budget: { total: 35, meals: 15, transport: 4, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 78, meals: 30, transport: 8, activities: 26, drinks: 14, incidentals: 12 },
      luxury: { total: 290, meals: 105, transport: 15, activities: 95, drinks: 50, incidentals: 25 }
    },
    confidence: 'high'
  },

  'madrid': {
    dailyCost: { budget: 42, midRange: 90, luxury: 340 },
    accommodation: { budget: 58, midRange: 115, luxury: 208 }, // Blended: Spanish capital with strong Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 4, activities: 14, drinks: 8, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 8, activities: 28, drinks: 20, incidentals: 12 },
      luxury: { total: 340, meals: 120, transport: 15, activities: 105, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'prague': {
    dailyCost: { budget: 52, midRange: 85, luxury: 270 },
    accommodation: { budget: 58, midRange: 108, luxury: 200 }, // Blended: popular Eastern European city with excellent Airbnb culture (22% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 18, drinks: 10, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 28, drinks: 18, incidentals: 12 },
      luxury: { total: 250, meals: 90, transport: 12, activities: 85, drinks: 38, incidentals: 25 }
    },
    confidence: 'high'
  },

  'budapest': {
    dailyCost: { budget: 48, midRange: 78, luxury: 250 },
    accommodation: { budget: 52, midRange: 88, luxury: 165 }, // Blended: affordable Eastern European city with strong Airbnb culture (25% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 6, activities: 16, drinks: 10, incidentals: 8 },
      midRange: { total: 78, meals: 30, transport: 10, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 230, meals: 82, transport: 10, activities: 78, drinks: 35, incidentals: 25 }
    },
    confidence: 'high'
  },

  'dublin': {
    dailyCost: { budget: 52, midRange: 115, luxury: 420 },
    accommodation: { budget: 78, midRange: 148, luxury: 268 }, // Blended: expensive Irish market with growing Airbnb acceptance (16% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 115, meals: 42, transport: 15, activities: 32, drinks: 26, incidentals: 15 },
      luxury: { total: 420, meals: 150, transport: 25, activities: 120, drinks: 100, incidentals: 25 }
    },
    confidence: 'high'
  },

  'nice': {
    dailyCost: { budget: 48, midRange: 105, luxury: 390 },
    accommodation: { budget: 85, midRange: 165, luxury: 295 }, // Blended: French Riviera tourism with good vacation rental market (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 6, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 12, activities: 32, drinks: 21, incidentals: 15 },
      luxury: { total: 390, meals: 145, transport: 20, activities: 120, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'lyon': {
    dailyCost: { budget: 42, midRange: 90, luxury: 340 },
    accommodation: { budget: 62, midRange: 118, luxury: 208 }, // Blended: French regional city with good Airbnb penetration (20% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 6, activities: 14, drinks: 6, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 340, meals: 125, transport: 20, activities: 100, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'frankfurt': {
    dailyCost: { budget: 48, midRange: 100, luxury: 370 },
    accommodation: { budget: 68, midRange: 138, luxury: 248 }, // Blended: business-focused German city with competitive Airbnb market (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 100, meals: 38, transport: 15, activities: 28, drinks: 19, incidentals: 12 },
      luxury: { total: 370, meals: 135, transport: 25, activities: 105, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'hamburg': {
    dailyCost: { budget: 45, midRange: 95, luxury: 350 },
    accommodation: { budget: 62, midRange: 125, luxury: 218 }, // Blended: German port city with competitive Airbnb market (18% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 95, meals: 36, transport: 15, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 350, meals: 125, transport: 25, activities: 100, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  // ASIA
  'tokyo': {
    dailyCost: { budget: 45, midRange: 98, luxury: 360 },
    accommodation: { budget: 58, midRange: 125, luxury: 248 }, // Blended: traditional hotels + growing vacation rental market (15% savings)
    breakdown: {
      budget: { total: 45, meals: 20, transport: 8, activities: 12, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 38, transport: 15, activities: 27, drinks: 18, incidentals: 12 },
      luxury: { total: 360, meals: 125, transport: 30, activities: 110, drinks: 70, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 45,
        meals: {
          amount: 20,
          examples: ["Ramen bowl ¥800-1200", "Convenience store meal ¥300-600", "Sushi conveyor belt ¥100-300/plate", "Teishoku set meal ¥600-1000"],
          tips: ["Convenience stores have excellent quality food", "Many restaurants offer lunch sets (teishoku)", "Standing bars (tachinomi) are very affordable"]
        },
        transport: {
          amount: 8,
          examples: ["JR Yamanote Line ¥140-200", "Metro day pass ¥800", "IC card rides ¥130-320", "Walking between stations free"],
          tips: ["IC cards (Suica/Pasmo) work on all transit", "Walking often faster than transfers", "Avoid peak hours 7-9am, 5-8pm"]
        },
        activities: {
          amount: 12,
          examples: ["Senso-ji Temple free", "Imperial Palace East Gardens free", "Meiji Shrine free", "Observation decks ¥500-1000"],
          tips: ["Many shrines and temples are free", "City parks offer great views", "Museum day passes available"]
        },
        drinks: {
          amount: 7,
          examples: ["Vending machine drinks ¥120-160", "Convenience store coffee ¥100-200", "Draft beer ¥300-500", "Green tea free at restaurants"],
          tips: ["Vending machines everywhere with hot/cold drinks", "Free tea often provided at restaurants", "Convenience store coffee is excellent quality"]
        },
        incidentals: {
          amount: 8,
          examples: ["100-yen shop items ¥110", "Public bath ¥400-600", "Coin locker ¥300-600", "Phone charger ¥500-1000"],
          tips: ["100-yen shops (Daiso, Seria) for cheap goods", "Cash still preferred many places", "Public baths (sento) great experience"]
        }
      },
      midRange: {
        total: 98,
        meals: {
          amount: 38,
          examples: ["Izakaya dinner ¥2000-4000", "Sushi restaurant ¥1500-3000", "Wagyu beef set ¥2500-5000", "Department store restaurant ¥1200-2500"],
          tips: ["Izakayas perfect for authentic dining experience", "Department store restaurant floors offer quality", "Lunch versions of dinner menus much cheaper"]
        },
        transport: {
          amount: 15,
          examples: ["Taxi short rides ¥700-1500", "Airport express ¥400-3000", "JR Pass daily value ¥2000+", "Private car tours ¥8000-15000"],
          tips: ["Taxis expensive but very clean and safe", "Airport express varies by terminal", "JR Pass only worthwhile for longer trips"]
        },
        activities: {
          amount: 27,
          examples: ["TeamLab Borderless ¥3200", "Tokyo Skytree ¥2100-3100", "Kabuki theater ¥4000-20000", "Robot Restaurant ¥8000-10000"],
          tips: ["Book popular attractions in advance", "Many experiences unique to Tokyo", "Traditional arts can be expensive but worthwhile"]
        },
        drinks: {
          amount: 18,
          examples: ["Craft cocktails ¥1000-2000", "Sake tasting ¥1500-3000", "Whiskey bar ¥1500-4000", "Hotel bar ¥2000-5000"],
          tips: ["Japanese whiskey world-renowned", "Sake bars offer educational experiences", "Golden Gai area famous for tiny bars"]
        },
        incidentals: {
          amount: 12,
          examples: ["Shopping in Harajuku ¥1000-5000", "Manga/anime goods ¥500-3000", "Traditional crafts ¥2000-10000", "Electronics ¥1000-50000"],
          tips: ["Tax-free shopping available for tourists", "Akihabara for electronics and anime goods", "Traditional crafts make unique souvenirs"]
        }
      },
      luxury: {
        total: 360,
        meals: {
          amount: 125,
          examples: ["Michelin sushi omakase ¥15000-50000", "Wagyu tasting menu ¥20000-40000", "Kaiseki dinner ¥10000-30000", "French fine dining ¥15000-35000"],
          tips: ["Tokyo has most Michelin stars globally", "Book famous restaurants months ahead", "Lunch omakase often half the price"]
        },
        transport: {
          amount: 30,
          examples: ["Private car with driver ¥8000-15000/day", "Helicopter tour ¥15000-30000", "First class airport express ¥1000-5000", "Luxury taxi services ¥1500-3000"],
          tips: ["Private drivers speak English", "Helicopter tours offer unique Tokyo views", "Luxury taxis available via apps"]
        },
        activities: {
          amount: 110,
          examples: ["Private geisha dinner ¥50000-100000", "Exclusive temple ceremony ¥20000-50000", "VIP sumo experience ¥15000-30000", "Private tea ceremony ¥10000-25000"],
          tips: ["Private cultural experiences truly exclusive", "Geisha entertainment extremely rare opportunity", "Traditional ceremonies often include meal"]
        },
        drinks: {
          amount: 70,
          examples: ["Premium whiskey tasting ¥5000-15000", "Exclusive sake brewery tour ¥8000-20000", "Hotel cocktail bars ¥2500-5000", "Private bar experiences ¥10000-25000"],
          tips: ["Japanese whiskey highly sought after globally", "Some bars require introductions", "Hotel bars offer incredible city views"]
        },
        incidentals: {
          amount: 25,
          examples: ["Luxury department store shopping ¥10000-100000", "Traditional kimono ¥50000-200000", "High-end electronics ¥50000-500000", "Artisan crafts ¥20000-100000"],
          tips: ["Ginza district for ultimate luxury shopping", "Traditional items require authentication", "Personal shopping services available"]
        }
      }
    },
    confidence: 'high'
  },

  'seoul': {
    dailyCost: { budget: 32, midRange: 72, luxury: 270 },
    accommodation: { budget: 45, midRange: 85, luxury: 168 }, // Blended: modern city with growing vacation rental market (17% savings)
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 72, meals: 28, transport: 8, activities: 24, drinks: 12, incidentals: 12 },
      luxury: { total: 270, meals: 95, transport: 15, activities: 90, drinks: 45, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 32,
        meals: {
          amount: 14,
          examples: [
            "Street food (hotteok, tteokbokki) ₩2,000-5,000",
            "Kimbap from convenience store ₩2,000-3,000",
            "Korean BBQ lunch ₩8,000-15,000",
            "Instant noodles ₩1,000-2,000"
          ],
          tips: ["Street food is delicious and safe", "Convenience stores have great prepared food", "Set meals (jeongsik) offer good value"]
        },
        transport: {
          amount: 4,
          examples: [
            "Subway single ride ₩1,370",
            "T-money card for day ₩2,000-5,000",
            "Bus fare ₩1,200",
            "Walking between nearby stations free"
          ],
          tips: ["T-money card works on all public transport", "Subway system is excellent and extensive", "Free WiFi on all subway trains"]
        },
        activities: {
          amount: 10,
          examples: [
            "Gyeongbokgung Palace ₩3,000",
            "Bukchon Hanok Village free",
            "Cheonggyecheon stream free",
            "Hiking Namsan Mountain free"
          ],
          tips: ["Many temples and parks are free", "Palace guard ceremonies are spectacular", "Hiking trails offer city views"]
        },
        drinks: {
          amount: 6,
          examples: [
            "Coffee shop ₩3,000-6,000",
            "Korean traditional tea ₩4,000-8,000",
            "Beer at convenience store ₩1,500-3,000",
            "Soju bottle ₩1,500-2,500"
          ],
          tips: ["Convenience store alcohol is cheap", "Coffee culture is huge in Seoul", "Traditional tea houses offer atmosphere"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Korean beauty products ₩5,000-20,000",
            "Souvenirs ₩3,000-15,000",
            "PC bang (internet cafe) ₩1,000/hour",
            "Tips (rare) ₩0-5,000"
          ],
          tips: ["Tipping not customary", "Korean skincare products excellent value", "PC bangs popular for gaming"]
        }
      },
      midRange: {
        total: 72,
        meals: {
          amount: 28,
          examples: [
            "Korean BBQ dinner ₩25,000-40,000",
            "Traditional restaurant ₩15,000-30,000",
            "Bibimbap at nice restaurant ₩12,000-18,000",
            "Korean fried chicken ₩18,000-25,000"
          ],
          tips: ["Korean BBQ is social dining experience", "Try different regional cuisines", "Many restaurants open 24/7"]
        },
        transport: {
          amount: 8,
          examples: [
            "Taxi short ride ₩3,000-8,000",
            "Airport express ₩4,250",
            "KakaoTaxi app rides ₩5,000-15,000",
            "Bike sharing ₩1,000/hour"
          ],
          tips: ["KakaoTaxi app very popular", "Airport express connects to subway", "Seoul Bike available citywide"]
        },
        activities: {
          amount: 24,
          examples: [
            "DMZ tour ₩50,000-80,000",
            "Lotte World Tower ₩27,000",
            "Korean spa (jjimjilbang) ₩10,000-15,000",
            "Cooking class ₩40,000-60,000"
          ],
          tips: ["DMZ tours book up quickly", "Jjimjilbangs offer full spa experience", "Cooking classes very popular"]
        },
        drinks: {
          amount: 12,
          examples: [
            "Cocktails ₩10,000-18,000",
            "Korean whiskey ₩8,000-15,000",
            "Craft beer ₩6,000-12,000",
            "Karaoke (noraebang) ₩20,000-30,000/hour"
          ],
          tips: ["Hongdae area great for nightlife", "Noraebang is essential Seoul experience", "Gangnam has upscale bars"]
        },
        incidentals: {
          amount: 12,
          examples: [
            "Shopping Myeongdong ₩30,000-100,000",
            "K-beauty haul ₩50,000-200,000",
            "Korean fashion ₩20,000-80,000",
            "Traditional crafts ₩15,000-50,000"
          ],
          tips: ["Myeongdong for cosmetics shopping", "Hongdae for youth fashion", "Insadong for traditional items"]
        }
      },
      luxury: {
        total: 270,
        meals: {
          amount: 95,
          examples: [
            "High-end Korean restaurant ₩80,000-150,000",
            "Hotel fine dining ₩100,000-200,000",
            "Premium Korean BBQ ₩60,000-120,000",
            "Chef's table experience ₩150,000-300,000"
          ],
          tips: ["Seoul has excellent fine dining scene", "Hotel restaurants offer refined Korean cuisine", "Private dining rooms available"]
        },
        transport: {
          amount: 15,
          examples: [
            "Private driver ₩100,000-200,000/day",
            "Luxury car rental ₩150,000-400,000/day",
            "Helicopter tour ₩300,000-600,000",
            "First class KTX train ₩60,000-100,000"
          ],
          tips: ["Private drivers speak English", "Helicopter tours offer Han River views", "KTX high-speed rail very comfortable"]
        },
        activities: {
          amount: 90,
          examples: [
            "Private cultural tours ₩200,000-500,000",
            "VIP K-pop experiences ₩300,000-800,000",
            "Private spa treatments ₩150,000-400,000",
            "Exclusive shopping experiences ₩200,000-600,000"
          ],
          tips: ["VIP K-pop tours include behind-scenes access", "Private cultural tours customize to interests", "Luxury spas offer traditional Korean treatments"]
        },
        drinks: {
          amount: 45,
          examples: [
            "Premium cocktails ₩20,000-40,000",
            "Fine Korean whiskey ₩30,000-80,000",
            "Wine tastings ₩50,000-150,000",
            "Private karaoke suites ₩100,000-300,000/hour"
          ],
          tips: ["Gangnam has premium nightlife", "Korean whiskey gaining international recognition", "Private karaoke suites very luxurious"]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Luxury shopping Gangnam ₩200,000-2,000,000",
            "Premium beauty treatments ₩100,000-500,000",
            "Personal shopping service ₩150,000-400,000",
            "VIP cultural experiences ₩200,000-800,000"
          ],
          tips: ["Gangnam District for luxury shopping", "Korean beauty treatments world-renowned", "Personal shoppers provide insider access"]
        }
      }
    },
    confidence: 'high'
  },

  'singapore': {
    dailyCost: { budget: 38, midRange: 85, luxury: 320 },
    accommodation: { budget: 68, midRange: 146, luxury: 288 }, // Blended: strict regulations = minimal Airbnb savings (10%)
    breakdown: {
      budget: { total: 38, meals: 16, transport: 6, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 10, activities: 27, drinks: 16, incidentals: 12 },
      luxury: { total: 320, meals: 115, transport: 20, activities: 105, drinks: 55, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 38,
        meals: {
          amount: 16,
          examples: [
            "Hawker center meal $3-5",
            "Chicken rice $4-6", 
            "Laksa noodles $4-5",
            "Kopi (coffee) + toast $3-4"
          ],
          tips: ["Hawker centers offer cheapest authentic food", "Try different stalls for variety", "Newton Food Centre is touristy - avoid for budget"]
        },
        transport: {
          amount: 6,
          examples: [
            "MRT day pass $8",
            "Single MRT ride $1-2", 
            "Bus fare $0.80-1.50",
            "Walking Marina Bay area free"
          ],
          tips: ["Get EZ-Link card for convenience", "MRT very efficient and clean", "Many attractions walkable in city center"]
        },
        activities: {
          amount: 12,
          examples: [
            "Gardens by the Bay conservatories $28",
            "Marina Bay Sands SkyPark $23",
            "Singapore Zoo $30",
            "Merlion Park free"
          ],
          tips: ["Many free outdoor attractions", "Book online for discounts", "Sentosa island has multiple paid attractions"]
        },
        drinks: {
          amount: 6,
          examples: [
            "Local beer $3-5",
            "Fresh sugarcane juice $2",
            "Kopi/Teh $1-2", 
            "7-Eleven drinks $1-3"
          ],
          tips: ["Alcohol expensive due to taxes", "Try local coffee culture", "Hawker center drinks cheapest"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Souvenirs $5-15",
            "Pharmacy items $5-10",
            "Laundry service $8-12",
            "Phone data $10-15"
          ],
          tips: ["Shopping at malls expensive", "Chinatown for cheaper souvenirs", "Many free WiFi hotspots available"]
        }
      },
      midRange: {
        total: 85,
        meals: {
          amount: 32,
          examples: [
            "Restaurant meal $15-25",
            "Hotel breakfast $20-30",
            "Cocktail bar $12-18",
            "Fine dining lunch $25-40"
          ],
          tips: ["Restaurant Week offers deals", "Hotel restaurants expensive but good", "Try fusion cuisine unique to Singapore"]
        },
        transport: {
          amount: 10,
          examples: [
            "Taxi short distance $8-15",
            "Grab ride $10-20",
            "Tourist bus $15-25",
            "Airport express $15"
          ],
          tips: ["Grab widely available", "Peak hour surcharges apply", "Airport very well connected"]
        },
        activities: {
          amount: 27,
          examples: [
            "Universal Studios $75",
            "Singapore Flyer $33",
            "River Safari $34",
            "Jurong Bird Park $30"
          ],
          tips: ["Combo tickets save money", "Book Sentosa attractions together", "Many world-class attractions"]
        },
        drinks: {
          amount: 16,
          examples: [
            "Craft cocktails $15-22",
            "Wine bar $10-18/glass",
            "Rooftop bar $18-25",
            "Hotel bar $20-30"
          ],
          tips: ["Happy hours 5-8pm common", "Clarke Quay nightlife district", "Marina Bay has upscale bars"]
        },
        incidentals: {
          amount: 12,
          examples: [
            "Shopping at Orchard $25-100",
            "Spa treatment $50-120",
            "Electronics duty-free $50-200",
            "Designer goods $100-500"
          ],
          tips: ["Orchard Road for shopping", "Electronics prices competitive", "GST refund available for tourists"]
        }
      },
      luxury: {
        total: 320,
        meals: {
          amount: 115,
          examples: [
            "Michelin star dinner $150-300",
            "Marina Bay Sands dining $80-150",
            "Celebrity chef restaurant $100-200",
            "Private dining experience $200-400"
          ],
          tips: ["Singapore has many Michelin stars", "Book famous restaurants well ahead", "Hotel restaurants world-class"]
        },
        transport: {
          amount: 20,
          examples: [
            "Private car service $40-80",
            "Luxury taxi $25-50",
            "Helicopter tour $200-400",
            "Private yacht charter $500-1000/day"
          ],
          tips: ["Private drivers know best routes", "Helicopter tours offer great views", "Marina Bay yacht charters available"]
        },
        activities: {
          amount: 105,
          examples: [
            "Private tour guide $150-300/day",
            "VIP theme park experience $200-400",
            "Private museum tours $100-200",
            "Exclusive shopping tour $200-500"
          ],
          tips: ["Private guides avoid crowds", "VIP experiences skip lines", "Personal shoppers available"]
        },
        drinks: {
          amount: 55,
          examples: [
            "Premium cocktails $25-40",
            "Wine tasting $75-150",
            "Champagne service $50-150",
            "Private bar hire $300-800"
          ],
          tips: ["Rooftop bars offer stunning views", "Wine bars have excellent selections", "Hotel bars very upscale"]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Luxury shopping $200-1000",
            "Spa at Marina Bay Sands $200-500",
            "Personal shopping $300/day",
            "Concierge services $100-200"
          ],
          tips: ["Marina Bay Sands has luxury shopping", "Spa treatments world-class", "Concierge can arrange anything"]
        }
      }
    },
    confidence: 'high'
  },

  'bangkok': {
    dailyCost: { budget: 42, midRange: 65, luxury: 180 },
    accommodation: { budget: 25, midRange: 55, luxury: 165 }, // Blended: good Airbnb options reduce costs 15-25%
    breakdown: {
      budget: { total: 42, meals: 18, transport: 6, activities: 12, drinks: 6, incidentals: 5 },
      midRange: { total: 65, meals: 25, transport: 8, activities: 20, drinks: 12, incidentals: 8 },
      luxury: { total: 160, meals: 60, transport: 12, activities: 60, drinks: 23, incidentals: 15 }
    },
    detailedBreakdown: {
      budget: {
        total: 42,
        meals: {
          amount: 18,
          examples: [
            "Breakfast: Street cart pad thai $2-3",
            "Lunch: Tom yum soup + rice $4-5",
            "Dinner: Local restaurant meal $6-8",
            "Snacks: Mango sticky rice $2, fresh fruit $1"
          ],
          tips: ["Avoid tourist areas like Khao San Road", "Try som tam (papaya salad) for $2-3"]
        },
        transport: {
          amount: 6,
          examples: [
            "BTS Skytrain: $1-2 per ride",
            "Tuk-tuk short trip: $2-3",
            "Taxi meter: $3-5 for most trips",
            "Motorbike taxi: $1-2"
          ],
          tips: ["Always use metered taxis", "BTS is fastest for tourist areas"]
        },
        activities: {
          amount: 12,
          examples: [
            "Temple visits: Free-$2 donation",
            "Chatuchak Market: Free browsing",
            "Khlong boat tour: $5-8",
            "Traditional massage: $5-10"
          ],
          tips: ["Many temples are free", "Bargain at markets"]
        },
        drinks: {
          amount: 6,
          examples: [
            "Thai iced tea: $1-2",
            "Fresh coconut: $1",
            "Chang beer: $2-3",
            "Street coffee: $1"
          ]
        },
        incidentals: {
          amount: 5,
          examples: [
            "Tips: $1-2 per service",
            "Small souvenirs: $2-5",
            "Phone SIM card: $10 one-time"
          ]
        }
      },
      midRange: {
        total: 65,
        meals: {
          amount: 25,
          examples: [
            "Breakfast: Hotel or café $4-6",
            "Lunch: Nice restaurant $8-12",
            "Dinner: Popular Thai restaurant $10-15",
            "Drinks: Fresh juices $2-3"
          ]
        },
        transport: {
          amount: 8,
          examples: [
            "BTS daily travel: $4-6",
            "Grab rides: $3-6 per trip",
            "Airport taxi: $8-12"
          ]
        },
        activities: {
          amount: 20,
          examples: [
            "Grand Palace: $15",
            "Cooking class: $25-35",
            "Floating market tour: $15-25",
            "Spa treatment: $20-40"
          ]
        },
        drinks: {
          amount: 12,
          examples: [
            "Rooftop bar cocktails: $6-10",
            "Thai beer at restaurant: $3-4",
            "Fresh juice bars: $2-4"
          ]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Shopping: $10-20",
            "Tips: $2-5 per service",
            "Miscellaneous: $5-10"
          ]
        }
      },
      luxury: {
        total: 160,
        meals: {
          amount: 60,
          examples: [
            "5-star hotel breakfast: $15-25",
            "Fine dining lunch: $25-40",
            "Michelin restaurant dinner: $40-80",
            "Premium cocktails: $8-15"
          ]
        },
        transport: {
          amount: 12,
          examples: [
            "Private car with driver: $30-50/day",
            "Luxury airport transfer: $25-35",
            "First-class BTS: $3-5"
          ]
        },
        activities: {
          amount: 60,
          examples: [
            "Private temple tour: $80-120",
            "Luxury spa day: $100-200",
            "Private boat charter: $150-300",
            "VIP cultural experiences: $50-100"
          ]
        },
        drinks: {
          amount: 23,
          examples: [
            "Premium cocktail bars: $12-20",
            "Wine with dinner: $8-15/glass",
            "Luxury hotel bar: $10-18"
          ]
        },
        incidentals: {
          amount: 15,
          examples: [
            "Luxury shopping: $50-200",
            "Concierge tips: $5-10",
            "Premium services: $10-30"
          ]
        }
      }
    },
    confidence: 'high'
  },

  'kuala-lumpur': {
    dailyCost: { budget: 22, midRange: 50, luxury: 185 },
    accommodation: { budget: 28, midRange: 58, luxury: 135 }, // Blended: strong SE Asian vacation rental market with good savings (20% savings)
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 50, meals: 18, transport: 6, activities: 16, drinks: 10, incidentals: 12 },
      luxury: { total: 185, meals: 65, transport: 12, activities: 60, drinks: 33, incidentals: 25 }
    },
    confidence: 'high'
  },

  'ho-chi-minh-city': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    accommodation: { budget: 18, midRange: 38, luxury: 98 }, // Blended: emerging vacation rental market with significant savings (25% savings)
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'jakarta': {
    dailyCost: { budget: 17, midRange: 38, luxury: 140 },
    accommodation: { budget: 22, midRange: 45, luxury: 115 }, // Blended: growing SE Asian market with vacation rental savings (22% savings)
    breakdown: {
      budget: { total: 17, meals: 7, transport: 2, activities: 6, drinks: 3, incidentals: 5 },
      midRange: { total: 38, meals: 16, transport: 4, activities: 14, drinks: 6, incidentals: 8 },
      luxury: { total: 140, meals: 55, transport: 12, activities: 50, drinks: 18, incidentals: 15 }
    },
    confidence: 'high'
  },

  'manila': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    accommodation: { budget: 24, midRange: 52, luxury: 135 }, // Blended: growing Filipino market with emerging vacation rental culture (22% savings)
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'mumbai': {
    dailyCost: { budget: 38, midRange: 62, luxury: 180 },
    accommodation: { budget: 32, midRange: 58, luxury: 140 }, // Blended: growing Indian market with emerging vacation rentals (18% savings)
    breakdown: {
      budget: { total: 38, meals: 16, transport: 6, activities: 12, drinks: 8, incidentals: 8 },
      midRange: { total: 62, meals: 24, transport: 10, activities: 18, drinks: 15, incidentals: 12 },
      luxury: { total: 160, meals: 55, transport: 8, activities: 50, drinks: 32, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 38,
        meals: {
          amount: 16,
          examples: [
            "Street food meal ₹150-250",
            "Local restaurant ₹200-350",
            "Vada pav (Mumbai snack) ₹15-25", 
            "Thali meal ₹180-300"
          ],
          tips: ["Street food safe at busy stalls", "Try Mumbai specialties like pav bhaji", "Local restaurants offer best value"]
        },
        transport: {
          amount: 6,
          examples: [
            "Local train ticket ₹5-15",
            "Auto-rickshaw short ride ₹30-80",
            "Bus fare ₹10-25",
            "Taxi short distance ₹100-200"
          ],
          tips: ["Local trains cheapest but very crowded", "Use prepaid taxi stands at stations", "Apps like Ola/Uber widely available"]
        },
        activities: {
          amount: 12,
          examples: [
            "Gateway of India free",
            "Elephanta Caves ₹40 + ferry ₹180",
            "Museums ₹30-100",
            "Crawford Market free browsing"
          ],
          tips: ["Many free sights around South Mumbai", "Book Elephanta ferry tickets in advance", "Museums very affordable"]
        },
        drinks: {
          amount: 8,
          examples: [
            "Chai tea ₹10-20",
            "Fresh lime soda ₹30-50",
            "Local beer ₹150-250",
            "Lassi ₹40-80"
          ],
          tips: ["Chai available everywhere", "Avoid tap water", "Local drinks refreshing in heat"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Souvenirs ₹100-500",
            "Rickshaw rides ₹50-150",
            "Phone data ₹300-500",
            "Tips for services ₹20-100"
          ],
          tips: ["Bargain in markets", "Keep small change for tips", "SIM cards very affordable"]
        }
      },
      midRange: {
        total: 62,
        meals: {
          amount: 24,
          examples: [
            "Restaurant meal ₹400-800",
            "Hotel breakfast ₹500-800",
            "International cuisine ₹600-1200",
            "Food delivery ₹300-600"
          ],
          tips: ["Hotel restaurants reliable quality", "Food delivery very popular", "Try diverse Mumbai cuisine scene"]
        },
        transport: {
          amount: 10,
          examples: [
            "Uber/Ola rides ₹150-400",
            "Taxi full day ₹1500-2500",
            "AC local train ₹25-50",
            "Private driver half day ₹1000-1500"
          ],
          tips: ["App-based rides convenient", "Traffic can be heavy", "AC trains more comfortable"]
        },
        activities: {
          amount: 18,
          examples: [
            "Bollywood studio tour ₹1000-2000",
            "Marine Drive walking free",
            "Hanging Gardens entry ₹15",
            "Guided city tour ₹1500-3000"
          ],
          tips: ["Book tours through reputable companies", "Many attractions walkable", "Evening at Marine Drive is magical"]
        },
        drinks: {
          amount: 15,
          examples: [
            "Restaurant drinks ₹200-500",
            "Hotel bar ₹400-800",
            "Fresh juices ₹80-150",
            "Coffee shop ₹150-300"
          ],
          tips: ["Hotel bars have AC and ambiance", "Fresh juices widely available", "Coffee culture growing rapidly"]
        },
        incidentals: {
          amount: 12,
          examples: [
            "Shopping at malls ₹500-3000",
            "Spa treatment ₹1500-4000",
            "Electronics ₹1000-5000",
            "Laundry service ₹200-500"
          ],
          tips: ["Malls have international brands", "Local tailors very affordable", "Electronics prices competitive"]
        }
      },
      luxury: {
        total: 160,
        meals: {
          amount: 55,
          examples: [
            "Fine dining ₹2000-5000",
            "Hotel luxury restaurant ₹3000-8000",
            "Celebrity chef restaurant ₹4000-10000",
            "Private dining ₹5000-15000"
          ],
          tips: ["Mumbai has excellent fine dining", "Hotel restaurants world-class", "Book popular restaurants ahead"]
        },
        transport: {
          amount: 8,
          examples: [
            "Private car with driver ₹2000-4000/day",
            "Luxury taxi ₹500-1500",
            "Helicopter tour ₹8000-15000",
            "Premium rides ₹300-800"
          ],
          tips: ["Private drivers know city well", "Helicopter tours offer unique views", "Premium services very comfortable"]
        },
        activities: {
          amount: 50,
          examples: [
            "Private Bollywood tour ₹5000-10000",
            "Exclusive club access ₹2000-5000",
            "Private yacht ₹15000-30000",
            "VIP experiences ₹3000-8000"
          ],
          tips: ["Private tours avoid crowds", "Exclusive clubs offer networking", "Yacht charters available from Gateway"]
        },
        drinks: {
          amount: 32,
          examples: [
            "Premium cocktails ₹800-1500",
            "Wine tastings ₹2000-4000",
            "Hotel bar premium ₹1000-2500",
            "Private bar hire ₹10000-25000"
          ],
          tips: ["Rooftop bars offer city views", "Premium hotels have excellent bars", "Wine scene growing in Mumbai"]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Designer shopping ₹5000-50000",
            "Luxury spa ₹3000-8000",
            "Personal shopping ₹2000-5000",
            "Concierge services ₹1000-3000"
          ],
          tips: ["Designer stores in luxury malls", "Spa treatments very affordable compared to West", "Personal shoppers help navigate markets"]
        }
      }
    },
    confidence: 'high'
  },

  'delhi': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    accommodation: { budget: 18, midRange: 42, luxury: 118 }, // Blended: capital city with growing vacation rental market (20% savings)
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'dubai': {
    dailyCost: { budget: 58, midRange: 135, luxury: 480 },
    accommodation: { budget: 79, midRange: 198, luxury: 432 }, // Blended: expensive market, limited Airbnb (10% savings)
    breakdown: {
      budget: { total: 58, meals: 26, transport: 12, activities: 15, drinks: 5, incidentals: 12 },
      midRange: { total: 135, meals: 52, transport: 23, activities: 35, drinks: 25, incidentals: 20 },
      luxury: { total: 480, meals: 170, transport: 40, activities: 145, drinks: 90, incidentals: 35 }
    },
    detailedBreakdown: {
      budget: {
        total: 58,
        meals: {
          amount: 26,
          examples: ["Shawarma AED 8-15", "Indian restaurant AED 20-35", "Filipino food court AED 12-25", "Pakistani curry AED 15-30"],
          tips: ["Dubai Mall food court offers diverse options", "Karama and Deira areas have authentic budget food", "Many restaurants offer lunch deals"]
        },
        transport: {
          amount: 12,
          examples: ["Metro day pass AED 20", "Bus single trip AED 3-8", "Taxi short rides AED 12-25", "Walking malls free with AC"],
          tips: ["Metro is clean, efficient and affordable", "Nol card works for all public transport", "Many malls connected by walkways"]
        },
        activities: {
          amount: 15,
          examples: ["Dubai Museum AED 3", "Public beaches free", "Dubai Fountain show free", "Old Dubai walking free"],
          tips: ["Many spectacular free attractions", "Public beaches well-maintained", "Gold and spice souks free to explore"]
        },
        drinks: {
          amount: 5,
          examples: ["Fresh juice AED 5-12", "Coffee shops AED 8-15", "Mall food court drinks AED 4-8", "Water bottles AED 1-3"],
          tips: ["Fresh juice stands everywhere", "Mall air conditioning a relief", "Water important due to heat"]
        },
        incidentals: {
          amount: 12,
          examples: ["Gold souk browsing free", "Spice market samples free", "SIM card AED 30-50", "Souvenirs AED 10-50"],
          tips: ["Bargaining expected in souks", "Many shops offer tax-free shopping", "Dubai very safe for tourists"]
        }
      },
      midRange: {
        total: 135,
        meals: {
          amount: 52,
          examples: ["International restaurants AED 80-150", "Dubai Marina dining AED 100-200", "Hotel brunch AED 200-400", "Emirate cuisine AED 60-120"],
          tips: ["Friday brunch very popular cultural experience", "Marina and JBR areas offer scenic dining", "Many restaurants have happy hour deals"]
        },
        transport: {
          amount: 23,
          examples: ["Taxi across city AED 30-60", "Uber rides AED 25-80", "Airport metro AED 8", "Desert safari transport included"],
          tips: ["Taxis are comfortable and air-conditioned", "Uber/Careem widely available", "Airport metro very convenient"]
        },
        activities: {
          amount: 35,
          examples: ["Burj Khalifa observation AED 149-500", "Desert safari AED 150-300", "Dubai Aquarium AED 120", "Ski Dubai AED 200"],
          tips: ["Book popular attractions online for discounts", "Desert safaris include multiple activities", "Indoor activities perfect for hot weather"]
        },
        drinks: {
          amount: 25,
          examples: ["Hotel bar cocktails AED 50-80", "Rooftop lounges AED 60-120", "Beach club drinks AED 40-100", "Shisha café AED 30-60"],
          tips: ["Hotel bars offer sophisticated atmosphere", "Beach clubs popular during cooler months", "Shisha culture important social activity"]
        },
        incidentals: {
          amount: 20,
          examples: ["Dubai Mall shopping AED 100-500", "Gold jewelry AED 200-2000", "Electronics duty-free AED 100-1000", "Spa treatments AED 150-400"],
          tips: ["Dubai Mall one of world's largest", "Gold prices competitive globally", "Electronics often duty-free"]
        }
      },
      luxury: {
        total: 480,
        meals: {
          amount: 170,
          examples: ["Burj Al Arab dining AED 400-1200", "Michelin starred restaurants AED 300-800", "Private beach dining AED 500-1500", "Celebrity chef venues AED 400-1000"],
          tips: ["Burj Al Arab requires minimum spend", "Many restaurants in luxury hotels", "Private dining with views available"]
        },
        transport: {
          amount: 40,
          examples: ["Private car with driver AED 200-400/day", "Helicopter tour AED 800-2000", "Luxury yacht charter AED 2000-8000", "Rolls Royce airport transfer AED 300-600"],
          tips: ["Private drivers speak multiple languages", "Helicopter tours offer incredible views", "Yacht charters include crew and refreshments"]
        },
        activities: {
          amount: 145,
          examples: ["Private desert experience AED 800-2000", "VIP Burj Khalifa access AED 500-800", "Private island access AED 1000-3000", "Luxury spa day AED 600-1500"],
          tips: ["Private desert camps offer exclusive experiences", "VIP access skips all queues", "Private islands ultimate luxury"]
        },
        drinks: {
          amount: 90,
          examples: ["Skybar premium cocktails AED 80-150", "Private beach club service AED 200-500", "Wine tastings AED 300-800", "Exclusive lounge access AED 150-400"],
          tips: ["Skybar views among world's best", "Beach clubs offer full luxury service", "Some venues require membership"]
        },
        incidentals: {
          amount: 35,
          examples: ["Luxury mall shopping AED 500-5000", "Designer boutiques AED 1000-20000", "Private shopping experience AED 500-2000", "Concierge services AED 200-800"],
          tips: ["Mall of Emirates and Dubai Mall for luxury", "Personal shoppers available", "Concierge can arrange exclusive experiences"]
        }
      }
    },
    confidence: 'high'
  },

  'istanbul': {
    dailyCost: { budget: 28, midRange: 62, luxury: 230 },
    accommodation: { budget: 35, midRange: 68, luxury: 148 }, // Blended: major tourist city with strong Airbnb market (22% savings)
    breakdown: {
      budget: { total: 28, meals: 12, transport: 3, activities: 10, drinks: 5, incidentals: 8 },
      midRange: { total: 62, meals: 24, transport: 5, activities: 21, drinks: 12, incidentals: 12 },
      luxury: { total: 230, meals: 82, transport: 10, activities: 78, drinks: 35, incidentals: 25 }
    },
    detailedBreakdown: {
      budget: {
        total: 28,
        meals: {
          amount: 12,
          examples: [
            "Döner kebab ₺15-25",
            "Turkish breakfast ₺20-35",
            "Street food simit ₺3-5",
            "Local restaurant meal ₺25-45"
          ],
          tips: ["Street food generally safe and delicious", "Turkish breakfast is elaborate and filling", "Try local specialties like balık ekmek"]
        },
        transport: {
          amount: 3,
          examples: [
            "Metro/tram single ride ₺4-7",
            "Bus fare ₺3-5",
            "Istanbulkart day pass ₺15-20",
            "Ferry across Bosphorus ₺5-8"
          ],
          tips: ["Get Istanbulkart for convenience", "Ferries offer scenic routes", "Walking in Old City areas is pleasant"]
        },
        activities: {
          amount: 10,
          examples: [
            "Hagia Sophia ₺100",
            "Blue Mosque free",
            "Grand Bazaar browsing free",
            "Galata Tower ₺50"
          ],
          tips: ["Many mosques are free to visit", "Bargain in Grand Bazaar", "Sunset from Galata Bridge is free"]
        },
        drinks: {
          amount: 5,
          examples: [
            "Turkish tea ₺3-8",
            "Turkish coffee ₺8-15",
            "Fresh juice ₺10-20",
            "Local beer ₺15-30"
          ],
          tips: ["Tea culture central to Turkish life", "Turkish coffee UNESCO heritage", "Alcohol more expensive due to taxes"]
        },
        incidentals: {
          amount: 8,
          examples: [
            "Souvenirs ₺20-100",
            "Turkish bath (hamam) ₺80-150",
            "Phone SIM card ₺50-100",
            "Tips for services ₺5-20"
          ],
          tips: ["Bargain for souvenirs", "Traditional hamam experience worthwhile", "Tipping appreciated but not mandatory"]
        }
      },
      midRange: {
        total: 62,
        meals: {
          amount: 24,
          examples: [
            "Restaurant meal ₺50-100",
            "Seafood by Bosphorus ₺80-150",
            "Rooftop restaurant ₺70-120",
            "Turkish meze dinner ₺60-100"
          ],
          tips: ["Seafood restaurants along Bosphorus excellent", "Try traditional Ottoman cuisine", "Rooftop restaurants offer great views"]
        },
        transport: {
          amount: 5,
          examples: [
            "Taxi short distance ₺15-30",
            "Private tour transport ₺100-200",
            "Airport shuttle ₺20-40",
            "Bosphorus cruise ₺30-60"
          ],
          tips: ["Taxis plentiful but traffic heavy", "Bosphorus cruises offer unique perspective", "Private transfers convenient"]
        },
        activities: {
          amount: 21,
          examples: [
            "Topkapi Palace ₺100",
            "Basilica Cistern ₺60",
            "Turkish bath luxury ₺200-400",
            "Guided tour ₺150-300"
          ],
          tips: ["Museum passes save money", "Book popular attractions in advance", "Guided tours provide valuable context"]
        },
        drinks: {
          amount: 12,
          examples: [
            "Wine at restaurant ₺40-80/glass",
            "Cocktails ₺50-100",
            "Turkish raki ₺30-60",
            "Hotel bar drinks ₺60-120"
          ],
          tips: ["Turkish wines improving rapidly", "Raki is national drink", "Hotel bars offer atmosphere"]
        },
        incidentals: {
          amount: 12,
          examples: [
            "Shopping at malls ₺100-500",
            "Turkish carpets ₺500-5000",
            "Leather goods ₺200-1000",
            "Spa treatments ₺150-400"
          ],
          tips: ["Grand Bazaar vs modern malls", "Negotiate prices for carpets and leather", "Quality varies significantly"]
        }
      },
      luxury: {
        total: 230,
        meals: {
          amount: 82,
          examples: [
            "Fine dining Ottoman ₺300-600",
            "Michelin restaurant ₺400-800",
            "Private chef ₺500-1000",
            "Luxury hotel dining ₺250-500"
          ],
          tips: ["Istanbul has growing fine dining scene", "Ottoman cuisine at luxury level", "Hotel restaurants world-class"]
        },
        transport: {
          amount: 10,
          examples: [
            "Private driver full day ₺400-800",
            "Luxury transfers ₺100-200",
            "Private yacht ₺1000-3000",
            "Helicopter tour ₺800-1500"
          ],
          tips: ["Private drivers navigate traffic expertly", "Yacht charters popular for Bosphorus", "Helicopter offers unique city views"]
        },
        activities: {
          amount: 78,
          examples: [
            "Private palace tours ₺500-1000",
            "Exclusive hamam experience ₺400-800",
            "Private Bosphorus cruise ₺800-1500",
            "VIP cultural experiences ₺600-1200"
          ],
          tips: ["Private tours avoid crowds", "Luxury hamams offer complete relaxation", "VIP access to popular sites"]
        },
        drinks: {
          amount: 35,
          examples: [
            "Premium cocktails ₺100-200",
            "Wine tastings ₺200-500",
            "Champagne service ₺150-400",
            "Private bar experiences ₺500-1200"
          ],
          tips: ["Rooftop bars offer Bosphorus views", "Turkish wine scene developing", "Hotel bars very sophisticated"]
        },
        incidentals: {
          amount: 25,
          examples: [
            "Luxury shopping ₺1000-10000",
            "Spa at 5-star hotel ₺300-800",
            "Personal shopping ₺400-800",
            "Concierge services ₺200-500"
          ],
          tips: ["Nisantasi district for luxury shopping", "Turkish textiles and jewelry excellent", "Personal shoppers know best sources"]
        }
      }
    },
    confidence: 'high'
  },

  'hong-kong': {
    dailyCost: { budget: 42, midRange: 92, luxury: 340 },
    accommodation: { budget: 78, midRange: 155, luxury: 298 }, // Blended: expensive hotels, limited Airbnb options (12% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 6, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 92, meals: 36, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 340, meals: 120, transport: 20, activities: 105, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'shanghai': {
    dailyCost: { budget: 32, midRange: 72, luxury: 270 },
    accommodation: { budget: 45, midRange: 88, luxury: 178 }, // Blended: major Chinese city with emerging vacation rental market (15% savings)
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 72, meals: 28, transport: 8, activities: 24, drinks: 12, incidentals: 12 },
      luxury: { total: 270, meals: 95, transport: 15, activities: 90, drinks: 45, incidentals: 25 }
    },
    confidence: 'high'
  },

  // OCEANIA
  'sydney': {
    dailyCost: { budget: 58, midRange: 125, luxury: 450 },
    accommodation: { budget: 95, midRange: 185, luxury: 328 }, // Blended: expensive Australian market with strong Airbnb culture (14% savings)
    breakdown: {
      budget: { total: 58, meals: 24, transport: 12, activities: 16, drinks: 8, incidentals: 8 },
      midRange: { total: 125, meals: 48, transport: 22, activities: 32, drinks: 23, incidentals: 15 },
      luxury: { total: 450, meals: 160, transport: 40, activities: 135, drinks: 90, incidentals: 25 }
    },
    confidence: 'high'
  },

  'melbourne': {
    dailyCost: { budget: 52, midRange: 115, luxury: 420 },
    accommodation: { budget: 82, midRange: 165, luxury: 288 }, // Blended: cultural city with good Airbnb market (16% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 10, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 115, meals: 44, transport: 18, activities: 32, drinks: 21, incidentals: 15 },
      luxury: { total: 420, meals: 150, transport: 35, activities: 130, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'cairns': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 15, activities: 30, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 25, activities: 120, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'queenstown': {
    dailyCost: { budget: 52, midRange: 115, luxury: 420 },
    breakdown: {
      budget: { total: 52, meals: 22, transport: 8, activities: 17, drinks: 7, incidentals: 8 },
      midRange: { total: 115, meals: 42, transport: 15, activities: 38, drinks: 20, incidentals: 15 },
      luxury: { total: 420, meals: 145, transport: 25, activities: 150, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  // AFRICA
  'cairo': {
    dailyCost: { budget: 36, midRange: 62, luxury: 180 },
    breakdown: {
      budget: { total: 36, meals: 15, transport: 5, activities: 12, drinks: 8, incidentals: 8 },
      midRange: { total: 62, meals: 24, transport: 8, activities: 20, drinks: 15, incidentals: 12 },
      luxury: { total: 160, meals: 55, transport: 8, activities: 50, drinks: 32, incidentals: 25 }
    },
    confidence: 'high'
  },

  'cape-town': {
    dailyCost: { budget: 28, midRange: 62, luxury: 230 },
    breakdown: {
      budget: { total: 28, meals: 12, transport: 4, activities: 9, drinks: 3, incidentals: 8 },
      midRange: { total: 62, meals: 24, transport: 6, activities: 20, drinks: 12, incidentals: 12 },
      luxury: { total: 230, meals: 82, transport: 15, activities: 78, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'marrakech': {
    dailyCost: { budget: 24, midRange: 52, luxury: 195 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 3, activities: 8, drinks: 3, incidentals: 8 },
      midRange: { total: 52, meals: 20, transport: 5, activities: 17, drinks: 10, incidentals: 12 },
      luxury: { total: 195, meals: 70, transport: 12, activities: 68, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MISSING EUROPEAN CITIES - BATCH 1
  'seville': {
    dailyCost: { budget: 35, midRange: 75, luxury: 280 },
    accommodation: { budget: 48, midRange: 92, luxury: 172 }, // Blended: Spanish tourist city with strong vacation rental culture (20% savings)
    breakdown: {
      budget: { total: 35, meals: 15, transport: 4, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 75, meals: 28, transport: 8, activities: 24, drinks: 15, incidentals: 12 },
      luxury: { total: 280, meals: 100, transport: 15, activities: 85, drinks: 55, incidentals: 25 }
    },
    confidence: 'high'
  },

  'geneva': {
    dailyCost: { budget: 85, midRange: 175, luxury: 620 },
    accommodation: { budget: 125, midRange: 245, luxury: 418 }, // Blended: expensive Swiss city with limited Airbnb options (8% savings)
    breakdown: {
      budget: { total: 85, meals: 38, transport: 15, activities: 22, drinks: 10, incidentals: 12 },
      midRange: { total: 175, meals: 70, transport: 25, activities: 50, drinks: 30, incidentals: 20 },
      luxury: { total: 620, meals: 220, transport: 45, activities: 200, drinks: 120, incidentals: 35 }
    },
    confidence: 'high'
  },

  'brussels': {
    dailyCost: { budget: 45, midRange: 95, luxury: 360 },
    accommodation: { budget: 62, midRange: 125, luxury: 225 }, // Blended: Belgian capital with growing Airbnb market (16% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 95, meals: 36, transport: 15, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 360, meals: 130, transport: 25, activities: 100, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'porto': {
    dailyCost: { budget: 32, midRange: 68, luxury: 260 },
    accommodation: { budget: 42, midRange: 82, luxury: 158 }, // Blended: Portuguese tourist city with excellent vacation rental market (20% savings)
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 68, meals: 26, transport: 8, activities: 20, drinks: 14, incidentals: 12 },
      luxury: { total: 260, meals: 95, transport: 15, activities: 80, drinks: 55, incidentals: 25 }
    },
    confidence: 'high'
  },

  'athens': {
    dailyCost: { budget: 32, midRange: 70, luxury: 260 },
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 10, drinks: 6, incidentals: 8 },
      midRange: { total: 70, meals: 26, transport: 8, activities: 22, drinks: 14, incidentals: 12 },
      luxury: { total: 260, meals: 90, transport: 15, activities: 85, drinks: 55, incidentals: 25 }
    },
    confidence: 'high'
  },

  'santorini': {
    dailyCost: { budget: 65, midRange: 135, luxury: 480 },
    breakdown: {
      budget: { total: 65, meals: 28, transport: 12, activities: 18, drinks: 9, incidentals: 12 },
      midRange: { total: 135, meals: 52, transport: 20, activities: 38, drinks: 25, incidentals: 20 },
      luxury: { total: 480, meals: 170, transport: 35, activities: 140, drinks: 105, incidentals: 30 }
    },
    confidence: 'high'
  },

  'warsaw': {
    dailyCost: { budget: 30, midRange: 65, luxury: 240 },
    breakdown: {
      budget: { total: 30, meals: 12, transport: 5, activities: 10, drinks: 5, incidentals: 8 },
      midRange: { total: 65, meals: 24, transport: 8, activities: 21, drinks: 12, incidentals: 12 },
      luxury: { total: 240, meals: 85, transport: 15, activities: 80, drinks: 45, incidentals: 25 }
    },
    confidence: 'high'
  },

  'krakow': {
    dailyCost: { budget: 28, midRange: 60, luxury: 220 },
    breakdown: {
      budget: { total: 28, meals: 11, transport: 4, activities: 10, drinks: 5, incidentals: 8 },
      midRange: { total: 60, meals: 22, transport: 6, activities: 20, drinks: 12, incidentals: 12 },
      luxury: { total: 220, meals: 78, transport: 12, activities: 75, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'helsinki': {
    dailyCost: { budget: 55, midRange: 120, luxury: 450 },
    accommodation: { budget: 78, midRange: 148, luxury: 268 }, // Blended: Nordic capital with growing tech-friendly Airbnb market (14% savings)
    breakdown: {
      budget: { total: 55, meals: 24, transport: 10, activities: 16, drinks: 7, incidentals: 8 },
      midRange: { total: 120, meals: 46, transport: 20, activities: 34, drinks: 20, incidentals: 15 },
      luxury: { total: 450, meals: 160, transport: 35, activities: 135, drinks: 95, incidentals: 25 }
    },
    confidence: 'high'
  },

  'zagreb': {
    dailyCost: { budget: 32, midRange: 68, luxury: 250 },
    accommodation: { budget: 42, midRange: 82, luxury: 155 }, // Blended: Croatian capital with excellent Airbnb culture (22% savings)
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 11, drinks: 5, incidentals: 8 },
      midRange: { total: 68, meals: 26, transport: 8, activities: 22, drinks: 12, incidentals: 12 },
      luxury: { total: 250, meals: 90, transport: 15, activities: 80, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'dubrovnik': {
    dailyCost: { budget: 48, midRange: 105, luxury: 390 },
    accommodation: { budget: 58, midRange: 115, luxury: 218 }, // Blended: Croatian tourist hotspot with strong vacation rental market (20% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 6, activities: 17, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 12, activities: 33, drinks: 20, incidentals: 15 },
      luxury: { total: 390, meals: 140, transport: 20, activities: 125, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'antalya': {
    dailyCost: { budget: 30, midRange: 65, luxury: 240 },
    accommodation: { budget: 38, midRange: 75, luxury: 148 }, // Blended: Turkish resort destination with growing vacation rental market (20% savings)
    breakdown: {
      budget: { total: 30, meals: 12, transport: 4, activities: 11, drinks: 5, incidentals: 8 },
      midRange: { total: 65, meals: 24, transport: 6, activities: 23, drinks: 12, incidentals: 12 },
      luxury: { total: 240, meals: 85, transport: 12, activities: 85, drinks: 43, incidentals: 25 }
    },
    confidence: 'high'
  },

  'bucharest': {
    dailyCost: { budget: 26, midRange: 55, luxury: 205 },
    breakdown: {
      budget: { total: 26, meals: 11, transport: 3, activities: 9, drinks: 5, incidentals: 8 },
      midRange: { total: 55, meals: 20, transport: 5, activities: 18, drinks: 12, incidentals: 12 },
      luxury: { total: 205, meals: 72, transport: 10, activities: 75, drinks: 33, incidentals: 25 }
    },
    confidence: 'high'
  },

  'manchester': {
    dailyCost: { budget: 42, midRange: 90, luxury: 330 },
    accommodation: { budget: 68, midRange: 128, luxury: 228 }, // Blended: northern English city with good Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 6, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 330, meals: 115, transport: 20, activities: 105, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MISSING ASIAN CITIES - BATCH 1
  'beijing': {
    dailyCost: { budget: 28, midRange: 65, luxury: 240 },
    accommodation: { budget: 45, midRange: 88, luxury: 168 }, // Blended: Chinese capital with regulated but growing short-term rental market (18% savings)
    breakdown: {
      budget: { total: 28, meals: 12, transport: 4, activities: 8, drinks: 4, incidentals: 8 },
      midRange: { total: 65, meals: 25, transport: 8, activities: 20, drinks: 12, incidentals: 12 },
      luxury: { total: 240, meals: 85, transport: 15, activities: 80, drinks: 45, incidentals: 25 }
    },
    confidence: 'high'
  },

  'guangzhou': {
    dailyCost: { budget: 26, midRange: 58, luxury: 220 },
    accommodation: { budget: 42, midRange: 82, luxury: 155 }, // Blended: southern Chinese business city with emerging short-term rental market (18% savings)
    breakdown: {
      budget: { total: 26, meals: 11, transport: 3, activities: 8, drinks: 4, incidentals: 8 },
      midRange: { total: 58, meals: 22, transport: 6, activities: 18, drinks: 12, incidentals: 12 },
      luxury: { total: 220, meals: 78, transport: 12, activities: 75, drinks: 40, incidentals: 25 }
    },
    confidence: 'high'
  },

  'chiang-mai': {
    dailyCost: { budget: 38, midRange: 60, luxury: 170 },
    accommodation: { budget: 28, midRange: 52, luxury: 115 }, // Blended: northern Thai city with excellent backpacker and digital nomad Airbnb market (25% savings)
    breakdown: {
      budget: { total: 38, meals: 16, transport: 5, activities: 12, drinks: 8, incidentals: 8 },
      midRange: { total: 60, meals: 22, transport: 8, activities: 18, drinks: 12, incidentals: 12 },
      luxury: { total: 150, meals: 55, transport: 10, activities: 45, drinks: 25, incidentals: 25 }
    },
    confidence: 'high'
  },

  'phuket': {
    dailyCost: { budget: 25, midRange: 55, luxury: 200 },
    accommodation: { budget: 32, midRange: 68, luxury: 142 }, // Blended: Thai resort island with excellent vacation rental market (25% savings)
    breakdown: {
      budget: { total: 25, meals: 10, transport: 4, activities: 8, drinks: 3, incidentals: 8 },
      midRange: { total: 55, meals: 20, transport: 8, activities: 15, drinks: 12, incidentals: 12 },
      luxury: { total: 200, meals: 70, transport: 15, activities: 65, drinks: 35, incidentals: 25 }
    },
    confidence: 'high'
  },

  'penang': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 6, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 55, drinks: 33, incidentals: 25 }
    },
    confidence: 'high'
  },

  'cebu': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'bangalore': {
    dailyCost: { budget: 36, midRange: 62, luxury: 180 },
    breakdown: {
      budget: { total: 36, meals: 15, transport: 5, activities: 12, drinks: 8, incidentals: 8 },
      midRange: { total: 62, meals: 24, transport: 8, activities: 20, drinks: 15, incidentals: 12 },
      luxury: { total: 160, meals: 55, transport: 8, activities: 50, drinks: 32, incidentals: 25 }
    },
    confidence: 'high'
  },

  'chennai': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'abu-dhabi': {
    dailyCost: { budget: 55, midRange: 125, luxury: 450 },
    breakdown: {
      budget: { total: 55, meals: 24, transport: 10, activities: 16, drinks: 5, incidentals: 12 },
      midRange: { total: 125, meals: 48, transport: 20, activities: 32, drinks: 25, incidentals: 20 },
      luxury: { total: 450, meals: 160, transport: 35, activities: 135, drinks: 85, incidentals: 35 }
    },
    confidence: 'high'
  },

  'doha': {
    dailyCost: { budget: 52, midRange: 118, luxury: 420 },
    breakdown: {
      budget: { total: 52, meals: 22, transport: 10, activities: 15, drinks: 5, incidentals: 12 },
      midRange: { total: 118, meals: 45, transport: 18, activities: 30, drinks: 25, incidentals: 20 },
      luxury: { total: 420, meals: 150, transport: 30, activities: 125, drinks: 80, incidentals: 35 }
    },
    confidence: 'high'
  },

  'taipei': {
    dailyCost: { budget: 32, midRange: 70, luxury: 260 },
    breakdown: {
      budget: { total: 32, meals: 14, transport: 4, activities: 10, drinks: 4, incidentals: 8 },
      midRange: { total: 70, meals: 26, transport: 8, activities: 22, drinks: 14, incidentals: 12 },
      luxury: { total: 260, meals: 90, transport: 15, activities: 85, drinks: 55, incidentals: 25 }
    },
    confidence: 'high'
  },

  'colombo': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'male': {
    dailyCost: { budget: 85, midRange: 180, luxury: 650 },
    breakdown: {
      budget: { total: 85, meals: 38, transport: 15, activities: 24, drinks: 8, incidentals: 12 },
      midRange: { total: 180, meals: 70, transport: 30, activities: 50, drinks: 30, incidentals: 20 },
      luxury: { total: 650, meals: 230, transport: 60, activities: 200, drinks: 125, incidentals: 35 }
    },
    confidence: 'high'
  },

  'bali': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MISSING OCEANIA CITIES - COMPLETE SET
  'brisbane': {
    dailyCost: { budget: 52, midRange: 110, luxury: 400 },
    accommodation: { budget: 75, midRange: 142, luxury: 258 }, // Blended: Australian city with good Airbnb market (16% savings)
    breakdown: {
      budget: { total: 52, meals: 22, transport: 10, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 110, meals: 42, transport: 20, activities: 28, drinks: 20, incidentals: 15 },
      luxury: { total: 400, meals: 145, transport: 35, activities: 120, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'perth': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 72, midRange: 135, luxury: 245 }, // Blended: western Australian city with growing Airbnb market (16% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 10, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 18, activities: 27, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 30, activities: 115, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'adelaide': {
    dailyCost: { budget: 45, midRange: 98, luxury: 360 },
    accommodation: { budget: 68, midRange: 128, luxury: 232 }, // Blended: South Australian city with good Airbnb culture (16% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 15, activities: 27, drinks: 20, incidentals: 15 },
      luxury: { total: 360, meals: 125, transport: 25, activities: 115, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'gold-coast': {
    dailyCost: { budget: 55, midRange: 115, luxury: 420 },
    accommodation: { budget: 78, midRange: 148, luxury: 268 }, // Blended: Australian resort city with excellent vacation rental market (16% savings)
    breakdown: {
      budget: { total: 55, meals: 23, transport: 10, activities: 17, drinks: 7, incidentals: 8 },
      midRange: { total: 115, meals: 44, transport: 18, activities: 33, drinks: 20, incidentals: 15 },
      luxury: { total: 420, meals: 150, transport: 30, activities: 135, drinks: 80, incidentals: 25 }
    },
    confidence: 'high'
  },

  'auckland': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 68, midRange: 132, luxury: 242 }, // Blended: New Zealand's largest city with growing Airbnb culture (15% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 15, activities: 30, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 25, activities: 120, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'wellington': {
    dailyCost: { budget: 45, midRange: 98, luxury: 360 },
    accommodation: { budget: 62, midRange: 118, luxury: 218 }, // Blended: New Zealand capital with good vacation rental options (15% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 15, activities: 27, drinks: 20, incidentals: 15 },
      luxury: { total: 360, meals: 125, transport: 25, activities: 115, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'christchurch': {
    dailyCost: { budget: 42, midRange: 90, luxury: 330 },
    accommodation: { budget: 58, midRange: 112, luxury: 205 }, // Blended: New Zealand city with decent vacation rental options (15% savings)
    breakdown: {
      budget: { total: 42, meals: 16, transport: 8, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 24, drinks: 20, incidentals: 15 },
      luxury: { total: 330, meals: 115, transport: 20, activities: 105, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MISSING AFRICAN CITIES - MAJOR DESTINATIONS
  'alexandria': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'johannesburg': {
    dailyCost: { budget: 26, midRange: 55, luxury: 205 },
    breakdown: {
      budget: { total: 26, meals: 11, transport: 4, activities: 8, drinks: 3, incidentals: 8 },
      midRange: { total: 55, meals: 20, transport: 6, activities: 19, drinks: 10, incidentals: 12 },
      luxury: { total: 205, meals: 72, transport: 12, activities: 70, drinks: 36, incidentals: 25 }
    },
    confidence: 'high'
  },

  'durban': {
    dailyCost: { budget: 24, midRange: 50, luxury: 185 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 4, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 50, meals: 18, transport: 5, activities: 17, drinks: 10, incidentals: 12 },
      luxury: { total: 185, meals: 65, transport: 10, activities: 65, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'casablanca': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 5, activities: 15, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 58, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'nairobi': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'addis-ababa': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'lagos': {
    dailyCost: { budget: 24, midRange: 52, luxury: 195 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 4, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 52, meals: 20, transport: 6, activities: 16, drinks: 10, incidentals: 12 },
      luxury: { total: 195, meals: 70, transport: 15, activities: 65, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'accra': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 5, activities: 15, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 58, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'tunis': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MISSING SOUTH AMERICAN CITIES
  'salvador': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 4, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 6, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 15, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'fortaleza': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'brasilia': {
    dailyCost: { budget: 26, midRange: 55, luxury: 205 },
    breakdown: {
      budget: { total: 26, meals: 11, transport: 4, activities: 8, drinks: 3, incidentals: 8 },
      midRange: { total: 55, meals: 20, transport: 6, activities: 19, drinks: 10, incidentals: 12 },
      luxury: { total: 205, meals: 72, transport: 12, activities: 70, drinks: 36, incidentals: 25 }
    },
    confidence: 'high'
  },

  'manaus': {
    dailyCost: { budget: 24, midRange: 50, luxury: 185 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 4, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 50, meals: 18, transport: 5, activities: 17, drinks: 10, incidentals: 12 },
      luxury: { total: 185, meals: 65, transport: 10, activities: 65, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'curitiba': {
    dailyCost: { budget: 24, midRange: 52, luxury: 195 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 4, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 52, meals: 20, transport: 6, activities: 16, drinks: 10, incidentals: 12 },
      luxury: { total: 195, meals: 70, transport: 15, activities: 65, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'medellin': {
    dailyCost: { budget: 18, midRange: 40, luxury: 150 },
    breakdown: {
      budget: { total: 18, meals: 7, transport: 3, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 40, meals: 15, transport: 4, activities: 11, drinks: 10, incidentals: 12 },
      luxury: { total: 150, meals: 55, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'cartagena': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'quito': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'guayaquil': {
    dailyCost: { budget: 18, midRange: 40, luxury: 150 },
    breakdown: {
      budget: { total: 18, meals: 7, transport: 3, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 40, meals: 15, transport: 4, activities: 11, drinks: 10, incidentals: 12 },
      luxury: { total: 150, meals: 55, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'arequipa': {
    dailyCost: { budget: 16, midRange: 35, luxury: 130 },
    breakdown: {
      budget: { total: 16, meals: 6, transport: 2, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 35, meals: 13, transport: 3, activities: 9, drinks: 10, incidentals: 12 },
      luxury: { total: 130, meals: 45, transport: 7, activities: 40, drinks: 23, incidentals: 25 }
    },
    confidence: 'high'
  },

  'sucre': {
    dailyCost: { budget: 14, midRange: 32, luxury: 125 },
    breakdown: {
      budget: { total: 14, meals: 5, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 32, meals: 12, transport: 3, activities: 7, drinks: 10, incidentals: 12 },
      luxury: { total: 125, meals: 42, transport: 8, activities: 37, drinks: 23, incidentals: 25 }
    },
    confidence: 'high'
  },

  'santa-cruz': {
    dailyCost: { budget: 16, midRange: 35, luxury: 130 },
    breakdown: {
      budget: { total: 16, meals: 6, transport: 2, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 35, meals: 13, transport: 3, activities: 9, drinks: 10, incidentals: 12 },
      luxury: { total: 130, meals: 45, transport: 7, activities: 40, drinks: 23, incidentals: 25 }
    },
    confidence: 'high'
  },

  'asuncion': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'montevideo': {
    dailyCost: { budget: 28, midRange: 60, luxury: 220 },
    breakdown: {
      budget: { total: 28, meals: 12, transport: 4, activities: 9, drinks: 3, incidentals: 8 },
      midRange: { total: 60, meals: 22, transport: 6, activities: 22, drinks: 10, incidentals: 12 },
      luxury: { total: 220, meals: 78, transport: 12, activities: 85, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'punta-del-este': {
    dailyCost: { budget: 35, midRange: 75, luxury: 280 },
    breakdown: {
      budget: { total: 35, meals: 15, transport: 5, activities: 12, drinks: 3, incidentals: 8 },
      midRange: { total: 75, meals: 28, transport: 8, activities: 29, drinks: 10, incidentals: 12 },
      luxury: { total: 280, meals: 98, transport: 15, activities: 122, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'caracas': {
    dailyCost: { budget: 18, midRange: 40, luxury: 150 },
    breakdown: {
      budget: { total: 18, meals: 7, transport: 3, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 40, meals: 15, transport: 4, activities: 11, drinks: 10, incidentals: 12 },
      luxury: { total: 150, meals: 55, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  // FINAL BATCH - REMAINING CITIES
  'puerto-vallarta': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 5, activities: 15, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 58, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'acapulco': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'san-jose-costa-rica': {
    dailyCost: { budget: 24, midRange: 52, luxury: 195 },
    breakdown: {
      budget: { total: 24, meals: 10, transport: 4, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 52, meals: 20, transport: 6, activities: 16, drinks: 10, incidentals: 12 },
      luxury: { total: 195, meals: 70, transport: 15, activities: 65, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'panama-city': {
    dailyCost: { budget: 26, midRange: 55, luxury: 205 },
    breakdown: {
      budget: { total: 26, meals: 11, transport: 4, activities: 8, drinks: 3, incidentals: 8 },
      midRange: { total: 55, meals: 20, transport: 6, activities: 19, drinks: 10, incidentals: 12 },
      luxury: { total: 205, meals: 72, transport: 12, activities: 70, drinks: 36, incidentals: 25 }
    },
    confidence: 'high'
  },

  'guatemala-city': {
    dailyCost: { budget: 18, midRange: 40, luxury: 150 },
    breakdown: {
      budget: { total: 18, meals: 7, transport: 3, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 40, meals: 15, transport: 4, activities: 11, drinks: 10, incidentals: 12 },
      luxury: { total: 150, meals: 55, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'san-salvador': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'tegucigalpa': {
    dailyCost: { budget: 16, midRange: 38, luxury: 145 },
    breakdown: {
      budget: { total: 16, meals: 7, transport: 2, activities: 4, drinks: 3, incidentals: 8 },
      midRange: { total: 38, meals: 14, transport: 4, activities: 10, drinks: 10, incidentals: 12 },
      luxury: { total: 145, meals: 50, transport: 8, activities: 45, drinks: 27, incidentals: 25 }
    },
    confidence: 'high'
  },

  'managua': {
    dailyCost: { budget: 16, midRange: 35, luxury: 130 },
    breakdown: {
      budget: { total: 16, meals: 6, transport: 2, activities: 5, drinks: 3, incidentals: 8 },
      midRange: { total: 35, meals: 13, transport: 3, activities: 9, drinks: 10, incidentals: 12 },
      luxury: { total: 130, meals: 45, transport: 7, activities: 40, drinks: 23, incidentals: 25 }
    },
    confidence: 'high'
  },

  'kingston': {
    dailyCost: { budget: 28, midRange: 60, luxury: 220 },
    breakdown: {
      budget: { total: 28, meals: 12, transport: 4, activities: 9, drinks: 3, incidentals: 8 },
      midRange: { total: 60, meals: 22, transport: 6, activities: 22, drinks: 10, incidentals: 12 },
      luxury: { total: 220, meals: 78, transport: 12, activities: 85, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'santo-domingo': {
    dailyCost: { budget: 22, midRange: 48, luxury: 180 },
    breakdown: {
      budget: { total: 22, meals: 9, transport: 3, activities: 7, drinks: 3, incidentals: 8 },
      midRange: { total: 48, meals: 18, transport: 5, activities: 15, drinks: 10, incidentals: 12 },
      luxury: { total: 180, meals: 65, transport: 12, activities: 58, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'port-au-prince': {
    dailyCost: { budget: 20, midRange: 45, luxury: 170 },
    breakdown: {
      budget: { total: 20, meals: 8, transport: 3, activities: 6, drinks: 3, incidentals: 8 },
      midRange: { total: 45, meals: 16, transport: 5, activities: 14, drinks: 10, incidentals: 12 },
      luxury: { total: 170, meals: 60, transport: 10, activities: 55, drinks: 30, incidentals: 25 }
    },
    confidence: 'high'
  },

  'nassau': {
    dailyCost: { budget: 45, midRange: 95, luxury: 350 },
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 95, meals: 35, transport: 15, activities: 25, drinks: 20, incidentals: 15 },
      luxury: { total: 350, meals: 125, transport: 25, activities: 115, drinks: 60, incidentals: 25 }
    },
    confidence: 'high'
  },

  'bridgetown': {
    dailyCost: { budget: 42, midRange: 90, luxury: 330 },
    breakdown: {
      budget: { total: 42, meals: 16, transport: 8, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 24, drinks: 20, incidentals: 15 },
      luxury: { total: 330, meals: 115, transport: 20, activities: 105, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  'port-of-spain': {
    dailyCost: { budget: 38, midRange: 80, luxury: 295 },
    breakdown: {
      budget: { total: 38, meals: 15, transport: 7, activities: 11, drinks: 7, incidentals: 8 },
      midRange: { total: 80, meals: 30, transport: 10, activities: 20, drinks: 20, incidentals: 15 },
      luxury: { total: 295, meals: 105, transport: 18, activities: 95, drinks: 52, incidentals: 25 }
    },
    confidence: 'high'
  },

  // MAJOR US DEPARTURE CITIES - MISSING FROM DATABASE
  'phoenix': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 72, midRange: 142, luxury: 258 }, // Blended: desert city with good Airbnb market (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 10, activities: 13, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 18, activities: 27, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 30, activities: 115, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'detroit': {
    dailyCost: { budget: 40, midRange: 85, luxury: 310 },
    accommodation: { budget: 58, midRange: 118, luxury: 198 }, // Blended: revitalizing city with growing Airbnb market (20% savings)
    breakdown: {
      budget: { total: 40, meals: 16, transport: 8, activities: 11, drinks: 7, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 23, drinks: 18, incidentals: 12 },
      luxury: { total: 310, meals: 110, transport: 20, activities: 90, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  'minneapolis': {
    dailyCost: { budget: 45, midRange: 98, luxury: 360 },
    accommodation: { budget: 68, midRange: 132, luxury: 238 }, // Blended: midwest city with good vacation rental market (17% savings)
    breakdown: {
      budget: { total: 45, meals: 18, transport: 8, activities: 14, drinks: 7, incidentals: 8 },
      midRange: { total: 98, meals: 36, transport: 15, activities: 27, drinks: 20, incidentals: 15 },
      luxury: { total: 360, meals: 125, transport: 25, activities: 110, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'salt-lake-city': {
    dailyCost: { budget: 42, midRange: 90, luxury: 340 },
    accommodation: { budget: 62, midRange: 125, luxury: 218 }, // Blended: outdoor recreation city with good Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 8, activities: 12, drinks: 6, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 340, meals: 120, transport: 20, activities: 105, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'portland': {
    dailyCost: { budget: 48, midRange: 105, luxury: 380 },
    accommodation: { budget: 75, midRange: 148, luxury: 268 }, // Blended: progressive city with strong Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 48, meals: 20, transport: 8, activities: 15, drinks: 7, incidentals: 8 },
      midRange: { total: 105, meals: 40, transport: 15, activities: 30, drinks: 20, incidentals: 15 },
      luxury: { total: 380, meals: 135, transport: 25, activities: 120, drinks: 75, incidentals: 25 }
    },
    confidence: 'high'
  },

  'nashville': {
    dailyCost: { budget: 42, midRange: 90, luxury: 340 },
    accommodation: { budget: 65, midRange: 128, luxury: 225 }, // Blended: music city with excellent vacation rental market (20% savings)
    breakdown: {
      budget: { total: 42, meals: 18, transport: 8, activities: 11, drinks: 7, incidentals: 8 },
      midRange: { total: 90, meals: 34, transport: 12, activities: 26, drinks: 18, incidentals: 12 },
      luxury: { total: 340, meals: 120, transport: 20, activities: 105, drinks: 70, incidentals: 25 }
    },
    confidence: 'high'
  },

  'charlotte': {
    dailyCost: { budget: 40, midRange: 85, luxury: 320 },
    accommodation: { budget: 62, midRange: 122, luxury: 205 }, // Blended: southern business hub with growing Airbnb market (18% savings)
    breakdown: {
      budget: { total: 40, meals: 16, transport: 8, activities: 11, drinks: 7, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 23, drinks: 18, incidentals: 12 },
      luxury: { total: 320, meals: 115, transport: 20, activities: 95, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  'kansas-city': {
    dailyCost: { budget: 38, midRange: 80, luxury: 295 },
    accommodation: { budget: 55, midRange: 108, luxury: 188 }, // Blended: midwest city with affordable vacation rental market (20% savings)
    breakdown: {
      budget: { total: 38, meals: 15, transport: 8, activities: 10, drinks: 7, incidentals: 8 },
      midRange: { total: 80, meals: 30, transport: 12, activities: 20, drinks: 18, incidentals: 12 },
      luxury: { total: 295, meals: 105, transport: 18, activities: 85, drinks: 62, incidentals: 25 }
    },
    confidence: 'high'
  },

  'pittsburgh': {
    dailyCost: { budget: 40, midRange: 85, luxury: 320 },
    accommodation: { budget: 58, midRange: 115, luxury: 198 }, // Blended: revitalized city with good Airbnb culture (18% savings)
    breakdown: {
      budget: { total: 40, meals: 16, transport: 8, activities: 11, drinks: 7, incidentals: 8 },
      midRange: { total: 85, meals: 32, transport: 12, activities: 23, drinks: 18, incidentals: 12 },
      luxury: { total: 320, meals: 115, transport: 20, activities: 95, drinks: 65, incidentals: 25 }
    },
    confidence: 'high'
  },

  'cleveland': {
    dailyCost: { budget: 38, midRange: 80, luxury: 295 },
    accommodation: { budget: 55, midRange: 108, luxury: 185 }, // Blended: affordable midwest city with good vacation rental options (20% savings)
    breakdown: {
      budget: { total: 38, meals: 15, transport: 8, activities: 10, drinks: 7, incidentals: 8 },
      midRange: { total: 80, meals: 30, transport: 12, activities: 20, drinks: 18, incidentals: 12 },
      luxury: { total: 295, meals: 105, transport: 18, activities: 85, drinks: 62, incidentals: 25 }
    },
    confidence: 'high'
  }
};

/**
 * Claude Daily Costs API
 * Provides methods to access and query the daily costs database
 */
export class ClaudeDailyCosts {
  /**
   * Get daily costs for a city
   */
  static getDailyCosts(cityKey: string): CityDailyCosts | null {
    const normalizedKey = cityKey.toLowerCase().replace(/\s+/g, '-');
    return CLAUDE_DAILY_COSTS_DATABASE[normalizedKey] || null;
  }

  /**
   * Get detailed breakdown for a city
   */
  static getDetailedBreakdown(cityKey: string): CityDailyCosts['breakdown'] | null {
    const costs = this.getDailyCosts(cityKey);
    return costs ? costs.breakdown : null;
  }

  /**
   * Check if a city exists in the database
   */
  static hasCity(cityKey: string): boolean {
    const normalizedKey = cityKey.toLowerCase().replace(/\s+/g, '-');
    return normalizedKey in CLAUDE_DAILY_COSTS_DATABASE;
  }

  /**
   * Get all available city keys
   */
  static getAllCities(): string[] {
    return Object.keys(CLAUDE_DAILY_COSTS_DATABASE);
  }

  /**
   * Get total count of cities in database
   */
  static getCityCount(): number {
    return Object.keys(CLAUDE_DAILY_COSTS_DATABASE).length;
  }

  /**
   * Get daily cost for specific travel style
   */
  static getDailyCostForStyle(cityKey: string, style: 'budget' | 'midRange' | 'luxury'): number | null {
    const costs = this.getDailyCosts(cityKey);
    return costs ? costs.dailyCost[style] : null;
  }

  /**
   * Search cities by name (partial match)
   */
  static searchCities(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    return this.getAllCities().filter(city => 
      city.toLowerCase().includes(normalizedQuery)
    );
  }
}
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
import React from "react";
import { Calendar, DollarSign, MapPin, Shield, Thermometer, Plane, Clock, AlertTriangle, TrendingUp, TrendingDown, Lightbulb, Target, Wifi, CreditCard, Phone } from "lucide-react";
import type { CityRecommendation } from "@shared/schema";

type SmartInsightsProps = {
  city: CityRecommendation;
  travelStyle: "budget" | "mid" | "luxury";
  userBudget?: number;
  originAirport?: string;
};

export function CityModalSmartInsights({ city, travelStyle, userBudget, originAirport }: SmartInsightsProps) {
  // Get current month for seasonal insights
  const getCurrentMonth = () => new Date().getMonth();
  const getCurrentSeason = () => {
    const month = getCurrentMonth();
    if (month >= 11 || month <= 1) return 'winter';
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    return 'fall';
  };

  // Enhanced regional insights for ALL regions
  const getRegionalMoneySavingTips = () => {
    const regionTips = {
      "europe": {
        bestValue: "Book accommodations 4-6 weeks ahead, use public transport passes",
        hidden: "Many museums are free on first Sunday mornings",
        seasonal: "Visit in shoulder season (Apr-May, Sep-Oct) for 30-40% savings",
        transport: "Eurail pass pays off if visiting 3+ countries in 2+ weeks",
        food: "Lunch menus (€10-15) offer same food as dinner (€25-35)",
        tech: "Get eSIM or local SIM - roaming charges can be €5-10/day"
      },
      "asia": {
        bestValue: "Street food is 70-80% cheaper than restaurants and often better",
        hidden: "Many temples offer free meditation sessions and cultural programs",
        seasonal: "Avoid Chinese New Year and Golden Week for better prices",
        transport: "Night buses/trains save a hotel night and are very affordable",
        food: "Eat where locals eat - follow the crowds for authentic, cheap meals",
        tech: "Download local ride-hailing apps (Grab, etc.) for better prices"
      },
      "north_america": {
        bestValue: "Happy hour deals (3-6 PM) can save 40-50% on drinks and apps",
        hidden: "Many cities have free downtown trolleys or public art walks",
        seasonal: "Winter rates in warm cities drop 20-30% (except holidays)",
        transport: "Megabus and Greyhound offer $1-20 intercity travel",
        food: "Food trucks and food halls offer restaurant quality at half price",
        tech: "Use library WiFi - most cities have excellent free internet access"
      },
      "south_america": {
        bestValue: "Use local buses - 50x cheaper than tourist shuttles",
        hidden: "Free walking tours operate in most major cities (tip-based)",
        seasonal: "Shoulder season saves 40-60% on accommodations",
        transport: "Overnight buses are comfortable and save hotel costs",
        food: "Mercados (markets) have incredible cheap eats and fresh juice",
        tech: "Buy local SIM cards - international roaming is very expensive"
      },
      "africa": {
        bestValue: "Shared taxis and minibuses are authentic and very affordable",
        hidden: "Many national parks have free community days monthly",
        seasonal: "Dry season premium can be 100%+ - wet season has perks",
        transport: "Bus travel is comfortable and costs 80% less than flying",
        food: "Local restaurants (not hotels) offer amazing food for $2-5",
        tech: "Mobile money is widely used - get local mobile wallet set up"
      },
      "oceania": {
        bestValue: "Cook your own meals - groceries are expensive but restaurants more so",
        hidden: "Many beaches have free BBQ facilities and picnic areas",
        seasonal: "Shoulder seasons (Mar-May, Sep-Nov) save 30-50%",
        transport: "Camping and backpacker passes offer significant savings",
        food: "RSL clubs offer cheap meals and often welcome travelers",
        tech: "Get unlimited data plans - WiFi charges at hotels can be $20+/day"
      },
      "middle_east": {
        bestValue: "Stay in old city areas for character and lower prices",
        hidden: "Many mosques offer free cultural tours and iftar during Ramadan",
        seasonal: "Summer is brutal but hotels are 50-70% cheaper",
        transport: "Metro systems are modern, air-conditioned, and very affordable",
        food: "Street food and local joints are safe and incredibly cheap",
        tech: "VPN may be needed for some services - check local internet laws"
      }
    };

    const regionKey = city.region.toLowerCase().replace('_', '_');
    return regionTips[regionKey as keyof typeof regionTips] || regionTips["north_america"];
  };

  // Smart booking optimization based on destination and style
  const getBookingIntelligence = () => {
    const baseAdvice = {
      flightWindow: "8-10 weeks ahead",
      hotelWindow: "3-4 weeks ahead",
      activityWindow: "1-2 weeks ahead"
    };

    // Adjust based on region popularity and seasonality
    if (city.region === "europe") {
      baseAdvice.flightWindow = "6-8 weeks ahead (book earlier for summer)";
      baseAdvice.hotelWindow = "4-6 weeks ahead (peak season fills up fast)";
    } else if (city.region === "asia") {
      baseAdvice.flightWindow = "10-12 weeks ahead (better deals for advance booking)";
      baseAdvice.hotelWindow = "2-3 weeks ahead (good last-minute deals often available)";
    } else if (city.region === "oceania") {
      baseAdvice.flightWindow = "12-16 weeks ahead (limited routes, book early)";
      baseAdvice.hotelWindow = "6-8 weeks ahead (high demand, limited supply)";
    }

    return baseAdvice;
  };

  // Dynamic budget optimization based on actual user budget vs city costs
  const getBudgetOptimization = () => {
    const dailyCost = city.breakdown?.dailyPerDay || 100;
    const totalTripCost = dailyCost * (city.nights || 7);
    const isOverBudget = userBudget ? totalTripCost > userBudget : false;
    const percentOver = userBudget ? ((totalTripCost - userBudget) / userBudget) * 100 : 0;

    if (!userBudget) {
      return {
        status: "no_budget",
        tips: [
          "Set a clear budget to get personalized money-saving tips",
          "Track expenses with apps like Trail Wallet or TravelSpend",
          "Allocate 20% extra for unexpected experiences and emergencies"
        ]
      };
    }

    if (isOverBudget) {
      if (percentOver > 50) {
        return {
          status: "significantly_over",
          tips: [
            `🎯 Target: Reduce costs by $${Math.round(totalTripCost - userBudget)} (${Math.round(percentOver)}% over budget)`,
            "Consider staying outside city center - can save 40-60% on accommodation",
            "Cook 1-2 meals per day if accommodation has kitchen facilities",
            "Use public transport exclusively - avoid taxis and ride-shares",
            "Look for free activities: walking tours, parks, free museum days",
            "Consider reducing trip length by 1-2 days to fit budget"
          ]
        };
      } else {
        return {
          status: "moderately_over",
          tips: [
            `🎯 Target: Reduce costs by $${Math.round(totalTripCost - userBudget)} (${Math.round(percentOver)}% over budget)`,
            "Mix street food/local eateries with occasional restaurant meals",
            "Book accommodations slightly outside city center",
            "Use happy hour specials and lunch menus instead of dinner prices",
            "Walk when possible - most city centers are very walkable"
          ]
        };
      }
    } else {
      const extraBudget = userBudget - totalTripCost;
      const percentUnder = (extraBudget / userBudget) * 100;
      
      return {
        status: "under_budget",
        tips: [
          `🎉 Great! You have $${Math.round(extraBudget)} extra budget (${Math.round(percentUnder)}% under)`,
          "Consider upgrading to a nicer hotel for 1-2 nights",
          "Book a food tour or cooking class for authentic local experience",
          "Splurge on that special restaurant you've been researching",
          "Add a day trip or unique activity you wouldn't normally consider",
          "Keep 50% as buffer, spend 50% on experiences"
        ]
      };
    }
  };

  // Seasonal intelligence with specific months and pricing
  const getSeasonalIntelligence = () => {
    const currentSeason = getCurrentSeason();
    const month = getCurrentMonth();
    
    // General seasonal patterns by region
    const seasonalData = {
      winter: {
        europe: { pricing: "25-40% cheaper", weather: "Cold but cozy", crowds: "Very low", pros: ["Christmas markets", "Lower prices", "Authentic local life"], cons: ["Short days", "Cold weather", "Some attractions closed"] },
        asia: { pricing: "Peak pricing", weather: "Perfect temps", crowds: "High", pros: ["Perfect weather", "Clear skies", "Festival season"], cons: ["Higher prices", "More crowds", "Book early"] },
        oceania: { pricing: "Peak pricing", weather: "Summer season", crowds: "Very high", pros: ["Beach weather", "Long days", "All activities open"], cons: ["Highest prices", "Very crowded", "Book months ahead"] }
      },
      spring: {
        europe: { pricing: "Increasing prices", weather: "Mild & pleasant", crowds: "Growing", pros: ["Perfect weather", "Flowers blooming", "Moderate crowds"], cons: ["Prices rising", "Rainy days", "Book ahead"] },
        asia: { pricing: "Shoulder season", weather: "Warm & humid", crowds: "Moderate", pros: ["Good weather", "Reasonable prices", "Less crowds"], cons: ["Some rain", "Increasing humidity", "Festival periods busy"] },
        oceania: { pricing: "Shoulder season", weather: "Mild autumn", crowds: "Moderate", pros: ["Comfortable temps", "Lower prices", "Good weather"], cons: ["Cooler water", "Some seasonal closures", "Variable weather"] }
      },
      summer: {
        europe: { pricing: "Peak pricing", weather: "Warm & busy", crowds: "Very high", pros: ["Long days", "All attractions open", "Festival season"], cons: ["Highest prices", "Very crowded", "Hot in south"] },
        asia: { pricing: "Low season", weather: "Hot & humid", crowds: "Low", pros: ["Lowest prices", "Fewer crowds", "Lush landscapes"], cons: ["Very hot", "Rainy season", "Some flooding"] },
        oceania: { pricing: "Low season", weather: "Cool winter", crowds: "Very low", pros: ["Lowest prices", "No crowds", "Authentic experience"], cons: ["Cold weather", "Short days", "Some closures"] }
      },
      fall: {
        europe: { pricing: "Shoulder season", weather: "Crisp & clear", crowds: "Moderate", pros: ["Beautiful colors", "Good weather", "Harvest season"], cons: ["Shorter days", "Rain increases", "Prices dropping"] },
        asia: { pricing: "Shoulder season", weather: "Cool & dry", crowds: "Moderate", pros: ["Perfect weather", "Clear skies", "Comfortable temps"], cons: ["Prices rising", "Book ahead", "Getting busy"] },
        oceania: { pricing: "Shoulder season", weather: "Warming up", crowds: "Growing", pros: ["Good weather", "Reasonable prices", "Wildflowers"], cons: ["Prices rising", "More crowds", "Book accommodation"] }
      }
    };

    const regionKey = city.region.toLowerCase().replace('_', '') as keyof typeof seasonalData.winter;
    const currentData = seasonalData[currentSeason]?.[regionKey] || seasonalData[currentSeason].europe;

    return {
      current: {
        season: currentSeason,
        ...currentData
      },
      bestTiming: {
        cheapest: city.region === "europe" ? "January-March" : city.region === "asia" ? "July-September" : "May-August",
        weather: city.region === "europe" ? "May-June, September" : city.region === "asia" ? "November-February" : "March-May, September-November",
        crowds: city.region === "europe" ? "November-March" : city.region === "asia" ? "July-September" : "May-August"
      }
    };
  };

  // Technology and connectivity tips by region
  const getTechConnectivityTips = () => {
    const techAdvice = {
      "europe": {
        internet: "Excellent WiFi in cities, get EU-wide data plan",
        payment: "Contactless payment universal, Apple Pay/Google Pay widely accepted",
        apps: "Citymapper for transport, Too Good To Go for food deals",
        data: "EU roaming includes 27 countries in one plan"
      },
      "asia": {
        internet: "Free WiFi common but VPN recommended for some services",
        payment: "Mobile payments dominant (Alipay, WeChat Pay), have cash backup",
        apps: "Google Translate with camera, local ride apps (Grab, Gojek)",
        data: "Local SIM cards very cheap, tourist SIM available at airports"
      },
      "north_america": {
        internet: "Good WiFi in cities, libraries offer free high-speed internet",
        payment: "Credit cards universal, contactless common in major cities",
        apps: "Uber/Lyft, Yelp for restaurants, GasBuddy for road trips",
        data: "Unlimited plans common, good coverage in cities"
      },
      "south_america": {
        internet: "WiFi common in tourist areas, buy local SIM for data",
        payment: "Cash still king, some contactless in major cities",
        apps: "WhatsApp essential, offline maps crucial",
        data: "Data can be expensive, use WiFi when possible"
      },
      "africa": {
        internet: "Growing rapidly, major cities have good connectivity",
        payment: "Mobile money revolutionary (M-Pesa), cash important",
        apps: "WhatsApp universal, offline maps essential",
        data: "Data bundles affordable, coverage improving fast"
      },
      "oceania": {
        internet: "Excellent in cities, limited in remote areas",
        payment: "Contactless universal, cash being phased out",
        apps: "Local transit apps, camping apps for road trips",
        data: "Can be expensive, unlimited plans available"
      },
      "middle_east": {
        internet: "Generally good, some services may be restricted",
        payment: "Mix of cash and cards, contactless growing",
        apps: "Local ride apps common, translation apps helpful",
        data: "Tourist SIM available, check service restrictions"
      }
    };

    const regionKey = city.region.toLowerCase().replace('_', '_');
    return techAdvice[regionKey as keyof typeof techAdvice] || techAdvice["north_america"];
  };

  const regional = getRegionalMoneySavingTips();
  const booking = getBookingIntelligence();
  const budget = getBudgetOptimization();
  const seasonal = getSeasonalIntelligence();
  const tech = getTechConnectivityTips();

  return (
    <div className="space-y-6" data-testid="smart-insights">
      {/* Budget Optimization - Most Important */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Budget Optimization</h3>
        </div>
        <div className="space-y-3">
          {budget.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-blue-600 mt-1 text-xs">
                {i === 0 && budget.status !== "no_budget" ? "🎯" : "💡"}
              </span>
              <span className={i === 0 && budget.status !== "no_budget" ? "font-medium text-blue-800" : "text-blue-700"}>
                {tip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Money-Saving Secrets */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Regional Money-Saving Secrets</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-green-700 mb-2">💰 Best Value Tips</h4>
              <p className="text-sm text-gray-700">{regional.bestValue}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-purple-700 mb-2">🕵️ Hidden Savings</h4>
              <p className="text-sm text-gray-700">{regional.hidden}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-orange-700 mb-2">📅 Seasonal Strategy</h4>
              <p className="text-sm text-gray-700">{regional.seasonal}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-blue-700 mb-2">🚇 Transport Hacks</h4>
              <p className="text-sm text-gray-700">{regional.transport}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-red-700 mb-2">🍽️ Food Savings</h4>
              <p className="text-sm text-gray-700">{regional.food}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-indigo-700 mb-2">📱 Tech & Connectivity</h4>
              <p className="text-sm text-gray-700">{regional.tech}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Intelligence */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Seasonal Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm text-purple-700 mb-3">
              Current Season: {seasonal.current.season.charAt(0).toUpperCase() + seasonal.current.season.slice(1)}
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Pricing:</strong> {seasonal.current.pricing}</p>
              <p><strong>Weather:</strong> {seasonal.current.weather}</p>
              <p><strong>Crowds:</strong> {seasonal.current.crowds}</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="font-medium text-green-600 text-xs mb-1">PROS</p>
                  {seasonal.current.pros.map((pro, i) => (
                    <p key={i} className="text-xs text-green-700">• {pro}</p>
                  ))}
                </div>
                <div>
                  <p className="font-medium text-red-600 text-xs mb-1">CONS</p>
                  {seasonal.current.cons.map((con, i) => (
                    <p key={i} className="text-xs text-red-700">• {con}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-purple-700 mb-3">Optimal Timing</h4>
            <div className="space-y-2 text-sm">
              <p><strong className="text-green-600">💰 Cheapest:</strong> {seasonal.bestTiming.cheapest}</p>
              <p><strong className="text-blue-600">🌤️ Best Weather:</strong> {seasonal.bestTiming.weather}</p>
              <p><strong className="text-orange-600">👥 Fewest Crowds:</strong> {seasonal.bestTiming.crowds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Booking Timeline */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold">Strategic Booking Timeline</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <Plane className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
            <p className="font-medium text-sm text-indigo-800">Flights</p>
            <p className="text-xs text-indigo-600 mt-1">{booking.flightWindow}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="font-medium text-sm text-green-800">Hotels</p>
            <p className="text-xs text-green-600 mt-1">{booking.hotelWindow}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium text-sm text-purple-800">Activities</p>
            <p className="text-xs text-purple-600 mt-1">{booking.activityWindow}</p>
          </div>
        </div>
      </div>

      {/* Technology & Connectivity Guide */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Technology & Connectivity</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wifi className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-sm">Internet Access</h4>
              </div>
              <p className="text-sm text-gray-700">{tech.internet}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-sm">Payment Methods</h4>
              </div>
              <p className="text-sm text-gray-700">{tech.payment}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-sm">Essential Apps</h4>
              </div>
              <p className="text-sm text-gray-700">{tech.apps}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium text-sm">Data & Roaming</h4>
              </div>
              <p className="text-sm text-gray-700">{tech.data}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Style Optimization */}
      <div className="bg-card border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Travel Style Optimization</h3>
        </div>
        <div className={`p-4 rounded-lg border-2 ${
          travelStyle === "budget" ? "bg-green-50 border-green-300" :
          travelStyle === "mid" ? "bg-blue-50 border-blue-300" :
          "bg-purple-50 border-purple-300"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${
              travelStyle === "budget" ? "bg-green-500" :
              travelStyle === "mid" ? "bg-blue-500" :
              "bg-purple-500"
            }`} />
            <span className={`font-medium text-sm ${
              travelStyle === "budget" ? "text-green-800" :
              travelStyle === "mid" ? "text-blue-800" :
              "text-purple-800"
            }`}>
              {travelStyle === "mid" ? "Mid-Range" : travelStyle.charAt(0).toUpperCase() + travelStyle.slice(1)} Travel Style
            </span>
          </div>
          
          {travelStyle === "budget" && (
            <div className="space-y-2 text-sm text-green-700">
              <p>• <strong>Accommodation:</strong> Hostels with private rooms, guesthouses, Airbnb shared spaces</p>
              <p>• <strong>Dining:</strong> Street food, local markets, cooking your own meals</p>
              <p>• <strong>Transport:</strong> Public transport, walking, budget airlines</p>
              <p>• <strong>Activities:</strong> Free walking tours, public beaches, hiking, free museums</p>
              <p>• <strong>Pro tip:</strong> Book hostels with kitchens to save 50-70% on food costs</p>
            </div>
          )}
          
          {travelStyle === "mid" && (
            <div className="space-y-2 text-sm text-blue-700">
              <p>• <strong>Accommodation:</strong> Mid-range hotels, nice Airbnbs, boutique properties</p>
              <p>• <strong>Dining:</strong> Mix of local restaurants and street food, some splurge meals</p>
              <p>• <strong>Transport:</strong> Mix of public transport and taxis, domestic flights</p>
              <p>• <strong>Activities:</strong> Paid tours, museums, some unique experiences</p>
              <p>• <strong>Pro tip:</strong> Book accommodations with breakfast to save time and money</p>
            </div>
          )}
          
          {travelStyle === "luxury" && (
            <div className="space-y-2 text-sm text-purple-700">
              <p>• <strong>Accommodation:</strong> 4-5 star hotels, luxury resorts, premium Airbnb</p>
              <p>• <strong>Dining:</strong> Fine dining, room service, wine tastings, cooking classes</p>
              <p>• <strong>Transport:</strong> Private transfers, business class flights, first-class trains</p>
              <p>• <strong>Activities:</strong> Private tours, exclusive experiences, premium attractions</p>
              <p>• <strong>Pro tip:</strong> Book directly with hotels for upgrades and perks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
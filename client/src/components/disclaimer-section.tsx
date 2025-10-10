import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface DisclaimerSectionProps {
  sources?: string[];
  disclaimer?: string;
}

export function DisclaimerSection({ 
  sources = ["Claude AI"], 
  disclaimer = "Ballpark estimates, not live quotes. Events/holidays may raise prices." 
}: DisclaimerSectionProps) {
  return (
    <Card className="bg-muted/50" data-testid="disclaimer-section">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-foreground flex items-center text-lg">
          <Info className="h-5 w-5 mr-2" />
          Important Disclaimers
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="mb-2" data-testid="text-disclaimer-accuracy">
              <strong>These are ballpark estimates, not live quotes.</strong> Actual prices may vary based on booking dates, availability, seasonality, and local events.
            </p>
            <p data-testid="text-disclaimer-variance">
              Hotel prices show 25th-75th percentile ranges. Daily costs include meals, activities, and local transport.
            </p>
          </div>
          <div>
            <p className="mb-2" data-testid="text-disclaimer-sources">
              <strong>Data sources:</strong> Hotel & daily cost estimates from Claude AI with intelligent market analysis.
            </p>
            <p data-testid="text-disclaimer-updates">
              Updates: Hotels monthly, Daily costs quarterly.
            </p>
          </div>
        </div>
        
        {disclaimer && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground" data-testid="text-disclaimer-general">
              <strong>Note:</strong> {disclaimer}
            </p>
          </div>
        )}
        
        {sources.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground" data-testid="text-data-sources">
              Current data sources: {sources.join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

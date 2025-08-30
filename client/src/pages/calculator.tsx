import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import GoldCalculator from "@/components/calculator/gold-calculator";
import { TrendingUp } from "lucide-react";
import type { GoldCalculation } from "@shared/schema";

export default function Calculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recentCalculations, isLoading } = useQuery({
    queryKey: ["/api/calculations"],
    queryFn: () => fetch("/api/calculations?limit=10").then(res => res.json()),
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="calculator-title">Gold Calculator</h2>
        <p className="text-muted-foreground" data-testid="calculator-subtitle">Calculate gold value based on purity percentage</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GoldCalculator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8" data-testid="calculation-placeholder">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <p>Enter values and click calculate to see results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-foreground">Customer</th>
                  <th className="text-left py-2 text-foreground">Weight (g)</th>
                  <th className="text-left py-2 text-foreground">Purity (%)</th>
                  <th className="text-left py-2 text-foreground">Pure Gold (g)</th>
                  <th className="text-left py-2 text-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {recentCalculations?.map((calc: GoldCalculation, index: number) => (
                  <tr key={calc.id} className="border-b border-border">
                    <td className="py-2" data-testid={`calc-customer-${index}`}>
                      {calc.customerId ? "Customer" : "Guest"}
                    </td>
                    <td className="py-2" data-testid={`calc-weight-${index}`}>{calc.weight}</td>
                    <td className="py-2" data-testid={`calc-purity-${index}`}>{calc.purity}%</td>
                    <td className="py-2 font-semibold text-primary" data-testid={`calc-pure-gold-${index}`}>
                      {Number(calc.pureGoldWeight).toFixed(3)}g
                    </td>
                    <td className="py-2" data-testid={`calc-date-${index}`}>
                      {new Date(calc.createdAt!).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!recentCalculations || recentCalculations.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center" data-testid="no-calculations">
                      No calculations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

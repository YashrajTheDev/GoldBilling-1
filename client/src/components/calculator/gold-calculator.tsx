import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Save } from "lucide-react";
import { GOLD_PURITY_PRESETS, DEFAULT_GOLD_RATE } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import type { Customer } from "@shared/schema";

interface CalculationResult {
  weight: number;
  purity: number;
  goldRate: number;
  pureGoldWeight: number;
  totalValue: number;
}

export default function GoldCalculator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customerId, setCustomerId] = useState("");
  const [weight, setWeight] = useState("");
  const [purity, setPurity] = useState("");
  const [goldRate, setGoldRate] = useState(DEFAULT_GOLD_RATE.toString());
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<CalculationResult | null>(null);

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetch("/api/customers?limit=100").then(res => res.json()),
  });

  const saveCalculation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/calculations", data),
    onSuccess: () => {
      toast({ title: "Calculation saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
      // Reset form
      setCustomerId("");
      setWeight("");
      setPurity("");
      setDescription("");
      setResult(null);
    },
    onError: () => {
      toast({ 
        title: "Failed to save calculation",
        description: "Please try again.",
        variant: "destructive" 
      });
    },
  });

  const handleCalculate = () => {
    const weightNum = parseFloat(weight);
    const purityNum = parseFloat(purity);
    const rateNum = parseFloat(goldRate);

    if (!weightNum || !purityNum || !rateNum) {
      toast({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (purityNum <= 0 || purityNum > 100) {
      toast({
        title: "Purity must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    const pureGoldWeight = (weightNum * purityNum) / 100;
    const totalValue = pureGoldWeight * rateNum;

    setResult({
      weight: weightNum,
      purity: purityNum,
      goldRate: rateNum,
      pureGoldWeight,
      totalValue
    });
  };

  const handleSaveCalculation = () => {
    if (!result) {
      toast({
        title: "Please calculate first",
        variant: "destructive"
      });
      return;
    }

    saveCalculation.mutate({
      customerId: customerId || null,
      weight: result.weight.toString(),
      purity: result.purity.toString(),
      goldRate: result.goldRate.toString(),
      description: description || null,
    });
  };

  return (
    <>
      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Gold Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <div>
            <Label htmlFor="customer-select">Select Customer (Optional)</Label>
            <Select value={customerId} onValueChange={setCustomerId} data-testid="customer-select">
              <SelectTrigger>
                <SelectValue placeholder="Choose customer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No customer selected</SelectItem>
                {customers?.customers?.map((customer: Customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.customerId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gold Weight */}
          <div>
            <Label htmlFor="gold-weight">Gold Weight (grams) *</Label>
            <Input
              id="gold-weight"
              type="number"
              step="0.01"
              placeholder="Enter weight in grams"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              data-testid="gold-weight-input"
            />
          </div>

          {/* Gold Purity */}
          <div>
            <Label>Gold Purity (%) *</Label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {GOLD_PURITY_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setPurity(preset.value.toString())}
                  data-testid={`purity-preset-${preset.value}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="100"
              placeholder="Enter custom purity %"
              value={purity}
              onChange={(e) => setPurity(e.target.value)}
              data-testid="gold-purity-input"
            />
          </div>

          {/* Current Gold Rate */}
          <div>
            <Label htmlFor="gold-rate">Current Gold Rate (₹/gram) *</Label>
            <Input
              id="gold-rate"
              type="number"
              value={goldRate}
              onChange={(e) => setGoldRate(e.target.value)}
              data-testid="gold-rate-input"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this calculation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="description-input"
            />
          </div>

          {/* Calculate Button */}
          <Button 
            onClick={handleCalculate} 
            className="w-full" 
            size="lg"
            data-testid="calculate-button"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Value
          </Button>

          {/* Results Display */}
          {result && (
            <div className="space-y-4 p-4 bg-muted rounded-lg" data-testid="calculation-results">
              <h4 className="text-lg font-semibold text-foreground">Calculation Results</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Total Weight</p>
                  <p className="font-semibold text-foreground" data-testid="result-total-weight">{result.weight}g</p>
                </div>
                <div className="bg-card p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Gold Purity</p>
                  <p className="font-semibold text-foreground" data-testid="result-purity">{result.purity}%</p>
                </div>
                <div className="bg-card p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Pure Gold Weight</p>
                  <p className="font-semibold text-foreground" data-testid="result-pure-weight">{result.pureGoldWeight.toFixed(2)}g</p>
                </div>
                <div className="bg-card p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Rate per gram</p>
                  <p className="font-semibold text-foreground" data-testid="result-rate">₹{result.goldRate.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                <p className="text-2xl font-bold text-primary" data-testid="result-total-value">
                  ₹{result.totalValue.toLocaleString('en-IN')}
                </p>
              </div>

              <Button 
                onClick={handleSaveCalculation} 
                className="w-full" 
                variant="secondary"
                disabled={saveCalculation.isPending}
                data-testid="save-calculation-button"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveCalculation.isPending ? "Saving..." : "Save Calculation"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

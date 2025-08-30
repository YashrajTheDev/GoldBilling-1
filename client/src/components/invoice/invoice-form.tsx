import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { File, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Customer, InvoiceItem } from "@shared/schema";
import type { InvoiceData } from "@/pages/invoicing";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: (data: InvoiceData) => void;
}

export default function InvoiceForm({ invoiceData, setInvoiceData }: InvoiceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetch("/api/customers?limit=100").then(res => res.json()),
  });

  const createInvoice = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => {
      toast({ title: "Invoice created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      // Reset form
      setInvoiceData({
        customerId: "",
        items: [],
        makingCharges: 0,
        taxPercentage: 3,
      });
    },
    onError: () => {
      toast({ 
        title: "Failed to create invoice",
        description: "Please try again.",
        variant: "destructive" 
      });
    },
  });

  const addItem = () => {
    const newItem: InvoiceItem = {
      description: "",
      weight: 0,
      purity: 0,
      rate: 5250,
      amount: 0,
    };
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount if weight, purity, or rate changed
    if (field === 'weight' || field === 'purity' || field === 'rate') {
      const item = updatedItems[index];
      const pureGoldWeight = (item.weight * item.purity) / 100;
      updatedItems[index].amount = pureGoldWeight * item.rate;
    }
    
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const removeItem = (index: number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index),
    });
  };

  const handleGenerateInvoice = () => {
    if (!invoiceData.customerId) {
      toast({
        title: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    if (invoiceData.items.length === 0) {
      toast({
        title: "Please add at least one item",
        variant: "destructive"
      });
      return;
    }

    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0) + invoiceData.makingCharges;
    const taxAmount = (subtotal * invoiceData.taxPercentage) / 100;
    const total = subtotal + taxAmount;

    createInvoice.mutate({
      customerId: invoiceData.customerId,
      items: invoiceData.items,
      subtotal: subtotal.toFixed(2),
      makingCharges: invoiceData.makingCharges.toFixed(2),
      taxPercentage: invoiceData.taxPercentage.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      dueDate: invoiceData.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <File className="mr-2 h-5 w-5" />
          Create Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Selection */}
        <div>
          <Label htmlFor="invoice-customer">Customer *</Label>
          <Select 
            value={invoiceData.customerId} 
            onValueChange={(value) => setInvoiceData({ ...invoiceData, customerId: value })}
            data-testid="invoice-customer-select"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers?.customers?.map((customer: Customer) => (
                <SelectItem key={customer.id} value={customer.id || "unknown"}>
                  {customer.name} ({customer.customerId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Items</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addItem}
              data-testid="add-item-button"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {invoiceData.items.map((item, index) => (
              <div key={index} className="p-3 border border-border rounded-md space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Item {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    data-testid={`remove-item-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  data-testid={`item-description-${index}`}
                />
                
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Weight (g)"
                    value={item.weight || ""}
                    onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                    data-testid={`item-weight-${index}`}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Purity (%)"
                    value={item.purity || ""}
                    onChange={(e) => updateItem(index, 'purity', parseFloat(e.target.value) || 0)}
                    data-testid={`item-purity-${index}`}
                  />
                  <Input
                    type="number"
                    placeholder="Rate (₹)"
                    value={item.rate || ""}
                    onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                    data-testid={`item-rate-${index}`}
                  />
                </div>
                
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">Amount: </span>
                  <span className="font-semibold" data-testid={`item-amount-${index}`}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Charges */}
        <div>
          <Label>Additional Charges</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="making-charges" className="text-sm">Making Charges (₹)</Label>
              <Input
                id="making-charges"
                type="number"
                placeholder="Making Charges"
                value={invoiceData.makingCharges || ""}
                onChange={(e) => setInvoiceData({ 
                  ...invoiceData, 
                  makingCharges: parseFloat(e.target.value) || 0 
                })}
                data-testid="making-charges-input"
              />
            </div>
            <div>
              <Label htmlFor="tax-percentage" className="text-sm">Tax (%)</Label>
              <Input
                id="tax-percentage"
                type="number"
                step="0.1"
                placeholder="Tax %"
                value={invoiceData.taxPercentage || ""}
                onChange={(e) => setInvoiceData({ 
                  ...invoiceData, 
                  taxPercentage: parseFloat(e.target.value) || 0 
                })}
                data-testid="tax-percentage-input"
              />
            </div>
          </div>
        </div>

        {/* Generate Invoice */}
        <Button 
          onClick={handleGenerateInvoice} 
          className="w-full" 
          size="lg"
          disabled={createInvoice.isPending}
          data-testid="generate-invoice-button"
        >
          <File className="mr-2 h-4 w-4" />
          {createInvoice.isPending ? "Generating..." : "Generate Invoice"}
        </Button>
      </CardContent>
    </Card>
  );
}

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
        paymentDetails: "",
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
      itemName: "",
      pieces: 1,
      netWeight: 0,
      touch: 0,
      fineGold: 0,
      oldBalance: 0,
    };
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate fine gold when net weight or touch changes
    if (field === 'netWeight' || field === 'touch') {
      const item = updatedItems[index];
      const netWeight = field === 'netWeight' ? Number(value) : item.netWeight;
      const touch = field === 'touch' ? Number(value) : item.touch;
      updatedItems[index].fineGold = (netWeight * touch) / 100;
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

    createInvoice.mutate({
      customerId: invoiceData.customerId,
      items: invoiceData.items,
      paymentDetails: invoiceData.paymentDetails,
      status: "pending",
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
                  placeholder="Item Name (e.g., Gold Ring, Necklace)"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  data-testid={`item-name-${index}`}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Pieces"
                    value={item.pieces || ""}
                    onChange={(e) => updateItem(index, 'pieces', parseInt(e.target.value) || 1)}
                    data-testid={`item-pieces-${index}`}
                  />
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Net Weight (g)"
                    value={item.netWeight || ""}
                    onChange={(e) => updateItem(index, 'netWeight', parseFloat(e.target.value) || 0)}
                    data-testid={`item-net-weight-${index}`}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Touch %"
                    value={item.touch || ""}
                    onChange={(e) => updateItem(index, 'touch', parseFloat(e.target.value) || 0)}
                    data-testid={`item-touch-${index}`}
                  />
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Fine Gold (auto)"
                    value={item.fineGold?.toFixed(3) || "0.000"}
                    readOnly
                    className="bg-muted"
                    data-testid={`item-fine-gold-${index}`}
                  />
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Old Balance (opt)"
                    value={item.oldBalance || ""}
                    onChange={(e) => updateItem(index, 'oldBalance', parseFloat(e.target.value) || 0)}
                    data-testid={`item-old-balance-${index}`}
                  />
                </div>
                
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <Label htmlFor="payment-details">Payment Details (Optional)</Label>
          <Input
            id="payment-details"
            placeholder="e.g., 50% gold + 50% cash, Full gold exchange, Cash payment"
            value={invoiceData.paymentDetails || ""}
            onChange={(e) => setInvoiceData({ ...invoiceData, paymentDetails: e.target.value })}
            data-testid="payment-details-input"
          />
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

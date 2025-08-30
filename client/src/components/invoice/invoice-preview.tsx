import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, Printer, Save, Mail } from "lucide-react";
import { COMPANY_INFO } from "@/lib/constants";
import type { Customer } from "@shared/schema";
import type { InvoiceData } from "@/pages/invoicing";

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

export default function InvoicePreview({ invoiceData }: InvoicePreviewProps) {
  const { data: customerData } = useQuery({
    queryKey: ["/api/customers", invoiceData.customerId],
    queryFn: () => 
      invoiceData.customerId 
        ? fetch(`/api/customers/${invoiceData.customerId}`).then(res => res.json())
        : null,
    enabled: !!invoiceData.customerId,
  });

  const customer = customerData as Customer;
  
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0) + invoiceData.makingCharges;
  const taxAmount = (subtotal * invoiceData.taxPercentage) / 100;
  const total = subtotal + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="invoice-shadow print-page">
      <CardContent className="p-8">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="gold-gradient p-3 rounded-lg">
                <Coins className="text-primary-foreground text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="company-name">{COMPANY_INFO.name}</h1>
                <p className="text-muted-foreground" data-testid="company-tagline">{COMPANY_INFO.tagline}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p data-testid="company-address">{COMPANY_INFO.address}</p>
              <p data-testid="company-city">{COMPANY_INFO.city}</p>
              <p data-testid="company-phone">Phone: {COMPANY_INFO.phone}</p>
              <p data-testid="company-gst">GST: {COMPANY_INFO.gst}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary mb-2" data-testid="invoice-header">INVOICE</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Invoice #:</span> <span data-testid="invoice-number">PREVIEW</span></p>
              <p><span className="font-medium">Date:</span> <span data-testid="invoice-date">{new Date().toLocaleDateString()}</span></p>
              <p><span className="font-medium">Due Date:</span> <span data-testid="invoice-due-date">{new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-2">Bill To:</h3>
          <div className="bg-muted p-4 rounded-md">
            {customer ? (
              <>
                <p className="font-medium text-foreground" data-testid="customer-name">{customer.name}</p>
                <p className="text-sm text-muted-foreground" data-testid="customer-id">Customer ID: {customer.customerId}</p>
                <p className="text-sm text-muted-foreground" data-testid="customer-phone">{customer.phone}</p>
                {customer.city && customer.state && (
                  <p className="text-sm text-muted-foreground" data-testid="customer-location">
                    {customer.city}, {customer.state}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground" data-testid="no-customer">Please select a customer</p>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-foreground">Description</th>
                <th className="text-center py-3 text-foreground">Weight (g)</th>
                <th className="text-center py-3 text-foreground">Purity (%)</th>
                <th className="text-right py-3 text-foreground">Rate (₹)</th>
                <th className="text-right py-3 text-foreground">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3" data-testid={`item-description-${index}`}>
                    {item.description || "Item Description"}
                  </td>
                  <td className="text-center py-3" data-testid={`item-weight-${index}`}>
                    {item.weight || 0}
                  </td>
                  <td className="text-center py-3" data-testid={`item-purity-${index}`}>
                    {item.purity || 0}%
                  </td>
                  <td className="text-right py-3" data-testid={`item-rate-${index}`}>
                    ₹{(item.rate || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="text-right py-3 font-semibold" data-testid={`item-amount-${index}`}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {invoiceData.makingCharges > 0 && (
                <tr className="border-b border-border">
                  <td className="py-3">Making Charges</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-center py-3">-</td>
                  <td className="text-right py-3">-</td>
                  <td className="text-right py-3 font-semibold" data-testid="making-charges-amount">
                    ₹{invoiceData.makingCharges.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
              {invoiceData.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground" data-testid="no-items">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium" data-testid="invoice-subtotal">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST ({invoiceData.taxPercentage}%):</span>
                <span className="font-medium" data-testid="invoice-tax">
                  ₹{taxAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="font-bold text-primary text-lg" data-testid="invoice-total">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t border-border pt-6">
          <h4 className="font-semibold text-foreground mb-2">Terms & Conditions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Payment is due within 15 days of invoice date</li>
            <li>• All gold rates are subject to market fluctuations</li>
            <li>• Returns accepted within 7 days with original receipt</li>
          </ul>
        </div>
      </CardContent>

      {/* Invoice Actions */}
      <div className="px-8 pb-6 no-print">
        <div className="flex space-x-3">
          <Button onClick={handlePrint} data-testid="print-invoice-button">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="secondary" data-testid="save-invoice-button">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" data-testid="email-invoice-button">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>
      </div>
    </Card>
  );
}

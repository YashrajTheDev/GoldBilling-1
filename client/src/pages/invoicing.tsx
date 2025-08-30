import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvoiceForm from "@/components/invoice/invoice-form";
import InvoicePreview from "@/components/invoice/invoice-preview";
import type { InvoiceItem } from "@shared/schema";

export interface InvoiceData {
  customerId: string;
  items: InvoiceItem[];
  makingCharges: number;
  taxPercentage: number;
  dueDate?: Date;
}

export default function Invoicing() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    customerId: "",
    items: [],
    makingCharges: 0,
    taxPercentage: 3,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="invoicing-title">Professional Invoicing</h2>
        <p className="text-muted-foreground" data-testid="invoicing-subtitle">Create and manage professional invoices for your customers</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="xl:col-span-1">
          <InvoiceForm 
            invoiceData={invoiceData} 
            setInvoiceData={setInvoiceData} 
          />
        </div>

        {/* Invoice Preview */}
        <div className="xl:col-span-2">
          <InvoicePreview invoiceData={invoiceData} />
        </div>
      </div>
    </div>
  );
}

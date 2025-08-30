import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, Printer, MessageCircle, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  
  const totalNetWeight = invoiceData.items.reduce((sum, item) => sum + (item.netWeight || 0), 0);
  const totalFineGold = invoiceData.items.reduce((sum, item) => sum + (item.fineGold || 0), 0);
  const totalPieces = invoiceData.items.reduce((sum, item) => sum + (item.pieces || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!customer) {
      alert("Please select a customer first");
      return;
    }

    const element = document.getElementById('invoice-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      const fileName = `GoldBill-${customer.name.replace(/\s+/g, '-')}-${today}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleWhatsApp = async () => {
    if (!customer) {
      alert("Please select a customer first");
      return;
    }
    
    // First generate and download the PDF
    await handleDownloadPDF();
    
    // Then open WhatsApp with a message about the invoice
    const message = `*GoldBill Pro Invoice*\n\nHi ${customer.name},\n\nYour invoice has been generated with the following details:\n\nDate: ${new Date().toLocaleDateString()}\nTotal Pieces: ${totalPieces}\nTotal Net Weight: ${totalNetWeight.toFixed(3)}g\nTotal Fine Gold: ${totalFineGold.toFixed(3)}g${invoiceData.paymentDetails ? `\nPayment: ${invoiceData.paymentDetails}` : ''}\n\nI've prepared your detailed invoice PDF. Please check your downloads folder for the complete invoice document.\n\nThank you for your business!`;
    
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card id="invoice-content" className="invoice-shadow print-page">
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
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary mb-2" data-testid="invoice-header">INVOICE</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Invoice #:</span> <span data-testid="invoice-number">PREVIEW</span></p>
              <p><span className="font-medium">Date:</span> <span data-testid="invoice-date">{new Date().toLocaleDateString()}</span></p>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-foreground">Item Name</th>
                <th className="text-center py-3 text-foreground">Pieces</th>
                <th className="text-center py-3 text-foreground">Net Weight</th>
                <th className="text-center py-3 text-foreground">Touch %</th>
                <th className="text-center py-3 text-foreground">Fine Gold</th>
                <th className="text-center py-3 text-foreground">Old Balance</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3" data-testid={`item-name-${index}`}>
                    {item.itemName || "Item Name"}
                  </td>
                  <td className="text-center py-3" data-testid={`item-pieces-${index}`}>
                    {item.pieces || 0}
                  </td>
                  <td className="text-center py-3" data-testid={`item-net-weight-${index}`}>
                    {item.netWeight || 0}g
                  </td>
                  <td className="text-center py-3" data-testid={`item-touch-${index}`}>
                    {item.touch || 0}%
                  </td>
                  <td className="text-center py-3 font-semibold" data-testid={`item-fine-gold-${index}`}>
                    {item.fineGold?.toFixed(3) || "0.000"}g
                  </td>
                  <td className="text-center py-3" data-testid={`item-old-balance-${index}`}>
                    {item.oldBalance ? `${item.oldBalance}g` : "-"}
                  </td>
                </tr>
              ))}
              {invoiceData.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground" data-testid="no-items">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Pieces:</span>
                <span className="font-medium" data-testid="invoice-total-pieces">
                  {totalPieces}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Net Weight:</span>
                <span className="font-medium" data-testid="invoice-total-net-weight">
                  {totalNetWeight.toFixed(3)}g
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total Fine Gold:</span>
                <span className="font-bold text-primary text-lg" data-testid="invoice-total-fine-gold">
                  {totalFineGold.toFixed(3)}g
                </span>
              </div>
              {invoiceData.paymentDetails && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="font-medium" data-testid="invoice-payment">
                      {invoiceData.paymentDetails}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t border-border pt-6">
          <h4 className="font-semibold text-foreground mb-2">Terms & Conditions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• All weights are measured in grams</li>
            <li>• Gold purity as per standard hallmark specifications</li>
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
          <Button 
            onClick={handleDownloadPDF} 
            variant="outline"
            data-testid="download-pdf-button"
            disabled={!customer}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button 
            onClick={handleWhatsApp} 
            className="bg-green-600 hover:bg-green-700"
            data-testid="whatsapp-invoice-button"
            disabled={!customer}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Send to WhatsApp
          </Button>
        </div>
      </div>
    </Card>
  );
}
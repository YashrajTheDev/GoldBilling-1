import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Printer, Download } from "lucide-react";
import type { Invoice, Customer } from "@shared/schema";

interface InvoiceWithCustomer extends Invoice {
  customer: Customer;
}

export default function History() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/invoices", search, statusFilter, customerFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (customerFilter) params.append("customerId", customerFilter);
      params.append("limit", "50");
      
      return fetch(`/api/invoices?${params.toString()}`).then(res => res.json());
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetch("/api/customers?limit=100").then(res => res.json()),
  });

  const invoices = data?.invoices || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800" data-testid={`status-${status}`}>Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800" data-testid={`status-${status}`}>Pending</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800" data-testid={`status-${status}`}>Overdue</Badge>;
      default:
        return <Badge variant="secondary" data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="history-title">Invoice History</h2>
        <p className="text-muted-foreground" data-testid="history-subtitle">View and manage all your past invoices</p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="search-invoices"
              />
            </div>
            
            <Select value={customerFilter} onValueChange={setCustomerFilter} data-testid="filter-customer">
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Customers</SelectItem>
                {customers?.customers?.map((customer: Customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="filter-status">
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              type="date" 
              placeholder="Date filter"
              data-testid="filter-date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Invoice #</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Customer</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Date</th>
                  <th className="text-right px-6 py-4 font-medium text-foreground">Amount</th>
                  <th className="text-center px-6 py-4 font-medium text-foreground">Status</th>
                  <th className="text-center px-6 py-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice: InvoiceWithCustomer, index: number) => (
                  <tr key={invoice.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-primary" data-testid={`invoice-number-${index}`}>
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground" data-testid={`invoice-customer-${index}`}>
                          {invoice.customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`invoice-customer-id-${index}`}>
                          {invoice.customer.customerId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground" data-testid={`invoice-date-${index}`}>
                      {new Date(invoice.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground" data-testid={`invoice-amount-${index}`}>
                      ₹{Number(invoice.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(invoice.status!)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="ghost" size="icon" data-testid={`view-invoice-${index}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`print-invoice-${index}`}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" data-testid={`download-invoice-${index}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-muted-foreground" data-testid="no-invoices">
                        <p className="text-lg font-semibold mb-2">No invoices found</p>
                        <p>Create your first invoice to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {invoices.length > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="pagination-info">
                Showing {invoices.length} of {data?.total || 0} invoices
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" disabled data-testid="pagination-previous">
                  Previous
                </Button>
                <Button variant="default" size="sm" data-testid="pagination-current">
                  1
                </Button>
                <Button variant="outline" size="sm" disabled data-testid="pagination-next">
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

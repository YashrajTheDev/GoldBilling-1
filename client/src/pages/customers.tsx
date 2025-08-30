import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Search, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import type { Customer } from "@shared/schema";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/customers", search],
    queryFn: () => fetch(`/api/customers?search=${encodeURIComponent(search)}&limit=50`).then(res => res.json()),
  });

  const customers = data?.customers || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="customers-title">Customer Management</h2>
        <p className="text-muted-foreground" data-testid="customers-subtitle">
          Manage your {data?.total || 0} customers and their billing information
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="search-customers"
              />
            </div>
            <Select data-testid="filter-customers">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="add-customer-button">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer: Customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm" data-testid={`customer-initials-${customer.customerId}`}>
                      {getInitials(customer.name)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground" data-testid={`customer-name-${customer.customerId}`}>
                      {customer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`customer-id-${customer.customerId}`}>
                      ID: {customer.customerId}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCustomer(customer)}
                  data-testid={`select-customer-${customer.customerId}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="h-3 w-3 mr-2" />
                  <span data-testid={`customer-phone-${customer.customerId}`}>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-3 w-3 mr-2" />
                    <span data-testid={`customer-email-${customer.customerId}`}>{customer.email}</span>
                  </div>
                )}
                {customer.city && customer.state && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-2" />
                    <span data-testid={`customer-location-${customer.customerId}`}>
                      {customer.city}, {customer.state}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
                <span className="text-muted-foreground">Last Invoice:</span>
                <span className="font-medium text-foreground" data-testid={`customer-last-invoice-${customer.customerId}`}>
                  INV-{customer.customerId}-001
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No customers found</h3>
            <p className="text-muted-foreground" data-testid="no-customers-message">
              {search ? "Try adjusting your search criteria" : "Add your first customer to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

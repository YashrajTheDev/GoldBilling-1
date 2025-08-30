import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  File, 
  DollarSign, 
  Weight,
  Calculator,
  UserPlus,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => fetch("/api/dashboard/stats").then(res => res.json()),
  });

  const { data: recentCalculations, isLoading: calculationsLoading } = useQuery({
    queryKey: ["/api/calculations"],
    queryFn: () => fetch("/api/calculations?limit=5").then(res => res.json()),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="dashboard-title">Dashboard</h2>
        <p className="text-muted-foreground" data-testid="dashboard-subtitle">Overview of your gold business operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-customers">
                  {stats?.totalCustomers || 0}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Invoices</p>
                <p className="text-2xl font-bold text-foreground" data-testid="today-invoices">
                  {stats?.todayInvoices || 0}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <File className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                  ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : '0'}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gold Processed</p>
                <p className="text-2xl font-bold text-foreground" data-testid="gold-processed">
                  {stats?.goldProcessed || '0'}g
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Weight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Calculations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recentCalculations?.slice(0, 3).map((calc: any, index: number) => (
                  <div key={calc.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-medium text-foreground" data-testid={`calculation-customer-${index}`}>
                        Customer Calculation
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`calculation-details-${index}`}>
                        {calc.purity}% Purity - {calc.weight}g
                      </p>
                    </div>
                    <p className="font-semibold text-primary" data-testid={`calculation-value-${index}`}>
                      ₹{Number(calc.totalValue).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
                {(!recentCalculations || recentCalculations.length === 0) && (
                  <p className="text-center text-muted-foreground py-4" data-testid="no-calculations">
                    No calculations yet
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/calculator">
                <Button variant="outline" className="w-full justify-start h-auto p-3" data-testid="quick-action-calculator">
                  <Calculator className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">New Calculation</p>
                    <p className="text-sm text-muted-foreground">Calculate gold value by purity</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/invoicing">
                <Button variant="outline" className="w-full justify-start h-auto p-3" data-testid="quick-action-invoice">
                  <File className="mr-3 h-5 w-5 text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Create Invoice</p>
                    <p className="text-sm text-muted-foreground">Generate professional invoice</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/customers">
                <Button variant="outline" className="w-full justify-start h-auto p-3" data-testid="quick-action-customers">
                  <UserPlus className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Manage Customers</p>
                    <p className="text-sm text-muted-foreground">View and edit customer data</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

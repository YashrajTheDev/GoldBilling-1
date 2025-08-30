import { Coins, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="gold-gradient p-2 rounded-lg">
              <Coins className="text-primary-foreground text-xl" data-testid="logo-icon" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="app-title">GoldBill Pro</h1>
              <p className="text-sm text-muted-foreground" data-testid="app-tagline">Professional Gold Calculator & Invoice System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium" data-testid="gold-rate-label">Gold Rate Today</p>
              <p className="text-lg font-bold text-primary" data-testid="gold-rate-value">₹5,250/gm</p>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <Button variant="ghost" size="icon" data-testid="user-menu-button">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

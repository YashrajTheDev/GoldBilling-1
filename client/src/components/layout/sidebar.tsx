import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  File, 
  History, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/calculator", label: "Gold Calculator", icon: Calculator },
  { href: "/invoicing", label: "Invoicing", icon: File },
  { href: "/history", label: "Invoice History", icon: History },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0 no-print">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground font-medium"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        
        <div className="border-t border-border pt-4 mt-4">
          <Button variant="ghost" className="w-full justify-start" data-testid="nav-settings">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </div>
      </nav>
    </aside>
  );
}

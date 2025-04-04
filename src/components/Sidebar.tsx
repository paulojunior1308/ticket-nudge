import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();

  const sidebarLinks = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      icon: FileText,
      label: "Atendimentos",
      href: "/tickets"
    },
    {
      icon: Users,
      label: "Reincidentes",
      href: "/recurring"
    },
    {
      icon: Laptop,
      label: "Empréstimo de Notebooks",
      href: "/laptop-loan"
    }
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link to="/" className="font-bold text-xl text-primary">
            NTI Pompeia
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  isActive && "text-gray-900 dark:text-gray-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 
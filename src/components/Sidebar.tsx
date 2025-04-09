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
    <div className="flex flex-col h-screen bg-gray-900 border-r border-gray-800">
      <div className="border-b border-gray-800">
        <div className="flex h-16 items-center px-4">
          <Link to="/" className="font-bold text-xl text-white">
            NTI Pompeia
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400 transition-all hover:bg-gray-800 hover:text-white",
                  isActive && "bg-gray-800 text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 
import React, { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { MenuButton } from "@/components/ui/menu-button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fechar menu quando a rota mudar
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return '';
    return email
      .split("@")[0]
      .split(/[._-]/)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <div className={cn(
        "fixed top-4 z-50 transition-all duration-300 lg:hidden",
        isMobileMenuOpen ? "left-48" : "left-4"
      )}>
        <MenuButton
          isOpen={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        />
      </div>

      {/* Sidebar */}
      <div className={cn(
        "lg:block fixed top-0 left-0 h-full transition-transform duration-300 z-40",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isMobileMenuOpen ? "ml-64" : "ml-0 lg:ml-64"
      )}>
        <header className="h-16 border-b bg-white flex items-center justify-end px-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full bg-blue-500">
                <span className="text-sm font-medium text-white">
                  {getInitials(user?.email || '')}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem asChild>
                <Link to="/change-password">
                  Resetar a senha
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

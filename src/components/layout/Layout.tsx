import React from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  FileText, 
  Users,  
  LogOut
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Atendimentos", path: "/tickets", icon: <FileText className="w-5 h-5" /> },
    { name: "Reincidentes", path: "/recurring", icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/dashboard" className="text-xl font-bold text-primary">
            NTI Pompeia
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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

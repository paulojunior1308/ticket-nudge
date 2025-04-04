import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/context/AuthContext";
import { DataProvider } from "@/lib/context/DataContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AddTicket from "@/pages/AddTicket";
import NotFound from "@/pages/NotFound";
import ChangePassword from "@/pages/ChangePassword";
import ForgotPassword from "@/pages/ForgotPassword";
import { Toaster } from "@/components/ui/sonner";
import RecurringTickets from "@/pages/RecurringTickets";
import TicketList from "@/pages/TicketList";
import { startReminderScheduler } from '@/lib/services/scheduler';
import { useEffect } from "react";
import EditTicketPage from "./pages/tickets/edit/[id]";
import LaptopLoanList from "./pages/LaptopLoanList";
import NewLaptopLoan from "./pages/NewLaptopLoan";

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      startReminderScheduler();
    }
  }, []);

  return (
    <BrowserRouter future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={
              <PrivateRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tickets">
                <Route index element={<TicketList />} />
                <Route path="new" element={<AddTicket />} />
                <Route path="edit/:id" element={<EditTicketPage />} />
              </Route>
              <Route path="recurring" element={<RecurringTickets />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="laptop-loan">
                <Route index element={<LaptopLoanList />} />
                <Route path="new" element={<NewLaptopLoan />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

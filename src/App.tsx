import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Providers from "@/components/Providers";
import Home from "@/pages/Home";
import Account from "@/pages/Account";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import TwoFactor from "@/pages/TwoFactor";
import TwoFactorSetup from "@/pages/TwoFactorSetup";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

const AdminRoutes = lazy(() => import("@/pages/admin/AdminRoutes"));

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <AdminRoutes />
            </Suspense>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/two-factor" element={<TwoFactor />} />
        <Route path="/two-factor/setup" element={<TwoFactorSetup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </Providers>
  );
}

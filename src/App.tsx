import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Providers from "@/components/Providers";
import Home from "@/pages/Home";
import Account from "@/pages/Account";
import Membership from "@/pages/Membership";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import TwoFactor from "@/pages/TwoFactor";
import TwoFactorSetup from "@/pages/TwoFactorSetup";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <h1 className="font-serif text-4xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you opened doesn't exist or has moved. Head back and try again.
      </p>
      <Link to="/" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
        Back to Gate
      </Link>
    </div>
  );
}

const AdminRoutes = lazy(() => import("@/pages/admin/AdminRoutes"));

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/membership" element={<Membership />} />
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
        {/* The Google sign-in redirect from the server lands here */}
        <Route path="/setup-2fa" element={<TwoFactorSetup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Providers>
  );
}

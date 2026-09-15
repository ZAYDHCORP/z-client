import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCachedUser } from "@/lib/client-auth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getCachedUser();
    if (!user?.email) {
      navigate(`/signin?callbackUrl=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }
    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    setChecked(true);
  }, [navigate, location.pathname]);

  if (!checked) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: "employee" | "it_support";
};

export default function AuthGuard({
  children,
  requiredRole,
}: AuthGuardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (requiredRole) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          router.replace("/login");
          return;
        }

        if (profile.role !== requiredRole) {
          if (profile.role === "employee") {
            router.replace("/my-tickets");
          } else if (profile.role === "it_support") {
            router.replace("/dashboard");
          }

          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
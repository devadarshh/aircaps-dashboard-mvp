"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, signIn } from "next-auth/react";

const Loader = () => (
  <div className="w-12 h-12 border-4 border-[#e9e6e2] border-t-[#cfcac1] rounded-full animate-spin"></div>
);

const AuthPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/analytics");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e9e6e2]">
        <Loader />
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard/analytics" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#e9e6e2]">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl rounded-3xl bg-white overflow-hidden">
          <CardHeader className="flex flex-col items-center py-6 space-y-2 bg-[#f7f5f2]">
            <div className="p-4 rounded-full bg-white shadow-md">
              <Image
                src="/logo.svg"
                alt="AirCaps Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-extrabold text-gray-900 font-inter">
              AirCaps
            </CardTitle>
          </CardHeader>

          <CardContent className="py-5 px-6 flex flex-col items-center">
            <p className="text-center text-gray-700 text-base mb-3 leading-relaxed font-normal">
              Sign in to access your dashboard.
            </p>

            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium transition-all duration-200 shadow-sm hover:bg-gray-50 hover:shadow-md hover:scale-105 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#dcd8d2] border-t-[#cfcac1] rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.82-.07-1.62-.21-2.38H12v4.52h6.46c-.28 1.53-1.12 2.83-2.34 3.7v3.08h3.77c2.21-2.04 3.41-5.04 3.41-8.92z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.3 0 6.09-1.08 8.12-2.93l-3.77-3.08c-1.02.68-2.34 1.08-4.35 1.08-3.34 0-6.16-2.26-7.17-5.27H1.92v3.3C3.91 21.62 7.71 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.83 14.88c-.19-.56-.3-1.16-.3-1.88s.11-1.32.3-1.88V7.92H1.92C1.34 9.03 1 10.45 1 12s.34 2.97.92 4.08l2.91-2.2z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.77c1.8 0 3.41.62 4.68 1.64l3.5-3.5C18.08 1.61 15.3 0 12 0 7.71 0 3.91 2.37 1.92 5.92l2.91 2.91c1.01-3.01 3.83-5.06 7.17-5.06z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

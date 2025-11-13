"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user");
        setUser(res.data.user);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to fetch user data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  const handleFeatureNotReady = (featureName: string) => {
    toast({
      title: "Coming Soon",
      description: `${featureName} feature is yet to be implemented.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          {loading ? (
            <Skeleton className="h-8 w-48 mb-2" />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
              Settings
            </h1>
          )}
          {loading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account and preferences
            </p>
          )}
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            {loading ? (
              <Skeleton className="h-6 w-32 mb-1" />
            ) : (
              <CardTitle>Profile Information</CardTitle>
            )}
            {loading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <CardDescription>View your personal details</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Name</Label>
                {loading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <p className="text-base font-medium text-foreground">
                    {user?.name}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Email</Label>
              {loading ? (
                <Skeleton className="h-5 w-64" />
              ) : (
                <p className="text-base font-medium text-foreground">
                  {user?.email}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            {loading ? (
              <Skeleton className="h-6 w-40 mb-1" />
            ) : (
              <CardTitle>Notification Preferences</CardTitle>
            )}
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your sessions
                </p>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-12 rounded-full" />
              ) : (
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="cursor-pointer"
                />
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-analysis">Auto Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically analyze uploaded sessions
                </p>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-12 rounded-full" />
              ) : (
                <Switch
                  id="auto-analysis"
                  checked={autoAnalysis}
                  onCheckedChange={setAutoAnalysis}
                  className="cursor-pointer"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* AirCaps Device */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            {loading ? (
              <Skeleton className="h-6 w-40 mb-1" />
            ) : (
              <CardTitle>AirCaps Device</CardTitle>
            )}
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <CardDescription>Manage your connected glasses</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <Image
                      src="/glasses.svg"
                      alt="AirPro Glasses"
                      width={40}
                      height={40}
                      className="object-contain rounded-md border border-border w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                      priority
                    />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      AirCaps Glasses
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Connected • Battery: 87%
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => handleFeatureNotReady("Device Management")}
                >
                  Manage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            {loading ? (
              <Skeleton className="h-6 w-40 mb-1" />
            ) : (
              <CardTitle>Data & Privacy</CardTitle>
            )}
            {loading ? (
              <Skeleton className="h-4 w-64" />
            ) : (
              <CardDescription>
                Control your data and privacy settings
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => handleFeatureNotReady("Export All Data")}
                >
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => handleFeatureNotReady("Delete Account")}
                >
                  Delete Account
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          {loading ? (
            <Skeleton className="h-10 w-32 rounded-md" />
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

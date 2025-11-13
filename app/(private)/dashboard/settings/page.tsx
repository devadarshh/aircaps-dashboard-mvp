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
      title: "Coming Soon ",
      description: `${featureName} feature is yet to be implemented.`,
    });
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen w-full bg-white">
          <div className="w-12 h-12 border-4 border-[#f5f5f5] border-t-[#e9e6e2] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-muted-foreground">
          No user found
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="text-base font-medium text-foreground">
                  {user?.name}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base font-medium text-foreground">
                {user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your sessions
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                className="cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-analysis">Auto Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically analyze uploaded sessions
                </p>
              </div>
              <Switch
                id="auto-analysis"
                checked={autoAnalysis}
                onCheckedChange={setAutoAnalysis}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>AirCaps Device</CardTitle>
            <CardDescription>Manage your connected glasses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <Image
                    src="/glasses.svg"
                    alt="AirPro Glasses"
                    width={40}
                    height={40}
                    className="object-contain rounded-md border border-border 
                   w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
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
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer hover:scale-[1.02] transition-transform"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

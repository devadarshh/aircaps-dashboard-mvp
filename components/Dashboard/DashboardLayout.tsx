"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Upload,
  Settings,
  LogOut,
  Menu,
  Battery,
  Zap,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Upload, label: "Upload", path: "/dashboard/upload" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-sidebar border-b border-sidebar-border p-4 md:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-2 hover:bg-sidebar-accent transition"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-sidebar-foreground" />
          </Button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="AirCaps Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-semibold text-sidebar-foreground">
              AirCaps
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-300 ease-in-out z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:flex"
        )}
      >
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-sidebar-border cursor-pointer hover:opacity-90 transition">
          <div className="p-2 bg-sidebar-primary rounded-lg">
            <Image
              src="/logo.svg"
              alt="AirCaps Logo"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            AirCaps
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-12 md:mt-0">
          {/* Device Status Section */}
          <div className="px-2 mb-6 space-y-3">
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-sidebar-foreground/90">
                  AirCaps Pro
                </span>
              </div>
              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold tracking-wider">
                SYNCED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-sidebar-foreground/60">
                  <Battery className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Battery
                  </span>
                </div>
                <span className="text-sm font-bold text-sidebar-foreground">
                  84%
                </span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-1.5 text-sidebar-foreground/60">
                  <HardDrive className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    Storage
                  </span>
                </div>
                <span className="text-sm font-bold text-sidebar-foreground">
                  1.2GB
                </span>
              </div>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white transition-all duration-200 active:scale-95 cursor-pointer",
                  isActive && "bg-sidebar-accent text-white shadow-lg"
                )}
                onClick={() => {
                  router.push(item.path);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-red-600 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto pt-16 md:pt-0">{children}</main>
    </div>
  );
};

export default DashboardLayout;

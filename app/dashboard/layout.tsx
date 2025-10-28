"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  Zap,
  BarChart3,
  Settings,
  Play,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/layout/WorkspaceSelector";
import { EmailVerificationBanner } from "@/components/layout/EmailVerificationBanner";
import { useAuth } from "@/lib/auth/AuthContext";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "Flows",
    href: "/dashboard/flows",
    icon: GitBranch,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Events",
    href: "/dashboard/events",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    name: "Destinations",
    href: "/dashboard/destinations",
    icon: Send,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    name: "Playground",
    href: "/dashboard/playground",
    icon: Play,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const settingsNav = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
  },
];
type NavItemType = (typeof navigation)[number];

const itemIsActive = (pathname: string | null, href: string) => {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
};

function NavItem({
  item,
  onClick,
  collapsed: itemCollapsed,
  pathname,
}: {
  item: NavItemType;
  onClick?: () => void;
  collapsed?: boolean;
  pathname: string | null;
}) {
  const isActive = itemIsActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      title={itemCollapsed ? item.name : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        itemCollapsed && "justify-center",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {isActive && !itemCollapsed && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-lg" />
      )}
      <div
        className={cn(
          "relative h-9 w-9 rounded-lg flex items-center justify-center transition-all duration-200",
          isActive
            ? "bg-primary-foreground/10"
            : `${item.bgColor} group-hover:scale-110`
        )}
      >
        <item.icon
          className={cn(
            "h-5 w-5 relative z-10",
            isActive ? "text-primary-foreground" : item.color
          )}
        />
      </div>
      {!itemCollapsed && <span className="relative z-10">{item.name}</span>}
      {itemCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.name}
        </div>
      )}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Grid Background */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                         linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Grid Background for Sidebar */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Logo */}
          <div className="relative flex h-16 items-center justify-between px-4 border-b border-border/50">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">EventMesh</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Workspace Selector */}
          <WorkspaceSelector />

          {/* Navigation */}
          <nav className="relative flex-1 space-y-1 p-3 overflow-y-auto">
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </p>
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                onClick={() => setSidebarOpen(false)}
                pathname={pathname}
              />
            ))}

            <div className="pt-4 mt-4 border-t border-border/50">
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Configuration
              </p>
              {settingsNav.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  onClick={() => setSidebarOpen(false)}
                  pathname={pathname}
                />
              ))}
            </div>
          </nav>

          {/* User Profile */}
          <div className="relative border-t border-border/50 p-3">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-md">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/settings" className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                  >
                    <Settings className="h-3 w-3" />
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 z-40",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="flex flex-col flex-1 border-r border-border/50 bg-card/50 backdrop-blur-xl relative">
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Logo */}
          <div className="relative flex h-16 items-center justify-between px-4 border-b border-border/50">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                collapsed && "justify-center w-full"
              )}
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              {!collapsed && (
                <span className="text-xl font-bold">EventMesh</span>
              )}
            </Link>

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCollapsed(true)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <div className="absolute -right-3 top-20 z-50">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 rounded-full shadow-md bg-background"
                onClick={() => setCollapsed(false)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Workspace Selector */}
          <WorkspaceSelector collapsed={collapsed} />

          {/* Navigation */}
          <nav className="relative flex-1 space-y-1 p-3 overflow-y-auto">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main Menu
              </p>
            )}
            {navigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}

            {!collapsed && (
              <div className="pt-4 mt-4 border-t border-border/50">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Configuration
                </p>
                {settingsNav.map((item) => (
                  <NavItem
                    key={item.name}
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            )}
          </nav>

          {/* User Profile */}
          <div className="relative border-t border-border/50 p-3">
            {!collapsed ? (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/dashboard/settings" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-xs"
                    >
                      <Settings className="h-3 w-3" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3 w-3" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <button className="w-full flex justify-center group">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-md group-hover:scale-110 transition-transform">
                  {getUserInitials()}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />
        </header>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Page content */}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

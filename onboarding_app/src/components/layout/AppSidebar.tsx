"use client";

import type { LucideIcon } from "lucide-react";
import {
  LogOut,
  Map,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Star,
  Truck,
  UserCircle,
  Users,
  Utensils,
  Inbox,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { icon: Utensils, label: "Restaurants", href: "/restaurants" },
      { icon: Inbox, label: "Received Orders", href: "/received-orders" },
      { icon: Search, label: "Order Lookup", href: "/order-lookup" },
      { icon: Map, label: "Live Map", href: "/map" },
    ],
  },
  {
    label: "People",
    items: [
      { icon: Users, label: "Managers", href: "/managers" },
      { icon: Truck, label: "Drivers", href: "/drivers" },
      { icon: UserCircle, label: "Customers", href: "/customers" },
    ],
  },
  {
    label: "Engagement",
    items: [
      { icon: Star, label: "Reviews", href: "/reviews" },
      { icon: Megaphone, label: "Banners", href: "/banners" },
    ],
  },
  {
    label: "System",
    items: [{ icon: Settings, label: "Settings", href: "/settings" }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state: sidebarState, toggleSidebar } = useSidebar();

  const displayName =
    user?.displayName ?? user?.email?.split("@")[0] ?? "User";
  const email = user?.email ?? "";

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader>
        <div className="flex h-10 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link
            href="/restaurants"
            className="flex min-w-0 items-center gap-2"
            aria-label="OrderSync home"
          >
            <Image
              src="/icons/icon-192.png"
              alt="OrderSync"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:rounded-md"
            />
            <span className="truncate font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              OrderSync
            </span>
          </Link>
        </div>
      </SidebarHeader>

      {/* Grouped navigation */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Collapse toggle */}
          <SidebarMenuItem className="max-md:hidden">
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={sidebarState === "collapsed" ? "Expand" : "Collapse"}
            >
              {sidebarState === "collapsed" ? (
                <PanelLeftOpen />
              ) : (
                <PanelLeftClose />
              )}
              <span>{sidebarState === "collapsed" ? "Expand" : "Collapse"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={email || displayName}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/60">
                      {email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem disabled className="flex-col items-start">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

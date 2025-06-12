"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Building2, Users, Settings } from "lucide-react";
import { logout } from "@/lib/auth";

export function LandlordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const landlordId = params.id as string;

  const navigation = [
    {
      name: "Dashboard",
      href: `/landlord/${landlordId}/dashboard`,
      icon: Home,
    },
    {
      name: "Properties",
      href: `/landlord/${landlordId}/properties`,
      icon: Building2,
    },
    { name: "Tenants", href: `/landlord/${landlordId}/tenants`, icon: Users },
    {
      name: "Settings",
      href: `/landlord/${landlordId}/settings`,
      icon: Settings,
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden w-64 border-r bg-gray-50/40 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-lg">RentEase</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

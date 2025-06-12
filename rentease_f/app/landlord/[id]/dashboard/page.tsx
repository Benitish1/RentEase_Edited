"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Home,
  Users,
  CreditCard,
  BarChart3,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchProperties, Property } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { PropertyPriceChart } from "@/components/property-price-chart";

export default function LandlordDashboard() {
  const router = useRouter();
  const params = useParams();
  const landlordId = params.id as string;
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalProperties, setTotalProperties] = useState(0);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.lastName) {
          setCurrentUser(parsedUser);
        } else {
          console.error("Invalid user data structure:", parsedUser);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchPropertiesData = async () => {
      try {
        const properties = await fetchProperties();
        if (Array.isArray(properties)) {
          setTotalProperties(properties.length);
          // Take first 5 properties
          setRecentProperties(properties.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchPropertiesData();
  }, []);

  // Check for session expiration
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        handleSessionExpired();
      }
    };

    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSessionExpired = () => {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
    router.push("/login");
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {currentUser?.lastName || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your properties.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Your listed properties
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tenants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,500</div>
            <p className="text-xs text-muted-foreground">
              +$1,200 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Occupancy Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>
              Monthly revenue and occupancy rates
            </CardDescription>
          </CardHeader>

        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Properties</CardTitle>
            <CardDescription>
              Your most recently added properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentProperties.map((property) => (
                <div key={property.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md">
                    <Image
                      src={property.mainPhoto || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.neighborhood}, {property.city}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          property.status === "APPROVED"
                            ? "bg-green-50 text-green-700 hover:bg-green-50"
                            : property.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-50"
                        }`}
                      >
                        {property.status === "APPROVED"
                          ? "Available"
                          : property.status === "PENDING"
                          ? "Pending"
                          : "Rented"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {property.status === "RENTED"
                          ? "Currently rented"
                          : "Available now"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${property.price?.toLocaleString() || "N/A"}/mo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {property.status === "RENTED"
                        ? "Currently rented"
                        : "Available now"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/landlord/${landlordId}/properties`}>
                View All Properties
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/landlord/${landlordId}/properties/add`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

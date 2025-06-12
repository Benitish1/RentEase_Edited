"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPropertyById, deleteProperty } from "@/lib/api";
import type { Property } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  MapPin,
  Home,
  Building,
  Building2,
  Hotel,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!params.propertyId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(
          parseInt(params.propertyId as string)
        );
        setProperty(data);
      } catch (err: any) {
        console.error("Error loading property:", err);
        setError(
          err.response?.data?.message || "Failed to load property details"
        );
        if (err.response?.status === 404) {
          router.push(`/landlord/${params.id}/properties`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [params.propertyId, params.id, router]);

  const handleDelete = async () => {
    if (!property || !params.id) return;

    try {
      await deleteProperty(property.id, parseInt(params.id as string));
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      router.push(`/landlord/${params.id}/properties`);
    } catch (err) {
      console.error("Error deleting property:", err);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      RENTED: "outline",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    toast({
      title: "Coming Soon",
      description: "PDF export functionality will be available soon",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">Loading property details...</div>
          <div className="text-sm text-muted-foreground">
            Please wait while we fetch the property information
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500">
        <h3 className="font-semibold">Error Loading Property</h3>
        <p>{error}</p>
        <p className="mt-2 text-sm">
          Please check the console for more details
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold">Property Not Found</h3>
        <p className="text-muted-foreground">
          The property you're looking for doesn't exist or has been removed
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/landlord/${params.id}/properties`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to properties
          </Link>
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {property.title}
              </h1>
              {getStatusBadge(property.status)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {property.address || property.neighborhood}, {property.city}
                {property.district && `, ${property.district}`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
            <Button variant="outline" asChild>
              <Link
                href={`/landlord/${params.id}/properties/${params.propertyId}/edit`}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Property
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Property Details</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{property.type}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Price</div>
                <div className="font-medium">${property.price}/month</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Bedrooms</div>
                <div className="font-medium">{property.bedrooms}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Bathrooms</div>
                <div className="font-medium">{property.bathrooms}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Area</div>
                <div className="font-medium">{property.area} m²</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Furnished</div>
                <div className="font-medium capitalize">
                  {property.furnished}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">
                  Available From
                </div>
                <div className="font-medium">
                  {new Date(property.availableFrom).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">{property.description}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <h2 className="mb-4 text-lg font-semibold">Photos</h2>
            <div className="grid gap-4">
              {property.mainPhoto && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={property.mainPhoto}
                    alt={property.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              {property.additionalPhotos &&
                property.additionalPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {property.additionalPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative aspect-video w-full overflow-hidden rounded-lg"
                      >
                        <Image
                          src={photo}
                          alt={`${property.title} - Photo ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

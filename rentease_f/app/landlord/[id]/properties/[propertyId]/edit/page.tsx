"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PropertyForm } from "@/components/PropertyForm";
import { getPropertyById, updateProperty } from "@/lib/api";
import { Property } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(Number(params.propertyId));
        setProperty(data);
      } catch (err) {
        setError("Failed to load property. Please try again.");
        console.error("Error loading property:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [params.propertyId, toast]);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const propertyId = parseInt(params.propertyId as string);
      const landlordId = parseInt(params.id as string);

      if (isNaN(propertyId) || isNaN(landlordId)) {
        throw new Error("Invalid property or landlord ID");
      }

      await updateProperty(propertyId, landlordId, formData);
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      router.push(`/landlord/${landlordId}/properties`);
    } catch (err: any) {
      console.error("Error updating property:", err);
      setError(err.message || "Failed to update property");
      toast({
        title: "Error",
        description: err.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Property not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Property</h1>
      </div>
      <PropertyForm
        initialData={property}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

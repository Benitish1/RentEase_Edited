"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateProperty } from "@/lib/api";
import { Property, PropertyFormData } from "@/lib/types";
import Image from "next/image";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["house", "apartment", "condo", "studio", "villa"]),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "RENTED"]),
  price: z.number().min(0, "Price must be positive"),
  bedrooms: z.number().min(0, "Bedrooms must be positive"),
  bathrooms: z.number().min(0, "Bathrooms must be positive"),
  area: z.number().min(0, "Area must be positive"),
  address: z.string().min(1, "Address is required"),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  furnished: z.enum(["fully", "partially", "unfurnished"]),
  availableFrom: z.string().min(1, "Available from date is required"),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function PropertyForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: PropertyFormProps) {
  const { toast } = useToast();
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string>(
    initialData?.mainPhoto || ""
  );
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<
    string[]
  >(initialData?.additionalPhotos || []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      type: initialData?.type || "house",
      status: initialData?.status || "PENDING",
      price: initialData?.price || 0,
      bedrooms: initialData?.bedrooms || 0,
      bathrooms: initialData?.bathrooms || 0,
      area: initialData?.area || 0,
      address: initialData?.address || "",
      neighborhood: initialData?.neighborhood || "",
      city: initialData?.city || "",
      district: initialData?.district || "",
      furnished: initialData?.furnished || "unfurnished",
      availableFrom: initialData?.availableFrom || "",
    },
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setAdditionalImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagesPreview((prev) => [
          ...prev,
          reader.result as string,
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (values: PropertyFormValues) => {
    try {
      const formData = new FormData();

      // Add all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Add main photo if it's a File object
      if (mainImage instanceof File) {
        formData.append("images", mainImage);
      } else if (mainImagePreview) {
        formData.append("mainPhoto", mainImagePreview);
      }

      // Add additional photos
      additionalImages.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      // Add existing additional photos
      additionalImagesPreview.forEach((preview) => {
        if (!preview.startsWith("data:")) {
          // Only add if it's not a data URL
          formData.append("additionalPhotos", preview);
        }
      });

      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit form",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input {...field} />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea {...field} />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="furnished"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Furnished Status
                  </label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select furnished status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fully">Fully Furnished</SelectItem>
                      <SelectItem value="partially">
                        Partially Furnished
                      </SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.furnished && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.furnished.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bedrooms
                    </label>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                    {errors.bedrooms && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.bedrooms.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bathrooms
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                    {errors.bathrooms && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.bathrooms.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Area (m²)
                  </label>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  {errors.area && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.area.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <Input {...field} />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="neighborhood"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Neighborhood
                  </label>
                  <Input {...field} />
                  {errors.neighborhood && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.neighborhood.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input {...field} />
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    District
                  </label>
                  <Input {...field} />
                  {errors.district && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div>
            <Controller
              name="availableFrom"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Available From
                  </label>
                  <Input type="date" {...field} />
                  {errors.availableFrom && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.availableFrom.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Main Photo
              </label>
              <div className="space-y-2">
                {mainImagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={mainImagePreview}
                      alt="Main property photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleMainImageChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Photos
              </label>
              <div className="grid grid-cols-2 gap-4">
                {additionalImagesPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={preview}
                        alt={`Additional photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <label className="flex flex-col items-center justify-center w-full h-full">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

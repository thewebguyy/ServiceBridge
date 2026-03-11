"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

// Robust, type-safe validation schema
const onboardingSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  phoneNumber: z.string().min(10, "Valid phone number required."),
  bio: z.string().min(20, "Bio must be at least 20 characters to build trust."),
  serviceCategories: z.string().min(1, "Please define your primary services."),
  serviceArea: z.string().min(2, "Service area is required."),
  hourlyRate: z.coerce.number().min(1, "Hourly rate must be greater than 0."),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export default function ProviderOnboardingPage() {
  const [step, setStep] = useState(1);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      phoneNumber: "",
      bio: "",
      serviceCategories: "",
      serviceArea: "",
      hourlyRate: 0,
    },
  });

  async function onSubmit(data: OnboardingValues) {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Final Submission Logic (Calling providerService.ts)
    console.log("Onboarding data submitted:", data);
    console.log("Images to upload:", portfolioFiles.length);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (portfolioFiles.length + files.length <= 10) {
        setPortfolioFiles([...portfolioFiles, ...files]);
      } else {
        alert("Maximum of 10 images allowed.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 border rounded-lg shadow-sm bg-card text-card-foreground">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Provider Onboarding</h1>
        <p className="text-muted-foreground mt-2">Step {step} of 3: {
          step === 1 ? 'Basic Profile' : step === 2 ? 'Service Definition' : 'Portfolio Upload'
        }</p>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input {...form.register("displayName")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" placeholder="Your business name" />
              {form.formState.errors.displayName && <p className="text-red-500 text-xs mt-1">{form.formState.errors.displayName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input {...form.register("phoneNumber")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" placeholder="+234 XXX XXXX" />
              {form.formState.errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{form.formState.errors.phoneNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Short Bio</label>
              <textarea {...form.register("bio")} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" placeholder="Tell customers about your experience..." />
              {form.formState.errors.bio && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bio.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-medium mb-1">Service Categories</label>
              <input {...form.register("serviceCategories")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" placeholder="E.g. Plumber, Electrician (comma separated)" />
              {form.formState.errors.serviceCategories && <p className="text-red-500 text-xs mt-1">{form.formState.errors.serviceCategories.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Area (City or Radius)</label>
              <input {...form.register("serviceArea")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" placeholder="E.g. Lagos, Abuja" />
              {form.formState.errors.serviceArea && <p className="text-red-500 text-xs mt-1">{form.formState.errors.serviceArea.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Base Hourly Rate (₦)</label>
              <input type="number" {...form.register("hourlyRate")} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background" />
              {form.formState.errors.hourlyRate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.hourlyRate.message}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Portfolio Images (Max 10)</label>
              <input type="file" multiple accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium" />
              <p className="text-xs text-muted-foreground mt-2">{portfolioFiles.length} files selected.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
              Back
            </button>
          )}
          <button type="submit" className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            {step === 3 ? "Complete Profile" : "Next Step"}
          </button>
        </div>
      </form>
    </div>
  );
}

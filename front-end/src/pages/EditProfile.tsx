import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  MapPin, 
  Globe, 
  Twitter, 
  Linkedin, 
  Instagram,
  User
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  twitter: z.string().max(50, "Twitter handle too long").optional(),
  linkedin: z.string().max(50, "LinkedIn username too long").optional(),
  instagram: z.string().max(50, "Instagram handle too long").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, uploadAvatar, loading } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.socialLinks?.website || "",
      twitter: profile?.socialLinks?.twitter || "",
      linkedin: profile?.socialLinks?.linkedin || "",
      instagram: profile?.socialLinks?.instagram || "",
    },
  });

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <LoadingSpinner className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File size too large. Max 5MB allowed');
      return;
    }

    setIsUploadingAvatar(true);
    setSubmitError(null);
    
    try {
      await uploadAvatar(file);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Update profile with new data using the real API
      await updateProfile({
        name: data.name,
        bio: data.bio,
        location: data.location,
        socialLinks: {
          website: data.website || undefined,
          twitter: data.twitter || undefined,
          linkedin: data.linkedin || undefined,
          instagram: data.instagram || undefined,
        }
      });

      setSubmitSuccess(true);
      
      // Redirect back to profile after success
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error: any) {
      console.error('Profile update failed:', error);
      setSubmitError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Edit Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Update your profile information and preferences
            </p>
          </div>

          {/* Success/Error Alerts */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/20 text-green-700">
              <AlertDescription>Profile updated successfully!</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <Card className="glass p-6 h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Profile Photo
              </h2>
              
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Avatar Upload Button */}
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload-edit"
                      disabled={isUploadingAvatar}
                    />
                    <label
                      htmlFor="avatar-upload-edit"
                      className={`
                        w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center 
                        cursor-pointer hover:bg-primary/80 transition-colors shadow-lg
                        ${isUploadingAvatar ? 'pointer-events-none opacity-50' : ''}
                      `}
                    >
                      {isUploadingAvatar ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-foreground font-medium mb-1">
                    Click the camera icon to upload
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </Card>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="glass p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Basic Information
                    </h2>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          rows={4}
                          {...form.register("bio")}
                        />
                        {form.formState.errors.bio && (
                          <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {form.watch("bio")?.length || 0}/500 characters
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            placeholder="City, Country"
                            className="pl-10"
                            {...form.register("location")}
                          />
                        </div>
                        {form.formState.errors.location && (
                          <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Social Links
                    </h2>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="website"
                            placeholder="https://your-website.com"
                            className="pl-10"
                            {...form.register("website")}
                          />
                        </div>
                        {form.formState.errors.website && (
                          <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter">Twitter</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="twitter"
                            placeholder="@username"
                            className="pl-10"
                            {...form.register("twitter")}
                          />
                        </div>
                        {form.formState.errors.twitter && (
                          <p className="text-sm text-destructive">{form.formState.errors.twitter.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="linkedin"
                            placeholder="username"
                            className="pl-10"
                            {...form.register("linkedin")}
                          />
                        </div>
                        {form.formState.errors.linkedin && (
                          <p className="text-sm text-destructive">{form.formState.errors.linkedin.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="instagram"
                            placeholder="@username"
                            className="pl-10"
                            {...form.register("instagram")}
                          />
                        </div>
                        {form.formState.errors.instagram && (
                          <p className="text-sm text-destructive">{form.formState.errors.instagram.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/profile")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-hero text-white px-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditProfile;

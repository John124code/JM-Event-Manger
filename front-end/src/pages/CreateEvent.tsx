import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, ArrowLeft, Check, Upload, X, Video, FileImage, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(10000, "Capacity cannot exceed 10,000"),
  image: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
      location: "",
      capacity: 50,
      image: "",
    },
  });

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setSubmitError("Please upload only image or video files");
      return;
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setSubmitError(`File size too large. Max ${isVideo ? '50MB' : '10MB'} allowed`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setSubmitError(null);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadedFile(file);
      setMediaType(isImage ? "image" : "video");

      // Simulate API upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
      }, 500);

    } catch (error) {
      setSubmitError("Failed to upload file. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
    setMediaType("none");
    setUploadProgress(0);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock event creation logic
      const newEvent = {
        id: Date.now().toString(),
        ...data,
        creator: {
          name: user.name,
          avatar: user.avatar,
        },
        booked: 0,
        image: previewUrl || data.image || "/placeholder-tech-event.jpg",
        media: uploadedFile ? {
          type: mediaType,
          url: previewUrl,
          fileName: uploadedFile.name,
        } : null,
      };

      console.log("Created event:", newEvent);
      
      setIsSuccess(true);
      
      // Redirect to events page after success
      setTimeout(() => {
        navigate("/events");
      }, 2000);
      
    } catch (error) {
      setSubmitError("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Technology",
    "Workshop",
    "Community",
    "Business",
    "Entertainment",
    "Sports",
    "Education",
    "Art & Culture",
    "Food & Drink",
    "Health & Wellness",
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <Card className="glass p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Event Created Successfully!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your event has been created and is now live. Redirecting you to the events page...
            </p>
            <LoadingSpinner className="text-primary mx-auto" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Create New Event
            </h1>
            <p className="text-xl text-muted-foreground">
              Share your amazing event with the community
            </p>
          </div>

          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <Card className="glass p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-primary" />
                  Event Details
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      rows={4}
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => form.setValue("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="50"
                        className="pl-10"
                        {...form.register("capacity", { valueAsNumber: true })}
                      />
                    </div>
                    {form.formState.errors.capacity && (
                      <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-primary" />
                  When & Where
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        {...form.register("date")}
                      />
                    </div>
                    {form.formState.errors.date && (
                      <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-10"
                        {...form.register("time")}
                      />
                    </div>
                    {form.formState.errors.time && (
                      <p className="text-sm text-destructive">{form.formState.errors.time.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="Enter event location"
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

              {/* Media Upload */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-primary" />
                  Event Media
                </h2>

                {!uploadedFile ? (
                  <div className="space-y-4">
                    <Label htmlFor="media-upload">Upload Image or Video</Label>
                    <div className="relative">
                      <input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="media-upload"
                        className={`
                          flex flex-col items-center justify-center w-full h-64 
                          border-2 border-dashed border-border rounded-lg cursor-pointer 
                          bg-muted/20 hover:bg-muted/30 transition-colors
                          ${isUploading ? 'pointer-events-none opacity-50' : ''}
                        `}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center">
                            <LoadingSpinner className="w-8 h-8 text-primary mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">Uploading...</p>
                            <div className="w-48 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                            <p className="text-sm text-foreground font-medium mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground text-center">
                              Images: PNG, JPG, GIF up to 10MB<br />
                              Videos: MP4, MOV, AVI up to 50MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    
                    {/* Alternative: URL Input */}
                    <div className="relative">
                      <p className="text-sm text-muted-foreground mb-2">Or enter image URL:</p>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://example.com/image.jpg"
                          className="pl-10"
                          {...form.register("image")}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Uploaded Media</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    <Card className="glass p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {mediaType === "image" ? (
                            <FileImage className="w-8 h-8 text-blue-500" />
                          ) : (
                            <Video className="w-8 h-8 text-purple-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {mediaType}
                          </p>
                        </div>
                      </div>
                      
                      {previewUrl && (
                        <div className="mt-4">
                          {mediaType === "image" ? (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="relative">
                              <video
                                src={previewUrl}
                                className="w-full h-48 object-cover rounded-lg"
                                controls
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-hero text-white px-8"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Event...
                    </>
                  ) : isUploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateEvent;

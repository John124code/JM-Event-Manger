import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";
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
import { Calendar, Clock, MapPin, Users, Image as ImageIcon, ArrowLeft, Check, Upload, X, Video, FileImage, Play, Plus, Trash2, DollarSign, CreditCard, Smartphone } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ticketTypeSchema = z.object({
  name: z.string().min(1, "Ticket name is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  description: z.string().optional(),
  available: z.number().min(1, "Must have at least 1 ticket available"),
});

const paymentMethodSchema = z.object({
  type: z.enum(['bank_transfer', 'cash_app']),
  details: z.object({
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    username: z.string().optional(),
  }),
});

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(10000, "Capacity cannot exceed 10,000"),
  image: z.string().optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),
  paymentMethods: z.array(paymentMethodSchema).min(1, "At least one payment method is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const { user } = useAuth();
  const { addEvent } = useEvents();
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
      ticketTypes: [
        {
          name: "General Admission",
          price: 0,
          description: "Standard event access",
          available: 50,
        }
      ],
      paymentMethods: [
        {
          type: "bank_transfer",
          details: {
            bankName: "",
            accountNumber: "",
          }
        }
      ],
    },
  });

  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({
    control: form.control,
    name: "ticketTypes",
  });

  const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
    control: form.control,
    name: "paymentMethods",
  });

  const addTicketType = (type: 'general' | 'vip' | 'early_bird' | 'student') => {
    const ticketTypes = {
      general: { name: "General Admission", price: 25, description: "Standard event access" },
      vip: { name: "VIP", price: 75, description: "Premium access with exclusive benefits" },
      early_bird: { name: "Early Bird", price: 20, description: "Limited time discount" },
      student: { name: "Student", price: 15, description: "Student discount (ID required)" },
    };
    
    const ticket = ticketTypes[type];
    appendTicket({
      ...ticket,
      available: Math.floor(form.getValues().capacity / ticketFields.length + 1) || 10,
    });
  };

  const addPaymentMethod = (type: 'bank_transfer' | 'cash_app') => {
    const defaultDetails = {
      bank_transfer: { bankName: "", accountNumber: "" },
      cash_app: { username: "" },
    };
    
    appendPayment({
      type,
      details: defaultDetails[type],
    });
  };

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
      // Create preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setUploadedFile(file);
      setMediaType(isImage ? "image" : "video");
      setUploadProgress(20);

      // Upload to Cloudinary via backend
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      setUploadProgress(60);

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      setUploadProgress(90);

      if (uploadResult.success) {
        // Replace preview URL with Cloudinary URL
        URL.revokeObjectURL(localPreviewUrl);
        setPreviewUrl(uploadResult.data.url);
        setUploadProgress(100);
        
        // Update form with Cloudinary URL
        form.setValue('image', uploadResult.data.url);
        
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setSubmitError(`Failed to upload file: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setUploadedFile(null);
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
      // Create the event data with Cloudinary image URL
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        image: data.image || previewUrl || "/placeholder-tech-event.jpg", // Use Cloudinary URL if available
        ticketTypes: data.ticketTypes,
        paymentMethods: data.paymentMethods,
        media: uploadedFile ? {
          type: mediaType as 'image' | 'video',
          url: previewUrl,
          fileName: uploadedFile.name,
        } : undefined,
      };

      // Try to create event via API first
      try {
        const response = await fetch('http://localhost:3001/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(eventData),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Add event to context using API response
            addEvent(result.data.event);
            setIsSuccess(true);
            setTimeout(() => {
              navigate('/events');
            }, 2000);
            return;
          }
        }
      } catch (apiError) {
        console.warn('API creation failed, falling back to local creation:', apiError);
      }

      // Fallback: Create event locally if API fails
      const newEvent = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        location: data.location,
        capacity: data.capacity,
        creator: {
          id: user?.id || "1",
          name: user?.name || "Anonymous",
          avatar: user?.avatar,
        },
        booked: 0,
        image: data.image || previewUrl || "/placeholder-tech-event.jpg",
        media: uploadedFile ? {
          type: mediaType as 'image' | 'video',
          url: previewUrl,
          fileName: uploadedFile.name,
        } : null,
        status: 'active' as const,
        views: 0,
        ratings: [],
        ticketTypes: data.ticketTypes.map((ticket, index) => ({
          id: `${Date.now()}-${index}`,
          name: ticket.name,
          price: ticket.price,
          description: ticket.description,
          available: ticket.available,
          sold: 0,
        })),
        paymentMethods: data.paymentMethods.map(method => ({
          type: method.type,
          details: method.details,
        })),
        createdAt: new Date().toISOString(),
      };

      // Add event to global context
      addEvent(newEvent);
      
      setIsSuccess(true);
      
      // Redirect to events page
      setTimeout(() => {
        navigate("/events");
      }, 2000);

    } catch (error: any) {
      console.error('Create event error:', error);
      setSubmitError(error.message || 'Failed to create event. Please try again.');
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
                    <Select 
                      value={form.watch("category")} 
                      onValueChange={(value) => form.setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="dropdown-solid">
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

              {/* Ticket Types */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-primary" />
                    Ticket Types
                  </h2>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => addTicketType(value as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Add Ticket" />
                      </SelectTrigger>
                      <SelectContent className="dropdown-solid">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="early_bird">Early Bird</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  {ticketFields.map((field, index) => (
                    <Card key={field.id} className="glass p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-medium text-foreground">Ticket Type #{index + 1}</h3>
                        {ticketFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicket(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`ticketTypes.${index}.name`}>Ticket Name *</Label>
                          <Input
                            placeholder="e.g., General Admission"
                            {...form.register(`ticketTypes.${index}.name`)}
                          />
                          {form.formState.errors.ticketTypes?.[index]?.name && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.ticketTypes[index]?.name?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ticketTypes.${index}.price`}>Price ($) *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-10"
                              {...form.register(`ticketTypes.${index}.price`, { valueAsNumber: true })}
                            />
                          </div>
                          {form.formState.errors.ticketTypes?.[index]?.price && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.ticketTypes[index]?.price?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ticketTypes.${index}.available`}>Available Tickets *</Label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="50"
                            {...form.register(`ticketTypes.${index}.available`, { valueAsNumber: true })}
                          />
                          {form.formState.errors.ticketTypes?.[index]?.available && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.ticketTypes[index]?.available?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`ticketTypes.${index}.description`}>Description</Label>
                          <Input
                            placeholder="Optional description"
                            {...form.register(`ticketTypes.${index}.description`)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-primary" />
                    Payment Methods
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPaymentMethod('bank_transfer')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Bank Transfer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPaymentMethod('cash_app')}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Cash App
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentFields.map((field, index) => (
                    <Card key={field.id} className="glass p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {form.watch(`paymentMethods.${index}.type`) === 'bank_transfer' ? (
                            <DollarSign className="w-5 h-5 text-green-600" />
                          ) : (
                            <Smartphone className="w-5 h-5 text-blue-600" />
                          )}
                          <h3 className="font-medium text-foreground capitalize">
                            {form.watch(`paymentMethods.${index}.type`)?.replace('_', ' ')} #{index + 1}
                          </h3>
                        </div>
                        {paymentFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePayment(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {form.watch(`paymentMethods.${index}.type`) === 'bank_transfer' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`paymentMethods.${index}.details.bankName`}>Bank Name *</Label>
                            <Input
                              placeholder="e.g., Chase Bank"
                              {...form.register(`paymentMethods.${index}.details.bankName`)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`paymentMethods.${index}.details.accountNumber`}>Account Number *</Label>
                            <Input
                              placeholder="Account number"
                              {...form.register(`paymentMethods.${index}.details.accountNumber`)}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor={`paymentMethods.${index}.details.username`}>Cash App Username *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                            <Input
                              placeholder="username"
                              className="pl-8"
                              {...form.register(`paymentMethods.${index}.details.username`)}
                            />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
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

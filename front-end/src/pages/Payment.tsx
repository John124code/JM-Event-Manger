import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useEvents } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Shield, 
  Check,
  Lock,
  Building,
  Smartphone,
  DollarSign
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const paymentSchema = z.object({
  ticketType: z.string().min(1, "Please select a ticket type"),
  currency: z.enum(["USD", "NGN"], { required_error: "Please select a currency" }),
  paymentMethod: z.enum(["bank_transfer", "cash_app"]),
  // Bank transfer fields
  accountHolderName: z.string().optional(),
  // Cash App fields
  cashAppUsername: z.string().optional(),
  // Common fields
  billingName: z.string().min(2, "Billing name is required"),
  billingEmail: z.string().email("Valid email is required"),
  billingPhone: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === "bank_transfer") {
    return data.accountHolderName && data.accountHolderName.length >= 2;
  }
  if (data.paymentMethod === "cash_app") {
    return data.cashAppUsername && data.cashAppUsername.length >= 2;
  }
  return true;
}, {
  message: "Please fill in all required payment details",
  path: ["paymentMethod"]
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const Payment = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getEventById, registerForEvent, isRegistered } = useEvents();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">("USD");

  // Currency conversion rates (in a real app, this would come from an API)
  const exchangeRates = {
    USD: 1,
    NGN: 1650, // 1 USD = 1650 NGN (approximate)
  };

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  ];

  const event = eventId ? getEventById(eventId) : null;
  const isAlreadyRegistered = eventId ? isRegistered(eventId) : false;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ticketType: "",
      currency: "USD",
      paymentMethod: "bank_transfer",
      accountHolderName: "",
      cashAppUsername: "",
      billingName: user?.name || "",
      billingEmail: user?.email || "",
      billingPhone: "",
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Redirect if event not found
  useEffect(() => {
    if (!event && eventId) {
      navigate("/events");
    }
  }, [event, eventId, navigate]);

  // Redirect if already registered
  useEffect(() => {
    if (isAlreadyRegistered) {
      navigate(`/events/${eventId}?registered=true`);
    }
  }, [isAlreadyRegistered, eventId, navigate]);

  // Initialize selected ticket from navigation state
  useEffect(() => {
    const stateData = location.state as any;
    console.log("Navigation state:", stateData);
    console.log("Event ticket types:", event?.ticketTypes);
    if (stateData?.ticket && event?.ticketTypes) {
      console.log("Setting selected ticket:", stateData.ticket);
      const ticketId = stateData.ticket._id || stateData.ticket.name || stateData.ticket.id;
      setSelectedTicketType(ticketId);
      form.setValue("ticketType", ticketId);
    }
  }, [location.state, event, form]);

  if (!user || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <LoadingSpinner className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  const selectedTicket = event.ticketTypes?.find(t => 
    (t.id && t.id === selectedTicketType) || 
    t.name === selectedTicketType || 
    event.ticketTypes?.indexOf(t).toString() === selectedTicketType
  );
  const basePriceUSD = selectedTicket?.price || 0;
  
  // Convert price based on selected currency
  const convertPrice = (priceUSD: number, currency: "USD" | "NGN") => {
    return Math.round(priceUSD * exchangeRates[currency]);
  };

  // Format currency display
  const formatCurrency = (amount: number, currency: "USD" | "NGN") => {
    const currencyInfo = currencies.find(c => c.code === currency);
    return `${currencyInfo?.symbol}${amount.toLocaleString()}`;
  };

  const ticketPrice = convertPrice(basePriceUSD, selectedCurrency);
  const processingFee = Math.round(ticketPrice * 0.05); // 5% processing fee
  const totalAmount = ticketPrice + processingFee;

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Random chance of payment failure for demo
      if (Math.random() < 0.1) {
        throw new Error("Payment failed. Please check your details and try again.");
      }

      // Register for event with user data
      registerForEvent(event.id, {
        name: data.billingName,
        email: data.billingEmail,
        phone: data.billingPhone,
        ticketType: selectedTicket?.name || "General",
        paymentStatus: "paid",
        paymentMethod: data.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash App"
      });
      
      setPaymentSuccess(true);
      
      // Redirect to success page after a delay
      setTimeout(() => {
        navigate(`/events/${event.id}?registered=true`);
      }, 2000);
      
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-screen">
          <Card className="glass p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              You're now registered for {event.title}. Check your email for confirmation details.
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
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/events/${event.id}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Complete Registration
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure your spot at this amazing event
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Summary */}
            <Card className="glass p-6 h-fit">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Event Summary</h2>
              
              <div className="space-y-4">
                <img 
                  src={event.image || "/placeholder-tech-event.jpg"} 
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-tech-event.jpg";
                  }}
                />
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      <span>{event.date}</span>
                      <Clock className="w-4 h-4 ml-4 mr-2 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span>{event.booked} / {event.capacity} attendees</span>
                    </div>
                  </div>
                </div>

                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {event.category}
                </Badge>
              </div>

              {/* Price Breakdown */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-4">Price Breakdown</h4>
                {selectedTicket ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{selectedTicket.name} ticket</span>
                      <span className="text-foreground">{formatCurrency(ticketPrice, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing fee (5%)</span>
                      <span className="text-foreground">{formatCurrency(processingFee, selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatCurrency(totalAmount, selectedCurrency)}</span>
                    </div>
                    {selectedCurrency !== "USD" && (
                      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        <p>Original price: ${basePriceUSD} USD</p>
                        <p>Exchange rate: 1 USD = ₦{exchangeRates.NGN.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Select a ticket type to see pricing</p>
                )}
              </div>
            </Card>

            {/* Payment Form */}
            <Card className="glass p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-primary" />
                Secure Payment
              </h2>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Your payment is secured with 256-bit SSL encryption</span>
              </div>

              {/* Error Alert */}
              {paymentError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Ticket Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Select Ticket Type</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ticketType">Ticket Type *</Label>
                    <Select 
                      value={selectedTicketType} 
                      onValueChange={(value) => {
                        setSelectedTicketType(value);
                        form.setValue("ticketType", value);
                      }}
                    >
                      <SelectTrigger className="h-auto min-h-[2.5rem]">
                        <SelectValue placeholder="Choose your ticket type">
                          {selectedTicket && (
                            <div className="flex justify-between items-center w-full pr-2">
                              <span className="font-medium text-sm truncate">
                                {selectedTicket.name}
                              </span>
                              <span className="text-sm font-semibold whitespace-nowrap ml-2">
                                {formatCurrency(convertPrice(selectedTicket.price, selectedCurrency), selectedCurrency)}
                              </span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="dropdown-solid max-w-md">
                        {event.ticketTypes?.map((ticket, index) => (
                          <SelectItem key={index} value={ticket.id || ticket.name || index.toString()}>
                            <div className="flex flex-col w-full min-w-0">
                              <div className="flex justify-between items-start gap-2 w-full">
                                <span className="font-medium text-sm flex-1 min-w-0">
                                  {ticket.name}
                                </span>
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  {formatCurrency(convertPrice(ticket.price, selectedCurrency), selectedCurrency)}
                                </span>
                              </div>
                              {ticket.description && (
                                <span className="text-xs text-muted-foreground mt-1">{ticket.description}</span>
                              )}
                              {selectedCurrency !== "USD" && (
                                <span className="text-xs text-muted-foreground mt-1">
                                  (${ticket.price} USD)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.ticketType && (
                      <p className="text-sm text-destructive">{form.formState.errors.ticketType.message}</p>
                    )}
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Select Currency</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select 
                      value={selectedCurrency} 
                      onValueChange={(value: "USD" | "NGN") => {
                        setSelectedCurrency(value);
                        form.setValue("currency", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose currency" />
                      </SelectTrigger>
                      <SelectContent className="dropdown-solid">
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currency.symbol}</span>
                              <span>{currency.name} ({currency.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.currency && (
                      <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>
                    )}
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
                  
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(value) => form.setValue("paymentMethod", value as "bank_transfer" | "cash_app")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Bank Transfer Option */}
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="bank_transfer" className="flex items-center gap-2 font-medium cursor-pointer">
                          <Building className="w-5 h-5 text-primary" />
                          Bank Transfer
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Direct bank transfer payment
                        </p>
                        {event.paymentMethods?.find(pm => pm.type === "bank_transfer") && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {event.paymentMethods.find(pm => pm.type === "bank_transfer")?.details.bankName} - 
                            Account: {event.paymentMethods.find(pm => pm.type === "bank_transfer")?.details.accountNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cash App Option */}
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                      <RadioGroupItem value="cash_app" id="cash_app" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="cash_app" className="flex items-center gap-2 font-medium cursor-pointer">
                          <Smartphone className="w-5 h-5 text-primary" />
                          Cash App
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Pay with Cash App
                        </p>
                        {event.paymentMethods?.find(pm => pm.type === "cash_app") && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Send to: {event.paymentMethods.find(pm => pm.type === "cash_app")?.details.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
                  
                  {paymentMethod === "bank_transfer" && (
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Building className="w-5 h-5" />
                        <span className="font-medium">Bank Transfer Instructions</span>
                      </div>
                      <div className="text-sm space-y-2 text-blue-600 dark:text-blue-400">
                        <p><strong>Bank:</strong> {event.paymentMethods?.find(pm => pm.type === "bank_transfer")?.details.bankName}</p>
                        <p><strong>Account Number:</strong> {event.paymentMethods?.find(pm => pm.type === "bank_transfer")?.details.accountNumber}</p>
                        <p><strong>Amount:</strong> {formatCurrency(totalAmount, selectedCurrency)}</p>
                        <p className="text-xs">Please include your name and email in the transfer description</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                        <Input
                          id="accountHolderName"
                          placeholder="Your full name as it appears on your bank account"
                          {...form.register("accountHolderName")}
                        />
                        {form.formState.errors.accountHolderName && (
                          <p className="text-sm text-destructive">{form.formState.errors.accountHolderName.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cash_app" && (
                    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <Smartphone className="w-5 h-5" />
                        <span className="font-medium">Cash App Payment Instructions</span>
                      </div>
                      <div className="text-sm space-y-2 text-green-600 dark:text-green-400">
                        <p><strong>Send to:</strong> {event.paymentMethods?.find(pm => pm.type === "cash_app")?.details.username}</p>
                        <p><strong>Amount:</strong> {formatCurrency(totalAmount, selectedCurrency)}</p>
                        <p className="text-xs">Please include your email in the payment note</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cashAppUsername">Your Cash App Username *</Label>
                        <Input
                          id="cashAppUsername"
                          placeholder="$yourusername"
                          {...form.register("cashAppUsername")}
                        />
                        {form.formState.errors.cashAppUsername && (
                          <p className="text-sm text-destructive">{form.formState.errors.cashAppUsername.message}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Billing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingName">Full Name *</Label>
                      <Input
                        id="billingName"
                        placeholder="John Doe"
                        {...form.register("billingName")}
                      />
                      {form.formState.errors.billingName && (
                        <p className="text-sm text-destructive">{form.formState.errors.billingName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingEmail">Email Address *</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        placeholder="john@example.com"
                        {...form.register("billingEmail")}
                      />
                      {form.formState.errors.billingEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.billingEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingPhone">Phone Number (Optional)</Label>
                    <Input
                      id="billingPhone"
                      placeholder="+1 (555) 123-4567"
                      {...form.register("billingPhone")}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full btn-hero text-white py-3 text-lg"
                  disabled={isProcessing || !selectedTicketType}
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      Confirm Payment {formatCurrency(totalAmount, selectedCurrency)}
                    </>
                  )}
                </Button>

                {selectedTicketType && (
                  <p className="text-xs text-muted-foreground text-center">
                    By clicking "Confirm Payment", you agree to our terms and conditions.
                    You will receive a confirmation email after payment processing.
                  </p>
                )}
              </form>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Payment;

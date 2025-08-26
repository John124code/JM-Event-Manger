import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className = "" }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass p-6 flex items-center space-x-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <span className="text-foreground font-medium">{message}</span>
      </div>
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = "Loading..." }: PageLoadingProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="glass p-8 text-center">
        <LoadingSpinner size="lg" className="text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </div>
  );
};

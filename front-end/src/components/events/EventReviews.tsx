import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ThumbsUp, MoreHorizontal } from "lucide-react";
import { useEvents, type EventRating } from "@/contexts/EventsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().min(10, "Comment must be at least 10 characters").optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface EventReviewsProps {
  eventId: string;
  ratings: EventRating[];
  onAddReview: (rating: Omit<EventRating, 'id' | 'createdAt'>) => void;
  canReview: boolean; // Only registered attendees can review
}

export const EventReviews = ({ eventId, ratings, onAddReview, canReview }: EventReviewsProps) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const watchedRating = form.watch("rating");

  // Check if user has already reviewed
  const userHasReviewed = ratings.some(rating => rating.userName === user?.name);

  // Calculate average rating
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 : 0
  }));

  const onSubmit = (data: ReviewFormData) => {
    if (!user) return;

    onAddReview({
      userId: user.id || Date.now().toString(),
      userName: user.name,
      rating: data.rating,
      comment: data.comment,
    });

    form.reset();
    setShowReviewForm(false);
  };

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = interactive ? 
        (hoveredRating > 0 ? starValue <= hoveredRating : starValue <= watchedRating) :
        starValue <= rating;
      
      return (
        <Star
          key={index}
          className={`${size} cursor-pointer transition-colors ${
            isActive ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
          onClick={interactive ? () => form.setValue("rating", starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-foreground">Reviews & Ratings</h3>
          {canReview && !userHasReviewed && (
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          )}
        </div>

        {ratings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(averageRating)}
              </div>
              <p className="text-muted-foreground">
                Based on {ratings.length} review{ratings.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-8">{star} ★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
          </div>
        )}
      </Card>

      {/* Review Form */}
      {showReviewForm && canReview && !userHasReviewed && (
        <Card className="glass p-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">Share Your Experience</h4>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rating *</label>
              <div className="flex gap-1">
                {renderStars(0, true, "w-8 h-8")}
              </div>
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Comment (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this event..."
                {...form.register("comment")}
                rows={4}
              />
              {form.formState.errors.comment && (
                <p className="text-sm text-destructive">{form.formState.errors.comment.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Submit Review
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Individual Reviews */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground">All Reviews</h4>
          
          {ratings.map((rating) => (
            <Card key={rating.id} className="glass p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {rating.userName.charAt(0).toUpperCase()}
                    </div>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="font-medium text-foreground">{rating.userName}</h5>
                      <div className="flex">
                        {renderStars(rating.rating, false, "w-4 h-4")}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    
                    {rating.comment && (
                      <p className="text-muted-foreground leading-relaxed">
                        {rating.comment}
                      </p>
                    )}
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Review Actions */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Helpful
                </Button>
                <span className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 10)} people found this helpful
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Prompts for Non-Attendees */}
      {!canReview && (
        <Card className="glass p-6 border-dashed">
          <div className="text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Register for this event to leave a review after attending
            </p>
          </div>
        </Card>
      )}

      {/* Already Reviewed Message */}
      {userHasReviewed && canReview && (
        <Card className="glass p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Thank you for your review!
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Your feedback helps other attendees make informed decisions.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

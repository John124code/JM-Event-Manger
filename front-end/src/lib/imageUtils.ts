/**
 * Get appropriate placeholder image based on event category
 */
export const getEventPlaceholder = (category?: string): string => {
  if (!category) return '/placeholder-tech-event.jpg';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('culinary')) {
    return '/placeholder-food.jpg';
  }
  
  if (categoryLower.includes('music') || categoryLower.includes('concert') || categoryLower.includes('band') || categoryLower.includes('audio')) {
    return '/placeholder-music.jpg';
  }
  
  if (categoryLower.includes('workshop') || categoryLower.includes('training') || categoryLower.includes('education') || categoryLower.includes('learning')) {
    return '/placeholder-workshop.jpg';
  }
  
  if (categoryLower.includes('tech') || categoryLower.includes('technology') || categoryLower.includes('software') || categoryLower.includes('coding')) {
    return '/placeholder-tech-event.jpg';
  }
  
  // Default fallback
  return '/placeholder-tech-event.jpg';
};

/**
 * Handle image loading errors with category-based fallback
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, category?: string) => {
  const target = e.target as HTMLImageElement;
  const placeholder = getEventPlaceholder(category);
  
  // Prevent infinite error loops
  if (target.src !== placeholder) {
    target.src = placeholder;
  }
};

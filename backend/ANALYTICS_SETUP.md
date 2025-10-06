# Backend Analytics API Setup Guide

## 1. Add Analytics Routes to Your Backend

Add these analytics routes to your backend. In your main app.js or server.js file, add:

```javascript
// Import analytics routes
const analyticsRoutes = require('./routes/analytics');

// Use analytics routes
app.use('/api/events', analyticsRoutes);
```

## 2. Required API Endpoints

Your frontend is now configured to use these endpoints:

### Analytics Endpoints:
- `GET /api/events/:eventId/analytics` - Get event analytics data
- `GET /api/events/:eventId/registrations` - Get registered users list
- `GET /api/events/:eventId/financials` - Get financial data
- `GET /api/events/:eventId/export/:type` - Export data as CSV
- `POST /api/events/:eventId/send-update` - Send updates to attendees
- `POST /api/events/:eventId/check-in/:registrationId` - Check in attendee
- `GET /api/events/:eventId/metrics` - Get performance metrics

## 3. Database Models Required

Make sure you have these models with the required fields:

### Event Model:
```javascript
{
  title: String,
  creator: ObjectId (ref: User),
  capacity: Number,
  views: Number,
  ratings: [{ user: ObjectId, rating: Number, comment: String }],
  ticketTypes: [{ name: String, price: Number }]
}
```

### Registration Model:
```javascript
{
  event: ObjectId (ref: Event),
  user: ObjectId (ref: User),
  ticketType: String,
  quantity: Number,
  totalAmount: Number,
  paymentMethod: String,
  paymentStatus: String,
  checkInStatus: Boolean,
  checkInTime: Date,
  createdAt: Date
}
```

### User Model:
```javascript
{
  name: String,
  email: String,
  phone: String
}
```

## 4. Fallback Behavior

If you haven't implemented these API endpoints yet, the frontend will automatically:

✅ Use mock data instead of throwing errors
✅ Show warning messages in console
✅ Continue to function normally
✅ Allow you to test the UI with realistic data

## 5. Quick Test

To test if your analytics are working:

1. Navigate to any event details page
2. If you're the event creator, click "View Analytics"
3. You should see either:
   - Real data from your API (if endpoints exist)
   - Mock data with console warnings (if endpoints don't exist)

## 6. Implementation Priority

Implement these endpoints in order of importance:

1. **High Priority**: `/analytics` and `/registrations` - Core analytics functionality
2. **Medium Priority**: `/financials` - Financial tracking
3. **Low Priority**: `/export`, `/send-update`, `/check-in` - Advanced features

## 7. Mock Data vs Real Data

Current behavior:
- **404 Response**: Frontend uses mock data and shows warnings
- **200 Response**: Frontend uses real data from your API
- **Other Errors**: Frontend shows error messages to user

This allows you to develop incrementally without breaking the frontend!
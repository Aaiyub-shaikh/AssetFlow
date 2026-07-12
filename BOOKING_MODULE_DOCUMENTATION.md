# Resource Booking Module Documentation

## Overview
The Resource Booking Module provides a complete solution for time-slot booking of shared resources with overlap validation, booking status tracking, cancellation/rescheduling, and reminder notifications.

## Key Features

### 1. **Overlap Validation**
- Prevents double bookings of the same resource
- Real-time availability checking
- Clear error messages when conflicts are detected
- Example: Room B2 booked 9:00–10:00 rejects 9:30–10:30 but accepts 10:00–11:00

### 2. **Booking Status Tracking**
- **Upcoming**: Scheduled for future date/time
- **Ongoing**: Currently in progress
- **Completed**: Past booking
- **Cancelled**: User-cancelled booking with optional reason

### 3. **Calendar View**
- Visual representation of resource bookings
- Month navigation
- Click to view bookings on specific dates
- Shows booking count for days with multiple bookings

### 4. **Booking Management**
- Create new bookings with overlap detection
- Cancel bookings with optional cancellation reason
- Reschedule to new date/time
- View booking details and history

### 5. **Reminder Notifications**
- Configurable reminder times (5, 15, 30, 60 minutes before)
- Tracks reminder sent status
- Integration point for notification system

## Architecture

### Backend Structure

#### Models
- **Resource**: Represents shared resources (meeting rooms, equipment, etc.)
  - name, type, location, capacity, amenities
  - working hours, active status

- **Booking**: Represents individual bookings
  - resource reference, time slots, booking status
  - attendees, notes, reminder preferences
  - cancellation reason for cancelled bookings

#### Services
- **bookingService.js**: Core booking logic
  - `checkOverlap()`: Validates no time overlaps exist
  - `createBooking()`: Creates new booking with validation
  - `updateBooking()`: Updates booking details
  - `cancelBooking()`: Cancels booking
  - `rescheduleBooking()`: Moves booking to new time slot
  - `getBookingsByResource()`: Retrieves bookings for a resource
  - `updateBookingStatuses()`: Auto-updates status based on current time

- **notificationService.js**: Notification logic
  - `getBookingsNeedingReminder()`: Gets bookings due for reminders
  - `sendReminder()`: Formats reminder data
  - `markReminderSent()`: Updates reminder status
  - `getBookingStatistics()`: Analytics for resource usage

#### API Routes

**Base URL**: `/api`

##### Bookings Endpoints
- `GET /bookings` - List bookings with filters
- `GET /bookings/:id` - Get specific booking
- `GET /bookings/resource/:resourceId` - Bookings for resource
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `POST /bookings/:id/cancel` - Cancel booking
- `POST /bookings/:id/reschedule` - Reschedule booking
- `POST /bookings/check-overlap` - Check availability
- `GET /bookings/user/:userId/upcoming` - User's upcoming bookings
- `POST /bookings/admin/update-statuses` - Update all booking statuses

##### Resources Endpoints
- `GET /resources` - List all resources
- `GET /resources/:id` - Get specific resource
- `POST /resources` - Create resource
- `PUT /resources/:id` - Update resource
- `DELETE /resources/:id` - Delete resource

### Frontend Structure

#### Types (`src/types/booking.ts`)
- `Resource`: Shared resource definition
- `Booking`: Booking data structure
- `BookingStatus`: Status enum (upcoming, ongoing, completed, cancelled)
- `BookingFormData`: Form submission data

#### Hooks (`src/hooks/useBooking.ts`)
- `useResources()`: Fetch all resources
- `useResource()`: Fetch single resource
- `useBookings()`: Fetch all bookings
- `useResourceBookings()`: Fetch bookings for specific resource
- `useUpcomingBookings()`: Fetch user's upcoming bookings
- `useCreateBooking()`: Create new booking mutation
- `useUpdateBooking()`: Update booking mutation
- `useCancelBooking()`: Cancel booking mutation
- `useRescheduleBooking()`: Reschedule booking mutation
- `useCheckOverlap()`: Check availability

#### API Layer (`src/lib/api/bookingAPI.ts`)
- Direct API calls to backend
- Automatic error handling
- Response parsing and error formatting

#### Components (`src/components/bookings/`)

1. **StatusBadge** (`status-badge.tsx`)
   - Visual status indicator
   - Icons and color coding for each status

2. **BookingCard** (`booking-card.tsx`)
   - Display booking details
   - Show resource info, time, attendees
   - Cancel/Reschedule action buttons

3. **BookingList** (`booking-list.tsx`)
   - Tabbed view of bookings by status
   - Status count badges
   - Empty state handling

4. **BookingCalendar** (`booking-calendar.tsx`)
   - Month view calendar
   - Click to see bookings for date
   - Navigation between months

5. **BookingFormDialog** (`booking-form-dialog.tsx`)
   - Create new booking form
   - Real-time overlap checking
   - Resource selection
   - Time validation

6. **CancelDialog** (`cancel-dialog.tsx`)
   - Confirmation dialog with reason field
   - Prevents accidental cancellations

7. **RescheduleDialog** (`reschedule-dialog.tsx`)
   - Change booking date and time
   - Shows current and new schedule
   - Optional reason field

#### Pages (`src/pages/bookings.tsx`)
- Main booking page
- Integrated views: List and Calendar
- Dialog management for CRUD operations

#### Utilities (`src/lib/booking-utils.ts`)
- `calculateDuration()`: Get booking duration
- `formatTimeRange()`: Format time display
- `isTimeSlotAvailable()`: Check availability
- `getBookingsByStatus()`: Filter by status
- `getUpcomingBookingsInNextDays()`: Future bookings
- `groupBookingsByResource()`: Group bookings by resource
- `getConflictingTimeSlots()`: Find conflicts

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file in backend directory:
   ```
   MONGODB_URI=mongodb://localhost:27017/assetflow
   PORT=5000
   NODE_ENV=development
   ```

3. **Database Connection** (`backend/src/config/database.js`)
   ```javascript
   import mongoose from "mongoose";
   
   const connectDB = async () => {
     try {
       await mongoose.connect(process.env.MONGODB_URI);
       console.log("MongoDB Connected");
     } catch (error) {
       console.error("Database connection error:", error);
       process.exit(1);
     }
   };
   
   export default connectDB;
   ```

4. **Start Backend**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Environment Configuration**
   Create `.env.local` file in root directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start Frontend**
   ```bash
   npm run dev
   ```

## Database Setup

### MongoDB Collections

#### Resources Collection
```javascript
db.resources.insertOne({
  name: "Conference Room A",
  type: "meeting_room",
  location: "Building A - Floor 2",
  capacity: 10,
  amenities: ["projector", "whiteboard", "video_conference"],
  isActive: true,
  workingHours: {
    startTime: "08:00",
    endTime: "18:00"
  }
})
```

#### Bookings Collection
Automatically created when bookings are made. Indexes are set up in the model for performance.

## Integration Points

### 1. Notification System Integration
The `notificationService.js` prepares reminder data that can be integrated with:
- Email notifications
- Push notifications
- In-app notifications
- SMS alerts

Implement notification handlers in your notification service:
```javascript
import { getBookingsNeedingReminder, sendReminder } from "@/services/notificationService.js";

// Run periodically (e.g., every 5 minutes)
const checkAndSendReminders = async () => {
  const bookings = await getBookingsNeedingReminder(15);
  
  for (const booking of bookings) {
    const reminder = sendReminder(booking);
    // Send via your notification service
    await notificationService.send(reminder);
    await markReminderSent(booking._id);
  }
};
```

### 2. User Authentication
The booking system expects `req.userId` to be set by authentication middleware.
Update your middleware in `backend/src/app.js`:
```javascript
// Add auth middleware
app.use(authMiddleware); // Sets req.userId
```

### 3. Calendar Integration
The calendar component can be extended to integrate with:
- External calendars (Google Calendar, Outlook)
- iCal feeds
- Calendar exports

## Usage Examples

### Creating a Booking
```typescript
const { mutate: createBooking } = useCreateBooking();

await createBooking({
  resource: resourceId,
  title: "Team Standup",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T09:30:00Z",
  reminderTime: 15
});
```

### Checking Availability
```typescript
const { mutate: checkOverlap } = useCheckOverlap();

const result = await checkOverlap({
  resourceId: "room123",
  startTime: "2024-01-15T09:00:00Z",
  endTime: "2024-01-15T10:00:00Z"
});
```

### Cancelling a Booking
```typescript
const { mutate: cancelBooking } = useCancelBooking();

await cancelBooking({
  id: bookingId,
  reason: "Meeting cancelled"
});
```

### Rescheduling a Booking
```typescript
const { mutate: rescheduleBooking } = useRescheduleBooking();

await rescheduleBooking({
  id: bookingId,
  newStartTime: "2024-01-16T10:00:00Z",
  newEndTime: "2024-01-16T11:00:00Z",
  reason: "Moved to next day"
});
```

## Database Indexes

Indexes are automatically created by Mongoose for:
- `resource + startTime + endTime` (for overlap checking)
- `bookedBy + createdAt` (for user's bookings)
- `status` (for status filtering)

These indexes ensure:
- Fast overlap detection queries
- Efficient user booking history retrieval
- Quick status-based filtering

## Error Handling

### Overlap Detection
```
Error: Booking overlaps with existing booking from Jan 15, 2024, 9:00 AM to 10:00 AM
```

### Invalid Time Range
```
Error: End time must be after start time
```

### Resource Not Available
```
Error: Cannot modify completed booking
```

## Performance Considerations

1. **Query Optimization**: Overlap queries use indexed fields
2. **Pagination**: Consider adding pagination for large booking lists
3. **Caching**: React Query handles automatic caching and revalidation
4. **Batch Operations**: The `updateBookingStatuses` endpoint updates multiple bookings efficiently

## Security Considerations

1. **Authentication**: All booking operations should require authentication
2. **Authorization**: Users should only see/modify their own bookings (add in middleware)
3. **Input Validation**: All inputs are validated with Zod schemas
4. **Rate Limiting**: Consider adding rate limiting for creation endpoints

## Testing

### Manual Testing Checklist
- [ ] Create booking - success and with overlap error
- [ ] Cancel booking - with and without reason
- [ ] Reschedule booking - to available and conflicting slots
- [ ] View calendar - navigate months, see bookings
- [ ] Filter by status - upcoming, ongoing, completed, cancelled
- [ ] Check reminders - verify reminder notifications work

### API Testing with cURL

```bash
# Check overlap
curl -X POST http://localhost:5000/api/bookings/check-overlap \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "resource123",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T10:00:00Z"
  }'

# Create booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "resource": "resource123",
    "title": "Meeting",
    "startTime": "2024-01-15T09:00:00Z",
    "endTime": "2024-01-15T10:00:00Z",
    "bookedBy": "user123"
  }'

# Cancel booking
curl -X POST http://localhost:5000/api/bookings/booking123/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Meeting cancelled"}'
```

## Future Enhancements

1. **Advanced Filtering**: Filter by resource type, location, capacity
2. **Bulk Operations**: Book multiple resources for same time
3. **Recurring Bookings**: Support recurring meeting schedules
4. **Booking Templates**: Save and reuse common booking patterns
5. **Resource Conflicts**: Detect when multiple resources are needed
6. **Analytics Dashboard**: Usage statistics and trends
7. **Calendar Sync**: Two-way sync with external calendars
8. **Mobile App**: Native mobile booking interface
9. **Approval Workflow**: Booking requests requiring manager approval
10. **Waitlist**: Queue for unavailable resources

## Troubleshooting

### Bookings Not Appearing
- Check MongoDB connection
- Verify API calls are reaching the backend
- Check browser console for errors

### Overlap Detection Not Working
- Ensure dates are in ISO format
- Check timezone handling
- Verify resource ID is correct

### Status Updates Not Working
- Ensure the `updateBookingStatuses` endpoint is being called periodically
- Check server logs for errors

## Support

For issues or questions:
1. Check the documentation above
2. Review API response errors
3. Check browser console and server logs
4. Verify MongoDB connection and data

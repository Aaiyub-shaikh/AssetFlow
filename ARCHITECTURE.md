# Resource Booking Module - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Pages/Bookings.tsx                                          │
│  ├── BookingList (Tabbed view by status)                    │
│  ├── BookingCalendar (Month view)                           │
│  ├── BookingFormDialog (Create booking)                     │
│  ├── CancelDialog (Cancel confirmation)                     │
│  └── RescheduleDialog (Reschedule booking)                  │
│                                                               │
│  Hooks/useBooking.ts                                         │
│  ├── useResources()                                          │
│  ├── useBookings()                                           │
│  ├── useCreateBooking()                                      │
│  ├── useCancelBooking()                                      │
│  ├── useRescheduleBooking()                                 │
│  └── useCheckOverlap()                                       │
│                                                               │
│  Lib/api/bookingAPI.ts                                       │
│  └── API call functions                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP Requests/Responses
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express + Node.js)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Routes                                                      │
│  ├── /api/bookings (POST, GET, PUT, DELETE)                │
│  ├── /api/bookings/:id/cancel (POST)                       │
│  ├── /api/bookings/:id/reschedule (POST)                   │
│  ├── /api/bookings/check-overlap (POST)                    │
│  ├── /api/resources (GET, POST, PUT, DELETE)               │
│  └── /api/resources/:id (GET, PUT, DELETE)                 │
│                                                               │
│  Services                                                    │
│  ├── bookingService.js                                       │
│  │   ├── checkOverlap()                                      │
│  │   ├── createBooking()                                     │
│  │   ├── updateBooking()                                     │
│  │   ├── cancelBooking()                                     │
│  │   ├── rescheduleBooking()                                 │
│  │   ├── getBookingsByResource()                             │
│  │   └── updateBookingStatuses()                             │
│  │                                                            │
│  └── notificationService.js                                  │
│      ├── getBookingsNeedingReminder()                        │
│      ├── sendReminder()                                      │
│      ├── markReminderSent()                                  │
│      └── getBookingStatistics()                              │
│                                                               │
│  Models (Mongoose)                                           │
│  ├── Resource                                                │
│  │   ├── name, type, location, capacity                     │
│  │   ├── amenities, workingHours                            │
│  │   └── isActive, notes                                     │
│  │                                                            │
│  └── Booking                                                 │
│      ├── resource, title, bookedBy                          │
│      ├── startTime, endTime, status                         │
│      ├── attendees, reminderSent                            │
│      └── cancellationReason, rescheduledFrom                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    MongoDB Queries
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collections:                                                │
│  ├── resources (with indexes)                               │
│  │   ├── _id, name, type, location                          │
│  │   ├── capacity, amenities, isActive                      │
│  │   └── workingHours, createdAt, updatedAt                 │
│  │                                                            │
│  └── bookings (with indexes)                                │
│      ├── _id, resource, title, description                  │
│      ├── bookedBy, attendees, startTime, endTime            │
│      ├── status (upcoming/ongoing/completed/cancelled)      │
│      ├── reminderSent, reminderTime                         │
│      ├── cancellationReason, rescheduledFrom                │
│      └── createdAt, updatedAt                               │
│                                                               │
│  Indexes:                                                    │
│  ├── { resource: 1, startTime: 1, endTime: 1 }             │
│  ├── { bookedBy: 1, createdAt: -1 }                        │
│  └── { status: 1 }                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating a Booking
```
User Form Input
    ↓
Validate Form (Zod)
    ↓
Check Overlap (API Call)
    ↓ (If available)
Submit Form
    ↓
Create Booking Mutation
    ↓
POST /api/bookings
    ↓
Backend: checkOverlap() in bookingService
    ↓
Query MongoDB for conflicts
    ↓ (If no conflicts)
Insert Booking Document
    ↓
Query and Populate Relations
    ↓
Return Booking with Resource & User Details
    ↓
Update React Query Cache
    ↓
Show Success Toast
    ↓
Refresh Bookings List & Calendar
```

### Cancelling a Booking
```
User Clicks Cancel Button
    ↓
CancelDialog Opens
    ↓
User Enters Reason (Optional)
    ↓
Confirm Cancel
    ↓
POST /api/bookings/:id/cancel
    ↓
Backend: cancelBooking()
    ↓
Verify Booking Status (not completed/cancelled)
    ↓
Update Document:
  status = "cancelled"
  cancellationReason = reason
    ↓
Return Updated Booking
    ↓
Invalidate React Query Cache
    ↓
Show Success Toast
    ↓
Update UI
```

### Rescheduling a Booking
```
User Clicks Reschedule Button
    ↓
RescheduleDialog Opens
    ↓
User Selects New Date & Time
    ↓
Real-time Overlap Check (Auto)
    ↓ (If available)
User Enters Reason (Optional)
    ↓
Confirm Reschedule
    ↓
POST /api/bookings/:id/reschedule
    ↓
Backend: rescheduleBooking()
    ↓
Verify Booking Status
    ↓
Check Overlap with New Time
    ↓ (If no conflicts)
Update Document:
  startTime = newStart
  endTime = newEnd
  reminderSent = false
    ↓
Return Updated Booking
    ↓
Invalidate Cache
    ↓
Show Success Toast
    ↓
Update Calendar & List
```

## Component Interaction Diagram

```
BookingsPage
├── State Management
│   ├── formOpen
│   ├── currentMonth
│   ├── selectedBookingForCancel
│   └── selectedBookingForReschedule
│
├── Custom Hooks
│   ├── useResources()
│   ├── useBookings()
│   ├── useCreateBooking()
│   ├── useCancelBooking()
│   └── useRescheduleBooking()
│
├── Child Components
│   ├── BookingFormDialog
│   │   ├── Form Fields
│   │   ├── Real-time Overlap Check
│   │   └── Submission Handler
│   │
│   ├── BookingList
│   │   ├── Tabs (By Status)
│   │   └── BookingCard (Multiple)
│   │       ├── Status Badge
│   │       ├── Details Display
│   │       └── Action Buttons
│   │
│   ├── BookingCalendar
│   │   ├── Month Navigation
│   │   ├── Calendar Grid
│   │   └── Day Cells with Bookings
│   │
│   ├── CancelDialog
│   │   ├── Confirmation Message
│   │   ├── Reason Input
│   │   └── Action Buttons
│   │
│   └── RescheduleDialog
│       ├── Current Schedule Display
│       ├── Date/Time Inputs
│       ├── Reason Input
│       └── Action Buttons
```

## API Flow

```
Frontend                          Backend                        Database
─────────────────────────────────────────────────────────────────────────

                                                    
1. GET /api/resources  ──────────→  getResources()
                                    └──→ Resource.find()  ──→ Query
                                                            ←── Docs
                      ←──────────── Return Resources[]
                      

2. POST /api/bookings/check-overlap ──→ checkOverlap()
                                      ├─→ Booking.findOne()  ──→ Query
                                      └←── Overlap? (true/false)
                      ←────────────── { success, message }
                      

3. POST /api/bookings ────────────→ createBooking()
                                  ├─→ checkOverlap() (again)
                                  ├─→ Booking.create()  ──→ Insert
                                  ├─→ .populate()       ──→ Join Query
                      ←──────────── Return Booking (populated)
                      

4. POST /api/bookings/:id/cancel ─→ cancelBooking()
                                   ├─→ Booking.findById()
                                   ├─→ Update status
                                   ├─→ booking.save()  ──→ Update
                      ←──────────── Return Updated Booking
                      

5. POST /api/bookings/:id/reschedule → rescheduleBooking()
                                     ├─→ checkOverlap()
                                     ├─→ Update times
                                     ├─→ booking.save()  ──→ Update
                      ←────────────── Return Updated Booking
```

## State Management

### React Query Cache Keys
```
["resources"]
["bookings", filters]
["resourceBookings", resourceId, filters]
["upcomingBookings", userId]
```

### Mutations
```
useCreateBooking()
useUpdateBooking()
useCancelBooking()
useRescheduleBooking()
useCheckOverlap()
```

### Cache Invalidation Strategy
After mutations:
- Invalidate ["bookings"]
- Invalidate ["resourceBookings"]
- Invalidate ["upcomingBookings"]

## Error Handling Flow

```
API Call
├── Network Error
│   ├── Show toast: "Network error"
│   └── Log error
│
├── 400 Bad Request
│   ├── Parse error message
│   ├── Show specific error (e.g., "Overlap detected")
│   └── Highlight affected field
│
├── 401 Unauthorized
│   ├── Clear auth
│   └── Redirect to login
│
├── 404 Not Found
│   ├── Show: "Booking not found"
│   └── Refresh data
│
└── 500 Server Error
    ├── Log error
    ├── Show: "Server error occurred"
    └── Offer retry
```

## Performance Optimizations

1. **Database Indexes**: Fast overlap detection
2. **React Query**: Automatic caching and revalidation
3. **Lazy Loading**: Calendar loads months on demand
4. **Debounced Checks**: Overlap check debounced 500ms
5. **Selective Updates**: Only invalidate relevant caches

## Security Considerations

```
Frontend:
├── Input validation (Zod)
├── XSS protection (React automatic escaping)
└── HTTPS in production

Backend:
├── Authentication middleware
├── Authorization checks
├── Input sanitization
├── Rate limiting
└── CORS configuration

Database:
├── Connection string in env
├── Mongoose schema validation
└── Indexed queries for performance
```

## Scalability Considerations

For production deployment:

1. **Database**
   - Add read replicas for high volume
   - Archive old bookings
   - Add TTL indexes for cleanup

2. **Backend**
   - Add caching layer (Redis)
   - Implement job queue for reminders
   - Add load balancing

3. **Frontend**
   - Implement pagination
   - Add virtual scrolling for long lists
   - Service Worker for offline support

4. **Notifications**
   - Queue-based notification system
   - Batch reminder processing
   - Retry logic for failures

# Quick Start: Resource Booking Module

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Step 1: Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/assetflow
```

Start backend:
```bash
npm run dev
```

### Step 2: Frontend Setup
Create `.env.local` in root:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### Step 3: Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Navigate to "Bookings" page

## Features to Try

### 1. Create a Booking
- Click "New Booking"
- Select a resource
- Choose date and time
- Submit

### 2. View Bookings
- See list with status badges
- Switch to calendar view
- Navigate between months

### 3. Manage Bookings
- Cancel upcoming bookings
- Reschedule to new time
- View booking details

### 4. Overlap Prevention
- Try booking overlapping time
- See error message
- Choose different time

## Key Files

**Backend:**
- Models: `backend/src/models/` (Booking, Resource)
- Routes: `backend/src/routes/` (bookings, resources)
- Services: `backend/src/services/` (booking logic)

**Frontend:**
- Types: `src/types/booking.ts`
- Hooks: `src/hooks/useBooking.ts`
- Components: `src/components/bookings/`
- Page: `src/pages/bookings.tsx`

## Next Steps

1. Set up authentication middleware
2. Configure notification system
3. Add user-specific filtering
4. Deploy to production
5. Add calendar integrations

## Troubleshooting

**Backend won't start:**
- Ensure MongoDB is running
- Check .env file
- Check port 5000 is available

**Frontend shows errors:**
- Check VITE_API_URL
- Open browser console
- Check backend is running

**No bookings showing:**
- Check MongoDB connection
- Create sample bookings first
- Check API responses

For detailed documentation, see `BOOKING_MODULE_DOCUMENTATION.md`

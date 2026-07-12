# Backend Configuration

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/assetflow

# Optional: For production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assetflow

# API Configuration
API_URL=http://localhost:5000/api
CORS_ORIGIN=http://localhost:5173

# Notification Settings (for future integration)
NOTIFICATION_ENABLED=true
REMINDER_CHECK_INTERVAL=5 # minutes
```

## Database Setup

### Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Mac: `brew install mongodb-community`
   - Linux: https://docs.mongodb.com/manual/installation/

2. **Start MongoDB**
   ```bash
   # Windows
   mongod
   
   # Mac/Linux
   brew services start mongodb-community
   ```

3. **Verify Connection**
   ```bash
   mongosh
   ```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assetflow?retryWrites=true&w=majority
   ```

## Database Initialization

The database and collections are created automatically when you first make API calls. However, you can pre-populate sample data:

```javascript
// backend/src/seeds/seedData.js
import mongoose from "mongoose";
import Resource from "../models/Resource.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Resource.deleteMany({});

    // Create sample resources
    const resources = [
      {
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
      },
      {
        name: "Conference Room B",
        type: "meeting_room",
        location: "Building A - Floor 3",
        capacity: 6,
        amenities: ["projector", "whiteboard"],
        isActive: true,
        workingHours: {
          startTime: "08:00",
          endTime: "18:00"
        }
      },
      {
        name: "Training Lab",
        type: "conference_hall",
        location: "Building B - Floor 1",
        capacity: 30,
        amenities: ["projector", "video_conference", "breakout_rooms"],
        isActive: true,
        workingHours: {
          startTime: "09:00",
          endTime: "17:00"
        }
      },
      {
        name: "Projector Cart",
        type: "equipment",
        location: "IT Department",
        capacity: 1,
        amenities: ["4K_resolution"],
        isActive: true
      }
    ];

    await Resource.insertMany(resources);
    console.log("✅ Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
```

Run seed script:
```bash
node src/seeds/seedData.js
```

## Frontend Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: For production
# VITE_API_URL=https://api.assetflow.com/api
```

## Running the Application

### Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### Start Frontend
```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Verification

### Check Backend Health
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Server is healthy"
}
```

### Check Available Resources
```bash
curl http://localhost:5000/api/resources
```

## Docker Setup (Optional)

### Docker Compose for MongoDB

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: assetflow-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: assetflow
    volumes:
      - mongodb_data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: assetflow-backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/assetflow
      PORT: 5000
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Backend Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

Start with Docker:
```bash
docker-compose up
```

## Monitoring

### Check MongoDB Connection
```bash
# In backend directory
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err))
"
```

### View MongoDB Data
```bash
# Using mongosh
mongosh
use assetflow
db.resources.find()
db.bookings.find()
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
- Check MongoDB is running: `mongosh`
- Verify MONGODB_URI in .env
- Check MongoDB network access (if using Atlas)
- Review backend logs

### API Calls Not Working
- Verify VITE_API_URL in frontend .env.local
- Check CORS_ORIGIN in backend .env
- Clear browser cache
- Check browser console for errors

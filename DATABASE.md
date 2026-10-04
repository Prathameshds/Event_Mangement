# EventHive - MongoDB Database Documentation

This document explains the MongoDB database layer for the Event Management and Registration System (Part 2).

## 1. Database Overview
- **Database Name**: `event_management`
- **Driver**: Mongoose (ODM for Node.js)
- **Architecture**: Document-oriented (NoSQL)

## 2. Collections & Schema

### `users`
Stores all system users (Admin, Organizer, Participant).
- `name` (String): Required
- `email` (String): Required, Unique, Indexed
- `password` (String): Hashed using bcrypt
- `role` (String): participant, organizer, admin
- `status` (String): active, disabled

### `events`
Stores event details. Demonstrates **embedded documents** for location.
- `title` (String): Required
- `description` (String): Required
- `categoryId` (ObjectId): Reference to `categories`
- `organizerId` (ObjectId): Reference to `users`
- `date` (Date): Event date, Indexed
- `time` (String): Event time
- **`location` (Object)**: Embedded document
  - `venue` (String)
  - `city` (String)
- `capacity` (Number): Min 1
- `registrationFee` (Number): Default 0

### `categories`
Categorizes events.
- `name` (String): Unique (e.g., Workshop, Seminar)
- `status` (String): active, inactive

### `registrations`
Links users to events.
- `userId` (ObjectId): Reference to `users`
- `eventId` (ObjectId): Reference to `events`
- `status` (String): confirmed, cancelled
- `registeredAt` (Date): Timestamp

## 3. Key NoSQL Concepts Demonstrated

### Embedded Documents
Location data is embedded directly within the event document.
```json
"location": {
  "venue": "Seminar Hall",
  "city": "Mumbai"
}
```
*Why?* Location is highly coupled with the event and doesn't need to be queried independently as a separate entity.

### Indexing
- **Single Field**: `email` in users, `date` in events.
- **Compound Unique Index**: `userId` + `eventId` in registrations. This prevents a user from registering for the same event twice at the database level.

### Aggregation Pipelines
Implemented in `src/server/routes/stats.routes.ts`:
- **$group**: Used to count registrations per event.
- **$lookup**: Used to join registration data with event titles for reports.
- **$match**: Filters confirmed registrations before processing stats.

## 4. Connecting to the REAL database (MongoDB Compass)
1. Install **MongoDB Community Server** and make sure the service is running (Windows: `services.msc` -> *MongoDB Server* -> Running).
2. Open **MongoDB Compass** -> New Connection -> URI: `mongodb://127.0.0.1:27017` -> Connect.
3. In the project, `.env` already contains:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/event_management
   ALLOW_IN_MEMORY_DB=false
   ```
   (`ALLOW_IN_MEMORY_DB=false` means the app stops with an error if MongoDB is unreachable, instead of silently using a hidden in-memory DB.)
4. Install and seed:
   ```bash
   npm install
   npm run seed          # add  -- --reset  to wipe and re-seed
   npm run db:check      # prints collections, document counts, indexes
   npm run dev
   ```
5. In Compass press the refresh icon: database `event_management` appears with `users`, `categories`, `events`, `registrations`.
6. **Inspect indexes**: `registrations` -> *Indexes* tab -> compound unique `userId_1_eventId_1`.
7. **Aggregation** (`registrations` -> *Aggregations* tab):
   ```json
   [
     { "$match": { "status": "confirmed" } },
     { "$group": { "_id": "$eventId", "count": { "$sum": 1 } } }
   ]
   ```
*MongoDB Atlas*: set `MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/event_management` (and allow your IP in Atlas Network Access).

## 5. Setup & Seeding
To populate the database with sample data:
```bash
npm run seed
```
This will create:
- 1 Admin, 2 Organizers, 5 Participants
- 8 Categories
- 3 Initial Events
- Sample registrations

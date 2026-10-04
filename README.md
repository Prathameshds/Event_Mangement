# EventHive - Event Management and Registration System

A full-stack web application for managing and registering for events, built as Part 1 of a college project.

## Features

### Participants
- Browse and filter events.
- Register for events.
- Manage profile and view own registrations.

### Organizers
- Create, edit, and delete events.
- Monitor registration statistics.
- View participant lists for own events.

### Administrators
- Manage all users, events, and registrations.
- System-wide dashboard.

## Technology Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios.
- **Backend**: Node.js, Express.js.
- **Auth**: JWT with bcrypt password hashing.
- **Database**: MongoDB via Mongoose (see DATABASE.md).

## Getting Started

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017/event_management
```
*Requires a running MongoDB (see DATABASE.md).*

### Running the App
```bash
npm run dev
```

## Test Accounts
- **Admin**: `admin@example.com` / `password123`
- **Organizer**: `organizer@example.com` / `password123`
- **Participant**: `participant@example.com` / `password123`

## API Documentation
- `POST /api/auth/login`: Authenticate user.
- `POST /api/auth/register`: Create new account.
- `GET /api/events`: List all events.
- `POST /api/events`: Create event (Organizer/Admin).
- `POST /api/registrations`: Register for an event.

import mongoose from 'mongoose';
import 'dotenv/config';
import { pathToFileURL } from 'url';
import { User } from '../models/User.ts';
import { Event } from '../models/Event.ts';
import { Category } from '../models/Category.ts';
import { Registration } from '../models/Registration.ts';

export const seedData = async () => {
  try {
    // Check if data already exists to avoid double seeding
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data, skipping seed.');
      return;
    }

    console.log('Seeding initial data...');

    // 1. Create Categories
    const categories = await Category.insertMany([
      { name: 'Workshop', description: 'Technical workshops', status: 'active' },
      { name: 'Seminar', description: 'Educational seminars', status: 'active' },
      { name: 'Hackathon', description: 'Coding competitions', status: 'active' },
      { name: 'Competition', description: 'General competitions', status: 'active' },
      { name: 'Social', description: 'Social gatherings', status: 'active' },
      { name: 'Corporate', description: 'Business events', status: 'active' },
      { name: 'College Event', description: 'Campus activities', status: 'active' },
      { name: 'Other', description: 'Miscellaneous', status: 'active' }
    ]);

    // 2. Create Users
    const password = 'password123';
    
    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password,
      role: 'admin',
      status: 'active'
    });

    // Organizers
    const org1 = await User.create({
      name: 'John Organizer',
      email: 'organizer@example.com',
      password,
      role: 'organizer',
      status: 'active'
    });

    const org2 = await User.create({
      name: 'Sarah EventManager',
      email: 'organizer2@example.com',
      password,
      role: 'organizer',
      status: 'active'
    });

    // Participants
    const participants = [];
    for (let i = 1; i <= 5; i++) {
      const p = await User.create({
        name: `Participant ${i}`,
        email: `participant${i}@example.com`,
        password,
        role: 'participant',
        status: 'active'
      });
      participants.push(p);
    }

    // 3. Create Events
    const eventsData = [
      {
        title: 'AI & Machine Learning Workshop',
        description: 'Hands-on session on neural networks.',
        categoryId: categories[0]._id,
        organizerId: org1._id,
        date: new Date('2026-11-15'),
        time: '10:00',
        location: { venue: 'Seminar Hall 1', city: 'Mumbai' },
        capacity: 50,
        registrationFee: 199,
        status: 'upcoming'
      },
      {
        title: 'SustainTech Summit',
        description: 'Green energy and sustainability.',
        categoryId: categories[1]._id,
        organizerId: org1._id,
        date: new Date('2026-12-05'),
        time: '09:00',
        location: { venue: 'Grand Hotel', city: 'Bangalore' },
        capacity: 100,
        registrationFee: 0,
        status: 'upcoming'
      },
      {
        title: 'CodeQuest Hackathon',
        description: 'Build for the future.',
        categoryId: categories[2]._id,
        organizerId: org2._id,
        date: new Date('2026-10-25'),
        time: '18:00',
        location: { venue: 'Innovation Lab', city: 'Pune' },
        capacity: 30,
        registrationFee: 500,
        status: 'upcoming'
      }
    ];

    const events = await Event.insertMany(eventsData);

    // 4. Create Registrations
    await Registration.create({
      userId: participants[0]._id,
      eventId: events[0]._id,
      status: 'confirmed',
      registeredAt: new Date()
    });

    await Registration.create({
      userId: participants[1]._id,
      eventId: events[0]._id,
      status: 'confirmed',
      registeredAt: new Date()
    });

    await Registration.create({
      userId: participants[0]._id,
      eventId: events[2]._id,
      status: 'cancelled',
      registeredAt: new Date(),
      cancelledAt: new Date()
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// If run directly (`npm run seed`). pathToFileURL makes this work on Windows too.
// `npm run seed -- --reset` drops the existing data first.
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';
  mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
      if (process.argv.includes('--reset')) {
        console.log('Dropping existing collections...');
        await Promise.all([User.deleteMany({}), Event.deleteMany({}), Category.deleteMany({}), Registration.deleteMany({})]);
      }
      await Promise.all([User, Event, Category, Registration].map(m => m.syncIndexes()));
      await seedData();
      console.log(`Done. Database: ${mongoose.connection.name}`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

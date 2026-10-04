import mongoose from 'mongoose';
import 'dotenv/config';
import { seedData } from '../scripts/seed.ts';

let mongod: any = null;

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/event_management';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  const allowMemory = process.env.ALLOW_IN_MEMORY_DB === 'true';

  try {
    console.log(`Connecting to MongoDB: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (err: any) {
    if (!allowMemory) {
      console.error('\n✖ Could not connect to MongoDB.');
      console.error(`  Reason: ${err.message}`);
      console.error('  Make sure MongoDB is running (Windows: Services -> MongoDB Server) and MONGODB_URI in .env is correct.');
      console.error('  To use a throw-away in-memory DB instead, set ALLOW_IN_MEMORY_DB=true in .env.\n');
      process.exit(1);
    }
    console.warn('⚠ Real MongoDB unreachable - starting IN-MEMORY database (data will NOT appear in Compass).');
    const { MongoMemoryServer } = await import('mongodb-memory-server-core');
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }

  const { host, port, name } = mongoose.connection;
  console.log(`✔ MongoDB connected -> ${host}:${port}/${name}${mongod ? ' (IN-MEMORY)' : ''}`);

  // Make sure the indexes declared in the models actually exist in the real database
  await mongoose.connection.syncIndexes();
  await seedData();
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};

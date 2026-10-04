import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/event_management';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db!;
  console.log(`\n✔ Connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}\n`);
  const cols = await db.listCollections().toArray();
  if (!cols.length) console.log('No collections yet - run: npm run seed');
  for (const c of cols) {
    const count = await db.collection(c.name).countDocuments();
    const idx = (await db.collection(c.name).indexes()).map(i => i.name).join(', ');
    console.log(`${c.name.padEnd(15)} docs: ${String(count).padEnd(4)} indexes: ${idx}`);
  }
  await mongoose.disconnect();
} catch (e: any) {
  console.error('✖ Connection failed:', e.message);
  process.exit(1);
}

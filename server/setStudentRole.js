import mongoose from 'mongoose';
import 'dotenv/config';

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const result = await mongoose.connection
      .collection('users')
      .updateMany(
        { role: { $exists: false } },
        { $set: { role: 'student' } }
      );

    console.log('Matched:', result.matchedCount);
    console.log('Updated:', result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medivault'; // Update if needed
const dbName = 'medivault';

async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = await db.collection('users').find({}).toArray();
    let migrated = { patients: 0, doctors: 0, admins: 0 };
    for (const user of users) {
      let targetCollection;
      if (user.role === 'patient') targetCollection = 'patients';
      else if (user.role === 'doctor') targetCollection = 'doctors';
      else if (user.role === 'admin') targetCollection = 'admins';
      else continue;
      // Check if already exists
      const exists = await db.collection(targetCollection).findOne({ email: user.email });
      if (exists) continue;
      // Remove role field for new collections
      const { role, ...rest } = user;
      await db.collection(targetCollection).insertOne(rest);
      migrated[targetCollection]++;
    }
    console.log('Migration complete:', migrated);
    // Uncomment to drop the old users collection after verifying migration:
    // await db.collection('users').drop();
    await client.close();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate(); 
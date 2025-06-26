import { MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient>;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  } else {
    console.warn(
      "\n\n" +
      "**********************************************************************************\n" +
      "** WARNING: MONGODB_URI is not set in your .env file.                             **\n" +
      "** The application will start, but any database operation will fail gracefully.   **\n" +
      "**********************************************************************************\n"
    );
    // Create a rejecting promise to prevent app crash on startup.
    // The error will be caught in server actions.
    clientPromise = Promise.reject(new Error('MONGODB_URI is not set in the .env file.'));
  }
} else {
  const uri = process.env.MONGODB_URI;
  const options = {};

  let client;
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found in .env');
    return;
  }
  
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
  } finally {
    await client.close();
  }
}

testConnection();

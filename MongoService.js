const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_URI.split('/').pop();

async function getClient() {
  const client = new MongoClient(url);
  await client.connect();
  return client;
}

function getCollection(client, collectionName) {
  return client.db(dbName).collection(collectionName);
}

const collections = {};

async function loadCollection(collectionName) {
  const client = await getClient();
  const allData = await getCollection(client, 'liked_tweets').find({}).toArray();
  collections[collectionName] = allData;
  console.log("foobar");
  client.close();
}

function coldCollection(collectionName) {
  return collections[collectionName] || [];
}

loadCollection('liked_tweets');

module.exports = { getClient, getCollection, loadCollection, coldCollection };

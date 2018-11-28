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
  const allData = await getCollection(client, collectionName).find({}).toArray();
  collections[collectionName] = allData;
  client.close();
}

function coldCollection(collectionName) {
  return collections[collectionName] || [];
}

async function deleteRecord(collectionName, data) {
  const client = await getClient();
  await getCollection(client, collectionName).deleteOne({ _id: data._id });
  console.log(JSON.stringify({ _id: data._id }));
  const allData = await getCollection(client, collectionName).find({}).toArray();
  collections[collectionName] = allData;
  client.close();
}

loadCollection('liked_tweets');

module.exports = { getClient, getCollection, loadCollection, coldCollection, deleteRecord };

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017'; // URL de connexion à MongoDB
const dbName = 'visualisationDeCarte'; // Nom de votre base de données MongoDB

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    const db = client.db(dbName);
    return db;
}

module.exports = { connect };

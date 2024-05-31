const { connect } = require('../config/db');

async function findDocuments(collectionName, query = {}) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.find(query).toArray();
}

async function insertDocument(collectionName, document) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.insertOne(document);
}

async function updateDocuments(collectionName, filter, update) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.updateMany(filter, { $set: update });
}

async function deleteDocuments(collectionName, filter) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.deleteMany(filter);
}

module.exports = {
    findDocuments,
    insertDocument,
    updateDocuments,
    deleteDocuments,
};

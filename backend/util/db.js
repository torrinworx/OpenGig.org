import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { OObject } from 'destam';

import { clone, stringify, parse } from './clone.js';

config();

const dbName = process.env.DB_TABLE;

export default async (collectionName, defaultValue = OObject({})) => {
    const client = new MongoClient(process.env.DB, { serverSelectionTimeoutMS: 1000 });

    try {
        await client.connect();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let dbDocument = await collection.findOne({ _id: 1 });

    if (!dbDocument) {
        const initialEmptyState = { _id: 1, state: stringify(defaultValue) };
        await collection.insertOne(initialEmptyState);
        dbDocument = initialEmptyState;
    }

    let state = parse(dbDocument.state);

    state.observer.watchCommit(async () => {
        await collection.updateOne(
            { _id: 1 },
            { $set: { state: stringify(clone(state)) } },
            { upsert: true }
        );
    });

    return state;
};

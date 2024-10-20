import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { OObject } from 'destam';

import { clone, stringify, parse } from './clone.js';

config();

const dbName = process.env.DB_TABLE;

// Storing state, however it's not storing the deltas.
// Manage state using MongoDB and destam
export default async (collectionName) => {
	const client = new MongoClient(process.env.DB);
	await client.connect();

	const db = client.db(dbName);
	const collection = db.collection(collectionName);

	let dbDocument = await collection.findOne({ _id: 1 });

	// Create initial document if none exists:
	if (!dbDocument) {
		const initialEmptyState = { _id: 1, state: stringify(OObject({})) };
		await collection.insertOne(initialEmptyState);
		dbDocument = initialEmptyState;
	}

	// Apply initial state
	const state = parse(dbDocument.state);

	state.observer.watchCommit(async () => {
		// TODO: Validation system to validate data structure before storage:
		await collection.updateOne(
			{ _id: 1 },
			{ $set: { state: stringify(clone(state)) } },
			{ upsert: true }
		);
	});

	return state;
};

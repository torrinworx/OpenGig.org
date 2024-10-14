import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { OObject, createNetwork, clone, stringify, parse, OArray } from 'destam';

config();

// Setup MongoDB connection parameters from environment variables
const uri = process.env.DB;
const dbName = process.env.DB_TABLE;

// Function to manage state using MongoDB and destam
const ODB = async (collectionName) => {
	const state = OObject();
	const network = createNetwork(state.observer);
	const client = new MongoClient(uri);

	await client.connect();
	console.log(`Connected to MongoDB: Database - ${dbName}, Collection - ${collectionName}`);

	const db = client.db(dbName);
	const collection = db.collection(collectionName);
	let dbDocument = await collection.findOne({ _id: 1 });

	// Create initial document if none exists:
	if (!dbDocument) {
		const initialEmptyState = { _id: 1, stateData: [] };
		await collection.insertOne(initialEmptyState);
		dbDocument = initialEmptyState;
	}
	const initialState = dbDocument.stateData.map(item => parse(item));

	console.log("Initial ODB State: ", initialState)

	// Apply db state to state
	initialState.forEach(commit => {
		network.apply(commit);
	});

	network.digest(async (commit) => {
		try {
			const stateDataToStore = stringify(clone(commit));

			await collection.updateOne(
				{ _id: 1 },
				{ $push: { stateData: stateDataToStore } },
				{ upsert: true }
			);
		} catch (error) {
			console.error('Failed to sync changes with MongoDB:', error);
		}
	}, 1000 / 30);

	// state.disconnect = async () => {
	// 	await client.close();
	// 	console.log(`Disconnected from MongoDB: Collection - ${collectionName}`);
	// };

	return state;
};

// Example Usage
(async () => {
	const state = await ODB('my_collection');
	console.log('Initial Client State:', state);

	// Ensure user data is set and manipulate it
	if (!state.user) {
		state.user = OObject({ name: "Alice", email: "alice@test.com" });
	}

	// await state.disconnect();
})();

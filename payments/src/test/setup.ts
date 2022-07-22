import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

jest.setTimeout(30000);
let mongo: any;

// Include fake file to tests
jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
    'sk_test_51LLZeoFJ61DxD9jzukuUH3jcIrG15jWvfjB3OronU7RaiQcJ1eTpADWYREzmMAMZTttdAhJjxAXU3c51ASHT1KH400m2XzPMLk';

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfdadg';

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

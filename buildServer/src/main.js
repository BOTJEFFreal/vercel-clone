import { connectToMongoDB } from './utils/mongo.js';
import { initLoggingModel } from './controller/loggingController.js';
import { buildAndUpload } from './controller/buildController.js';
import dotenv from 'dotenv';

dotenv.config();

const PROJECT_ID = process.env.PROJECT_ID;

await connectToMongoDB();

initLoggingModel(PROJECT_ID);
buildAndUpload(PROJECT_ID);

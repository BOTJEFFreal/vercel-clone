import mongoose from 'mongoose';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import 'dotenv/config';

// MongoDB connection
mongoose.connect("mongodb+srv://anmoldeepa2002:qxrCRw8YA1aTi3Qz@cluster0.sixsp.mongodb.net/Logs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Adjust timeout as needed
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
  

// Define the logs schema
const logsSchema = new mongoose.Schema({
  
  Timestamp: {
    type: Date,
    required: true,
  },
  Message: {
    type: String,
    required: true,
  },
  Error: {
    type: Boolean,
    required: true,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const PROJECT_ID = process.env.PROJECT_ID; 
const Logs = mongoose.model('p1234', logsSchema);

async function logging(message, error = false) {
  await Logs.create({
    Timestamp: new Date(),
    Message: message,
    Error: error,
  });
}

// Main script logic
async function main() {
    console.log(PROJECT_ID);
  console.log('Executing script.js');
  await logging('Executing script.js');

  console.log('Build Started...');
  await logging('Build Started...');

  const outDirPath = path.join(process.cwd(), 'output');

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on('data', async function (data) {
    console.log(data.toString());
    await logging(data.toString());
  });

  p.stderr.on('data', async function (data) {
    console.error('Error:', data.toString());
    await logging(`Error: ${data.toString()}`, true);
  });

  p.on('close', async function () {
    console.log('Build Complete');
    await logging('Build Complete');

    const distFolderPath = path.join(process.cwd(), 'output', 'dist');
    let distFolderContents;
    try {
      distFolderContents = fs.readdirSync(distFolderPath, { recursive: true });
    } catch (err) {
      console.error(`Error reading dist folder: ${err.message}`);
      await logging(`Error reading dist folder: ${err.message}`, true);
      return;
    }

    console.log('Starting to upload');
    await logging('Starting to upload');
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log('Uploading:', filePath);
      await logging(`Uploading: ${filePath}`);

      const command = new PutObjectCommand({
        Bucket: 'vercelclonedummy',
        Key: `output/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath) || 'application/octet-stream',
      });

      try {
        await s3Client.send(command);
        console.log('Uploaded:', filePath);
        await logging(`Uploaded: ${filePath}`);
      } catch (err) {
        console.error(`Error uploading ${filePath}: ${err.message}`);
        await logging(`Error uploading ${filePath}: ${err.message}`, true);
      }
    }

    console.log('Done...');
    await logging('Done...');
  });
}

main();

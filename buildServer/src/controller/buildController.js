import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { logging } from './loggingController.js';  
import {projectStatusUpdate} from './projectController.js'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const buildAndUpload = async (PROJECT_ID) => {
  console.log('Executing script.js');
  await logging('Executing script.js');

  console.log('Build Started...');
  await logging('Build Started...');
  console.log('PROGRESS');
  await projectStatusUpdate('PROGRESS',PROJECT_ID);

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
      await projectStatusUpdate('FAIL',PROJECT_ID);
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
        await projectStatusUpdate('FAIL',PROJECT_ID);

      }
    }

    console.log('Done...');
    await logging('Done...');
    await projectStatusUpdate('READY',PROJECT_ID);

  });
};

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

import 'dotenv/config'; 


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID;

async function main() {
    console.log('Executing script.js');
    console.log('Build Started...');

    const outDirPath = path.join(process.cwd(), 'output'); 

    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', function (data) {
        console.log(data.toString()); // type buffer -> string
    });

    p.stdout.on('error', function (data) {
        console.log('Error', data.toString());
    });

    p.on('close', async function () {
        console.log('Build Complete');

        const distFolderPath = path.join(process.cwd(), 'output', 'dist');
        let distFolderContents;
        try {
            distFolderContents = fs.readdirSync(distFolderPath, { recursive: true });
        } catch (err) {
            console.error(`Error reading dist folder: ${err.message}`);
            return;
        }

        console.log('Starting to upload');
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('Uploading:', filePath);

            const command = new PutObjectCommand({
                Bucket: 'vercelclonedummy',
                Key: `output/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) || 'application/octet-stream'
            });

            try {
                await s3Client.send(command);
                console.log('Uploaded:', filePath);
            } catch (err) {
                console.error(`Error uploading ${filePath}: ${err.message}`);
            }
        }
        console.log('Done...');
    });
}

main();

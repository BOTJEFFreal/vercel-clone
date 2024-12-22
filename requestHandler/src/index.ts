import express from 'express';
import { S3, AWSError } from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

app.get("/*", async (req, res) => {
    let filePath = req.path;
    
    // If accessing root, serve index.html
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Handle asset paths - convert forward slashes to backslashes
    if (filePath.includes('/assets/')) {
        filePath = filePath.replace('/assets/', '/assets\\');
    }
    
    // Construct the S3 key
    const key = `dist/y9k1o${filePath}`;
    console.log(`Requesting S3 Object with Key: ${key}`);
    
    try {
        const contents = await s3.getObject({
            Bucket: "vercelclonedummy",
            Key: key,
        }).promise();
        
        const type = filePath.endsWith("html") ? "text/html" :
                     filePath.endsWith("css") ? "text/css" :
                     filePath.endsWith("js") ? "application/javascript" :
                     filePath.endsWith("ico") ? "image/x-icon" : 
                     filePath.endsWith("png") ? "image/png" : 
                     filePath.endsWith("svg") ? "image/svg+xml" : 
                     filePath.endsWith("json") ? "application/json" :
                     "application/octet-stream";
        
        res.set("Content-Type", type);
        res.send(contents.Body);
    } catch (error: unknown) {
        console.error("Error fetching file from S3:", error);
        console.error("Attempted to fetch key:", key);
        
        if (error instanceof Error && 'code' in error) {
            const awsError = error as AWSError;
            if (awsError.code === 'NoSuchKey') {
                res.status(404).send(`File not found: ${key}`);
                return;
            }
        }
        res.status(500).send("Internal server error");
    }
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
    console.log("Serving files for ID: y9k1o");
});
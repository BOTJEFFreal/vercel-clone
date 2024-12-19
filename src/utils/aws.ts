import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";


dotenv.config();


const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    // endpoint: process.env.AWS_S3_BUCKET_NAME,
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercelclonedummy",
        Key: fileName,
    }).promise();
    console.log(response);
}
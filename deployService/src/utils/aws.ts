import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";


dotenv.config();


const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // endpoint: process.env.AWS_S3_BUCKET_NAME,
});

export async function downloadS3Folder(prefix: string) {   
    try {
        const allFiles = await s3.listObjectsV2({
            Bucket: "vercelclonedummy", 
            Prefix: prefix
        }).promise();

        if (!allFiles.Contents) {
            console.log("No files found.");
            return;
        }
        const allPromises = allFiles.Contents.map(async ({ Key }) => {
            if (!Key) return;

            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);

            // console.log(`files are downloaded to: ${finalOutputPath}`);

            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            return new Promise((resolve, reject) => {
                s3.getObject({
                    Bucket: "vercelclonedummy", 
                    Key
                }).createReadStream()
                  .pipe(outputFile)
                  .on("finish", resolve)
                  .on("error", reject);
            });
        });

        console.log("Downloading files...");
        await Promise.all(allPromises);
        console.log(`Download completed`);
    } catch (error) {
        console.error("Error downloading folder:", error);
    }
}

export function copyFinalDist(id: string) {
    const folderPath = path.join(__dirname, `output/${id}/build`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];


    if (!fs.existsSync(folderPath)) {
        console.log(`Directory does not exist: ${folderPath}`);
        return response;
    }


    const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });

    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercelclonedummy",
        Key: fileName,
    }).promise();
    console.log(response);
}
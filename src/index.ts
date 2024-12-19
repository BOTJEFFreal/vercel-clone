import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path"
import {createClient} from "redis";
import { generate } from "./utils/generator";
import { getAllFiles } from "./utils/file";
import { uploadFile } from "./utils/aws";


const PORT = 3000;
const outputDir = "./output";

//reddis code
const publisher = createClient();
publisher.connect();

const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());



if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

app.post("/deploy", async (req, res) => {
    const repoURL = req.body.repoURL;
    console.log("Received repo URL:", repoURL);

    const id = generate();

    try {
        const repoPath = path.join(__dirname, `output/${id}`);
        await simpleGit().clone(repoURL, repoPath);

        const files = getAllFiles(repoPath);

        for (const file of files) {
            const relativePath = path.relative(repoPath, file); 
            const s3Key = `${id}/${relativePath}`; 
            await uploadFile(s3Key, file);
            console.log(`Uploaded ${s3Key} to S3.`);
        }
        console.log(`Repository cloned and files uploaded to S3 with ID: ${id}`);

        publisher.lPush("build-queue",id);
        res.json({ status: "success", id });
    } catch (error) {
        const errorMessage = (error as Error).message || "Unknown error";
        console.error("Error cloning repository:", errorMessage);
        res.status(500).json({ status: "error", message: errorMessage });
    }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

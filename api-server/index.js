import express from "express";
import mongoose from "mongoose";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 9000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", 
  })
);

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const projectSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    CreatedBy: { type: String, required: true },
    GitUrl: { type: String, required: true },
    Link: { type: String, required: true },
    Status: { type: String, required: true },
  },
  { timestamps: true } 
);

const Project = mongoose.model("Project", projectSchema);

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.use(express.json());

async function projectBuild(gitURL, link, userID) {
  await Project.create({
    Name: link,
    CreatedBy: userID,
    GitUrl: gitURL,
    Link: `${link}.localhost:8000`,
    Status: "QUEUE",
  });
}

app.post("/project", async (req, res) => {
  const { gitURL, userID } = req.body;

  if (!gitURL || !userID) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const projectSlug = generateSlug(); 

  try {
    await projectBuild(gitURL, projectSlug, userID);

    const command = new RunTaskCommand({
      cluster: process.env.CLUSTER_ARN,
      taskDefinition: process.env.TASK_ARN,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: process.env.SUBNETS.split(","),
          securityGroups: process.env.SECURITY_GROUPS.split(","), 
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              { name: "GIT_REPOSITORY_URL", value: gitURL },
              { name: "PROJECT_ID", value: projectSlug },
              { name: "USER_ID", value: userID },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    return res.json({
      status: "queued",
      data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
    });
  } catch (err) {
    console.error("Error in ECS Task or MongoDB:", err);
    return res.status(500).json({ error: "Failed to queue ECS task" });
  }
});

app.listen(PORT, () => console.log(`API Server Running on port ${PORT}`));

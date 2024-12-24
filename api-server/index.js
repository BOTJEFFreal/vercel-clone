import express from "express";
import mongoose from 'mongoose';
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

mongoose.connect(process.env.DB_URL, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, 
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
  

const projectSchema = new mongoose.Schema({
  
  Name: {
    type: String,
    required: true,
  },
  CreadtedBy: {
    type: String,
    required: true,
  },
  GitUrl: {
    type: String,
    required: true,
  },
  Link: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    required: true,
  },
});



const ecsClient = new ECSClient({
  region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

});

app.use(express.json());

async function projectBuild(gitURL,link) {
  const Project = mongoose.model(link, projectSchema);
  await Project.create({
    Name: `${link}.localhost:8000`,
    CreadtedBy: "dummyUser",
    GitUrl: gitURL,
    Link: link,
    Status:"QUEUE"
  });
}

app.post("/project", async (req, res) => {
  const { gitURL,userID } = req.body;
  const projectSlug = generateSlug();
  await projectBuild(gitURL,projectSlug)

  const command = new RunTaskCommand({
    cluster: process.env.CLUSTER_ARN,
    taskDefinition: process.env.TASK_ARN,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-0798a389342490ddf",
          "subnet-00c87beba68fee744",
          "subnet-0ac19bff1798b8ba1",
        ],
        securityGroups: ["sg-0843020b25c5371e4"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "GIT_REPOSITORY__URL", value: gitURL },
            { name: "PROJECT_ID", value: projectSlug },
            { name: "USER_ID", value: userID },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  return res.json({ status: 'queued', data: { projectSlug, url: `http://${projectSlug}.localhost:8000` } })
});

app.listen(PORT, () => console.log(`API Server Running on port ${PORT}`));

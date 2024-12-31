import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import dotenv from "dotenv"

dotenv.config();

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const runEcsTask = async (gitURL, projectSlug, userID) => {
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

  try {
    await ecsClient.send(command);
  } catch (err) {
    console.error("Error running ECS task:", err);
    throw new Error('ECS task failed');
  }
};

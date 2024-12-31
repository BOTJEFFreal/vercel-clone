import express from 'express';
import { generateSlug } from 'random-word-slugs';
import Project from '../models/project.js';
import { runEcsTask } from '../services/ecs.js';

const router = express.Router();

async function projectBuild(gitURL, link, userID) {
  await Project.create({
    Name: link,
    CreatedBy: userID,
    GitUrl: gitURL,
    Link: `${link}.localhost:8000`,
    Status: "QUEUE",
  });
}

router.post("/project", async (req, res) => {
  const { gitURL, userID } = req.body;

  if (!gitURL || !userID) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  const projectSlug = generateSlug();

  try {
    await projectBuild(gitURL, projectSlug, userID);
    await runEcsTask(gitURL, projectSlug, userID);

    return res.json({
      status: "queued",
      data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
    });
  } catch (err) {
    console.error("Error in ECS Task or MongoDB:", err);
    return res.status(500).json({ error: "Failed to queue ECS task" });
  }
});

router.get("/project/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const project = await Project.findOne({ Name: slug });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    return res.status(500).json({ error: "Failed to fetch project details" });
  }
});

export default router;

import express from "express";
import { getDataBySlug } from "../services/dataService.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const data = await getDataBySlug(slug);

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data by slug:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

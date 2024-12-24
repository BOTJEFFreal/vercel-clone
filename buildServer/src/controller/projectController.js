import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

export async function projectStatusUpdate(newStatus) {
  try {
    const projectsDb = mongoose.connection.useDb('Projects'); 
    const collection = projectsDb.collection(String(process.env.PROJECT_ID)); 
    const filter = {}; 
    const update = { $set: { Status: newStatus } };

    const result = await collection.updateMany(filter, update);

    console.log(`${result.modifiedCount} document(s) updated to '${newStatus}'.`);
  } catch (error) {
    console.error("Error updating project status:", error.message);
  }
}

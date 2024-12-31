import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from './db.js'; 
import projectRoutes from './routes/project.js'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", 
}));

connectDB();

app.use('/api', projectRoutes); 

app.listen(PORT, () => console.log(`API Server Running on port ${PORT}`));

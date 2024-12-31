import mongoose from 'mongoose';

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

export default Project;

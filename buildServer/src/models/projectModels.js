import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  CreatedBy: { 
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

export const getProjectModel = (projectID) => {
  const projectsDb = mongoose.connection.useDb('Projects');  
  return projectsDb.model(projectID, projectSchema);
};

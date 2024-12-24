import mongoose from 'mongoose';

// Define the project schema
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

// Function to get the project model
export const getProjectModel = () => {
  const projectsDb = mongoose.connection.useDb('Projects');
  return projectsDb.model('Project', projectSchema);  // Use consistent 'Project' model name
};

let Project;

// Initialize the project model
export const initProjectModel = () => {
  Project = getProjectModel();
};

// Update the project status based on projectId
export const projectStatusUpdate = async (status, projectId) => {
  try {
    if (!Project) {
      initProjectModel();  // Ensure Project model is initialized
    }

    const result = await Project.updateOne(
      { Link: projectId },  // Query by Link (or _id) to match the project
      { $set: { Status: status } }
    );

    if (result.modifiedCount > 0) {
      console.log('Project status updated successfully');
    } else {
      console.log('No matching project found or status already set');
    }
  } catch (err) {
    console.error('Error updating project status:', err.message);
  }
};

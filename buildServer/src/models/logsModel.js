import mongoose from 'mongoose';

const logsSchema = new mongoose.Schema({
  Timestamp: {
    type: Date,
    required: true,
  },
  Message: {
    type: String,
    required: true,
  },
  Error: {
    type: Boolean,
    required: true,
  },
});

export const getLogsModel = (projectId) => {
  const logsDb = mongoose.connection.useDb('Logs');  
  return logsDb.model(projectId, logsSchema);
};

import { getLogsModel } from '../models/logsModel.js';

let Logs;

export const initLoggingModel = (projectId) => {
  Logs = getLogsModel(projectId); 
};

export const logging = async (message, error = false) => {
  try {
    await Logs.create({
      Timestamp: new Date(),
      Message: message,
      Error: error,
    });
  } catch (err) {
    console.error('Error logging message:', err.message);
  }
};

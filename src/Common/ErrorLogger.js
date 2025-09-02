// utils/ErrorLogger.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// A key to store logs in AsyncStorage
const ERROR_LOGS_KEY = "APP_ERROR_LOGS";

// Save error to storage
export const logError = async (error, extra = {}) => {
  try {
    const existingLogs = JSON.parse(await AsyncStorage.getItem(ERROR_LOGS_KEY)) || [];
    const newLog = {
      message: error?.message || JSON.stringify(error),
      stack: error?.stack || null,
      extra,
      time: new Date().toISOString(),
    };
    existingLogs.push(newLog);
    await AsyncStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(existingLogs));
    console.log("Error logged:", newLog);
  } catch (storageErr) {
    console.error("Failed to log error:", storageErr);
  }
};

// Get logs
export const getErrorLogs = async () => {
  return JSON.parse(await AsyncStorage.getItem(ERROR_LOGS_KEY)) || [];
};

// Clear logs
export const clearErrorLogs = async () => {
  await AsyncStorage.removeItem(ERROR_LOGS_KEY);
};

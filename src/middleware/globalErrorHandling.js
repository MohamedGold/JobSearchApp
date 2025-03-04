export const globalErrorHandling = (error, req, res, next) => {
  if (process.env.MOOD === "DEV") {
    return res.status(error.cause || 400).json({ message: error.message, error, stack: error.stack });
  }
  return res.status(error.cause || 400).json({ message: error.message });
};

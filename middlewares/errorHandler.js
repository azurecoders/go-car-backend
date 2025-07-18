const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).json({
    success: false,
    message,
    stack: err.stack,
  });
};

export default errorHandlerMiddleware;

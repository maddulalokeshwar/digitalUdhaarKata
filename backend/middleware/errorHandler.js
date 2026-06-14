export const errorHandler = (err, req, res, next) => {
  //console.error("ERROR:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: err.message
    });
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format"
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired"
    });
  }

  // Normal error
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
};
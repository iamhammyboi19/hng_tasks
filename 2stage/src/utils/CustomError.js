class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith("4") ? "error" : "fail";
    Error.captureStackTrace(this);
  }
}

module.exports = CustomError;

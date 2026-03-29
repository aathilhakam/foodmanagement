const mongoose = require('mongoose');

// Handle Mongoose validation errors
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => ({
    field: val.path,
    message: val.message,
    value: val.value
  }));

  return {
    success: false,
    error: 'Validation Error',
    details: errors,
    statusCode: 400
  };
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  return {
    success: false,
    error: `${field} already exists`,
    field,
    value,
    statusCode: 400
  };
};

// Handle Mongoose cast errors
const handleCastError = (err) => {
  return {
    success: false,
    error: `Invalid ${err.path}: ${err.value}`,
    field: err.path,
    value: err.value,
    statusCode: 400
  };
};

// Handle JWT errors
const handleJWTError = () => {
  return {
    success: false,
    error: 'Invalid token. Please log in again.',
    statusCode: 401
  };
};

// Handle JWT expired errors
const handleJWTExpiredError = () => {
  return {
    success: false,
    error: 'Your token has expired. Please log in again.',
    statusCode: 401
  };
};

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user ? req.user._id : 'anonymous'
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationError = handleValidationError(err);
    return res.status(validationError.statusCode).json(validationError);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const duplicateError = handleDuplicateKeyError(err);
    return res.status(duplicateError.statusCode).json(duplicateError);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const castError = handleCastError(err);
    return res.status(castError.statusCode).json(castError);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const jwtError = handleJWTError();
    return res.status(jwtError.statusCode).json(jwtError);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const jwtExpiredError = handleJWTExpiredError();
    return res.status(jwtExpiredError.statusCode).json(jwtExpiredError);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum file size is 5MB.',
      statusCode: 400
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'Too many files uploaded.',
      statusCode: 400
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected file field.',
      statusCode: 400
    });
  }

  // Custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't expose stack trace in production
  const response = {
    success: false,
    error: message,
    statusCode
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError
};

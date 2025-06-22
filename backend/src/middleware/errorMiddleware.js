/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Handle all other errors
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let stack = process.env.NODE_ENV === 'production' ? null : err.stack;
  
  console.error('Error:', {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    message,
    stack
  });

  // Handle specific types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: ' + err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized: ' + err.message;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File Upload Error: ' + err.message;
  } else if (err.code === 'ECONNREFUSED') {
    message = 'Database connection refused. Check that your database is running.';
  }

  // Set proper content type header
  res.setHeader('Content-Type', 'application/json');
  
  // Return error response
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    timestamp: new Date().toISOString()
  });
};

module.exports = { notFound, errorHandler }; 
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Page or resource not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Format Mongoose CastError or ValidationError
  let message = err.message || 'Something went wrong. Please try again.';
  if (err.name === 'CastError') {
    message = 'Resource not found.';
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `This ${field} already exists. Please choose another.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

const buildErrorResponse = (error, req) => {
  const status = error.status || error.statusCode || 500;
  const isClientError = status >= 400 && status < 500;

  const baseResponse = {
    message: error.message || 'Unexpected server error',
  };

  if (!isClientError) {
    console.error('[api:error]', {
      message: error.message,
      stack: error.stack,
      path: req.originalUrl,
    });
  }

  if (error.details) {
    baseResponse.details = error.details;
  }

  return { status, payload: baseResponse };
};

const notFoundHandler = (req, res) =>
  res.status(404).json({
    message: `Route not found for ${req.method} ${req.originalUrl}`,
  });

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, _next) => {
  const { status, payload } = buildErrorResponse(error, req);
  res.status(status).json(payload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

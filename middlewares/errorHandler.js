/**
 * Global error handler middleware.
 * Catches all errors passed via next(err) and renders an error page.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again later.'
      : err.message;

  res.status(statusCode).render('pages/error', {
    title: 'Error',
    message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
};

module.exports = errorHandler;

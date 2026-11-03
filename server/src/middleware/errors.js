export function notFound(req, res) {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  console.error(err);
  if (err.code === 11000)
    return res
      .status(409)
      .json({ message: "A record with this value already exists." });
  if (err.name === "ValidationError")
    return res.status(400).json({ message: err.message });
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid resource identifier." });
  res
    .status(err.status || 500)
    .json({
      message:
        process.env.NODE_ENV === "production"
          ? "Something went wrong."
          : err.message,
    });
}

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  // avoid leaking stack traces in production, but always log server-side
  if (process.env.NODE_ENV === "production") {
    console.error(err.message);
  } else {
    console.error(err.stack || err);
  }

  // Mongoose: cast errors (invalid ObjectId) -> 400
  const isMongooseCast = err?.name === "CastError";
  const responseStatus = isMongooseCast ? 400 : statusCode;

  const message =
    process.env.NODE_ENV === "production" && responseStatus === 500
      ? "Internal server error"
      : err.message || "Server error";

  const body = { message };

  if (err.details && process.env.NODE_ENV !== "production") {
    body.details = err.details;
  }

  res.status(responseStatus).json(body);
};

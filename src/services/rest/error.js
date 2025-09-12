export const formatError = (err) => {
  if (err.status && err.status < 500) {
    return {
      status: err.status,
      message: err.message,
      reasons: err.reasons || null,
    };
  }

  return {
    status: 500,
    message: 'Internal Server Error',
  };
};

export default (err, req, res) => {
  const { status, message, reasons } = formatError(err);

  res.status(status).json({
    success: false,
    message,
    ...(reasons ? { reasons } : {}),
  });
};

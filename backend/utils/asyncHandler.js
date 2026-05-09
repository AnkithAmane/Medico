const asyncHandler = (fn) => async (req, res, next) => {
  try {
    console.log('asyncHandler called for:', req.method, req.path);
    await fn(req, res);
  } catch (err) {
    console.error('Error in asyncHandler:', err.message);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      statusCode: err.statusCode || 500,
    });
  }
};

module.exports = asyncHandler;

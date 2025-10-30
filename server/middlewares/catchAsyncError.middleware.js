const catchAsyncError = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((error) => {
      console.error("Async error caught:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
  };
};
export default catchAsyncError;

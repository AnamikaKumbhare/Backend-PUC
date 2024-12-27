const errorHandler = (err, req, res, next) => {
    console.error(err); // log the error for debugging
    
    res.status(500).json({
        status: "failed",
        message: "Something went wrong",
        error: err.message || err
    });
};

module.exports = errorHandler;

const ResponseHandler = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: statusCode < 400 ? 'success' : 'failed',
        message,
        data
    });
};

module.exports = { ResponseHandler };

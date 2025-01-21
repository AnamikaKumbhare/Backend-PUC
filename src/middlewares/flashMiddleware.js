const validateFlashRequest = (req, res, next) => {
    const { firmwareUrl, portPath } = req.body;
    
    if (!firmwareUrl || !portPath) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameters: firmwareUrl and portPath are required'
        });
    }

    // Validate firmware URL format
    try {
        new URL(firmwareUrl);
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: 'Invalid firmware URL format'
        });
    }

    next();
};
module.exports = { validateFlashRequest };

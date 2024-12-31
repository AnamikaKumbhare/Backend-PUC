const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create file filter to validate image files
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Configure multer with storage and file filter
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    }
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle Multer-specific errors
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    status: 'failed',
                    message: 'File size exceeds limit of 5MB'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    status: 'failed',
                    message: 'Please upload the file with field name "file"'  // Updated error message
                });
            default:
                return res.status(400).json({
                    status: 'failed',
                    message: 'Error uploading file'
                });
        }
    }
    // Handle other errors
    if (err) {
        return res.status(400).json({
            status: 'failed',
            message: err.message
        });
    }
    next();
};


module.exports = {
    uploadMiddleware: upload.single('file'),
    handleMulterError
};
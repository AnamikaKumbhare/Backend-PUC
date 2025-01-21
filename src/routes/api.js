const { Router } = require('express');
const { uploadMiddleware, handleMulterError } = require('../middlewares/uploadMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');
const { handleLogin, handleSignup } = require('../controllers/authController');
const { checkPucValidation } = require('../controllers/pucValidationController');
const { processImage } = require('../controllers/imageProcessingController');
const { checkAndCreateRegion } = require('../controllers/regionController');
const { getRegionStats } = require('../controllers/regionFetchController');

const {
    handleDeviceFlash,
    checkDeviceHealth,
    listDevicePorts,
} = require('../controllers/flashingController');
const { validateFlashRequest } = require('../middlewares/flashMiddleware');

const apiRouter = Router();

// Public routes
apiRouter.post('/login', handleLogin);
apiRouter.post('/signup', handleSignup);

// Protected routes
apiRouter.post('/region', verifyToken, checkAndCreateRegion);
apiRouter.post('/puc', verifyToken, uploadMiddleware, handleMulterError, processImage);
apiRouter.post('/image', verifyToken, checkPucValidation);
apiRouter.get('/regionStats/:regionName', verifyToken, getRegionStats);

// Device flashing routes
apiRouter.post('/flash', verifyToken, validateFlashRequest, handleDeviceFlash);
apiRouter.get('/health', verifyToken, checkDeviceHealth);
apiRouter.get('/ports', verifyToken, listDevicePorts);

module.exports = apiRouter;

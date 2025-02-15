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
const { receivePollutionData } = require('../controllers/pollutionController');
const { getRegionVehicles } = require('../controllers/regionReportController');
const { savePpmData } = require('../controllers/ppmSaverController');
const { getVehicleCounts } = require('../controllers/vehicleClassController');
const { getAllRegions } = require('../controllers/allRegionsController');


const apiRouter = Router();

// Public routes
apiRouter.post('/login', handleLogin);
apiRouter.post('/signup', handleSignup);


// Protected routes
apiRouter.post('/region', verifyToken, checkAndCreateRegion);
apiRouter.post('/puc', verifyToken, uploadMiddleware, handleMulterError, processImage);
apiRouter.post('/image', verifyToken, checkPucValidation);
apiRouter.get('/regionStats/:regionName', verifyToken, getRegionStats);
apiRouter.get('/region/:regionName/vehicles', getRegionVehicles);
apiRouter.post('/ppm-value',savePpmData);
apiRouter.get('/vehicle-count',getVehicleCounts);
apiRouter.get('/allregions',getAllRegions);

// Device flashing routes
apiRouter.post('/flash', verifyToken, validateFlashRequest, handleDeviceFlash);
apiRouter.get('/health', verifyToken, checkDeviceHealth);
apiRouter.get('/ports', verifyToken, listDevicePorts);
apiRouter.post('/pollution-data', receivePollutionData);

module.exports = apiRouter;

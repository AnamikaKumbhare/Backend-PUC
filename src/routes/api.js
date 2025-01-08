const { Router } = require('express');
const { uploadMiddleware, handleMulterError } = require('../middlewares/uploadMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware'); 
const { handleLogin, handleSignup } = require('../controllers/authController'); 
const { checkPucValidation } = require('../controllers/pucValidationController');  
const { processImage } = require('../controllers/imageProcessingController');  
const { checkAndCreateRegion } = require('../controllers/regionController');
const { getRegionStats } = require('../controllers/regionFetchController');

const apiRouter = Router();

// Public routes (No authentication required)
apiRouter.post('/login', handleLogin);  
apiRouter.post('/signup', handleSignup);  

// Protected routes (Authentication required)
apiRouter.post('/region', verifyToken, checkAndCreateRegion);
apiRouter.post('/puc', verifyToken, uploadMiddleware, handleMulterError, processImage); 
apiRouter.post('/image', verifyToken, checkPucValidation);  
apiRouter.get('/regionStats/:regionName', verifyToken, getRegionStats);

module.exports = apiRouter;

const { Router } = require('express');
const { uploadMiddleware, handleMulterError } = require('../middlewares/uploadMiddleware');
const { handleLogin, handleSignup } = require('../controllers/authController'); // Destructure functions
const { checkPucValidation } = require('../controllers/pucValidationController');  // Destructure specific function
const { processImage } = require('../controllers/imageProcessingController');  // Destructure specific function

const apiRouter = Router();

// Register routes for login and signup
apiRouter.post('/login', handleLogin);  // Use the specific function for login
apiRouter.post('/signup', handleSignup);  // Use the specific function for signup

// Remove authentication middleware for PUC and image processing routes
apiRouter.post('/puc',uploadMiddleware, handleMulterError, processImage);  // Use the specific function for PUC validation
apiRouter.post('/image',checkPucValidation);  // Use the specific function for image processing

module.exports = apiRouter;
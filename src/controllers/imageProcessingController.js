const { processExternalImage } = require("../services/PUCcheckServices/modelApiService");
const { processOCR } = require("../services/PUCcheckServices/processOCRService");
const { parseRcNumber } = require("../services/PUCcheckServices/parsingService");
const { checkPucValidation } = require("../controllers/pucValidationController");
const websocketService = require("../services/webSockets/webSocketService");

/**
 * Handles the image processing request. This includes:
 * - Validating the input file
 * - Processing the file through an external model to extract sub-images
 * - Running OCR on the extracted images
 * - Parsing vehicle registration numbers (RC numbers) from the OCR results
 * - Validating the parsed RC numbers through the PUC validation system
 * - Broadcasting results or errors via WebSocket
 *
 * @param {Object} req - The request object, containing the uploaded file
 * @param {Object} res - The response object to send status and results
 */
const processImage = async (req, res) => {
    try {
        console.log("Request received to process image.");

        // Validate the uploaded file
        if (!req.file) {
            const error = "File not found in request";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const fileBuffer = req.file.buffer;
        const fileMimeType = req.file.mimetype;

        // Ensure the file is an image
        if (!fileMimeType.startsWith("image/")) {
            const error = "Invalid file type.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        // Process the image using an external model API
        const extractedFiles = await processExternalImage(fileBuffer, fileMimeType);

        if (!Array.isArray(extractedFiles) || extractedFiles.length === 0) {
            const error = "No valid files found in the processed result.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        // Perform OCR on the extracted images
        const extractedTexts = await processOCR(extractedFiles);
        const rcNumbers = parseRcNumber(extractedTexts);

        console.log("Parsed RC Numbers:", rcNumbers);

        // Validate that RC numbers were extracted
        if (rcNumbers.length === 0) {
            const error = "No RC numbers detected.";
            websocketService.emitPUCValidationError(error);
            return res.status(400).json({ status: "failed", message: error });
        }

        const resultRTOInfo = [];

        // Validate each RC number against the PUC system
        for (const rcNumber of rcNumbers) {
            try {
                const mockReq = { body: { rc_number: rcNumber } };
                let responseData = null;

                // Mock response to capture data from the controller
                const mockRes = {
                    status: (code) => ({
                        json: (response) => {
                            responseData = { statusCode: code, response };
                            return responseData;
                        }
                    })
                };

                // Call the PUC validation controller
                await checkPucValidation(mockReq, mockRes);

                // Collect valid responses
                if (responseData && responseData.statusCode === 200) {
                    resultRTOInfo.push(responseData.response.data);
                } else {
                    const error = `Validation failed for RC Number ${rcNumber}: ${responseData?.response?.message || 'Unknown error'}`;
                    console.warn(error);
                    websocketService.emitPUCValidationError(error);
                }
            } catch (error) {
                const errorMsg = `Error validating RC Number ${rcNumber}: ${error.message}`;
                console.error(errorMsg);
                websocketService.emitPUCValidationError(errorMsg);
            }
        }

        // Emit successful validation results via WebSocket
        if (resultRTOInfo.length > 0) {
            websocketService.emitPUCValidationResult(resultRTOInfo);
        }

        // Respond with the results
        return res.status(200).json({
            status: "success",
            message: "Image processing completed successfully.",
            response: resultRTOInfo,
        });
    } catch (error) {
        // Handle unexpected errors
        console.error("Error:", error);
        websocketService.emitPUCValidationError(error.message);
        return res.status(500).json({ status: "failed", message: error.message });
    }
};

module.exports = { processImage };
